import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert( JSON.parse(
      fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, "utf8")
    )),
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running with Firebase Admin OK!");
});

app.listen(5000, () => console.log("Server running on 5000"));
