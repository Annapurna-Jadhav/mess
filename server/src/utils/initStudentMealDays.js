import { getTodayISO, addDaysISO } from "../utils/date.js";

// export const initStudentMealDays = async (uid, student) => {
//   const batch = db.batch();
//   const todayISO = getTodayISO(); // "2026-01-02"

//   for (let i = 0; i < 7; i++) {
//     // ✅ always derive NEW date string
//     const dateISO = addDaysISO(todayISO, i);

//     const ref = db
//       .collection("student_meal_days")
//       .doc(`${uid}_${dateISO}`);

//     batch.set(ref, {
//       uid,
//       messId: student.selectedMess.messId,
//       date: dateISO,

//       meals: {
//         breakfast: { status: "NONE", time: "08:00-09:30" },
//         lunch: { status: "NONE", time: "12:30-14:00" },
//         snacks: { status: "NONE", time: "16:30-17:30" },
//         dinner: { status: "NONE", time: "19:30-21:00" },
//       },

//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//   }

//   await batch.commit();
// };




export const initStudentMealDays = async (uid, student) => {
  console.log("🛠 initStudentMealDays START for", uid);

  const batch = db.batch();
  const today = getTodayISO();

  console.log("📅 init today:", today);

  for (let i = 0; i < 8; i++) {
    const date = addDaysISO(today, i);
    console.log(`📆 Creating day ${i}:`, date);

    const ref = db
      .collection("student_meal_days")
      .doc(`${uid}_${date}`);

    batch.set(ref, {
      uid,
      messId: student.selectedMess.messId,
      date,

      meals: {
        breakfast: { status: "NONE", time: "08:00-09:30" },
        lunch: { status: "NONE", time: "12:30-14:00" },
        snacks: { status: "NONE", time: "16:30-17:30" },
        dinner: { status: "NONE", time: "19:30-21:00" },
      },

      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await batch.commit();
  console.log("✅ initStudentMealDays DONE");
};
