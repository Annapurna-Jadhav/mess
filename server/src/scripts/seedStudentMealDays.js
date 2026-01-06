
import admin from "../config/firebase.js";
import db from "../config/firestore.js";


const MESS_ID = "A1mUzvxiP3ol3QDMu7O1";

const STUDENT_UIDS = [
  "XzdjxEK4sNc6nZbknmN4gOaDoTm1",
  "VBZorFA3QCYVfdzykLBOAEAJ4TC2",
  "3JkuWvOehPfhFfU3q3QnGwoTvg72",
  "oMPC5aMTw8ZxHT6Ckb4bR07YqK23",
  "N1fZcb71iHd9L1OeUALDk8K3Rlg1",
  "ikUTeODqDKcWdjJjzk2CmW1D5Zr2",
  "ZAVRrs0kD1XeX2H6rHgnBiCrYlr2",
  "CUxrbin1sScLA0yeU7psMdGuZ3U2",
  "vKOxpAElryMRXQFnXdKKcc70QGt1",
  "v7ZIty6zzONmg9SLM2sMOhCIPkk2",
  "5tT5xlrk21gu6M8Eywp2Nhsy0jM2",
  "sGzxfDw9toayuAM2n6fg7iUHj7j2",
  "DZxqauGlKRhyg1jhqC1RqclawRt2",
  "8Dg98ns8TlY0lYGWiYuHIhVxd2g2",
  "flLmqDshHJQGG8YHQW4ikyFexQO2",
  "15BQjPqimiVgCYxn5VrguxmgVzo2",
  "tOOGvEbxAoTc3dE5wkbyPYP0kKR2",
  "2Q1O1we2tXVnyE8qsXc6hz04sFM2",
  "XAuPxAOTgBR4oE85WnqAMTz7fft1",
  "BLcGEljRd9ODP9JbfRcihsAR7rI2",
  "Qr4rg4mpKnctsmxL1jQpxFT8qU63",
  "HUNaaY2UpCgGWD0EXQ40FY1A7U92",
  "NK6SSMHFlja7TRE0lM8XVQkJjik2",
  "6eLEKbpZOebFP6RMgAuETeMFZIz2",
  "8zBjjcomEaSxnTxP8erRDKxR6Hb2",
  "OBt3tcp9y3SJ9TUYDWJ8SoQzsUe2",
  "r8efKGlHfnQPEfRYbtPSnQCuUG02",
  "2UnygH1YbtMaXv7ohplm8a8rVeH2",
  "19aivBPvHlUF8oblymSlRYzVfk93",
  "nMKgBITWhMX8t39mYCwbTdtQFXn2",
];

const MEAL_TIMES = {
  breakfast: "07:30-09:30",
  lunch: "12:00-14:00",
  snacks: "16:30-18:00",
  dinner: "19:30-21:00",
};

const STATUSES = ["SERVED", "DECLARED_ABSENT", "NONE"];



function randomStatus() {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)];
}

function dateRange(start, end) {
  const dates = [];
  let d = new Date(start);
  while (d <= end) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function randomScannedAt(dateStr, timeRange) {
  const [start, end] = timeRange.split("-");
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startDate = new Date(dateStr);
  startDate.setHours(sh, sm, 0, 0);

  const endDate = new Date(dateStr);
  endDate.setHours(eh, em, 0, 0);

  const totalMinutes =
    (endDate.getTime() - startDate.getTime()) / 60000;

  const bucketIndex = Math.floor(totalMinutes / 15);
  const chosenBucket = Math.floor(Math.random() * bucketIndex);

  const bucketStart = new Date(
    startDate.getTime() + chosenBucket * 15 * 60000
  );

  // random offset inside bucket
  const offset = Math.floor(Math.random() * 15) * 60000;

  return new Date(bucketStart.getTime() + offset);
}


async function seedStudentMealDays() {
  const dates = dateRange(
    new Date("2025-12-05"),
    new Date("2026-01-03")
  );

  const batch = db.batch();

  for (const uid of STUDENT_UIDS) {
    for (const date of dates) {
      const docId = `${uid}_${date}`;
      const ref = db.collection("student_meal_days").doc(docId);

      const meals = {};

      for (const meal of Object.keys(MEAL_TIMES)) {
        const status = randomStatus();

        meals[meal] = {
          status,
          time: MEAL_TIMES[meal],
        };

        if (status === "SERVED") {
          meals[meal].scannedAt = randomScannedAt(
            date,
            MEAL_TIMES[meal]
          );
        }
      }

      batch.set(ref, {
        uid,
        messId: MESS_ID,
        date,
        meals,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  await batch.commit();
  console.log("✅ student_meal_days seeded with scannedAt buckets");
}

seedStudentMealDays().catch(console.error);
