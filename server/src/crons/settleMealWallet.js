import db from "../config/firestore.js";
import { getTodayDate } from "../utils/getTodayDate.js";


export const settleMealWallet = async (mealType, date = getTodayDate()) => {
  console.log(`💰 Settling wallet + revenue → ${mealType} (${date})`);

  const messesSnap = await db
    .collection("messes")
    .where("isActive", "==", true)
    .get();

  for (const messDoc of messesSnap.docs) {
    const messId = messDoc.id;
    const messRef = messDoc.ref;

    const eventsSnap = await messRef
      .collection("meal_events")
      .where("mealType", "==", mealType)
      .where("date", "==", date)
      .where("settlementApplied", "==", false)
      .get();

    if (eventsSnap.empty) continue;

    const batch = db.batch();

    let messRevenueIncrement = 0;

    for (const eventDoc of eventsSnap.docs) {
      const event = eventDoc.data();
      const eventRef = eventDoc.ref;

      const studentRef = db.collection("students").doc(event.uid);
      const studentSnap = await studentRef.get();
      if (!studentSnap.exists) continue;

      let walletCredit = 0;
      let messRevenue = 0;

      if (event.status === "SERVED") {
        messRevenue = event.price;
      }

      if (event.status === "DECLARED_ABSENT") {
        walletCredit = event.price;
      }

      if (event.status === "NO_SHOW") {
        walletCredit =
          event.price * (1 - event.penaltyPercent / 100);

        messRevenue =
          event.price * (event.penaltyPercent / 100);
      }

      // student wallet update
      if (walletCredit > 0) {
        batch.update(studentRef, {
          walletBalance: db.FieldValue.increment(walletCredit),
        });
      }

      messRevenueIncrement += messRevenue;

      batch.update(eventRef, {
        settlementApplied: true,
        walletCreditApplied: walletCredit,
        messRevenueApplied: messRevenue,
        settledAt: new Date(),
      });
    }

  
    if (messRevenueIncrement > 0) {
      batch.update(messRef, {
        totalRevenue: db.FieldValue.increment(messRevenueIncrement),
      });
    }

    await batch.commit();
    console.log(
      `✅ Revenue settled for mess ${messId}: ₹${messRevenueIncrement}`
    );
  }
};


