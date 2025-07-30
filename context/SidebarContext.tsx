"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  setIsExpanded: (value: boolean) => void;
  setIsHovered: (value: boolean) => void;
  setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        isHovered,
        isMobileOpen,
        setIsExpanded,
        setIsHovered,
        setIsMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
} 