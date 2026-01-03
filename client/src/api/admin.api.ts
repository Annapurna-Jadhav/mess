import axiosClient from "./axiosClient.ts";
export const getPendingMessApps = async () => {
  const res = await axiosClient.get("/admin/mess-applications/pending");
  return res.data;
};


export const approveMess = async (
  applicationId: string,
  note?: string
) => {
  const res = await axiosClient.post(
    `/admin/mess-applications/${applicationId}/approve`,
    { note }
  );
  return res.data;
};


export const rejectMess = async (
  applicationId: string,
  reason: string
) => {
  const res = await axiosClient.post(
    `/admin/mess-applications/${applicationId}/reject`,
    { note: reason }
  );
  return res.data;
};


export const getApprovedMesses = async () => {
  const res = await axiosClient.get("/admin/messes");
  
  return res.data;
};
