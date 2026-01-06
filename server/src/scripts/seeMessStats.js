import admin from "../config/firebase.js";
import db from "../config/firestore.js";
import { getTodayDate } from "../utils/getTodayDate.js";

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

export const seedMessStatsFromStudentMealDays = async () => {
  const today = getTodayDate();

  const daysSnap = await db.collection("student_meal_days").get();
  if (daysSnap.empty) {
    console.log("❌ No student_meal_days found");
    return;
  }

  const messAgg = {}; // messId → stats

  for (const doc of daysSnap.docs) {
    const day = doc.data();
    const { messId, date, meals } = day;
    if (!messId || !meals) continue;

    if (!messAgg[messId]) {
      const messSnap = await db.collection("messes").doc(messId).get();
      if (!messSnap.exists) continue;

      const mess = messSnap.data();

      messAgg[messId] = {
        messId,
        prices: mess.prices,
        penaltyPercent: mess.penaltyPercent,

        total: {
          served: 0,
          declaredAbsent: 0,
          noShow: 0,
          revenue: 0,
        },

        today: {
          served: 0,
          declaredAbsent: 0,
          noShow: 0,
          revenue: 0,
        },
      };
    }

    const agg = messAgg[messId];

    for (const mealType of MEALS) {
      const meal = meals[mealType];
      if (!meal || meal.settlementApplied !== true) continue;

      let status = meal.status;
      if (status === "NONE") status = "NO_SHOW";

      const price = agg.prices[mealType] || 0;

  
      if (status === "SERVED") agg.total.served++;
      if (status === "DECLARED_ABSENT") agg.total.declaredAbsent++;
      if (status === "NO_SHOW") agg.total.noShow++;

      if (date === today) {
        if (status === "SERVED") agg.today.served++;
        if (status === "DECLARED_ABSENT") agg.today.declaredAbsent++;
        if (status === "NO_SHOW") agg.today.noShow++;
      }

  
      let revenue = 0;

      if (status === "SERVED") {
        revenue = price;
      }

      if (status === "DECLARED_ABSENT") {
        revenue = price;
      }

      if (status === "NO_SHOW") {
        revenue = price * (agg.penaltyPercent / 100);
      }

      agg.total.revenue += revenue;
      if (date === today) {
        agg.today.revenue += revenue;
      }
    }
  }

  for (const messId of Object.keys(messAgg)) {
    const agg = messAgg[messId];

    await db.collection("messes").doc(messId).update({
      servedCount: agg.total.served,
      stats: {
        total: {
          served: agg.total.served,
          declaredAbsent: agg.total.declaredAbsent,
          noShow: agg.total.noShow,
        },
        today: {
          served: agg.today.served,
          declaredAbsent: agg.today.declaredAbsent,
          noShow: agg.today.noShow,
        },
      },
      revenue: {
        total: agg.total.revenue,
        today: agg.today.revenue,
      },
      statsSeededAt: new Date(),
    });
  }

  console.log("✅ Mess stats seeded from student_meal_days");
};

/* ---------- RUN ---------- */
seedMessStatsFromStudentMealDays()
  .then(() => {
    console.log("🎯 Seed finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed", err);
    process.exit(1);
  });
