import admin from "../config/firebase.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const db = admin.firestore();

const ADMIN_EMAIL=process.env.ADMIN_EMAIL;

const parseStudent = (emailPrefix) => {
  const rollMatch = emailPrefix.match(/\d{2,3}[a-z]{2,3}\d{3}/i);
  if (!rollMatch) return null;

  return {
    name: emailPrefix.split(".")[0],
    studentRoll: rollMatch[0],
    role: "student",
  };
};
 function parseMessManager(email) {
  const local = email.split("@")[0]; // mess6
  const match = local.match(/^mess(\d+)$/i);

  if (!match) return null;

  return {
    messKey: local.toLowerCase(),      // mess6
    displayName: `Mess ${match[1]}`,   // Mess 6
  };
}


export const continueAuth = asyncHandler(async (req, res) => {
  const { uid, email } = req.user;

  if (!email?.endsWith("@nitk.edu.in")) {
    throw new ApiError(403, "Only NITK institute emails allowed");
  }

  const emailPrefix = email.split("@")[0];
  
const ADMIN_EMAIL=process.env.ADMIN_EMAIL;

  
  if (email === ADMIN_EMAIL) {
    const ref = db.collection("hostel_office").doc(uid);

    await ref.set(
      {
        uid,
        email,
        role: "hostel_office",
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Admin authentication successful",
        data: {
          uid,
          email,
          role: "hostel_office",
        },
      })
    );
  }

  // ---------- MESS MANAGEMENT ----------
const mess = parseMessManager(emailPrefix);

if (mess) {
  /* ---------- FIND APPROVED / ACTIVE MESS ---------- */
  const messSnap = await db
    .collection("messes")
    .where("messAuth.email", "==", email)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (messSnap.empty) {
    throw new ApiError(403, "Mess manager not approved by admin");
  }

  const messDoc = messSnap.docs[0];
  const messData = messDoc.data();

  /* ---------- UPSERT MESS MANAGER PROFILE ---------- */
  const ref = db.collection("mess_managers").doc(uid);

  await ref.set(
    {
      uid,
      email,
      role: "mess_manager",

      /* 🔹 BASIC IDENTITY */
      messId: messDoc.id,
      messName: messData.messName,
      campusType: messData.campusType,

      /* 🔹 CONTROL DATA (READ-ONLY FOR MANAGER) */
      foodType: messData.foodType,
      prices: messData.prices,
      penaltyPercent: messData.penaltyPercent,
      operation: messData.operation,

      /* 🔹 STATS */
      studentCount: messData.studentCount ?? 0,

      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt:
        messData.createdAt ??
        admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  /* ---------- RESPONSE ---------- */
  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Mess management authentication successful",
      data: {
        uid,
        email,
        role: "mess_manager",
        messId: messDoc.id,
        messName: messData.messName,
        campusType: messData.campusType,
      },
    })
  );
}


  // ---------- STUDENT ----------
  const student = parseStudent(email);
  if (!student) {
    throw new ApiError(403, "Invalid institute email format");
  }

  const ref = db.collection("students").doc(uid);

  await ref.set(
    {
      uid,
      email,
      name: student.name,
      studentRoll: student.studentRoll,
      role: "student",
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Student authentication successful",
      data: {
        uid,
        email,
        role: "student",
        studentRoll: student.studentRoll,
      },
    })
  );
});



