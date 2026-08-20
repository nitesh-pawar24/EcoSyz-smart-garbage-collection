"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-mesh overflow-x-hidden">
      {/* Sidebar - Desktop: fixed, Mobile: drawer — z-[10001] stays above modals */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
        {/* Header with hamburger for mobile — z-[10001] stays above modals */}
        <TopHeader onMenuClick={toggleSidebar} />

        {/* Content with padding that adjusts for header */}
        <main
          id="admin-content-area"
          className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 pb-10 relative"
          style={{ isolation: 'isolate' }}
        >
          {children}
          {/* Portal target: modals teleport here so they stay within content area */}
          <div id="modal-root" />
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}
