"use client";

import { useSidebar } from "../../context/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Backdrop; 