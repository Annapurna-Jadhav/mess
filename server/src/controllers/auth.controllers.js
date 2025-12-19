import admin from "../config/firebase.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const db = admin.firestore();



const parseStudent = (emailPrefix) => {
  const rollMatch = emailPrefix.match(/\d{2,3}[a-z]{2,3}\d{3}/i);
  if (!rollMatch) return null;

  return {
    name: emailPrefix.split(".")[0],
    studentRoll: rollMatch[0],
    role: "student",
  };
};
 const parseMessManager = (emailPrefix) => {
  const match = emailPrefix.match(/^([a-zA-Z]+)\.(\d+)$/);
  if (!match) return null;

  return {
    name: match[1],
    messRoll: match[2],
    role: "mess_manager",
  };
};



export const continueAuth = asyncHandler(async (req, res) => {
  const { uid, email } = req.user;

  if (!email?.endsWith("@nitk.edu.in")) {
    throw new ApiError(403, "Only NITK institute emails allowed");
  }

  const emailPrefix = email.split("@")[0];

  // ---------- HOSTEL ADMIN ----------
  if (email === "hosteloffice@nitk.edu.in") {
    const ref = db.collection("admins").doc(uid);

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
    const approvalRef = db
      .collection("mess_manager_approvals")
      .doc(email);

    const approvalSnap = await approvalRef.get();

    if (!approvalSnap.exists || approvalSnap.data().status !== "approved") {
      throw new ApiError(403, "Mess manager not approved by admin");
    }

    const ref = db.collection("mess_managers").doc(uid);

    await ref.set(
      {
        uid,
        email,
        name: mess.name,
        messRoll: mess.messRoll,
        role: "mess_manager",
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Mess management authentication successful",
        data: {
          uid,
          email,
          role: "mess_manager",
          messRoll: mess.messRoll,
        },
      })
    );
  }

  // ---------- STUDENT ----------
  const student = parseStudent(emailPrefix);
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

