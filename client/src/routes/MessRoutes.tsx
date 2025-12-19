import React from 'react'
import { Route, Routes } from 'react-router-dom';
import ProtectedLayout from '@/layout/ProtectedLayout';
import MessDashboard from '@/pages/mess/MessDashboard.tsx';
import ProtectedRoute from '@/routes/ProtectedRoute.tsx';


function MessRoutes() {
  return (
    <div>
       <Routes>
         <Route element={<ProtectedRoute role="mess_manager" />}>
  <Route element={<ProtectedLayout />}>
    
    <Route path="/mess/dashboard" element={<MessDashboard />} />
    
  </Route>
</Route>
       </Routes>
      
    </div>
  )
}

export default MessRoutes
