import admin from "../config/firebase.js";

import db from "../config/firestore.js";



const MEALS = ["breakfast", "lunch", "snacks", "dinner"];
const BUCKET_MIN = 15;

function getTimeBucket(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const start = Math.floor(m / BUCKET_MIN) * BUCKET_MIN;
  const end = start + BUCKET_MIN;

  return `${String(h).padStart(2, "0")}:${String(start).padStart(
    2,
    "0"
  )}-${String(h).padStart(2, "0")}:${String(end).padStart(2, "0")}`;
}

export const backfillDailyAnalytics = async () => {
  const snap = await db.collection("student_meal_days").get();
  if (snap.empty) {
    console.log("❌ No student_meal_days found");
    return;
  }

  const agg = {}; // messId_date

  for (const doc of snap.docs) {
    const day = doc.data();
    const { messId, date, meals } = day;
    if (!messId || !date || !meals) continue;

    const key = `${messId}_${date}`;

    if (!agg[key]) {
      agg[key] = {
        messId,
        date,
        meals: {},
        totals: {
          served: 0,
          declaredAbsent: 0,
          noShow: 0,
        },
        createdAt: new Date(),
      };

      for (const meal of MEALS) {
        agg[key].meals[meal] = {
          served: 0,
          declaredAbsent: 0,
          noShow: 0,
          buckets: {},
          peakBucket: null,
        };
      }
    }

    for (const mealType of MEALS) {
      const m = meals[mealType];
      if (!m) continue;

      let status = m.status;
      if (status === "NONE") status = "NO_SHOW";

      if (status === "SERVED") {
        agg[key].meals[mealType].served++;
        agg[key].totals.served++;

        if (m.scannedAt) {
          const bucket = getTimeBucket(m.scannedAt.toDate());
          agg[key].meals[mealType].buckets[bucket] =
            (agg[key].meals[mealType].buckets[bucket] || 0) + 1;
        }
      }

      if (status === "DECLARED_ABSENT") {
        agg[key].meals[mealType].declaredAbsent++;
        agg[key].totals.declaredAbsent++;
      }

      if (status === "NO_SHOW") {
        agg[key].meals[mealType].noShow++;
        agg[key].totals.noShow++;
      }
    }
  }

  /* --------- PEAK BUCKET --------- */
  for (const key of Object.keys(agg)) {
    for (const meal of MEALS) {
      let max = 0;
      let peak = null;

      for (const [bucket, count] of Object.entries(
        agg[key].meals[meal].buckets
      )) {
        if (count > max) {
          max = count;
          peak = bucket;
        }
      }

      agg[key].meals[meal].peakBucket = peak;
      delete agg[key].meals[meal].buckets;
    }
  }

  for (const key of Object.keys(agg)) {
    const d = agg[key];

    await db
      .collection("messes")
      .doc(d.messId)
      .collection("daily_analytics")
      .doc(d.date)
      .set(d, { merge: true });
  }

  console.log("✅ Daily analytics backfill completed");
};

backfillDailyAnalytics()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
