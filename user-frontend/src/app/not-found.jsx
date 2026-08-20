"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="btn-primary py-2.5 px-6 text-sm"
      >
        Return to Home
      </Link>
    </div>
  );
}
