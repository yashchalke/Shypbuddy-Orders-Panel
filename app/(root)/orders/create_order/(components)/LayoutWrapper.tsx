// components/LayoutWrapper.tsx
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import SidebarToggle from "./SidebarToggle";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Toggle Button - Fixed Position */}
      <div className="fixed top-3 left-4 z-30">
        <SidebarToggle onClick={openSidebar} />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </>
  );
}