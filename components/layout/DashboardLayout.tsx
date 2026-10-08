
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import Sidebar, { type DashboardRole } from "./Sidebar";
import Header from "./Header";

type DashboardLayoutProps = {
  children: ReactNode;
  role: DashboardRole;
  activePage: string;
  onNavigate: (page: string) => void;
  onRoleChange: (role: DashboardRole) => void;
};

export default function DashboardLayout({
  children,
  role,
  activePage,
  onNavigate,
  onRoleChange,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(
        localStorage.getItem("elevatex-sidebar-collapsed") === "true"
      );
    } catch {
      // Use expanded state if storage is unavailable.
    }
  }, []);

  function toggleCollapse() {
    setCollapsed((previous) => {
      const next = !previous;

      try {
        localStorage.setItem(
          "elevatex-sidebar-collapsed",
          String(next)
        );
      } catch {
        // Continue without saved preference.
      }

      return next;
    });
  }

  function handleRoleChange(nextRole: DashboardRole) {
    onRoleChange(nextRole);
    setSidebarOpen(false);

    router.push(`/${nextRole}`);
  }

  function handleNavigate(page: string) {
    onNavigate(page);
    setSidebarOpen(false);

    if (page === "Overview") {
      router.push(`/${role}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#101112] text-[#ECEBE8]">
      <Sidebar
        role={role}
        activePage={activePage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div
        className={`min-w-0 transition-[margin] duration-300 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[250px]"
        }`}
      >
        <Header
          role={role}
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
          onRoleChange={handleRoleChange}
        />

        <main className="mx-auto max-w-[1450px] space-y-8 px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
