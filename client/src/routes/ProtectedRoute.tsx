import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/auth/auth.types";

/* ================= CONFIG ================= */

const roleRedirectMap: Record<UserRole, string> = {
  student: "/student/dashboard",
  mess_manager: "/mess/dashboard",
  hostel_office: "/admin/dashboard",
};

interface ProtectedRouteProps {
  role: UserRole; 
}



const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  /* ⏳ Auth resolving */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  /* 🔐 Not logged in */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* 🧼 Normalize role once */
  const userRole = user.role.trim().toLowerCase() as UserRole;

  /* 🛑 Wrong role → send user to THEIR dashboard */
  if (userRole !== role) {
    return <Navigate to={roleRedirectMap[userRole]} replace />;
  }

  /* ✅ Correct role */
  return <Outlet />;
};

export default ProtectedRoute;
