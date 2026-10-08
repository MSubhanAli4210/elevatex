
"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  MessageCircle,
  MoreHorizontal,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

// --------------------------------------------------
// DEMO DATA
// --------------------------------------------------

type Stat = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

type ActivityItem = {
  title: string;
  detail: string;
  icon: LucideIcon;
};

type RoleData = {
  greeting: string;
  description: string;
  stats: Stat[];
  activities: ActivityItem[];
};

const dashboardData: Record<DashboardRole, RoleData> = {
  mentee: {
    greeting: "Good morning, Alex",
    description:
      "Every step forward counts. Here's where you are today.",
    stats: [
      {
        label: "Overall progress",
        value: "68%",
        detail: "+12% this month",
        icon: TrendingUp,
      },
      {
        label: "Tasks completed",
        value: "12/18",
        detail: "6 remaining",
        icon: CheckCircle2,
      },
      {
        label: "Learning streak",
        value: "7 days",
        detail: "Keep it going!",
        icon: Flame,
      },
      {
        label: "Upcoming sessions",
        value: "02",
        detail: "Next on Thursday",
        icon: CalendarDays,
      },
    ],
    activities: [
      {
        title: "JavaScript assessment completed",
        detail: "Yesterday at 4:30 PM",
        icon: CheckCircle2,
      },
      {
        title: "Sarah left feedback on your task",
        detail: "Wednesday at 11:20 AM",
        icon: MessageCircle,
      },
      {
        title: "New roadmap milestone unlocked",
        detail: "Monday at 9:15 AM",
        icon: Target,
      },
    ],
  },

  mentor: {
    greeting: "Welcome back, Sarah",
    description: "Your guidance helps people grow.",
    stats: [
      {
        label: "Active mentees",
        value: "08",
        detail: "Your assigned group",
        icon: Users,
      },
      {
        label: "Pending reviews",
        value: "04",
        detail: "Need your feedback",
        icon: BookOpen,
      },
      {
        label: "Tasks completed",
        value: "36",
        detail: "Across your mentees",
        icon: CheckCircle2,
      },
      {
        label: "Upcoming sessions",
        value: "03",
        detail: "This week",
        icon: CalendarDays,
      },
    ],
    activities: [
      {
        title: "Alex submitted the REST API task",
        detail: "Today at 10:30 AM",
        icon: BookOpen,
      },
      {
        title: "Hina completed her milestone",
        detail: "Yesterday at 3:15 PM",
        icon: CheckCircle2,
      },
      {
        title: "Next group session scheduled",
        detail: "Monday at 9:15 AM",
        icon: CalendarDays,
      },
    ],
  },

  admin: {
    greeting: "Welcome back, Admin",
    description: "A clear view of your mentorship community.",
    stats: [
      {
        label: "Active mentees",
        value: "124",
        detail: "+12 this month",
        icon: GraduationCap,
      },
      {
        label: "Active mentors",
        value: "18",
        detail: "Across programs",
        icon: Users,
      },
      {
        label: "Completion rate",
        value: "76%",
        detail: "Current cohorts",
        icon: TrendingUp,
      },
      {
        label: "Active programs",
        value: "06",
        detail: "3 cohorts running",
        icon: Route,
      },
    ],
    activities: [
      {
        title: "6 new mentees joined the program",
        detail: "Today at 10:30 AM",
        icon: Users,
      },
      {
        title: "Web Development cohort updated",
        detail: "Yesterday at 3:15 PM",
        icon: BookOpen,
      },
      {
        title: "4 mentors completed reviews",
        detail: "Monday at 9:15 AM",
        icon: CheckCircle2,
      },
    ],
  },
};

const milestones = [
  {
    name: "HTML & CSS Foundations",
    detail: "4 lessons completed",
    status: "done",
  },
  {
    name: "JavaScript Fundamentals",
    detail: "6 lessons completed",
    status: "done",
  },
  {
    name: "Building REST APIs",
    detail: "Current milestone",
    status: "active",
  },
  {
    name: "Full Stack Application",
    detail: "Up next",
    status: "upcoming",
  },
];

