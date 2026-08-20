"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../api/axios";

export default function ProtectedDashboardLayout({ children }) {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        await api.get("/auth/me");
        if (isMounted) {
          setIsAuthenticated(true);
          setAuthLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthLoading(false);
          router.replace("/login");
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%" }} className="spinner" />
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Loading EcoSyz…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
