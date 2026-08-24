"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Login from "../../views/Login";
import api from "../../api/axios";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3000";

    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/me");
        const role = data?.user?.role;
        if (role === "COMPANY_ADMIN") {
          router.replace("/dashboard");
        } else if (role === "ADMIN" || role === "PANCHAYAT_ADMIN") {
          window.location.href = `${adminUrl}/dashboard`;
        } else {
          window.location.href = adminUrl;
        }
      } catch {
        window.location.href = adminUrl;
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%" }} className="spinner" />
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Redirecting to EcoSyz Login…</span>
    </div>
  );
}
