import { LanguageServiceClient } from "@google-cloud/language";
import db from "../config/firestore.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";



const nlpClient = new LanguageServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});


function mapEntitiesToTags(entities = []) {
  const tags = new Set();

  for (const ent of entities) {
    const name = ent.name.toLowerCase();

    // Food related
    if (/(food|rice|curry|vegetable|taste|oily|salty|spicy)/i.test(name)) {
      tags.add("FOOD_QUALITY");
      tags.add("FOOD_TASTE");
    }

    // Staff / service
    if (/(staff|people|server|worker|employee)/i.test(name)) {
      tags.add("SERVICE");
    }

    // Hygiene / cleanliness
    if (/(plate|glass|wash|floor|toilet|dirty|clean|smell)/i.test(name)) {
      tags.add("HYGIENE");
      tags.add("CLEANLINESS");
    }

    // Infrastructure
    if (/(water|fan|light|seat|hall|infrastructure)/i.test(name)) {
      tags.add("INFRASTRUCTURE");
    }

    // Timing
    if (/(time|delay|late|timing)/i.test(name)) {
      tags.add("TIMING");
    }
  }

  return Array.from(tags);
}

export const submitFeedback = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, "Feedback message is required");
  }


  const studentSnap = await db.collection("students").doc(uid).get();
  if (!studentSnap.exists) {
    throw new ApiError(404, "Student profile not found");
  }

  const student = studentSnap.data();
  if (!student.messSelected || !student.selectedMess?.messId) {
    throw new ApiError(400, "Mess not selected");
  }

  const messId = student.selectedMess.messId;

  
  const [analysis] = await nlpClient.analyzeEntitySentiment({
    document: {
      content: message,
      type: "PLAIN_TEXT",
    },
  });

  const score = analysis.documentSentiment?.score ?? 0;

  let sentiment = "NEUTRAL";
  if (score > 0.25) sentiment = "POSITIVE";
  else if (score < -0.25) sentiment = "NEGATIVE";


  let tags = mapEntitiesToTags(analysis.entities);


  if (!tags.length) {
    const text = message.toLowerCase();

    if (text.includes("food")) tags.push("FOOD_QUALITY");
    if (text.includes("staff") || text.includes("people"))
      tags.push("SERVICE");
    if (text.includes("dirty") || text.includes("clean"))
      tags.push("HYGIENE");
  }

  await db.collection("feedbacks").add({
    messId,
    studentId: uid, 
    message: message.trim(),

    sentiment,
    sentimentScore: score,
    tags,

    createdAt: new Date(),
  });

  return res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: "Feedback submitted successfully",
      data: null,
    })
  );
});



export const getMyFeedbacks = asyncHandler(async (req, res) => {
  const { uid } = req.user;

  const snap = await db
    .collection("feedbacks")
    .where("studentId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

  const feedbacks = snap.docs.map((doc) => {
    const data = doc.data();

    const createdAtDate =
      data.createdAt?.toDate?.() instanceof Date
        ? data.createdAt.toDate()
        : null;

    return {
      id: doc.id,

    
      message: typeof data.message === "string" ? data.message : "",

    
      sentiment: data.sentiment ?? "NEUTRAL",
      sentimentScore: Number(data.sentimentScore ?? 0),

      tags: Array.isArray(data.tags) ? data.tags : [],

    
      createdAt: createdAtDate,
      createdAtFormatted: createdAtDate
        ? createdAtDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",

 
      isPositive: data.sentiment === "POSITIVE",
      isNegative: data.sentiment === "NEGATIVE",
      isNeutral: data.sentiment === "NEUTRAL",
    };
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Student feedbacks fetched",
      data: feedbacks,
    })
  );
});



export const getMessFeedbacks = asyncHandler(async (req, res) => {
  const { uid } = req.user;

  if (!uid) {
    throw new ApiError(401, "Unauthorized");
  }

  const messSnap = await db
    .collection("messes")
    .where("messAuth.uid", "==", uid)
    .limit(1)
    .get();

  if (messSnap.empty) {
    throw new ApiError(404, "Mess not found for this account");
  }

  const messDoc = messSnap.docs[0];
  const messId = messDoc.id;



 
  const feedbackSnap = await db
    .collection("feedbacks")
    .where("messId", "==", messId)
    .orderBy("createdAt", "desc")
    .get();

 

  const feedbacks = feedbackSnap.docs.map((doc) => {
    const data = doc.data();

    const createdAtDate =
      data.createdAt?.toDate?.() instanceof Date
        ? data.createdAt.toDate()
        : null;

    const sentiment = data.sentiment ?? "NEUTRAL";

    return {
      id: doc.id,

 
      message: typeof data.message === "string" ? data.message : "",


      sentiment,
      sentimentScore: Number(data.sentimentScore ?? 0),

     
      tags: Array.isArray(data.tags) ? data.tags : [],

    
      createdAt: createdAtDate,
      createdAtFormatted: createdAtDate
        ? createdAtDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",

      isPositive: sentiment === "POSITIVE",
      isNegative: sentiment === "NEGATIVE",
      isNeutral: sentiment === "NEUTRAL",
    };
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Mess feedbacks fetched",
      data: feedbacks,
    })
  );
});
