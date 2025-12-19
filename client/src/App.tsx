
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard.tsx";

import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import ProtectedLayout from "./layout/ProtectedLayout.tsx";
import MessDashboard from "./pages/mess/MessDashboard.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div>
            <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
<BrowserRouter>
        <Routes>
          {/* 🌍 PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* 🔐 AUTHENTICATED ROUTES */}
          {/* <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route
                path="/student/dashboard/verify-receipt"
                element={<VerifyReceiptPage />}
              />
            </Route>
          </Route> */}

          {/* 🎓 STUDENT ROUTES */}
          <Route element={<ProtectedRoute />}>
  <Route element={<ProtectedLayout />}>
    <Route path="/student/dashboard" element={<StudentDashboard />} />
    <Route path="/mess/dashboard" element={<MessDashboard />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Route>
</Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
