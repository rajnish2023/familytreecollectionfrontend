"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppSidebar from "@/components/layout/Sidebar";
import AppHeader from "@/components/layout/Header";
import Backdrop from "@/components/layout/Backdrop";
import AuthGuard from "@/app/components/AuthGuard";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <AuthGuard>
      <div className="min-h-screen xl:flex bg-background">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto max-w-7xl md:p-6 bg-background">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
} 