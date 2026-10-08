
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type Program = {
  id: number;
  name: string;
  category: string;
  mentees: number;
  mentors: number;
  capacity: number;
  completion: number;
  status: "Active" | "Planning";
};

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: "enrollment" | "review" | "program" | "mentor";
};

const programs: Program[] = [
  {
    id: 1,
    name: "Full Stack Development",
    category: "Web Engineering",
    mentees: 48,
    mentors: 6,
    capacity: 60,
    completion: 67,
    status: "Active",
  },
  {
    id: 2,
    name: "Frontend Engineering",
    category: "Web Engineering",
    mentees: 32,
    mentors: 4,
    capacity: 40,
    completion: 78,
    status: "Active",
  },
  {
    id: 3,
    name: "Backend Development",
    category: "Software Engineering",
    mentees: 26,
    mentors: 3,
    capacity: 35,
    completion: 54,
    status: "Active",
  },
  {
    id: 4,
    name: "AI & Machine Learning",
    category: "Artificial Intelligence",
    mentees: 0,
    mentors: 0,
    capacity: 30,
    completion: 0,
    status: "Planning",
  },
];

const activities: ActivityItem[] = [
  {
    id: 1,
    title: "New mentee enrollment",
    description:
      "Three learners joined the Full Stack Development program.",
    date: "Oct 8, 2026",
    type: "enrollment",
  },
  {
    id: 2,
    title: "Assignment reviews completed",
    description:
      "Mentors reviewed six submitted assignments.",
    date: "Oct 7, 2026",
    type: "review",
  },
  {
    id: 3,
    title: "Program planning updated",
    description:
      "AI & Machine Learning program moved into planning.",
    date: "Oct 6, 2026",
    type: "program",
  },
  {
    id: 4,
    title: "New mentor onboarded",
    description:
      "A mentor joined the Frontend Engineering program.",
    date: "Oct 5, 2026",
    type: "mentor",
  },
];

const enrollmentData = [
  { month: "May", value: 48 },
  { month: "Jun", value: 59 },
  { month: "Jul", value: 72 },
  { month: "Aug", value: 81 },
  { month: "Sep", value: 96 },
  { month: "Oct", value: 106 },
];

