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
  
  const { uid, email, customClaims } = req.user;

  if (!email?.endsWith("@nitk.edu.in")) {
    throw new ApiError(403, "Only NITK institute emails allowed");
  }

  
  if (customClaims?.role) {
    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Authentication successful",
        data: {
          uid,
          email,
          role: customClaims.role,
          ...(customClaims.messId && {
            messId: customClaims.messId,
            messName: customClaims.messName,
            campusType: customClaims.campusType,
          }),
          ...(customClaims.studentRoll && {
            studentRoll: customClaims.studentRoll,
          }),
        },
      })
    );
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

 
  if (email === ADMIN_EMAIL) {
    const ref = db.collection("hostel_office").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        uid,
        email,
        role: "hostel_office",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await admin.auth().setCustomUserClaims(uid, {
        role: "hostel_office",
      });
    }

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Admin authentication successful",
        data: { uid, email, role: "hostel_office" },
      })
    );
  }

 
  const messManagerRef = db.collection("mess_managers").doc(uid);
  const messManagerSnap = await messManagerRef.get();

  if (messManagerSnap.exists) {
    const messData = messManagerSnap.data();

    await admin.auth().setCustomUserClaims(uid, {
      role: "mess_manager",
      messId: messData.messId,
      messName: messData.messName,
      campusType: messData.campusType,
    });

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Mess management authentication successful",
        data: {
          uid,
          email,
          role: "mess_manager",
          messId: messData.messId,
          messName: messData.messName,
          campusType: messData.campusType,
        },
      })
    );
  }

 
  const student = parseStudent(email);
  if (!student) {
    throw new ApiError(403, "Invalid institute email format");
  }

  const studentRef = db.collection("students").doc(uid);
  const studentSnap = await studentRef.get();

  if (!studentSnap.exists) {
    await studentRef.set({
      uid,
      email,
      name: student.name,
      studentRoll: student.studentRoll,
      role: "student",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await admin.auth().setCustomUserClaims(uid, {
      role: "student",
      studentRoll: student.studentRoll,
    });
  }

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




