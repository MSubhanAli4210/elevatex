
"use client";

import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

import type { DashboardRole } from "./Sidebar";

type HeaderProps = {
  role: DashboardRole;
  activePage: string;
  onMenuClick: () => void;
  onRoleChange: (role: DashboardRole) => void;
};

export default function Header({
  role,
  activePage,
  onMenuClick,
  onRoleChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#303234] bg-[#101112]/95 px-5 backdrop-blur-md sm:px-8">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#292B2D] lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs capitalize text-[#818886]">
            ElevateX / {role}
          </p>
          <h2 className="mt-1 text-sm font-medium text-[#ECEBE8]">
            {activePage}
          </h2>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-[#929795] sm:block">
          Demo workspace
        </span>

        <div className="relative">
          <label htmlFor="role-switcher" className="sr-only">
            Switch demo role
          </label>

          <select
            id="role-switcher"
            value={role}
            onChange={(event) =>
              onRoleChange(event.target.value as DashboardRole)
            }
            className="appearance-none rounded-lg border border-[#373A3C] bg-[#232527] py-2 pl-3 pr-9 text-xs text-[#ECEBE8] outline-none focus:border-[#E88B42]"
          >
            <option value="mentee">Mentee</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A5AAA9]"
          />
        </div>

        <div
          className="rounded-lg p-2 text-[#B1B5B3]"
          aria-label="Notifications preview"
          title="Notifications coming soon"
        >
          <Bell size={19} />
        </div>
      </div>
    </header>
  );
}
