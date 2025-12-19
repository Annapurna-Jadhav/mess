// controllers/admin.controller.js
import db from "../config/firestore.js";
import admin from "../config/firebase.js";
import { sendApprovalEmail, sendRejectionEmail } from "../services/emailServices.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// controllers/admin.controller.js

export const getPendingApps = asyncHandler(async (req, res) => {
  const snap = await db
    .collection("mess_applications")
    .where("status", "==", "PENDING_HOSTEL_APPROVAL")
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

  const ref = db.collection("mess_applications").doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new ApiError(404, "Mess application not found");
  }

  const data = snap.data();

  // 🔐 Create auth user (idempotent)
  let tempPassword = null;
  try {
    tempPassword = Math.random().toString(36).slice(-8);
    await admin.auth().createUser({
      email: data.email,
      password: tempPassword,
    });
  } catch (err) {
    if (err.code !== "auth/email-already-exists") {
      throw err;
    }
  }

  // 📦 Promote to active mess
  const messRef = await db.collection("messes").add({
    ...data,
    isActive: true,
    createdFromApplicationId: id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await ref.update({
    status: "APPROVED",
    messId: messRef.id,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    approvalNote: note,
  });

  // 📧 Email (non-blocking)
  try {
    await sendApprovalEmail(data.email, tempPassword, note);
  } catch (err) {
    console.error("⚠️ Approval email failed:", err.message);
  }

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Mess application approved",
      data: {
        messId: messRef.id,
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

  // 📧 Email (non-blocking)
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
  const snap = await db.collection("messes").get();

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