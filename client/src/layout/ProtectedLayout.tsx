import { Outlet } from "react-router-dom";
import DashboardNavbar from "@/components/DashboardNavbar";

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Dashboard-only navbar */}
      <DashboardNavbar />

      {/* Main dashboard content */}
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
