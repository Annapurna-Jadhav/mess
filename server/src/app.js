import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
export const app=express();
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError.js";





app.use(cors({
  origin:process.env.FRONTEND_URL||"http://localhost:5173", 
  credentials: true,
   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],             
}));

app.use(express.json({
    limit: process.env.LIMIT

}))
app.use(express.urlencoded({
    limit: process.env.LIMIT,
    extended: true
}))
app.use(cookieParser());



app.use((req, res, next) => {
  console.log("🔸 Incoming Request Headers:", req.headers);
  next();
});

// pages 
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/student", studentRoutes);









app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

