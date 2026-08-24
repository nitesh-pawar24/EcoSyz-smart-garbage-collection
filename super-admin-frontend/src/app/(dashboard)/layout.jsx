"use client";

import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ProtectedDashboardLayout({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3000";

    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/me");
        const role = data?.user?.role;

        if (role === "COMPANY_ADMIN") {
          if (isMounted) {
            setIsAuthorized(true);
            setAuthLoading(false);
          }
        } else if (role === "ADMIN" || role === "PANCHAYAT_ADMIN") {
          if (isMounted) {
            setIsAuthorized(false);
            setAuthLoading(false);
            window.location.href = `${adminUrl}/dashboard`;
          }
        } else {
          if (isMounted) {
            setIsAuthorized(false);
            setAuthLoading(false);
            window.location.href = adminUrl;
          }
        }
      } catch {
        if (isMounted) {
          setIsAuthorized(false);
          setAuthLoading(false);
          window.location.href = adminUrl;
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%" }} className="spinner" />
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Loading EcoSyz…</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
}

