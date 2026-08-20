"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export const VIEW_TO_PATH = {
  // Public
  home: "/",
  about: "/about",
  contact: "/contact",
  complaint: "/complaint",
  submitComplaint: "/complaint",

  // Auth
  login: "/login",
  "login-household": "/login/household",
  "login-company": "/login/company",
  "forgot-password": "/forgot-password",
  register: "/register",
  registration: "/register",

  // Dashboards
  "household-dashboard": "/dashboard/household",
  "company-dashboard": "/dashboard/company",
  "admin-dashboard": "/dashboard/admin",

  // Features
  "schedule-booking": "/schedule-booking",
  "user-profile": "/profile",
  payments: "/payments",

  // Quick Links
  howItWorks: "/quick-links/how-it-works",
  statisticsReports: "/quick-links/statistics",
  viewSchedule: "/quick-links/schedule",
  guidesResources: "/quick-links/guides",
  eventsWorkshops: "/quick-links/events",
  newsUpdates: "/quick-links/news",
  gallery: "/quick-links/gallery",
  legal: "/quick-links/legal",
  faqsFeedback: "/quick-links/faqs",

  // Management
  "users-management": "/management/users",
  "companies-management": "/management/companies",
  "fleet-management": "/management/fleet",
  "complaints-management": "/management/complaints",
  "system-settings": "/management/settings",
};

export const PATH_TO_VIEW = Object.entries(VIEW_TO_PATH).reduce(
  (acc, [view, path]) => {
    if (!acc[path]) acc[path] = view;
    return acc;
  },
  {}
);

export function useAppNavigate() {
  const router = useRouter();

  const navigate = useCallback(
    (viewOrPath) => {
      if (!viewOrPath) return;
      const target = VIEW_TO_PATH[viewOrPath] || viewOrPath;
      router.push(target);
    },
    [router]
  );

  return navigate;
}

export function useCurrentView() {
  const pathname = usePathname();
  return PATH_TO_VIEW[pathname] || "home";
}
