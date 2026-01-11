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

    if (err.response?.status === 409) {
      return {
        success: true,
        alreadyVerified: true,
        message:
          err.response.data?.message ||
          "Receipt already verified",
      };
    }

 
    throw err;
  }
};

export const getMyStudentProfile = async () => {
  const res = await axiosClient.get("/student/me");
  return res.data?.data;
};
export const selectMess = (messId: string) => {
  return axiosClient.post("/student/select-mess", { messId });
};


export const getStudentMealDays = async () => {
  const res = await axiosClient.get("/student/meal-days");

 

  
  return res.data.data.days; 
};


export const declareAbsent = async (
  date: string,
  mealType: string
) => {
  return axiosClient.post("/student/declare-absent", {
    date,
    mealType,
  });
};
