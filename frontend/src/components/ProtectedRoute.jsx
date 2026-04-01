import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/auth";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(null); // 👈 change

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("me/");
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  // 👇 prevent flicker / incorrect redirect
  if (isAuth === false) return <Navigate to="/login" replace />;

  return children;
}