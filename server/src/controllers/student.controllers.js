// src/controllers/receipt.controller.js
import { extractRollFromEmail } from "../utils/extractRoll.js";
import { verifyQRToken } from "../services/qr.services.js";
import db from "../config/firestore.js";
import { scanQRFromImage } from "../utils/scanQRFromImage.js";
import  asyncHandler from "../utils/asyncHandler.js";
import  ApiResponse from "../utils/ApiResponse.js";
import  ApiError  from "../utils/ApiError.js";
import { getTodayISO ,addDaysISO,getWeekRangeISO} from "../utils/date.js";

import { initStudentMealDays } from "../utils/initStudentMealDays.js";

function isAbsentAllowed(mealTime, date) {
  const mealDateTime = new Date(`${date}T${mealTime}:00`);
  const cutoff = new Date(mealDateTime.getTime() - 24 * 60 * 60 * 1000);
  return new Date() < cutoff;
}


export const verifyReceipt = asyncHandler(async (req, res) => {
  /* ================= AUTH ================= */
  if (!req.user || !req.user.uid || !req.user.email) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!req.file) {
    throw new ApiError(400, "Receipt image required");
  }

  const { uid, email } = req.user;

  /* ================= 1️⃣ SCAN & VERIFY QR ================= */
  const qrToken = await scanQRFromImage(req.file.buffer);
  const rawQrData = verifyQRToken(qrToken);

  const qrData = {
    receiptId: rawQrData.receiptId,
    name: rawQrData.name,
    roll: rawQrData.roll,
    issuedAt: rawQrData.issuedAt,
    validTill: rawQrData.validTill,
    initialCredits: Number(rawQrData.initialCredits),
  };

  if (
    !qrData.receiptId ||
    !qrData.name ||
    !qrData.roll ||
    !qrData.issuedAt ||
    !qrData.validTill ||
    Number.isNaN(qrData.initialCredits)
  ) {
    throw new ApiError(400, "Invalid receipt QR data");
  }

  /* ================= 2️⃣ IDENTITY CHECK ================= */
  const emailRoll = extractRollFromEmail(email);
  if (qrData.roll !== emailRoll) {
    throw new ApiError(403, "Receipt does not belong to you");
  }

  /* ================= 3️⃣ VALIDITY CHECK ================= */
  if (new Date(qrData.validTill) < new Date()) {
    throw new ApiError(400, "Receipt has expired");
  }

  const receiptRef = db
    .collection("receiptVerification")
    .doc(qrData.receiptId);

  const studentRef = db.collection("students").doc(uid);

  /* ================= 4️⃣ ATOMIC TRANSACTION ================= */
  await db.runTransaction(async (tx) => {
    /* ---------- A. CHECK STUDENT FIRST (IDEMPOTENT) ---------- */
    const studentSnap = await tx.get(studentRef);

    if (studentSnap.exists && studentSnap.data().receiptVerified) {
      // Student already verified → safe retry
      return;
    }

    /* ---------- B. CHECK RECEIPT USAGE ---------- */
    const receiptSnap = await tx.get(receiptRef);

    if (receiptSnap.exists) {
      const usedBy = receiptSnap.data().verifiedByUid;

      if (usedBy === uid) {
        // Same student retry → idempotent success
        return;
      }

      // Different student → block
      throw new ApiError(
        409,
        "Receipt already used by another student"
      );
    }

    /* ---------- C. SAVE RECEIPT ---------- */
    tx.set(receiptRef, {
      receiptId: qrData.receiptId,
      roll: qrData.roll,
      issuedAt: qrData.issuedAt,
      validTill: qrData.validTill,
      initialCredits: qrData.initialCredits,
      verifiedByUid: uid,
      verifiedAt: new Date(),
    });

    /* ---------- D. UPDATE STUDENT ---------- */
    tx.set(
      studentRef,
      {
        name: qrData.name,
        roll: qrData.roll,
        receiptId: qrData.receiptId,
        issuedAt: qrData.issuedAt,
        validTill: qrData.validTill,
        receiptVerified: true,
        messSelected: false,
        initialCredits: qrData.initialCredits,
      },
      { merge: true }
    );
  });

  /* ================= 5️⃣ RESPONSE ================= */
  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Receipt verified successfully",
      data: {
        name: qrData.name,
        roll: qrData.roll,
        issuedAt: qrData.issuedAt,
        validTill: qrData.validTill,
        receiptVerified: true,
        initialCredits: qrData.initialCredits,
      },
    })
  );
});


export const getStudentProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json(
      new ApiResponse({
        statusCode: 401,
        message: "Unauthorized",
      })
    );
  }

  const { uid } = req.user;

  const snap = await db.collection("students").doc(uid).get();

  if (!snap.exists) {
    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Student profile not created yet",
        data: {
          role: "student",
          exists: false,
          receiptVerified: false,
          messSelected: false,
        },
      })
    );
  }

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Student profile",
      data: {
        role: "student",
        exists: true,
        ...snap.data(),
        messSelected: snap.data().messSelected ?? false,
      selectedMess: snap.data().selectedMess ?? null,
      },
    })
  );
});


