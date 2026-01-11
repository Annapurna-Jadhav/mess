
import axiosClient from "./axiosClient.ts";

export const applyMessManager = async (payload: any) => {
  const res = await axiosClient.post("/mess-manager/apply", payload);
  return res.data;
};


export async function getMessAnalyticsSummary(days: number = 7) {
  const res = await axiosClient.get("/mess-manager/analytics/summary", {
    params: { days },
  });

  return res.data;
}

export async function getMessAnalytics(from: string, to: string) {
  const res = await axiosClient.get("/mess-manager/analytics", {
    params: { fromDate: from, toDate: to },
  });
  return res.data.data;
}
