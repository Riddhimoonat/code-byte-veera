import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Events from "./pages/Events";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { Toaster } from "@/components/ui/sonner";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("veera_token");
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        closeButton 
        theme="dark" 
        toastOptions={{
          style: {
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'white',
            borderRadius: '16px'
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/alerts" 
          element={<ProtectedRoute><Alerts /></ProtectedRoute>} 
        />
        <Route 
          path="/events" 
          element={<ProtectedRoute><Events /></ProtectedRoute>} 
        />
        <Route 
          path="/analytics" 
          element={<ProtectedRoute><Analytics /></ProtectedRoute>} 
        />
        <Route 
          path="/settings" 
          element={<ProtectedRoute><Settings /></ProtectedRoute>} 
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
