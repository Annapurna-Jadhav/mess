export type UserRole =
  | "student"
  | "mess_manager"
  | "hostel_office";

export type AuthUser = {
  uid: string;
  email: string;
  role: "student" | "mess_manager" | "hostel_office";
  studentRoll?: string;
  messRoll?: string;
};
