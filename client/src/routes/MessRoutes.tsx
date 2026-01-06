
import { Route, Routes } from 'react-router-dom';
import ProtectedLayout from '@/layout/ProtectedLayout';
import MessDashboard from '@/pages/mess-manager/MessDashboard.tsx';
import ProtectedRoute from '@/routes/ProtectedRoute.tsx';
import ScanMeal from '@/pages/mess-manager/ScanMeal';
import AnalyticsPage from '@/pages/mess-manager/AnalyticsPage';
import MessFeedbacksPage from '@/pages/mess-manager/MessFeedbackPage';



function MessRoutes() {
  return (
    <div>
       <Routes>
         <Route element={<ProtectedRoute role="mess_manager" />}>
  <Route element={<ProtectedLayout />}>
    
    <Route path="/dashboard" element={<MessDashboard />} />
    <Route path="/scanQR" element={<ScanMeal />} />
    <Route path="/analytics" element={<AnalyticsPage/>}/>
  <Route path="/feedbacks" element={<MessFeedbacksPage/>}/>
    
    
    
  </Route>
</Route>
       </Routes>
      
    </div>
  )
}

export default MessRoutes
