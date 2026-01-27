import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

interface ProtectedRouteProps {
  allowedRoles: ("admin" | "superadmin" | "pegawai")[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  children 
}) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const userRole = localStorage.getItem("dashboard_type") as 
    "admin" | "superadmin" | "pegawai" | null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const validateToken = async () => {
      // Jika tidak ada token atau role, langsung redirect
      if (!token || !userRole) {
        //console.log("No token or role found");
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Jika role tidak sesuai, langsung redirect
      if (!allowedRoles.includes(userRole)) {
        //console.log("Role not allowed:", userRole);
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      try {
        // Validasi token ke backend
        const response = await api.get("/profile");
        //console.log("Token valid:", response.data);
        setIsAuthenticated(true);
      } catch (error) {
        //console.error("Token validation failed:", error);
        // Token tidak valid, hapus data dan redirect ke login
        localStorage.removeItem("token");
        localStorage.removeItem("dashboard_type");
        localStorage.removeItem("user");
        localStorage.removeItem("face_registered");
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, userRole, allowedRoles]);

  // Tampilkan loading saat validasi
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Memvalidasi sesi...
          </p>
        </div>
      </div>
    );
  }

  // Jika tidak terautentikasi, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;