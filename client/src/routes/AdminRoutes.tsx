import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "@/routes/ProtectedRoute";
import ProtectedLayout from "@/layout/ProtectedLayout";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminApprovals from "@/pages/admin/AdminApprovals";
import ApprovedMesses from "@/pages/admin/ApprovedMesses";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* ROLE GUARD */}
      <Route element={<ProtectedRoute role ="hostel_office"  />}>
        {/* COMMON DASHBOARD LAYOUT */}
        <Route element={<ProtectedLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="approved-messes" element={<ApprovedMesses />} />
        </Route>
      </Route>
    </Routes>
  );
}

