import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import db from "../config/firestore.js";
import { MEAL_TIMINGS } from "../config/mealTimings.js";


export const declareMealAbsence = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const { mealType, date } = req.body;

  if (!mealType || !date) {
    throw new ApiError(400, "mealType and date are required");
  }

  if (!MEAL_TIMINGS[mealType]) {
    throw new ApiError(400, "Invalid meal type");
  }

  const studentRef = db.collection("students").doc(uid);
  const studentSnap = await studentRef.get();

  if (!studentSnap.exists) {
    throw new ApiError(404, "Student not found");
  }

  const student = studentSnap.data();

  if (!student.messSelected) {
    throw new ApiError(403, "Student is not enrolled in any mess");
  }


  const mealStart = new Date(
    `${date}T${MEAL_TIMINGS[mealType].start}:00`
  );

  const now = new Date();
  const diffMs = mealStart.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    throw new ApiError(
      403,
      "Absence must be declared at least 24 hours before meal time"
    );
  }

  const currentStatus = student.mealStatus?.[mealType];

  if (currentStatus === "SERVED") {
    throw new ApiError(409, "Meal already consumed");
  }

  if (currentStatus === "DECLARED_ABSENT") {
    throw new ApiError(409, "Absence already declared");
  }

 

  await studentRef.update({
    [`mealStatus.${mealType}`]: "DECLARED_ABSENT",
  });


  const messId = student.selectedMess.messId;
  const price =
    student.selectedMess.prices[mealType.toLowerCase()];

  await db
    .collection("messes")
    .doc(messId)
    .collection("meal_events")
    .add({
      uid,
      studentRoll: student.roll,
      mealType,
      status: "DECLARED_ABSENT",
      price,
      date,
      createdAt: new Date(),
      settlementApplied: false,
    });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: `${mealType} marked as declared absent`,
    })
  );
});