const mentorItems = [
  "Alex Morgan — REST API submitted",
  "Hina Khan — React milestone completed",
  "Bilal Raza — Review requested",
  "Sara Ali — Session scheduled",
];

const adminItems = [
  "Web Development — 82% participation",
  "AI & Machine Learning — 64% participation",
  "UI/UX Design — 71% participation",
  "New cohort — Enrollment active",
];

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-[#343638] bg-[#232527] p-5 transition-colors hover:border-[#6B4A33]">
      <div className="mb-6 flex items-start justify-between gap-3">
        <p className="text-xs text-[#A5AAA9]">{stat.label}</p>

        <div className="rounded-lg bg-[#E88B42]/10 p-2 text-[#E88B42]">
          <Icon size={18} />
        </div>
      </div>

      <p className="text-3xl font-semibold tracking-tight text-[#ECEBE8]">
        {stat.value}
      </p>

      <p className="mt-3 text-xs text-[#C5A47E]">
        {stat.detail}
      </p>
    </div>
  );
}

function RoadmapCard() {
  return (
    <div className="space-y-0">
      {milestones.map((item, index) => (
        <div key={item.name} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                item.status === "done"
                  ? "border-[#826042] bg-[#473324] text-[#F3A66F]"
                  : item.status === "active"
                    ? "border-[#E88B42] bg-[#E88B42] text-[#101112]"
                    : "border-[#494C4D] bg-[#2C2F30] text-[#848B89]"
              }`}
            >
              {item.status === "done" ? (
                <Check size={17} />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>

            {index !== milestones.length - 1 && (
              <div className="my-2 h-11 w-px bg-[#454442]" />
            )}
          </div>

          <div className="min-w-0 flex-1 pb-8 pt-1">
            <p className="text-sm font-medium text-[#ECEBE8]">
              {item.name}
            </p>

            <p className="mt-1 text-xs text-[#999D9B]">
              {item.detail}
            </p>

            {item.status === "active" && (
              <span className="mt-3 inline-flex rounded-full border border-[#E88B42]/30 bg-[#E88B42]/10 px-3 py-1 text-[10px] font-medium text-[#F3A66F]">
                IN PROGRESS
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityList({
  activities,
}: {
  activities: ActivityItem[];
}) {
  return (
    <section className="rounded-2xl border border-[#343638] bg-[#232527] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">
            Recent activity
          </h3>
          <p className="mt-1 text-xs text-[#A5AAA9]">
            The latest updates from your workspace.
          </p>
        </div>

        <Clock3 size={19} className="text-[#A5AAA9]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex gap-3 rounded-xl border border-[#383B3D] bg-[#292B2D] p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E88B42]/10 text-[#E88B42]">
                <Icon size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium leading-5">
                  {item.title}
                </p>

                <p className="mt-2 text-xs text-[#969D99]">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

export default function Home() {
  const [role, setRole] = useState<DashboardRole>("mentee");
  const [activePage, setActivePage] = useState("Overview");

  const data = dashboardData[role];

  function changeRole(nextRole: DashboardRole) {
    setRole(nextRole);
    setActivePage("Overview");
  }

  function handleNavigate(page: string) {
    setActivePage(page);
  }

  return (
    <DashboardLayout
      role={role}
      activePage={activePage}
      onNavigate={handleNavigate}
      onRoleChange={changeRole}
    >
      {/* WELCOME SECTION */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#E88B42]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E88B42]" />
            Your workspace
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {activePage === "Overview"
              ? data.greeting
              : activePage}
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#A5AAA9]">
            {data.description}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#373A3C] bg-[#232527] px-4 py-3 text-xs text-[#C8C9C5]">
          <CalendarDays size={16} className="text-[#E88B42]" />
          October 2026
        </div>
      </div>

      {/* OVERVIEW STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* OTHER PAGE PLACEHOLDER */}
      {activePage !== "Overview" && (
        <div className="rounded-xl border border-[#E88B42]/20 bg-[#E88B42]/5 px-5 py-4 text-sm leading-6 text-[#C8B7A9]">
          <strong className="text-[#F3A66F]">
            {activePage}
          </strong>
          {" — "}
          This is currently a frontend navigation preview.
          We'll build the complete page in the next development phase.
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(290px,1fr)]">
        {/* ROADMAP / ROLE ACTIVITY */}
        <section className="min-w-0 rounded-2xl border border-[#343638] bg-[#232527] p-6">
          <div className="mb-7 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#E88B42]">
                {role === "mentee"
                  ? "Learning path"
                  : role === "mentor"
                    ? "Your mentees"
                    : "Programs"}
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                {role === "mentee"
                  ? "Your development roadmap"
                  : role === "mentor"
                    ? "Recent mentee activity"
                    : "Organization programs"}
              </h2>

              <p className="mt-2 text-xs leading-5 text-[#A5AAA9]">
                {role === "mentee"
                  ? "A clear view of where you've been and what's ahead."
                  : "Stay informed about your mentorship community."}
              </p>
            </div>

            <MoreHorizontal
              size={20}
              className="shrink-0 text-[#999D9B]"
            />
          </div>

          {role === "mentee" ? (
            <RoadmapCard />
          ) : (
            <div className="space-y-3">
              {(role === "mentor"
                ? mentorItems
                : adminItems
              ).map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-[#383B3D] bg-[#292C2E] p-4"
                >
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-[#E88B42]"
                  />

                  <span className="min-w-0 flex-1 text-sm leading-6 text-[#D7D8D5]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN */}
        <div className="min-w-0 space-y-6">
          {/* MENTOR / SESSION CARD */}
          <section className="rounded-2xl border border-[#343638] bg-[#232527] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {role === "mentee"
                  ? "Your mentor"
                  : role === "mentor"
                    ? "Next session"
                    : "Featured cohort"}
              </h2>

              <MoreHorizontal
                size={18}
                className="text-[#8B918F]"
              />
            </div>

            {role === "mentee" ? (
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#453225] text-lg font-semibold text-[#E88B42]">
                  SA
                </div>

                <div>
                  <p className="font-medium">Sarah Ahmed</p>

                  <p className="mt-1 text-xs leading-5 text-[#A5AAA9]">
                    Full Stack Development Mentor
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-xs text-[#E8B482]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E88B42]" />
                    Assigned mentor
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-medium">
                  {role === "mentor"
                    ? "Web Development Group"
                    : "Fall 2026 — Web Development"}
                </p>

                <p className="mt-2 text-sm text-[#A5AAA9]">
                  {role === "mentor"
                    ? "Thursday · 3:00 PM"
                    : "42 active mentees"}
                </p>
              </div>
            )}
          </section>

          {/* AI COMPANION */}
          <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6">
            <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#E88B42]/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex rounded-xl border border-[#E88B42]/20 bg-[#E88B42]/10 p-3 text-[#F3A66F]">
                <Sparkles size={23} />
              </div>

              <h2 className="text-lg font-semibold">
                {role === "mentee"
                  ? "Your AI companion"
                  : "AI-assisted mentorship"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#C5B7AC]">
                {role === "mentee"
                  ? "Stuck on a concept? Get guided explanations and break down difficult tasks."
                  : "Explore AI assistance for learning guidance and mentorship workflows."}
              </p>

              <button
                type="button"
                onClick={() =>
                  setActivePage("AI Companion")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E88B42] px-4 py-2.5 text-xs font-semibold text-[#191B1D] transition-colors hover:bg-[#F3A66F]"
              >
                Explore AI assistance
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <ActivityList activities={data.activities} />

      {/* FOOTER */}
      <footer className="flex flex-wrap justify-between gap-3 border-t border-[#303234] pt-5 text-xs text-[#7D8581]">
        <span>
          © 2026 ElevateX. Mentorship workspace.
        </span>

        <span>
          Frontend demo · Sample data
        </span>
      </footer>
    </DashboardLayout>
  );
}
