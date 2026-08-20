"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold text-teal-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-md transition-all"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
