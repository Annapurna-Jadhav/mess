import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/auth/auth.types.ts";

interface ProtectedRouteProps {
  role?: UserRole | UserRole[];
}

const roleRedirectMap: Record<UserRole, string> = {
  student: "/student/dashboard",
  mess_manager: "/mess/dashboard",
  hostel_office: "/admin/dashboard",
};

const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // ⏳ Auth still resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🛑 Role mismatch
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={roleRedirectMap[user.role]} replace />;
    }
  }

  // ✅ Allowed
  return <Outlet />;
};

export default ProtectedRoute;
