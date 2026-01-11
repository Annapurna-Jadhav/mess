import db from "../config/firestore.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { VertexAI } from "@google-cloud/vertexai";
import { BigQuery } from "@google-cloud/bigquery";

export const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
});



const MEALS = ["breakfast", "lunch", "snacks", "dinner"];




export const getMessAnalytics = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const {
    fromDate,
    toDate,
    mode = "count", 
  } = req.query;

  const messSnap = await db
    .collection("messes")
    .where("messAuth.uid", "==", uid)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (messSnap.empty) {
    throw new ApiError(403, "Mess not found");
  }

  const messDoc = messSnap.docs[0];
  const messId = messDoc.id;
  const mess = messDoc.data();

  const prices = mess.prices || {};
  const penaltyPercent = mess.operation?.penaltyPercent ?? 75;

 
  const end =
    toDate ||
    new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const start =
    fromDate ||
    new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const snap = await db
    .collection("messes")
    .doc(messId)
    .collection("daily_analytics")
    .where("date", ">=", start)
    .where("date", "<=", end)
    .orderBy("date", "asc")
    .get();

 
 if (mode === "peakHours") {
  const peakByMeal = [];
  const totals = {
    served: 0,
    declaredAbsent: 0,
    noShow: 0,
  };

  for (const doc of snap.docs) {
    const d = doc.data();

    const day = {
      date: d.date,
      meals: {}, 
    };

    for (const [meal, m] of Object.entries(d.meals || {})) {
     
      if (m.peakBucket) {
        day.meals[meal] = m.peakBucket;
      }

      totals.served += m.served || 0;
      totals.declaredAbsent += m.declaredAbsent || 0;
      totals.noShow += m.noShow || 0;
    }

    peakByMeal.push(day);
  }

  return res.json(
    new ApiResponse({
      statusCode: 200,
      message: "Peak hours analytics",
      data: {
        range: { start, end },
        mode,
        unit: "time",
        peakByMeal,   
        totals,      
      },
    })
  );
}

 
  const daily = [];
  const totals = {
    served: 0,
    declaredAbsent: 0,
    noShow: 0,
  };

  const unit = mode === "count" ? "students" : "rupees";

  for (const doc of snap.docs) {
    const d = doc.data();

    const day = {
      date: d.date,
      meals: {},
      totals: {
        served: 0,
        declaredAbsent: 0,
        noShow: 0,
      },
    };

    for (const [meal, m] of Object.entries(d.meals || {})) {
      if (mode === "count") {
        const served = m.served || 0;
        const absent = m.declaredAbsent || 0;
        const noShow = m.noShow || 0;

        day.meals[meal] = { served, declaredAbsent: absent, noShow };

        day.totals.served += served;
        day.totals.declaredAbsent += absent;
        day.totals.noShow += noShow;
      }

      if (mode === "revenue") {
        const price = prices[meal] || 0;

        const servedRevenue = (m.served || 0) * price;
        const noShowRevenue =
          (m.noShow || 0) * price * (penaltyPercent / 100);

        day.meals[meal] = {
          served: servedRevenue,
          declaredAbsent: 0,
          noShow: noShowRevenue,
        };

        day.totals.served += servedRevenue;
        day.totals.noShow += noShowRevenue;
      }
    }

    totals.served += day.totals.served;
    totals.declaredAbsent += day.totals.declaredAbsent;
    totals.noShow += day.totals.noShow;

    daily.push(day);
  }

  return res.json(
    new ApiResponse({
      statusCode: 200,
      message: "Analytics data fetched",
      data: {
        range: { start, end },
        mode,
        unit,
        daily,
        totals,
      },
    })
  );
});



