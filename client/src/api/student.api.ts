import  axiosClient  from "./axiosClient.ts";



export const verifyReceiptApi = async (file: File) => {
  const formData = new FormData();
  formData.append("receiptImage", file);

  try {
    const res = await axiosClient.post(
      "/student/verify",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      ...res.data,
    };
  } catch (err: any) {
    // ✅ HANDLE RECEIPT ALREADY USED (409)
    if (err.response?.status === 409) {
      return {
        success: true,
        alreadyVerified: true,
        message:
          err.response.data?.message ||
          "Receipt already verified",
      };
    }

    // ❌ REAL ERROR — rethrow
    throw err;
  }
};

export const getMyStudentProfile = async () => {
  const res = await axiosClient.get("/student/me");
  return res.data?.data;
};
