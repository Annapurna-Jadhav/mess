import db from "../config/firestore.js";
import { getTodayDate } from "../utils/getTodayDate.js";

const BUCKET_SIZE_MIN = 15;

function getTimeBucket(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const startMin = Math.floor(m / BUCKET_SIZE_MIN) * BUCKET_SIZE_MIN;
  const endMin = startMin + BUCKET_SIZE_MIN;

  return `${String(h).padStart(2, "0")}:${String(startMin).padStart(
    2,
    "0"
  )}-${String(h).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
}


export const buildDailyStats = async (date = getTodayDate()) => {
  console.log(`📊 Building daily stats → ${date}`);

  const messesSnap = await db
    .collection("messes")
    .where("isActive", "==", true)
    .get();

  if (messesSnap.empty) return;

  for (const messDoc of messesSnap.docs) {
    const messId = messDoc.id;

    const eventsSnap = await db
      .collection("messes")
      .doc(messId)
      .collection("meal_events")
      .where("date", "==", date)
      .get();

    if (eventsSnap.empty) continue;

    const stats = {};

    for (const doc of eventsSnap.docs) {
      const e = doc.data();
      const meal = e.mealType;

      if (!stats[meal]) {
        stats[meal] = {
          served: 0,
          noShow: 0,
          declaredAbsent: 0,
          expected: 0,
          buckets: {},
        };
      }

      stats[meal].expected++;

      if (e.status === "SERVED") {
        stats[meal].served++;
        const bucket = getTimeBucket(e.scannedAt.toDate());
        stats[meal].buckets[bucket] =
          (stats[meal].buckets[bucket] || 0) + 1;
      }

      if (e.status === "NO_SHOW") stats[meal].noShow++;
      if (e.status === "DECLARED_ABSENT")
        stats[meal].declaredAbsent++;
    }


    for (const meal of Object.keys(stats)) {
      let peak = null;
      let max = 0;

      for (const [bucket, count] of Object.entries(
        stats[meal].buckets
      )) {
        if (count > max) {
          max = count;
          peak = bucket;
        }
      }

      stats[meal].peakBucket = peak;
      delete stats[meal].buckets;
    }

    await db
      .collection("messes")
      .doc(messId)
      .collection("daily_stats")
      .doc(date)
      .set({
        date,
        ...stats,
        createdAt: new Date(),
      });

    console.log(`✅ Stats stored for mess ${messId}`);
  }
};