export const buildAnalyticsSummaryForMess = async (messAuthUid, days = 7) => {
  const messSnap = await db
    .collection("messes")
    .where("messAuth.uid", "==", messAuthUid)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (messSnap.empty) throw new Error("Mess not found");

  const messId = messSnap.docs[0].id;


  const end = new Date(Date.now() - 86400000); 
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  const snap = await db
    .collection("messes")
    .doc(messId)
    .collection("daily_analytics")
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .orderBy("date", "asc")
    .get();

  
  const totals = {
    served: 0,
    declaredAbsent: 0,
    noShow: 0,
    foodWaste: 0,
  };

  const mealWise = {};
  const peakTracker = {};
  const daily = [];

  const dayOfWeekStats = {
    0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {},
  };

  for (const meal of MEALS) {
    mealWise[meal] = { served: 0, declaredAbsent: 0, noShow: 0 };
    peakTracker[meal] = {};

    for (const d of Object.keys(dayOfWeekStats)) {
      dayOfWeekStats[d][meal] = { served: 0, count: 0 };
    }
  }

 
  for (const doc of snap.docs) {
    const d = doc.data();
    daily.push(d);

    const dayIndex = new Date(d.date).getDay();

    totals.served += d.totals.served;
    totals.declaredAbsent += d.totals.declaredAbsent;
    totals.noShow += d.totals.noShow;

    for (const meal of MEALS) {
      const m = d.meals[meal];
      if (!m) continue;

      mealWise[meal].served += m.served;
      mealWise[meal].declaredAbsent += m.declaredAbsent;
      mealWise[meal].noShow += m.noShow;

      dayOfWeekStats[dayIndex][meal].served += m.served;
      dayOfWeekStats[dayIndex][meal].count++;

      if (m.peakBucket) {
        peakTracker[meal][m.peakBucket] =
          (peakTracker[meal][m.peakBucket] || 0) + 1;
      }
    }
  }

  totals.foodWaste = totals.declaredAbsent + totals.noShow;


  const peakHours = {};
  for (const meal of MEALS) {
    let peak = null;
    let max = 0;

    for (const [bucket, count] of Object.entries(peakTracker[meal])) {
      if (count > max) {
        max = count;
        peak = bucket;
      }
    }
    peakHours[meal] = peak;
  }

 
  const averages = {};
  for (const meal of MEALS) {
    averages[meal] = Math.round(
      mealWise[meal].served / Math.max(daily.length, 1)
    );
  }


  const trendHint = {};
  for (const meal of MEALS) {
    if (daily.length < 4) {
      trendHint[meal] = "INSUFFICIENT_DATA";
      continue;
    }

    const mid = Math.floor(daily.length / 2);
    const firstHalf = daily.slice(0, mid);
    const secondHalf = daily.slice(mid);

    const avg1 =
      firstHalf.reduce((s, d) => s + d.meals[meal].served, 0) /
      firstHalf.length;
    const avg2 =
      secondHalf.reduce((s, d) => s + d.meals[meal].served, 0) /
      secondHalf.length;

    trendHint[meal] =
      avg2 > avg1 ? "INCREASING" : avg2 < avg1 ? "DECREASING" : "STABLE";
  }

  return {
    range: { start: startDate, end: endDate },
    totals,
    mealWise,
    peakHours,
    averages,
    trendHint,
    dayOfWeekStats,
    daily,
  };
};





export const getMessAnalyticsSummary = asyncHandler(async (req, res) => {
  const days = Number(req.query.days || 7);

  const summary = await buildAnalyticsSummaryForMess(
    req.user.uid,
    days
  );

  return res.json(
    new ApiResponse({
      statusCode: 200,
      message: "Analytics summary",
      data: summary,
    })
  );
});

