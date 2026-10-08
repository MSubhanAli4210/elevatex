
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  GraduationCap,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

const roadmap = [
  {
    title: "HTML & CSS Foundations",
    description: "Build responsive interfaces",
    status: "completed",
  },
  {
    title: "JavaScript Fundamentals",
    description: "Understand interactive web applications",
    status: "completed",
  },
  {
    title: "Building REST APIs",
    description: "Learn backend routes and API design",
    status: "current",
  },
  {
    title: "Full Stack Application",
    description: "Build and deploy your final project",
    status: "locked",
  },
] as const;

const activity = [
  {
    title: "Authentication System",
    description: "Assignment submitted for mentor review",
    time: "Oct 6, 2026",
    icon: ClipboardList,
  },
  {
    title: "JavaScript Task Manager",
    description: "Mentor feedback is available",
    time: "Oct 1, 2026",
    icon: BookOpen,
  },
  {
    title: "Building REST APIs",
    description: "Current learning milestone",
    time: "In progress",
    icon: Route,
  },
];

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof BookOpen;
}) {
  return (
    <div className="rounded-2xl border border-[#35383A] bg-[#232527] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#A5AAA9]">
          {title}
        </p>

        <div className="rounded-xl bg-[#E88B42]/10 p-2.5 text-[#E88B42]">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#A5AAA9]">
        {detail}
      </p>
    </div>
  );
}

export default function MenteeDashboardPage() {
  const router = useRouter();

  function handleNavigation(page: string) {
    const routes: Record<string, string> = {
      Overview: "/mentee",
      "My Roadmap": "/mentee/roadmap",
      Assignments: "/mentee/assignments",
      "My Mentor": "/mentee/mentor",
      "AI Companion": "/mentee/ai",
      Sessions: "/mentee/sessions",
    };

    const destination = routes[page];

    if (destination) {
      router.push(destination);
    }
  }

  function handleRoleChange(role: DashboardRole) {
    router.push(`/${role}`);
  }

  return (
    <DashboardLayout
      role="mentee"
      activePage="Overview"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <GraduationCap size={16} />
            Mentee workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, Alex
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Track your learning journey, complete
            assignments, and connect with your mentor.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-xl border border-[#45413C] bg-[#292521] px-4 py-3 text-xs text-[#D7B69A]">
          <Sparkles
            size={16}
            className="text-[#E88B42]"
          />
          Full Stack Development
        </span>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Learning progress"
          value="68%"
          detail="Overall program progress"
          icon={TrendingUp}
        />

        <StatCard
          title="Milestones completed"
          value="2 / 4"
          detail="Two milestones remaining"
          icon={Target}
        />

        <StatCard
          title="Assignments"
          value="5"
          detail="Assigned learning tasks"
          icon={ClipboardList}
        />

        <StatCard
          title="Assigned mentor"
          value="1"
          detail="Sarah Ahmed"
          icon={Users}
        />
      </div>

      {/* FEATURED LEARNING CARD */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#E8A774]">
              <Target size={16} />
              Current learning focus
            </p>

            <h2 className="mt-4 text-2xl font-semibold">
              Building REST APIs
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#C7B9AD]">
              You're progressing through backend
              fundamentals. Keep practicing Express
              routing, HTTP methods, error handling,
              and API design.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-[#C7B9AD]">
                  Sample milestone progress
                </span>

                <span className="font-semibold text-[#F3A66F]">
                  50%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#514036]">
                <div className="h-full w-1/2 rounded-full bg-[#E88B42]" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/mentee/roadmap")
            }
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F]"
          >
            Continue learning
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ROADMAP AND ACTIVITY */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)]">
        {/* ROADMAP PREVIEW */}
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Learning roadmap
              </h2>

              <p className="mt-2 text-sm text-[#A5AAA9]">
                Your path to becoming a full stack developer.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/mentee/roadmap")
              }
              className="inline-flex items-center gap-2 text-xs font-medium text-[#F3A66F] hover:underline"
            >
              View roadmap
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {roadmap.map((milestone, index) => {
              const completed =
                milestone.status === "completed";
              const current =
                milestone.status === "current";

              return (
                <div
                  key={milestone.title}
                  className={`flex items-center gap-4 rounded-xl border p-4 ${
                    current
                      ? "border-[#805439] bg-[#382B22]"
                      : "border-[#3B3E40] bg-[#292C2E]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      completed
                        ? "bg-[#294033] text-[#A6D5B0]"
                        : current
                          ? "bg-[#493225] text-[#F3A66F]"
                          : "bg-[#373A3C] text-[#969D99]"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <span className="text-sm font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">
                      {milestone.title}
                    </h3>

                    <p className="mt-1 text-xs text-[#A5AAA9]">
                      {milestone.description}
                    </p>
                  </div>

                  <span
                    className={`hidden shrink-0 text-[11px] sm:block ${
                      completed
                        ? "text-[#A6D5B0]"
                        : current
                          ? "text-[#F3A66F]"
                          : "text-[#8F9692]"
                    }`}
                  >
                    {completed
                      ? "Completed"
                      : current
                        ? "In progress"
                        : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            Recent activity
          </h2>

          <p className="mt-2 text-sm text-[#A5AAA9]">
            Highlights from your learning journey.
          </p>

          <div className="mt-6 space-y-5">
            {activity.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E88B42]/10 text-[#E88B42]">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1 border-b border-[#373A3C] pb-5 last:border-none">
                    <p className="text-sm font-medium">
                      {item.title}
                    </p>

                    <p className="mt-2 text-xs leading-6 text-[#A5AAA9]">
                      {item.description}
                    </p>

                    <p className="mt-2 text-[11px] text-[#8E9691]">
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/mentee/assignments")
            }
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
          >
            View assignments
            <ArrowRight size={16} />
          </button>
        </section>
      </div>

      {/* MENTOR AND AI */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#745139] bg-[#493225] text-sm font-semibold text-[#F3A66F]">
              SA
            </div>

            <div>
              <h2 className="font-semibold">
                Sarah Ahmed
              </h2>

              <p className="mt-1 text-xs text-[#A5AAA9]">
                Your assigned mentor
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-[#A5AAA9]">
            Get guidance on your projects, discuss
            challenges, and prepare for your next
            mentorship session.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/mentee/mentor")
            }
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
          >
            View mentor profile
            <ArrowRight size={16} />
          </button>
        </section>

        <section className="rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] to-[#232527] p-6">
          <div className="inline-flex rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
            <Sparkles size={23} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            AI Learning Companion
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#C5B7AC]">
            Explore development concepts, break down
            assignments, and prepare better questions
            for your mentor.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/mentee/ai")
            }
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
          >
            Open AI Companion
            <ArrowRight size={16} />
          </button>
        </section>
      </div>

      {/* SESSIONS LINK */}
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#35383A] bg-[#232527] p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
            <CalendarDays size={23} />
          </div>

          <div>
            <h2 className="font-semibold">
              Mentorship sessions
            </h2>

            <p className="mt-2 text-sm text-[#A5AAA9]">
              View upcoming sessions and manage
              your demo schedule.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/mentee/sessions")
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#805439] bg-[#382B22] px-4 py-3 text-sm font-medium text-[#F3A66F] transition hover:bg-[#493426]"
        >
          My sessions
          <ChevronRight size={17} />
        </button>
      </section>

      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Mentee Dashboard · Demo overview data
      </footer>
    </DashboardLayout>
  );
}
