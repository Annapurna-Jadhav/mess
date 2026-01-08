import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  CheckCircle2,
  MenuIcon,
  Sun,
  Moon,
  ScanQrCodeIcon,

  LogOut,
  GitGraphIcon,
  GitGraph,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme.ts";
import { useNavigate } from "react-router-dom";


type Role = "student" | "mess_manager" | "hostel_office"|"public";

type NavItem = {
  label: string;
  to: string;
  icon?: React.ComponentType<{ size?: number }>;
};




const roleDashboardNav: Record<
  Exclude<Role, "public">,
  NavItem[]
> = {
  student: [
    {
      label: "Dashboard",
      to: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Declare Absent",
      to: "/student/Declare-Absent",
      icon: MenuIcon,
    },
    {
      label: "Analytics",
      to: "/student/analytics",
      icon: GitGraph,
    },
    {
      label: "Feedbacks",
      to: "/student/submitFeedbacks",
      icon: MessageCircle,
    },
  ],

  mess_manager: [
    {
      label: "Dashboard",
      to: "/mess/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Scan QR",
      to: "/Mess/scanQR",
      icon: ScanQrCodeIcon,
    },
    {
      label: "Analytics",
      to: "/Mess/analytics",
      icon: GitGraphIcon,
    },
    {
      label: "Feedbacks",
      to: "/Mess/feedbacks",
      icon: MessageCircle,
    },
  ],

  hostel_office: [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Approvals",
      to: "/admin/approvals",
      icon: ClipboardCheck,
    },
    {
      label: "Approved Messes",
      to: "/admin/approved-messes",
      icon: CheckCircle2,
    },
  ],
};



export default function DashboardNavbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // const role = user?.role as Role | "public";
 const navItems = user
  ? roleDashboardNav[user.role as Exclude<Role, "public">]
  : [];

  return (
    <nav className="border-b bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">

        {/* ===== BRAND (UNCHANGED) ===== */}
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-extrabold tracking-tight text-[#6770d2] cursor-pointer"
            onClick={() => navigate("/")}
          >
            Smart Mess Card
          </span>

          {user?.role === "hostel_office" && (
            <span className="rounded-full bg-[#6770d2]/10 px-2 py-0.5 text-xs font-semibold text-[#6770d2]">
              ADMIN
            </span>
          )}
        </div>

        {/* ===== CENTER NAV (ONLY IF LOGGED IN) ===== */}
        {user && (
          <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full
                    text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-[#6770d2]/15 text-[#6770d2] shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }
                  `}
                >
                  {Icon && <Icon size={16} />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

   
        <div className="flex items-center gap-2">

      
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* AUTH ACTION */}
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Logout"
              className="rounded-full"
            >
              <LogOut size={18} />
            </Button>
          ) : (
            <Button
              className="bg-[#6770d2] hover:bg-[#5a63c7]"
              onClick={() => navigate("/login")}
            >
              Sign In / Sign Up
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
