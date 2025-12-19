import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

import {
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

/* ================= TYPES ================= */

type Role = "student" | "mess_manager" | "hostel_office";

type NavItem = {
  label: string;
  to: string;
  icon?: React.ComponentType<{ size?: number }>;
};

/* ================= CONFIG ================= */

/**
 * ONLY dashboard routes are defined here.
 * Add more links later if required (reports, analytics, etc.)
 */
const roleDashboardNav: Record<Role, NavItem[]> = {
  student: [
    {
      label: "Dashboard",
      to: "/student/dashboard",
      icon: LayoutDashboard,
    },
  ],

 mess_manager: [
    {
      label: "Dashboard",
      to: "/mess/dashboard",
      icon: LayoutDashboard,
    },
  ],

  hostel_office: [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: LayoutDashboard,
    },
  ],
};

/* ================= COMPONENT ================= */

export default function DashboardNavbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  if (!user) return null;

  const navItems = roleDashboardNav[user.role as Role] ?? [];

  return (
    <nav className="border-b bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">

        {/* LEFT — BRAND */}
        <span className="text-lg font-extrabold tracking-tight text-[#6770d2]">
          SmartMess
        </span>

        {/* CENTER — DASHBOARD NAV */}
        <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition
                  ${
                    active
                      ? "bg-[#6770d2]/15 text-[#6770d2]"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* RIGHT — ACTIONS */}
        <div className="flex items-center gap-2">

          {/* THEME TOGGLE */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="rounded-full"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* LOGOUT */}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Logout"
            className="rounded-full"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
