import { Route, Routes } from "react-router-dom";
import ProtectedLayout from "@/layout/ProtectedLayout";
import StudentDashboard from "@/pages/student/StudentDashboard.tsx";

import ProtectedRoute from "@/routes/ProtectedRoute.tsx";
import StudentMealPage from "@/pages/student/StudentMealPage";
import StudentAnalyticsPage from "@/pages/student/StudentAnalyticsPage";
import StudentFeedbackPage from "@/pages/student/StudentFeedbackPage";


function StudentRoutes() {
  return (
    <div>
      <Routes>
        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/Declare-Absent"    element={<StudentMealPage/>}/>  
            <Route path="/analytics" element={<StudentAnalyticsPage/>}/> 
            <Route path="/submitFeedbacks" element={<StudentFeedbackPage/>}/>  
          

          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default StudentRoutes;