export const selectMess = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const { messId } = req.body;

  if (!messId) {
    throw new ApiError(400, "Mess ID required");
  }

  const studentRef = db.collection("students").doc(uid);
  const messRef = db.collection("messes").doc(messId);
  const messStudentRef = messRef.collection("students").doc(uid);

  await db.runTransaction(async (tx) => {
    /* ---------- STUDENT ---------- */
    const studentSnap = await tx.get(studentRef);
    if (!studentSnap.exists) throw new ApiError(404, "Student not found");

    const student = studentSnap.data();

    if (!student.receiptVerified)
      throw new ApiError(403, "Receipt not verified");

    if (student.messSelected)
      throw new ApiError(409, "Mess already selected");

    /* ---------- MESS ---------- */
    const messSnap = await tx.get(messRef);
    if (!messSnap.exists) throw new ApiError(404, "Mess not found");

    const mess = messSnap.data();
    if (!mess.isActive) throw new ApiError(403, "Mess inactive");

    if (student.initialCredits < mess.estimatedCredits)
      throw new ApiError(403, "Insufficient credits");

    if (new Date(student.validTill) < new Date(mess.operation.endDate))
      throw new ApiError(403, "Receipt validity shorter than mess duration");

    /* ---------- UPDATE STUDENT ---------- */
    tx.update(studentRef, {
      messSelected: true,
      selectedMess: {
        messId,
        messName: mess.messName,
        campusType: mess.campusType,
        foodType: mess.foodType || "BOTH",
        prices: mess.prices,
        penaltyPercent: mess.penaltyPercent,
        estimatedCredits: mess.estimatedCredits,
        operation: mess.operation,
        selectedAt: new Date(),
      },
    });

    /* ---------- UPDATE MESS ---------- */
    tx.update(messRef, {
      studentCount: (mess.studentCount || 0) + 1,
    });

    tx.set(messStudentRef, { uid });

    /* ---------- INIT STUDENT MEAL DAYS (🔥 IMPORTANT) ---------- */
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const date = d.toISOString().split("T")[0];

      tx.set(
        db.collection("student_meal_days").doc(`${uid}_${date}`),
        {
          uid,
          messId,
          date,
          meals: {
            breakfast: { status: "NONE", time: "08:00-09:30" },
            lunch: { status: "NONE", time: "12:30-14:00" },
            snacks: { status: "NONE", time: "16:30-17:30" },
            dinner: { status: "NONE", time: "19:30-21:00" },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }
  });

  return res.status(200).json(
    new ApiResponse(200, null, "Mess selected successfully")
  );
});



export const declareAbsent = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const { date, mealType } = req.body;

  const dayRef = db
    .collection("student_meal_days")
    .doc(`${uid}_${date}`);

  const daySnap = await dayRef.get();
  if (!daySnap.exists) {
    throw new ApiError(404, "Meal day not found");
  }

  const day = daySnap.data();
  const meal = day.meals[mealType];

  if (!isAbsentAllowed(meal.time, date)) {
    throw new ApiError(400, "Absent window closed");
  }

  if (meal.status !== "NONE") {
    throw new ApiError(400, "Action already taken");
  }

  const studentSnap = await db.collection("students").doc(uid).get();
  const student = studentSnap.data();

  const messId = student.selectedMess.messId;
  const price = student.selectedMess.prices[mealType];
  const penaltyPercent = student.selectedMess.penaltyPercent;

  const batch = db.batch();

  
  batch.update(dayRef, {
    [`meals.${mealType}.status`]: "DECLARED_ABSENT",
    updatedAt: new Date(),
  });

  batch.set(
    db.collection("messes").doc(messId)
      .collection("meal_events").doc(),
    {
      uid,
      studentRoll: student.roll,
      messId,
      mealType,
      status: "DECLARED_ABSENT",
      price,
      penaltyPercent,
      date,
      declaredAt: new Date(),
      settlementApplied: false,
      createdAt: new Date(),
    }
  );

  await batch.commit();

  return res.json(
    new ApiResponse(200, null, "Absent declared")
  );
});




export const getStudentMealDays = asyncHandler(async (req, res) => {
 
  const { uid } = req.user;

  const studentSnap = await db.collection("students").doc(uid).get();
  if (!studentSnap.exists) {
    throw new ApiError(404, "Student not found");
  }

  const student = studentSnap.data();

  if (!student.messSelected) {
    return res.json(
      new ApiResponse({
        statusCode: 200,
        message: "Mess not selected yet",
        data: { days: [] },
      })
    );
  }

  const todayISO = getTodayISO();
  const { start, end } = getWeekRangeISO(todayISO);

  
  const snap = await db
    .collection("student_meal_days")
    .where("uid", "==", uid)
    .where("date", ">=", start)
    .where("date", "<=", end)
    .get();

  const existingDays = snap.docs.map(d => d.data());
  const existingDates = new Set(existingDays.map(d => d.date));

  const batch = db.batch();
  let created = 0;

  for (let i = 0; i < 7; i++) {
    const date = addDaysISO(start, i);

    if (existingDates.has(date)) continue;

    const ref = db
      .collection("student_meal_days")
      .doc(`${uid}_${date}`);

    batch.set(ref, {
      uid,
      messId: student.selectedMess.messId,
      date,

      meals: {
        breakfast: { status: "NONE", time: "08:00-09:30" },
        lunch: { status: "NONE", time: "12:30-14:00" },
        snacks: { status: "NONE", time: "16:30-06:00" },
        dinner: { status: "NONE", time: "19:30-21:00" },
      },

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    created++;
  }

  if (created > 0) {
    await batch.commit();
   
  }

  const finalSnap = await db
    .collection("student_meal_days")
    .where("uid", "==", uid)
    .where("date", ">=", start)
    .where("date", "<=", end)
    .get();

  const days = finalSnap.docs
    .map(d => d.data())
    .sort((a, b) => a.date.localeCompare(b.date));

  
  return res.json(
    new ApiResponse({
      statusCode: 200,
      message: "Meal days fetched",
      data: { days },
    })
  );
});



export const getStudentMealHistory = asyncHandler(async (req, res) => {
  const { uid } = req.user;

  const snap = await db
    .collectionGroup("meal_events")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const history = snap.docs.map(d => d.data());

  return res.json(
    new ApiResponse(200, { history }, "Meal history fetched")
  );
});
