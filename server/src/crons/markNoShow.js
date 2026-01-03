import db from "../config/firestore.js";
import { getTodayDate } from "../utils/getTodayDate.js";


export const markNoShowForMeal = async (mealType) => {
  const date = getTodayDate();
  console.log(`⏱ NO_SHOW cron → ${mealType} (${date})`);

  const snap = await db
    .collection("student_meal_days")
    .where("date", "==", date)
    .where(`meals.${mealType}.status`, "==", "NONE")
    .get();

  if (snap.empty) return;

  const batch = db.batch();

  for (const doc of snap.docs) {
    const day = doc.data();
    const { uid, messId } = day;

    const studentSnap = await db.collection("students").doc(uid).get();
    if (!studentSnap.exists) continue;

    const student = studentSnap.data();
    const price = student.selectedMess.prices[mealType];
    const penaltyPercent = student.selectedMess.penaltyPercent;

    /* 1️⃣ Update student daily state */
    batch.update(doc.ref, {
      [`meals.${mealType}.status`]: "NO_SHOW",
      updatedAt: new Date(),
    });

    /* 2️⃣ Write immutable event */
    batch.set(
      db
        .collection("messes")
        .doc(messId)
        .collection("meal_events")
        .doc(),
      {
        uid,
        studentRoll: student.roll,
        messId,
        mealType,
        status: "NO_SHOW",
        price,
        penaltyPercent,
        date,
        createdAt: new Date(),
        settlementApplied: false,
      }
    );
  }

  await batch.commit();
  console.log(`✅ NO_SHOW marked for ${mealType}`);
};