export const generateAnalyticsInsights = asyncHandler(async (req, res) => {
  const summary = await buildAnalyticsSummaryForMess(req.user.uid, 30);

  const insights = [];

  if (summary.totals.foodWaste > summary.totals.served * 0.15) {
    insights.push(
      "Food waste is high. Consider reducing meal preparation or improving attendance tracking."
    );
  }

  for (const meal of MEALS) {
    if (summary.mealWise[meal].noShow > summary.mealWise[meal].served * 0.3) {
      insights.push(
        `High no-show rate observed during ${meal}. Consider reducing quantity.`
      );
    }
  }

  if (summary.peakHours.breakfast) {
    insights.push(
      `Breakfast peak time is around ${summary.peakHours.breakfast}. Ensure counters are staffed accordingly.`
    );
  }

  return res.json(
    new ApiResponse({
      statusCode: 200,
      message: "Analytics insights generated",
      data: {
        insights,
        summary,
      },
    })
  );
});




export const getMessIdFromAuth = async (messAuthUid) => {
  const messSnap = await db
    .collection("messes")
    .where("messAuth.uid", "==", messAuthUid)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (messSnap.empty) {
    throw new Error("Mess not found for this user");
  }

  return messSnap.docs[0].id;
};



export const askMessAnalyticsAI = asyncHandler(async (req, res) => {
  const { question, days } = req.body;
  if (!question) throw new ApiError(400, "Question is required");

  const q = question.toLowerCase();

  const intent =
    q.includes("predict") || q.includes("forecast")
      ? "PREDICTION"
      : q.includes("waste") || q.includes("no show")
      ? "WASTE"
      : q.includes("peak") || q.includes("rush")
      ? "PEAK"
      : q.includes("attendance") || q.includes("served")
      ? "ATTENDANCE"
      : q.includes("quality") || q.includes("taste")
      ? "FOOD_QUALITY"
      : q.includes("what should") || q.includes("how can")
      ? "GUIDANCE"
      : "GENERAL";

  const messId = req.user.messId
    ? req.user.messId
    : await getMessIdFromAuth(req.user.uid);

  const cacheKey = days
    ? `${messId}_SUMMARY_${days}`
    : `${messId}_SUMMARY_ALL`;

  const cacheRef = db
    .collection("analytics_summary_cache")
    .doc(cacheKey);

  const cacheSnap = await cacheRef.get();
  let summary;

  if (cacheSnap.exists) {
    const cached = cacheSnap.data();
    if (
      cached?.createdAt &&
      Date.now() - cached.createdAt.toMillis() < 10 * 60 * 1000
    ) {
      summary = cached.summary;
    }
  }

  if (!summary) {
    summary = await buildAnalyticsSummaryForMessBigQuery({
      messId,
      days,
    });

    await cacheRef.set({
      summary,
      createdAt: new Date(),
    });
  }

  const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: "us-central1",
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  });

  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

 const prompt = `
You are a knowledgeable, friendly, and practical assistant for a college mess management system.

You behave like an experienced mess operations expert who understands real hostel mess operations — attendance issues, food preparation, wastage, planning, and cost pressures. Your communication should feel natural and conversational, like ChatGPT, not robotic or academic.

Your responsibility is to handle ANY question related to the college mess. This includes:
- Attendance, no-shows, and declared absences
- Food wastage and efficiency issues
- Meal-wise or day-wise trends
- Peak hours and operational load
- Food quality, taste, hygiene, and student satisfaction
- Planning, optimization, and operational improvements
- Revenue, cost, and profit/loss understanding (even when exact revenue data is missing)
- Open-ended questions like “What’s going wrong?” or “What should we improve?”

If a question is clearly outside mess operations, politely state that it is out of scope.

====================
CRITICAL DATA RULES
====================
- Use ONLY the data provided below
- Never invent numbers, prices, costs, revenue values, or assumptions
- Do NOT extrapolate beyond the available data
- Do NOT assume full-month or full-week coverage
- If data is partial, clearly say: “based on data available till now”
- If exact data (e.g., revenue or cost) is not available, say so explicitly

====================
REVENUE & COST QUESTIONS (IMPORTANT)
====================
If the user asks about revenue, cost, profit, or financial impact:
- Clearly state whether direct revenue or cost data is available or not
- If revenue data is NOT available:
  - Say that exact revenue or profit cannot be calculated
  - You MAY give qualitative insights using supported signals such as:
    - Served vs no-show trends
    - Declared absences
    - Consistency or drops in attendance
    - Meal-wise demand stability
- Frame such insights as **operational or efficiency impact**, not exact money values
- Never assign rupee amounts, prices, or profit figures unless explicitly present in data

Example framing you MAY use:
- “While exact revenue data is not available, higher no-shows suggest potential efficiency loss.”
- “Stable served counts usually indicate predictable revenue, assuming pricing remains constant.”

====================
PREDICTIONS & PLANNING
====================
When users ask about prediction or future planning:
- Base answers strictly on historical and recent data
- Clearly communicate uncertainty
- Never present future outcomes as guaranteed

====================
COMMUNICATION STYLE
====================
- Clear, calm, and practical
- Simple language a mess manager or hostel staff can understand
- Medium detail by default (around 5–7 readable lines)
- Use **bold text sparingly** for key insights
- Use bullet points only when they genuinely improve clarity
- Avoid long paragraphs or dumping raw data

====================
ANSWER STRUCTURE
====================
1. Start with a direct, helpful answer to the question
2. Clearly state what data is available and what is not
3. Explain insights using only relevant data
4. Highlight 1–2 meaningful observations if useful
5. Suggest 1–2 practical, realistic actions when appropriate
6. If something cannot be concluded, say so honestly

Control depth dynamically:
- If the user asks “why”, “explain”, or “deep dive”, provide more detail
- Otherwise, stop once the main insight and guidance are clear

====================
DATA CONTEXT
====================
The following data is from a college mess for the period:
${summary.range.start} to ${summary.range.end}

Available mess data:
${JSON.stringify(summary, null, 2)}

====================
USER QUESTION
====================
"${question}"

Now generate a clear, thoughtful, human-friendly response that directly addresses the question and helps the mess manager take informed, realistic action — without inventing or exaggerating financial conclusions.
`;



  let answer = "Unable to generate response";

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    answer =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      answer;
  } catch {
    answer = "Unable to generate response at the moment.";
  }

  return res.json(
    new ApiResponse({
      statusCode: 200,
      message: "Insight generated successfully",
      data: {
        intent,
        question,
        answer,
        range: summary.range,
      },
    })
  );
});




