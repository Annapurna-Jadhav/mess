import admin from "../config/firebase.js";
import db from "../config/firestore.js";

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];


function getTodayDate() {
  const d = new Date();
  return d.toISOString().split("T")[0]; 
}

function hasMealEnded(mealTimeRange) {
  // example: "12:00-14:00"
  const now = new Date();

  const parts = mealTimeRange.split("-");
  if (parts.length !== 2) return false;

  const [endH, endM] = parts[1].split(":").map(Number);
  if (isNaN(endH) || isNaN(endM)) return false;

  const endTime = new Date(now);
  endTime.setHours(endH, endM, 0, 0);

  return now >= endTime;
}



export const settleTodayFromStudentMealDays = async () => {
  const today = getTodayDate();
  console.log(`📅 Running time-aware settlement for ${today}`);

  const daysSnap = await db
    .collection("student_meal_days")
    .where("date", "==", today)
    .get();

  if (daysSnap.empty) {
    console.log("❌ No student_meal_days for today");
    return;
  }

  const messRevenueAgg = {};

  for (const doc of daysSnap.docs) {
    const day = doc.data();
    const dayRef = doc.ref;

    const { uid, messId, meals } = day;
    if (!uid || !messId || !meals) continue;

    const studentSnap = await db.collection("students").doc(uid).get();
    if (!studentSnap.exists) continue;

    const student = studentSnap.data();
    const prices = student?.selectedMess?.prices || {};
    const penalty = student?.selectedMess?.penaltyPercent ?? 0;

    const batch = db.batch();
    let hasWrites = false;

    for (const mealType of MEALS) {
      const meal = meals[mealType];
      if (!meal) continue;

      // 🔒 already settled
      if (meal.settlementApplied === true) continue;

      // ⏱️ do NOT settle future meals
      if (!meal.time || !hasMealEnded(meal.time)) continue;

      let status = meal.status;
      if (status === "NONE") status = "NO_SHOW";

      const price = prices[mealType];
      if (typeof price !== "number") continue;

      let studentCredit = 0;
      let messRevenue = 0;

      if (status === "SERVED") {
        messRevenue = price;
      } else if (status === "DECLARED_ABSENT") {
        studentCredit = price;
      } else if (status === "NO_SHOW") {
        studentCredit = price * (1 - penalty / 100);
        messRevenue = price * (penalty / 100);
      }

      /* ---------- APPLY WALLET ---------- */
      if (studentCredit > 0) {
        batch.update(db.collection("students").doc(uid), {
          walletBalance: admin.firestore.FieldValue.increment(studentCredit),
        });
        hasWrites = true;
      }

      /* ---------- AGGREGATE MESS REVENUE ---------- */
      if (!messRevenueAgg[messId]) messRevenueAgg[messId] = 0;
      messRevenueAgg[messId] += messRevenue;

      /* ---------- MARK SETTLED ---------- */
      batch.update(dayRef, {
        [`meals.${mealType}.settlementApplied`]: true,
        [`meals.${mealType}.settledAt`]: new Date(),
      });
      hasWrites = true;
    }

    if (hasWrites) {
      batch.update(dayRef, { updatedAt: new Date() });
      await batch.commit();
    }
  }

  /* ---------- APPLY MESS REVENUE (ONCE) ---------- */
  for (const messId of Object.keys(messRevenueAgg)) {
    await db.collection("messes").doc(messId).update({
      totalRevenue: admin.firestore.FieldValue.increment(
        messRevenueAgg[messId]
      ),
    });
  }

  console.log("✅ TODAY TIME-AWARE SETTLEMENT COMPLETED");
};



settleTodayFromStudentMealDays()
  .then(() => {
    console.log("🎯 Settlement script finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Settlement script failed", err);
    process.exit(1);
  });
