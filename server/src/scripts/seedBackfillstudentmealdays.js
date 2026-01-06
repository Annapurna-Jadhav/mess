import admin from "../config/firebase.js";
import db from "../config/firestore.js";

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

export const backfillFromStudentMealDays = async () => {
  const daysSnap = await db.collection("student_meal_days").get();

  if (daysSnap.empty) {
    console.log("❌ No student_meal_days found");
    return;
  }

  const messRevenueAgg = {};

  for (const doc of daysSnap.docs) {
    const day = doc.data();
    const dayRef = doc.ref;

    const { uid, messId, meals, date } = day;
    if (!uid || !messId || !meals) continue;

    const studentSnap = await db.collection("students").doc(uid).get();
    if (!studentSnap.exists) continue;

    const student = studentSnap.data();
    const prices = student?.selectedMess?.prices || {};
    const penalty = student?.selectedMess?.penaltyPercent ?? 0;

    const batch = db.batch();
    let hasBatchWrites = false;

    for (const mealType of MEALS) {
      const meal = meals[mealType];
      if (!meal) continue;

      // 🔒 Skip if already settled
      if (meal.settlementApplied === true) continue;

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

      // 💰 Student wallet
      if (studentCredit > 0) {
        const studentRef = db.collection("students").doc(uid);
        batch.update(studentRef, {
          walletBalance: admin.firestore.FieldValue.increment(studentCredit),
        });
        hasBatchWrites = true;
      }

      if (!messRevenueAgg[messId]) messRevenueAgg[messId] = 0;
      messRevenueAgg[messId] += messRevenue;

      // ✅ Mark meal as settled
      batch.update(dayRef, {
        [`meals.${mealType}.settlementApplied`]: true,
        [`meals.${mealType}.settledAt`]: new Date(),
      });
      hasBatchWrites = true;
    }

    if (hasBatchWrites) {
      batch.update(dayRef, {
        updatedAt: new Date(),
      });
      await batch.commit();
    }
  }

  for (const messId of Object.keys(messRevenueAgg)) {
    await db.collection("messes").doc(messId).update({
      totalRevenue: admin.firestore.FieldValue.increment(
        messRevenueAgg[messId]
      ),
    });
  }

  console.log("✅ SAFE BACKFILL COMPLETED (IDEMPOTENT)");
};

backfillFromStudentMealDays()
  .then(() => {
    console.log("🎯 Backfill script finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Backfill script failed", err);
    process.exit(1);
  });
