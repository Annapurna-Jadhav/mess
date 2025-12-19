import type { AuthUser } from "@/auth/auth.types";

export const roleDashboardMap: Record<AuthUser["role"], string> = {
  student: "/student/dashboard",
  mess_manager: "/mess/dashboard",
  hostel_office: "/admin/dashboard",
};
