

import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ApplyMessManager from "./pages/mess/ApplyMessManager";

import AdminRoutes from "./routes/AdminRoutes";
import MessRoutes from "./routes/MessRoutes";
import StudentRoutes from "./routes/StudentRoutes";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000 }}
      />

      <Routes>
        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/apply-mess-manager" element={<ApplyMessManager />} />

        {/* 🔐 ROLE-BASED ROUTES */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/mess/*" element={<MessRoutes />} />
        <Route path="/student/*" element={<StudentRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
