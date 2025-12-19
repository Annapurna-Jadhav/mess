// src/api/mess.api.ts
import axiosClient from "./axiosClient.ts";

export const applyMessManager = async (payload: any) => {
  const res = await axiosClient.post("/mess/apply", payload);
  return res.data;
};