const reviewStats = [
  {
    label: "Approved",
    value: 68,
    color: "bg-[#91BF9C]",
  },
  {
    label: "Awaiting review",
    value: 22,
    color: "bg-[#E88B42]",
  },
  {
    label: "Needs revision",
    value: 10,
    color: "bg-[#C78573]",
  },
];

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-[#35383A] bg-[#232527] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#A5AAA9]">
          {label}
        </p>

        <div className="rounded-xl bg-[#E88B42]/10 p-2.5 text-[#E88B42]">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-[#ECEBE8]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#A5AAA9]">
        {description}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#ECEBE8]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#A5AAA9]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [notice, setNotice] = useState("");

  const activePrograms = programs.filter(
    (program) => program.status === "Active"
  );

  const totalMentees = programs.reduce(
    (total, program) => total + program.mentees,
    0
  );

  const totalMentors = programs.reduce(
    (total, program) => total + program.mentors,
    0
  );

  const totalCapacity = activePrograms.reduce(
    (total, program) => total + program.capacity,
    0
  );

  const averageCompletion = Math.round(
    activePrograms.reduce(
      (total, program) => total + program.completion,
      0
    ) / activePrograms.length
  );

  const enrollmentRate = Math.round(
    (totalMentees / totalCapacity) * 100
  );

  const largestEnrollment = Math.max(
    ...enrollmentData.map((item) => item.value)
  );

  function handleNavigation(page: string) {
    const paths: Record<string, string> = {
      Overview: "/admin",
      Programs: "/admin/programs",
      Mentors: "/admin/mentors",
      Mentees: "/admin/mentees",
      Analytics: "/admin/analytics",
    };

    if (paths[page]) {
      router.push(paths[page]);
    }
  }

  function handleRoleChange(role: DashboardRole) {
    router.push(`/${role}`);
  }

  function showDemoNotice(message: string) {
    setNotice(message);
  }

  return (
    <DashboardLayout
      role="admin"
      activePage="Overview"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <ShieldCheck size={16} />
            Administration workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Platform Overview
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Monitor mentorship programs, oversee
            learner progress, and manage the ElevateX
            ecosystem from one workspace.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#45413C] bg-[#292521] px-4 py-3 text-xs text-[#D7B69A]">
          <Sparkles
            size={16}
            className="text-[#E88B42]"
          />
          Administrator Portal
        </div>
      </div>

      {/* DEMO NOTICE */}
      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-[#805439] bg-[#382B22] p-4 text-sm text-[#F3C49C]"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* MAIN STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total mentees"
          value={totalMentees}
          description="Across active programs"
          icon={GraduationCap}
        />

        <StatCard
          label="Active mentors"
          value={totalMentors}
          description="Supporting assigned learners"
          icon={Users}
        />

        <StatCard
          label="Active programs"
          value={activePrograms.length}
          description="One more program in planning"
          icon={Layers3}
        />

        <StatCard
          label="Average progress"
          value={`${averageCompletion}%`}
          description="Sample program progress"
          icon={TrendingUp}
        />
      </div>

      {/* ADMIN HIGHLIGHT */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#E8A774]">
              <Target size={16} />
              Platform performance
            </p>

            <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
              Build stronger mentorship outcomes.
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#C7B9AD]">
              Your active programs are currently
              at {enrollmentRate}% of their combined
              enrollment capacity in this demo.
              Continue monitoring engagement,
              mentor workloads, and learner progress.
            </p>

            <div className="mt-6 max-w-xl">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-[#C7B9AD]">
                  Enrollment capacity
                </span>

                <span className="font-medium text-[#F3A66F]">
                  {totalMentees}/{totalCapacity} learners
                </span>
              </div>

              <div
                role="progressbar"
                aria-label="Enrollment capacity used"
                aria-valuenow={enrollmentRate}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2.5 overflow-hidden rounded-full bg-[#514036]"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C77737] to-[#F3A66F]"
                  style={{
                    width: `${enrollmentRate}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              showDemoNotice(
                "Detailed analytics will be available when the Admin Analytics page is implemented."
              )
            }
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F]"
          >
            Analytics preview
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ENROLLMENT AND REVIEW ACTIVITY */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
        {/* ENROLLMENT CHART */}
        <section className="min-w-0 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <SectionHeading
            title="Enrollment growth"
            description="Illustrative learner enrollment over six months."
            action={
              <span className="rounded-lg border border-[#48413A] bg-[#302B26] px-3 py-2 text-[11px] text-[#D1B394]">
                May – Oct 2026
              </span>
            }
          />

          <div className="mt-7 rounded-xl border border-[#393C3E] bg-[#1D1F20] p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#A5AAA9]">
                  October enrollment
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {enrollmentData[enrollmentData.length - 1].value}
                </p>
              </div>

              <div className="rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
                <BarChart3 size={21} />
              </div>
            </div>

            <div
              aria-label="Enrollment by month: May 48, June 59, July 72, August 81, September 96, October 106"
              className="mt-8 flex h-48 items-end justify-between gap-3 border-b border-[#454749] pb-1"
            >
              {enrollmentData.map((item) => (
                <div
                  key={item.month}
                  className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  title={`${item.month}: ${item.value} mentees`}
                >
                  <span className="mb-2 text-[10px] font-medium text-[#E8A774]">
                    {item.value}
                  </span>

                  <div
                    className="w-full max-w-16 rounded-t-lg bg-gradient-to-t from-[#A85F2F] to-[#E88B42] transition-opacity group-hover:opacity-80"
                    style={{
                      height: `${
                        (item.value / largestEnrollment) * 85
                      }%`,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between gap-3">
              {enrollmentData.map((item) => (
                <span
                  key={item.month}
                  className="min-w-0 flex-1 text-center text-[10px] text-[#A5AAA9]"
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEW BREAKDOWN */}
        <section className="min-w-0 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <SectionHeading
            title="Assignment reviews"
            description="Sample distribution of mentor review outcomes."
          />

          <div className="mt-7 rounded-xl border border-[#393C3E] bg-[#292C2E] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[#B7BDB9]">
                Review outcomes
              </p>

              <ClipboardCheck
                size={20}
                className="text-[#E88B42]"
              />
            </div>

            <div
              role="img"
              aria-label="68 percent approved, 22 percent awaiting review, 10 percent needs revision"
              className="mt-6 flex h-3 overflow-hidden rounded-full bg-[#414345]"
            >
              {reviewStats.map((item) => (
                <div
                  key={item.label}
                  className={item.color}
                  style={{
                    width: `${item.value}%`,
                  }}
                />
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {reviewStats.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 text-sm text-[#C8CCC8]">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                    />
                    {item.label}
                  </span>

                  <span className="text-sm font-semibold">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#514436] bg-[#362C24] p-4">
            <p className="flex items-start gap-3 text-xs leading-6 text-[#D7BB9D]">
              <Activity
                size={17}
                className="mt-1 shrink-0 text-[#E88B42]"
              />
              These figures are representative demo data,
              not live submissions from the Mentor Dashboard.
            </p>
          </div>
        </section>
      </div>

      {/* ACTIVE PROGRAMS */}
      <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
        <SectionHeading
          title="Mentorship programs"
          description="Overview of program capacity and learning progress."
          action={
            <span className="text-xs text-[#A5AAA9]">
              {programs.length} total programs
            </span>
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {programs.map((program) => (
            <article
              key={program.id}
              className="rounded-2xl border border-[#3B3E40] bg-[#292C2E] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#E8A774]">
                    {program.category}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {program.name}
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-[11px] ${
                    program.status === "Active"
                      ? "border-[#466B52] bg-[#294033] text-[#A6D5B0]"
                      : "border-[#805439] bg-[#453323] text-[#F3A66F]"
                  }`}
                >
                  {program.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#3D4042] bg-[#232527] p-4">
                  <p className="flex items-center gap-2 text-xs text-[#A5AAA9]">
                    <GraduationCap
                      size={15}
                      className="text-[#E88B42]"
                    />
                    Mentees
                  </p>

                  <p className="mt-3 text-xl font-semibold">
                    {program.mentees}
                  </p>
                </div>

                <div className="rounded-xl border border-[#3D4042] bg-[#232527] p-4">
                  <p className="flex items-center gap-2 text-xs text-[#A5AAA9]">
                    <Users
                      size={15}
                      className="text-[#E88B42]"
                    />
                    Mentors
                  </p>

                  <p className="mt-3 text-xl font-semibold">
                    {program.mentors}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#A5AAA9]">
                    Sample learning progress
                  </span>

                  <span className="font-semibold text-[#F3A66F]">
                    {program.completion}%
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label={`${program.name} progress`}
                  aria-valuenow={program.completion}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 overflow-hidden rounded-full bg-[#404345]"
                >
                  <div
                    className="h-full rounded-full bg-[#E88B42]"
                    style={{
                      width: `${program.completion}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#3D4042] pt-4">
                <p className="text-xs text-[#A5AAA9]">
                  Capacity: {program.capacity}
                </p>

                <span className="text-xs font-medium text-[#D3A37E]">
                  Demo program
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ACTIVITY AND MANAGEMENT */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,1fr)]">
        {/* RECENT ACTIVITY */}
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <SectionHeading
            title="Recent platform activity"
            description="A demonstration of administrative activity tracking."
          />

          <div className="mt-6 space-y-5">
            {activities.map((item) => {
              const Icon =
                item.type === "enrollment"
                  ? GraduationCap
                  : item.type === "review"
                    ? ClipboardCheck
                    : item.type === "program"
                      ? BookOpen
                      : Users;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 border-b border-[#383B3D] pb-5 last:border-b-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E88B42]/10 text-[#E88B42]">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {item.title}
                    </p>

                    <p className="mt-2 text-xs leading-6 text-[#A5AAA9]">
                      {item.description}
                    </p>

                    <p className="mt-2 text-[11px] text-[#858C88]">
                      {item.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <SectionHeading
            title="Administration tools"
            description="Quick access to core management tasks."
          />

          <div className="mt-6 space-y-3">
            {[
              {
                title: "Manage programs",
                description: "Programs and enrollment capacity",
                icon: Layers3,
                message:
                  "Program management will be available in Step 33.",
              },
              {
                title: "Manage mentors",
                description: "Mentor assignments and workload",
                icon: Users,
                message:
                  "Mentor management will be available in Step 34.",
              },
              {
                title: "Manage mentees",
                description: "Learner enrollment and status",
                icon: GraduationCap,
                message:
                  "Mentee management will be available in Step 35.",
              },
              {
                title: "Platform analytics",
                description: "Learning and engagement reports",
                icon: BarChart3,
                message:
                  "Detailed analytics will be available in Step 36.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() =>
                    showDemoNotice(item.message)
                  }
                  className="group flex w-full items-center gap-4 rounded-xl border border-[#3D4042] bg-[#292C2E] p-4 text-left transition hover:border-[#805439] hover:bg-[#312B27]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E88B42]/10 text-[#E88B42]">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-[#A5AAA9]">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    className="shrink-0 text-[#A5AAA9] transition-transform group-hover:translate-x-1 group-hover:text-[#E88B42]"
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-[#514436] bg-[#362C24] p-4">
            <p className="text-xs leading-6 text-[#D7BB9D]">
              Administrative actions are not connected
              to a live backend yet. No real users,
              programs, or assignments are modified.
            </p>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Admin Dashboard · Demonstration data
      </footer>
    </DashboardLayout>
  );
}
