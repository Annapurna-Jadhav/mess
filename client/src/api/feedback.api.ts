import axiosClient from "./axiosClient";
export async function submitFeedback(payload: {
  
  message: string;
}) {
  const res = await axiosClient.post("/student/submitFeedback", payload);
  return res.data.data;
}



export async function getMyFeedbacks() {
  

  const res = await axiosClient.get("/student/myFeedbacks");
  
  return Array.isArray(res.data.data) ? res.data.data : [];
}







export type MessFeedback = {
  id: string;

  message: string;
  createdAt: any;

  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentimentScore: number;

  tags: string[];

  isPositive: boolean;
  isNegative: boolean;
  isNeutral: boolean;

  studentId?: string | null;
};



export async function getMessFeedbacks(): Promise<MessFeedback[]> {
  const res = await axiosClient.get("/mess-manager/messFeedbacks");

  return Array.isArray(res.data.data) ? res.data.data : [];
}
