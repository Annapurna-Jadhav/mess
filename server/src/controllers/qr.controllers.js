import admin from "../config/firebase.js";
import db from "../config/firestore.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { detectMealType } from "../utils/detectMealType.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import vision from "@google-cloud/vision";
import fs from "fs";


import { extractQrFromImage } from "../utils/visionQR.js";



import { MEAL_TIMINGS } from "../config/mealTimings.js";

function getMealExpiry(mealType, dateISO) {
  const timing = MEAL_TIMINGS[mealType];
  if (!timing) return null;

 
  const [year, month, day] = dateISO.split("-").map(Number);
  const [eh, em] = timing.end.split(":").map(Number);

  return new Date(year, month - 1, day, eh, em, 0);
}


function isDinner(mealType) {
  return mealType === "dinner";
}

export const generateMealQR = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const QR_SECRET = process.env.QR_SECRET;

  if (!QR_SECRET) {
    throw new ApiError(500, "QR secret not configured");
  }

  const mealType = req.body.mealType;
  if (!mealType) {
    throw new ApiError(400, "Meal type required");
  }

  // ⛔ Time enforcement (except dinner test mode)
  if (!isDinner(mealType) && !detectMealType()) {
    throw new ApiError(403, "Outside meal timing");
  }

  const date = new Date().toISOString().split("T")[0];

  const studentRef = db.collection("students").doc(uid);
  const dayRef = db
    .collection("student_meal_days")
    .doc(`${uid}_${date}`);

  let token;
  let expiresAt = null;
  let expiresIn = null;

  await db.runTransaction(async (tx) => {
    /* ---------- STUDENT ---------- */
    const studentSnap = await tx.get(studentRef);
    if (!studentSnap.exists) {
      throw new ApiError(404, "Student not found");
    }

    const student = studentSnap.data();
    if (!student.messSelected) {
      throw new ApiError(403, "Mess not selected");
    }

    /* ---------- DAY DOC ---------- */
    let daySnap = await tx.get(dayRef);
    if (!daySnap.exists) {
      tx.set(dayRef, {
        uid,
        messId: student.selectedMess.messId,
        date,
        meals: {
          breakfast: { status: "NONE" },
          lunch: { status: "NONE" },
          snacks: { status: "NONE" },
          dinner: { status: "NONE" },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      daySnap = await tx.get(dayRef);
    }

    const meal = daySnap.data().meals[mealType];

    /* ---------- RESUME EXISTING QR ---------- */
    if (meal.status === "QR_GENERATED") {
      const existing = await tx.get(
        db.collection("qr_sessions")
          .where("uid", "==", uid)
          .where("mealType", "==", mealType)
          .where("date", "==", date)
          .where("used", "==", false)
          .limit(1)
      );

      if (!existing.empty) {
        const s = existing.docs[0].data();

        token = s.token;
        expiresAt = s.expiresAt
          ? s.expiresAt.toDate()
          : null;

        expiresIn = expiresAt
          ? Math.max(
              Math.floor((expiresAt.getTime() - Date.now()) / 1000),
              0
            )
          : null;

        return;
      }
    }

    if (meal.status !== "NONE") {
      throw new ApiError(409, `Meal already ${meal.status}`);
    }

   
    const sessionId = uuidv4();

    if (isDinner(mealType)) {
      expiresAt = null;
      expiresIn = null;

      token = jwt.sign(
        { sessionId },
        QR_SECRET,
        { expiresIn: "7d" } 
      );
    } else {
      expiresAt = getMealExpiry(mealType, date);
      if (!expiresAt || expiresAt <= new Date()) {
        throw new ApiError(403, "Meal time already over");
      }

      expiresIn = Math.floor(
        (expiresAt.getTime() - Date.now()) / 1000
      );

      token = jwt.sign(
        { sessionId },
        QR_SECRET,
        { expiresIn }
      );
    }

    tx.set(db.collection("qr_sessions").doc(sessionId), {
      uid,
      mealType,
      date,
      used: false,
      expiresAt,
      token,
      createdAt: new Date(),
    });

    tx.update(dayRef, {
      [`meals.${mealType}.status`]: "QR_GENERATED",
      updatedAt: new Date(),
    });
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "QR ready",
      data: {
        token,
        mealType,
        expiresIn,
        testMode: isDinner(mealType),
      },
    })
  );
});



