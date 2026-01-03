
import axiosClient from "./axiosClient.ts"


export async function scanMealQR(token: string) {
  console.log(`${token}`)
  const res = await axiosClient.post("/mess-manager/scanQR", { token });
  return res.data;
}