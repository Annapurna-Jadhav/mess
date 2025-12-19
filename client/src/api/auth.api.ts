import axiosClient from "@/api/axiosClient";
import type { AuthUser } from "@/auth/auth.types";
import { roleDashboardMap } from "@/auth/roleRoutes";

export type ContinueAuthResponse = {
  user: AuthUser;
  redirectTo: string;
};

export const continueAuth = async (): Promise<ContinueAuthResponse> => {
  const res = await axiosClient.post("/auth/continue");

  const user: AuthUser = res.data.data;

  return {
    user,
    redirectTo: roleDashboardMap[user.role],
  };
};