export const scanMealEntry = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "QR token required");
  }

  const QR_SECRET = process.env.QR_SECRET;

  let payload;
  try {
    payload = jwt.verify(token, QR_SECRET);
  } catch {
    throw new ApiError(403, "Invalid or expired QR");
  }

  if (!payload?.sessionId) {
    throw new ApiError(400, "Malformed QR payload");
  }

  const { sessionId } = payload;
  const sessionRef = db.collection("qr_sessions").doc(sessionId);

  let responseData;

  await db.runTransaction(async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) {
      throw new ApiError(403, "Invalid QR");
    }

    const session = sessionSnap.data();

    if (session.used) {
      throw new ApiError(409, "QR already used");
    }

    if (session.expiresAt && session.expiresAt.toDate() < new Date()) {
      throw new ApiError(403, "QR expired");
    }

    const { uid, mealType, date } = session;

    const dayRef = db
      .collection("student_meal_days")
      .doc(`${uid}_${date}`);

    const daySnap = await tx.get(dayRef);
    if (!daySnap.exists) {
      throw new ApiError(404, "Meal day missing");
    }

    const dayData = daySnap.data();
    const meal = dayData.meals?.[mealType];

    if (!meal || meal.status !== "QR_GENERATED") {
      throw new ApiError(409, "Meal already processed");
    }

    const studentRef = db.collection("students").doc(uid);
    const studentSnap = await tx.get(studentRef);
    if (!studentSnap.exists) {
      throw new ApiError(404, "Student missing");
    }

    const student = studentSnap.data();
    const messId = student.selectedMess.messId;
    const price = student.selectedMess.prices[mealType];
    const penaltyPercent = student.selectedMess.penaltyPercent;

  
    tx.update(sessionRef, {
      used: true,
      usedAt: new Date(),
    });

   
    tx.update(dayRef, {
      [`meals.${mealType}.status`]: "SERVED",
      [`meals.${mealType}.scannedAt`]: new Date(),
      [`meals.${mealType}.settlementApplied`]: true,
      [`meals.${mealType}.settledAt`]: new Date(),    
      updatedAt: new Date(),
    });

    tx.update(db.collection("messes").doc(messId), {
      servedCount: admin.firestore.FieldValue.increment(1),
      totalRevenue: admin.firestore.FieldValue.increment(price), 
    });

   
    tx.set(
      db.collection("messes")
        .doc(messId)
        .collection("meal_events")
        .doc(),
      {
        uid,
        studentName: student.name,
        studentRoll: student.roll,
        messId,
        mealType,
        status: "SERVED",
        price,
        penaltyPercent,
        date,
        scannedAt: new Date(),
        settlementApplied: true, 
        settledAt: new Date(),
        createdAt: new Date(),
      }
    );

    responseData = {
      studentName: student.name,
      studentRoll: student.roll,
      mealType,
      date,
      messId,
      settled: true,
    };
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Meal marked as served and settled",
      data: responseData,
    })
  );
});




export const scanMealQRFromImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "QR image required");
  }


  let token;

  try {
    token = await extractQrFromImage(req.file.buffer);
  } catch (err) {
    throw new ApiError(400, err.message);
  }

  // Reuse SAME logic as normal scan
  req.body.token = token;
  console.log("VISION QR:", token);
console.log("LENGTH:", token.length);

  console.log(`scan meal entry ${token}`)
  return scanMealEntry(req, res);
});
