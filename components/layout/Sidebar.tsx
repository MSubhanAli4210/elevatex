
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Route,
  BookOpen,
  Users,
  Sparkles,
  CalendarDays,
  GraduationCap,
  Activity,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";

export type DashboardRole = "admin" | "mentor" | "mentee";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navigation: Record<DashboardRole, NavigationItem[]> = {
  mentee: [
    { label: "Overview", href: "/mentee", icon: LayoutDashboard },
    { label: "My Roadmap", href: "/mentee/roadmap", icon: Route },
    { label: "Assignments", href: "/mentee/assignments", icon: BookOpen },
    { label: "My Mentor", href: "/mentee/mentor", icon: Users },
    { label: "AI Companion", href: "/mentee/ai", icon: Sparkles },
    { label: "Sessions", href: "/mentee/sessions", icon: CalendarDays },
  ],
  mentor: [
    { label: "Overview", href: "/mentor", icon: LayoutDashboard },
    { label: "My Mentees", href: "/mentor/mentees", icon: Users },
    { label: "Reviews", href: "/mentor/reviews", icon: BookOpen },
    { label: "Roadmaps", href: "/mentor/roadmaps", icon: Route },
    { label: "Sessions", href: "/mentor/sessions", icon: CalendarDays },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Programs", href: "/admin/programs", icon: BookOpen },
    { label: "Mentors", href: "/admin/mentors", icon: Users },
    { label: "Mentees", href: "/admin/mentees", icon: GraduationCap },
    { label: "Analytics", href: "/admin/analytics", icon: Activity },
  ],
};

type SidebarProps = {
  role: DashboardRole;
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export default function Sidebar({
  role,
  onNavigate,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const user = {
    mentee: { initials: "AM", name: "Alex Morgan" },
    mentor: { initials: "SA", name: "Sarah Ahmed" },
    admin: { initials: "AD", name: "Demo Admin" },
  }[role];

  function navigate(label: string) {
    onNavigate(label);
    onClose();
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-[#303234] bg-[#191B1D] transition-[width,transform] duration-300 ease-in-out
          ${collapsed ? "w-[250px] lg:w-[72px]" : "w-[250px]"}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div
          className={`flex shrink-0 border-b border-[#303234] ${
            collapsed
              ? "h-20 items-center justify-between px-4 lg:h-28 lg:flex-col lg:justify-center lg:gap-3 lg:px-2"
              : "h-20 items-center justify-between px-4"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E88B42]/30 bg-[#E88B42]/10">
              <GraduationCap size={22} className="text-[#E88B42]" />
            </div>

            <div className={collapsed ? "lg:hidden" : ""}>
              <p className="whitespace-nowrap font-semibold text-[#ECEBE8]">
                ElevateX
              </p>
              <p className="whitespace-nowrap text-[9px] uppercase tracking-widest text-[#999D9B]">
                Mentorship
              </p>
            </div>
          </div>

          {/* DESKTOP COLLAPSE / EXPAND */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#A5AAA9] transition-colors hover:bg-[#343638] hover:text-[#E88B42] lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[#A5AAA9] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav
          aria-label={`${role} navigation`}
          className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-3 py-6"
        >
          <p
            className={`mb-4 px-3 text-[10px] uppercase tracking-widest text-[#777D7B] ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Workspace
          </p>

          {navigation[role].map(({ label, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(label)}
                className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${
                  active
                    ? "border-[#E88B42]/20 bg-[#E88B42]/10 font-medium text-[#F3A66F]"
                    : "border-transparent text-[#A5AAA9] hover:bg-[#292B2D] hover:text-white"
                }`}
              >
                <Icon size={19} className="shrink-0" />

                <span
                  className={`whitespace-nowrap ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {label}
                </span>

                {active && (
                  <span
                    className={`ml-auto h-1.5 w-1.5 rounded-full bg-[#E88B42] ${
                      collapsed ? "lg:hidden" : ""
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="shrink-0 space-y-3 border-t border-[#303234] px-3 py-4">
          <button
            type="button"
            title="Settings"
            onClick={() => navigate("Settings")}
            className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#A5AAA9] hover:bg-[#292B2D] ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Settings size={19} className="shrink-0" />

            <span className={collapsed ? "lg:hidden" : ""}>
              Settings
            </span>
          </button>

          <div
            className={`flex items-center gap-3 rounded-xl border border-[#35383A] bg-[#232527] p-2 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E88B42]/15 text-sm font-semibold text-[#E88B42]">
              {user.initials}
            </div>

            <div
              className={`min-w-0 flex-1 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <p className="truncate text-xs font-semibold text-[#ECEBE8]">
                {user.name}
              </p>
              <p className="text-xs capitalize text-[#999D9B]">
                {role} account
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
