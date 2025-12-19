import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const QR_SECRET = process.env.QR_SECRET; // same as backend .env
let num=1;
let  Roll=`231CV20${num}`
// let issueName="credits_0"
async function generateReceipt() {
  const payload = {
    roll: `231CV20${num}`,
    name: `STUDENT ${num}`,
    receiptId: `HOSTEL-${Roll}-2025`,
    issuedAt: "2025-12-15",   
    validTill: "2026-04-30",
    initialCredits:"20000"  //2026-04-30
  };

  // 1️⃣ Sign QR token
  const qrToken = jwt.sign(payload, QR_SECRET, {
    expiresIn: "365d",
  });

  // 2️⃣ Generate QR image
  const qrImagePath = `./receipts/231CV20${num}_receipt_qr.png`;
  await QRCode.toFile(qrImagePath, qrToken);

  console.log("✅ Receipt QR generated:", qrImagePath);
}

for (let i=1;i<30;i++){

    generateReceipt();
    num++;
}

 