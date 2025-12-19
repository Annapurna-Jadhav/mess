
import jwt from "jsonwebtoken";
import ApiError  from "../utils/ApiError.js";

export const verifyQRToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.QR_SECRET);

    // ✅ RETURN FULL PAYLOAD
    return decoded;
  } catch (err) {
    throw new ApiError(400, "Invalid or expired QR token");
  }
};
