
import db from "../config/firestore.js";
import admin from "../config/firebase.js";
import { sendApprovalEmail, sendRejectionEmail } from "../services/emailServices.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";



export const getPendingApps = asyncHandler(async (req, res) => {
  const snap = await db
    .collection("mess_applications")
    .where("status", "==", "PENDING")
    .get();

  const applications = snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      
    };
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Pending mess applications fetched",
      data: {
        total: applications.length,
        applications,
      },
    })
  );
});


export const approveMessApp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = req.body.note || "Approved by hostel office";

  /* ---------- FETCH APPLICATION ---------- */
  const ref = db.collection("mess_applications").doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new ApiError(404, "Mess application not found");
  }

  const data = snap.data();

  /* ---------- DEMO AUTH CREDENTIALS ---------- */
  const baseName = data.messName.toLowerCase().replace(/\s+/g, "");
  const demoEmail = `${baseName}@nitk.edu.in`;
  const demoPassword = `${baseName}@123`; // ✅ >= 6 chars (DEMO ONLY)

  let authUid;

  try {
    const userRecord = await admin.auth().createUser({
      email: demoEmail,
      password: demoPassword,
    });
    authUid = userRecord.uid;
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      const existingUser = await admin.auth().getUserByEmail(demoEmail);
      authUid = existingUser.uid;
    } else {
      throw err;
    }
  }

  /* ---------- CREATE ACTIVE MESS (FULL COPY) ---------- */
  const messRef = await db.collection("messes").add({
    /* 🔹 Core Identity */
    messName: data.messName,
    campusType: data.campusType,
    foodType: data.foodType,

    /* 🔹 Financials */
    prices: data.prices,
    penaltyPercent: data.penaltyPercent,
    estimatedCredits: data.estimatedCredits,

    /* 🔹 Grand Dinner Rules */
    grandDinner: data.grandDinner,

    /* 🔹 Operation Period */
    operation: data.operation,

    /* 🔹 Status & Metadata */
    status: "ACTIVE",
    isActive: true,
    createdFromApplicationId: id,

    /* 🔹 Demo Auth (Hackathon Only) */
    messAuth: {
      uid: authUid,
      email: demoEmail,
      password: demoPassword, // ⚠️ DEMO ONLY
    },

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  /* ---------- UPDATE APPLICATION ---------- */
  await ref.update({
    status: "APPROVED",
    messId: messRef.id,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    approvalNote: note,
    demoCredentials: {
      email: demoEmail,
      password: demoPassword,
    },
  });

  /* ---------- OPTIONAL EMAIL ---------- */
  try {
    await sendApprovalEmail(demoEmail, demoPassword, note);
  } catch (err) {
    console.error("⚠️ Approval email failed:", err.message);
  }

  /* ---------- RESPONSE ---------- */
  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Mess application approved and activated",
      data: {
        messId: messRef.id,
        demoLogin: {
          email: demoEmail,
          password: demoPassword,
        },
      },
    })
  );
});



export const rejectMessApp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = req.body.note || "Rejected by hostel office";

  const ref = db.collection("mess_applications").doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new ApiError(404, "Mess application not found");
  }

  const { email } = snap.data();

  await ref.update({
    status: "REJECTED",
    rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    rejectionNote: note,
  });

 
  try {
    await sendRejectionEmail(email, note);
  } catch (err) {
    console.error("⚠️ Rejection email failed:", err.message);
  }

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Mess application rejected",
    })
  );
});

export const getApprovedMesses = asyncHandler(async (req, res) => {
  const snap = await db
    .collection("messes")
    .where("isActive", "==", true) 
    .get();

  const messes = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Approved messes fetched",
      data: {
        total: messes.length,
        messes,
      },
    })
  );
});