const ANALYTICS_TABLE = `\`${process.env.GCP_PROJECT_ID}.mess_analytics.mess_daily_analytics\``;

export const buildAnalyticsSummaryForMessBigQuery = async ({
  messId,
  days,
  startDate,
  endDate,
}) => {
  if (!messId) throw new Error("messId is required");

  const normalizeBQDate = (d) =>
    typeof d === "string" ? d : d?.value ?? null;

  let rangeStart;
  let rangeEnd;

  if (startDate && endDate) {
    rangeStart = startDate;
    rangeEnd = endDate;
  } else if (days && days > 0) {
    const end = new Date(Date.now() - 86400000);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    rangeStart = start.toISOString().split("T")[0];
    rangeEnd = end.toISOString().split("T")[0];
  } else {
    const [rangeRows] = await bigquery.query({
      query: `
        SELECT
          MIN(date) AS startDate,
          MAX(date) AS endDate
        FROM ${ANALYTICS_TABLE}
        WHERE messId = @messId
      `,
      params: { messId },
    });

    rangeStart = normalizeBQDate(rangeRows[0]?.startDate);
    rangeEnd = normalizeBQDate(rangeRows[0]?.endDate);
  }

  if (!rangeStart || !rangeEnd) {
    return {
      range: null,
      totals: {},
      mealWise: {},
      peakHours: {},
      averages: {},
      trendHint: {},
      dayOfWeekStats: {},
      mealDayStats: {},
      daily: [],
    };
  }

  const [rows] = await bigquery.query({
    query: `
      SELECT
        date,
        meal,
        served,
        declaredAbsent,
        noShow,
        peakBucket
      FROM ${ANALYTICS_TABLE}
      WHERE messId = @messId
        AND date BETWEEN @start AND @end
      ORDER BY date
    `,
    params: { messId, start: rangeStart, end: rangeEnd },
  });

  if (!rows.length) {
    return {
      range: { start: rangeStart, end: rangeEnd },
      totals: { served: 0, declaredAbsent: 0, noShow: 0, foodWaste: 0 },
      mealWise: {},
      peakHours: {},
      averages: {},
      trendHint: {},
      dayOfWeekStats: {},
      mealDayStats: {},
      daily: [],
    };
  }

  const totals = {
    served: 0,
    declaredAbsent: 0,
    noShow: 0,
    foodWaste: 0,
  };

  const mealWise = {};
  const peakTracker = {};
  const dayOfWeekStats = {};
  const dailyMap = {};

  for (const meal of MEALS) {
    mealWise[meal] = { served: 0, declaredAbsent: 0, noShow: 0 };
    peakTracker[meal] = {};
  }

  for (let d = 0; d < 7; d++) {
    dayOfWeekStats[d] = {};
    for (const meal of MEALS) {
      dayOfWeekStats[d][meal] = { served: 0, count: 0 };
    }
  }

  for (const r of rows) {
    const meal = String(r.meal).toLowerCase().trim();
    if (!MEALS.includes(meal)) continue;

    const dateStr = normalizeBQDate(r.date);
    if (!dateStr) continue;

    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        date: dateStr,
        meals: {},
        totals: { served: 0, declaredAbsent: 0, noShow: 0 },
      };
    }

    dailyMap[dateStr].meals[meal] = {
      served: r.served,
      declaredAbsent: r.declaredAbsent,
      noShow: r.noShow,
      peakBucket: r.peakBucket,
    };

    dailyMap[dateStr].totals.served += r.served;
    dailyMap[dateStr].totals.declaredAbsent += r.declaredAbsent;
    dailyMap[dateStr].totals.noShow += r.noShow;

    totals.served += r.served;
    totals.declaredAbsent += r.declaredAbsent;
    totals.noShow += r.noShow;

    mealWise[meal].served += r.served;
    mealWise[meal].declaredAbsent += r.declaredAbsent;
    mealWise[meal].noShow += r.noShow;

    const dayIndex = new Date(dateStr).getDay();
    if (!Number.isNaN(dayIndex)) {
      dayOfWeekStats[dayIndex][meal].served += r.served;
      dayOfWeekStats[dayIndex][meal].count++;
    }

    if (r.peakBucket) {
      peakTracker[meal][r.peakBucket] =
        (peakTracker[meal][r.peakBucket] || 0) + 1;
    }
  }

  totals.foodWaste = totals.declaredAbsent + totals.noShow;

  const daily = Object.values(dailyMap);

  for (const d of daily) {
    for (const meal of MEALS) {
      if (!d.meals[meal]) {
        d.meals[meal] = {
          served: 0,
          declaredAbsent: 0,
          noShow: 0,
          peakBucket: null,
        };
      }
    }
  }

  const peakHours = {};
  for (const meal of MEALS) {
    let peak = null;
    let max = 0;
    for (const [bucket, count] of Object.entries(peakTracker[meal])) {
      if (count > max) {
        max = count;
        peak = bucket;
      }
    }
    peakHours[meal] = peak;
  }

  const averages = {};
  for (const meal of MEALS) {
    averages[meal] = Math.round(
      mealWise[meal].served / Math.max(daily.length, 1)
    );
  }

  const trendHint = {};
  for (const meal of MEALS) {
    if (daily.length < 4) {
      trendHint[meal] = "INSUFFICIENT_DATA";
      continue;
    }

    const mid = Math.floor(daily.length / 2);

    const avg1 =
      daily.slice(0, mid).reduce(
        (s, d) => s + (d.meals?.[meal]?.served ?? 0),
        0
      ) / mid;

    const avg2 =
      daily.slice(mid).reduce(
        (s, d) => s + (d.meals?.[meal]?.served ?? 0),
        0
      ) / (daily.length - mid);

    trendHint[meal] =
      avg2 > avg1 ? "INCREASING" : avg2 < avg1 ? "DECREASING" : "STABLE";
  }

  const DAY_NAMES = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const mealDayStats = {};

  for (let d = 0; d < 7; d++) {
    const dayName = DAY_NAMES[d];
    mealDayStats[dayName] = {};

    for (const meal of MEALS) {
      const stats = dayOfWeekStats[d][meal];
      mealDayStats[dayName][meal] = {
        totalServed: stats.served,
        days: stats.count,
        avgServed:
          stats.count > 0
            ? Math.round(stats.served / stats.count)
            : 0,
      };
    }
  }

  return {
    range: { start: rangeStart, end: rangeEnd },
    totals,
    mealWise,
    peakHours,
    averages,
    trendHint,
    dayOfWeekStats,
    mealDayStats,
    daily,
  };
};






