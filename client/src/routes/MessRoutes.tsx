
import { Route, Routes } from 'react-router-dom';
import ProtectedLayout from '@/layout/ProtectedLayout';
import MessDashboard from '@/pages/mess-manager/MessDashboard.tsx';
import ProtectedRoute from '@/routes/ProtectedRoute.tsx';
import ScanMeal from '@/pages/mess-manager/ScanMeal';



function MessRoutes() {
  return (
    <div>
       <Routes>
         <Route element={<ProtectedRoute role="mess_manager" />}>
  <Route element={<ProtectedLayout />}>
    
    <Route path="/dashboard" element={<MessDashboard />} />
    <Route path="/scanQR" element={<ScanMeal />} />

    
    
    
  </Route>
</Route>
       </Routes>
      
    </div>
  )
}

export default MessRoutes
