import { MEAL_TIMINGS } from "../config/mealTimings.js";

export function detectMealType(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();

  const inRange = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    return minutes >= startMin && minutes <= endMin;
  };

  for (const [mealType, timing] of Object.entries(MEAL_TIMINGS)) {
    if (inRange(timing.start, timing.end)) {
      return mealType; 
    }
  }

  return null;
}
