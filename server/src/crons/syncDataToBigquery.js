
import "../env.js"

import { BigQuery } from "@google-cloud/bigquery";

 
import admin from "../config/firebase.js";
import db from "../config/firestore.js";

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
   location: "asia-south1",
});

export const syncFirestoreToBigQuery = async (messId) => {
  const snap = await db
    .collection("messes")
    .doc(messId)
    .collection("daily_analytics")
    .get();

  if (snap.empty) {
    console.log("No analytics data found to sync");
    return;
  }

  const rows = [];

  for (const doc of snap.docs) {
    const d = doc.data();

    if (!d.meals || !d.date) continue;

    for (const [meal, mealData] of Object.entries(d.meals)) {
      rows.push({
        messId,
        date: d.date, 
        meal,
        served: mealData.served || 0,
        declaredAbsent: mealData.declaredAbsent || 0,
        noShow: mealData.noShow || 0,
        peakBucket: mealData.peakBucket || null,
        createdAt: d.createdAt
          ? d.createdAt.toDate()
          : new Date(),
      });
    }
  }

  if (!rows.length) {
    console.log("No rows to insert into BigQuery");
    return;
  }

  try {
    await bigquery
      .dataset("mess_analytics")
      .table("mess_daily_analytics")
      .insert(rows);

    console.log(`Synced ${rows.length} rows to BigQuery`);
  } catch (err) {
    console.error("BigQuery insert error:", err.errors || err);
  }
};


