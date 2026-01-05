"use client";

import { Menu } from "lucide-react";

interface SidebarToggleProps {
  onClick: () => void;
}

export default function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
      aria-label="Toggle Sidebar"
    >
      <Menu size={24} />
    </button>
  );
}