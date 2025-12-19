// src/controllers/receipt.controller.js
import { extractRollFromEmail } from "../utils/extractRoll.js";
import { verifyQRToken } from "../services/qr.services.js";
import db from "../config/firestore.js";
import { scanQRFromImage } from "../utils/scanQRFromImage.js";
import  asyncHandler from "../utils/asyncHandler.js";
import  ApiResponse from "../utils/ApiResponse.js";
import  ApiError  from "../utils/ApiError.js";



export const verifyReceipt = asyncHandler(async (req, res) => {
  /* ---------- AUTH ---------- */
  if (!req.user || !req.user.uid || !req.user.email) {
    return res.status(401).json(
      new ApiResponse({
        statusCode: 401,
        message: "Unauthorized",
      })
    );
  }

  if (!req.file) {
    return res.status(400).json(
      new ApiResponse({
        statusCode: 400,
        message: "Receipt image required",
      })
    );
  }

  const { uid, email } = req.user;

  /* ---------- 1️⃣ SCAN & VERIFY QR ---------- */
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
    return res.status(400).json(
      new ApiResponse({
        statusCode: 400,
        message: "Invalid receipt QR data",
      })
    );
  }

  /* ---------- 2️⃣ CROSS-CHECK IDENTITY ---------- */
  const emailRoll = extractRollFromEmail(email);
  if (qrData.roll !== emailRoll) {
    return res.status(403).json(
      new ApiResponse({
        statusCode: 403,
        message: "Receipt does not belong to you",
      })
    );
  }

  const receiptRef = db
    .collection("receiptVerification")
    .doc(qrData.receiptId);

  const studentRef = db.collection("students").doc(uid);

  /* ---------- 3️⃣ ATOMIC & IDEMPOTENT TRANSACTION ---------- */
  await db.runTransaction(async (tx) => {
    const receiptSnap = await tx.get(receiptRef);

    // 🔁 Receipt already exists
    if (receiptSnap.exists) {
      const usedBy = receiptSnap.data().verifiedByUid;

      // Same student retry → idempotent success
      if (usedBy === uid) {
        return;
      }

      // Different student → block
      throw new ApiError(
        409,
        "Receipt already used by another student"
      );
    }

    const studentSnap = await tx.get(studentRef);

    // 🔁 Student already verified → idempotent success
    if (studentSnap.exists && studentSnap.data().receiptVerified) {
      return;
    }

    /* ---------- SAVE RECEIPT ---------- */
    tx.set(receiptRef, {
      receiptId: qrData.receiptId,
      roll: qrData.roll,
      issuedAt: qrData.issuedAt,
      validTill: qrData.validTill,
      initialCredits: qrData.initialCredits,
      verifiedByUid: uid,
      verifiedAt: new Date(),
    });

    /* ---------- UPDATE STUDENT ---------- */
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

  /* ---------- 4️⃣ RESPONSE ---------- */
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

// controllers/student.controller.js
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
      },
    })
  );
});