export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) {
    throw new ApiError(401, "Unauthorized");
  }

  const mode = req.query.mode === "revenue" ? "revenue" : "meals";
  const from = req.query.from;
  const to = req.query.to;

  const analyticsRef = db
    .collection("students")
    .doc(uid)
    .collection("daily_analytics");

  let query;
  if (from && to) {
    query = analyticsRef
      .where("date", ">=", from)
      .where("date", "<=", to)
      .orderBy("date", "asc");
  } else {
    query = analyticsRef.orderBy("date", "desc").limit(30);
  }

  const snap = await query.get();

  if (snap.empty) {
    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Success",
        data: {
          summary: {
            totalDays: 0,
            totalServed: 0,
            totalDeclaredAbsent: 0,
            totalNoShow: 0,
            totalMessSpent: 0,
            totalWalletCredit: 0,
            totalFoodCourtSpent: 0,
            netWalletChange: 0,
          },
          chart: [],
          daily: [],
        },
      })
    );
  }

  /* ---------- AGGREGATION ---------- */
  const totals = {
    totalServed: 0,
    totalDeclaredAbsent: 0,
    totalNoShow: 0,
    totalMessSpent: 0,
    totalWalletCredit: 0,
    totalFoodCourtSpent: 0,
  };

  const chart = [];
  const daily = [];

  const docs = from && to ? snap.docs : snap.docs.reverse();

  for (const doc of docs) {
    const d = doc.data();

    let served = 0;
    let declaredAbsent = 0;
    let noShow = 0;

    for (const meal of Object.values(d.meals || {})) {
      if (meal.status === "SERVED") served++;
      else if (meal.status === "DECLARED_ABSENT") declaredAbsent++;
      else if (meal.status === "NO_SHOW") noShow++;
    }

    totals.totalServed += served;
    totals.totalDeclaredAbsent += declaredAbsent;
    totals.totalNoShow += noShow;

    totals.totalMessSpent += d.messSpent || 0;
    totals.totalWalletCredit += d.walletCredit || 0;
    totals.totalFoodCourtSpent += d.foodCourtSpent || 0;

    if (mode === "meals") {
      chart.push({ date: d.date, served, declaredAbsent, noShow });
    } else {
      chart.push({
        date: d.date,
        messSpent: d.messSpent || 0,
        walletCredit: d.walletCredit || 0,
        foodCourtSpent: d.foodCourtSpent || 0,
      });
    }

    daily.push({
      date: d.date,
      meals: d.meals || {},
      messSpent: d.messSpent || 0,
      walletCredit: d.walletCredit || 0,
      foodCourtSpent: d.foodCourtSpent || 0,
    });
  }

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Success",
      data: {
        summary: {
          totalDays: chart.length,
          ...totals,
          netWalletChange:
            totals.totalWalletCredit - totals.totalFoodCourtSpent,
        },
        chart,
        daily,
      },
    })
  );
});
