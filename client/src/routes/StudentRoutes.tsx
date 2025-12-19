
import { Route, Routes } from "react-router-dom";
import ProtectedLayout from "@/layout/ProtectedLayout";
import StudentDashboard from "@/pages/student/StudentDashboard.tsx";
import ProtectedRoute from "@/routes/ProtectedRoute.tsx";

function StudentRoutes() {
  return (
    <div>
     <Routes>
         <Route element={<ProtectedRoute role="student"/>}>
        <Route element={<ProtectedLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
      </Route>
     </Routes>
    </div>
  );
}

export default StudentRoutes;
