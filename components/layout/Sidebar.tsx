"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { canEdit, canManageUsers } from "@/app/utils/auth";
import {
  AiOutlineHome,
  AiOutlineUsergroupAdd,
  AiOutlineUserAdd,
  AiOutlineMail,
  AiOutlineMenu,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsExpanded } = useSidebar();
  const pathname = usePathname();

  // Role-based navigation items
  const navItems = [
    {
      icon: <AiOutlineHome className="w-5 h-5" />,
      name: "Home",
      path: "/dashboard/home",
      show: true, // Everyone can view
    },
    {
      icon: <AiOutlineUsergroupAdd className="w-5 h-5" />,
      name: "Family Tree",
      path: "/dashboard/family-tree",
      show: true, // Everyone can view
    },
    {
      name: "Add Member",
      icon: <AiOutlineUserAdd className="w-5 h-5" />,
      path: "/dashboard/new-member",
      show: canEdit(), // Only admin and sub-admin
    },
    {
      name: "Manage Users",
      icon: <AiOutlineMail className="w-5 h-5" />,
      path: "/dashboard/manage-users",
      show: canManageUsers(), // Only admin
    }
  ];


  const isActive = (path: string) => {
    // Check if the current pathname starts with the nav item path
    // This handles nested routes properly
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-card text-card-foreground h-screen transition-all duration-300 ease-in-out z-50 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 mb-2 p-2 rounded-full bg-accent hover:bg-accent/80 self-start transition-all"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <AiOutlineLeft className="w-5 h-5" />
        ) : (
          <AiOutlineRight className="w-5 h-5" />
        )}
      </button>
      
      <div className="flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-4">
              {navItems.filter(nav => nav.show).map((nav) => (
                <li key={nav.name}>
                  <Link
                    href={nav.path}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:bg-accent ${
                      isActive(nav.path)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`${
                        isActive(nav.path)
                          ? "text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span>{nav.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar; 