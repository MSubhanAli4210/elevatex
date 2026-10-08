
"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Code2,
  FileCode2,
  GraduationCap,
  LockKeyhole,
  Play,
  Rocket,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

type MilestoneStatus = "completed" | "current" | "locked";

type Lesson = {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
};

type Milestone = {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: MilestoneStatus;
  lessons: Lesson[];
};

const initialMilestones: Milestone[] = [
  {
    id: 1,
    title: "HTML & CSS Foundations",
    description:
      "Learn semantic HTML, responsive layouts, accessibility, and modern CSS.",
    duration: "2 weeks",
    status: "completed",
    lessons: [
      { id: 1, title: "HTML Essentials", duration: "45 min", completed: true },
      { id: 2, title: "CSS Fundamentals", duration: "1 hr", completed: true },
      { id: 3, title: "Responsive Design", duration: "1 hr", completed: true },
    ],
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    description:
      "Build a strong understanding of JavaScript and browser interactions.",
    duration: "3 weeks",
    status: "completed",
    lessons: [
      { id: 4, title: "Variables and Data Types", duration: "50 min", completed: true },
      { id: 5, title: "Functions and Arrays", duration: "1 hr", completed: true },
      { id: 6, title: "DOM Manipulation", duration: "1 hr", completed: true },
    ],
  },
  {
    id: 3,
    title: "Building REST APIs",
    description:
      "Create server-side applications, design API endpoints, and connect databases.",
    duration: "4 weeks",
    status: "current",
    lessons: [
      { id: 7, title: "Introduction to Node.js", duration: "45 min", completed: true },
      { id: 8, title: "Express.js Fundamentals", duration: "1 hr", completed: true },
      { id: 9, title: "REST API Architecture", duration: "1 hr 30 min", completed: false },
      { id: 10, title: "Database Integration", duration: "2 hrs", completed: false },
    ],
  },
  {
    id: 4,
    title: "Full Stack Application",
    description:
      "Combine your frontend and backend skills into a complete project.",
    duration: "5 weeks",
    status: "locked",
    lessons: [
      { id: 11, title: "Project Planning", duration: "1 hr", completed: false },
      { id: 12, title: "Authentication", duration: "2 hrs", completed: false },
      { id: 13, title: "Frontend Integration", duration: "2 hrs", completed: false },
      { id: 14, title: "Deployment", duration: "1 hr", completed: false },
    ],
  },
];

const statusStyles = {
  completed: {
    label: "Completed",
    text: "text-[#A9C9AE]",
    background: "bg-[#263B2E]",
    border: "border-[#45634B]",
  },
  current: {
    label: "In Progress",
    text: "text-[#F3A66F]",
    background: "bg-[#3A2A20]",
    border: "border-[#8B5834]",
  },
  locked: {
    label: "Upcoming",
    text: "text-[#A5AAA9]",
    background: "bg-[#292C2D]",
    border: "border-[#424648]",
  },
};

export default function MenteeRoadmapPage() {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [expanded, setExpanded] = useState<number[]>([3]);

  const totalLessons = milestones.reduce(
    (sum, milestone) => sum + milestone.lessons.length,
    0
  );

  const completedLessons = milestones.reduce(
    (sum, milestone) =>
      sum + milestone.lessons.filter((lesson) => lesson.completed).length,
    0
  );

  const progress = Math.round((completedLessons / totalLessons) * 100);

  const completedMilestones = milestones.filter(
    (milestone) => milestone.lessons.every((lesson) => lesson.completed)
  ).length;

  const currentMilestone = useMemo(
    () =>
      milestones.find((milestone) => milestone.status === "current"),
    [milestones]
  );

  function toggleExpanded(id: number) {
    setExpanded((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function completeLesson(milestoneId: number, lessonId: number) {
    setMilestones((previous) => {
      const updated = previous.map((milestone) => ({
        ...milestone,
        lessons: milestone.lessons.map((lesson) =>
          milestone.id === milestoneId && lesson.id === lessonId
            ? { ...lesson, completed: true }
            : lesson
        ),
      }));

      const firstIncomplete = updated.findIndex(
        (milestone) =>
          milestone.lessons.some((lesson) => !lesson.completed)
      );

      return updated.map((milestone, index) => ({
        ...milestone,
        status:
          firstIncomplete === -1 || index < firstIncomplete
            ? "completed"
            : index === firstIncomplete
              ? "current"
              : "locked",
      }));
    });
  }

  return (
    <DashboardLayout
      role="mentee"
      activePage="My Roadmap"
      onNavigate={(page) => {
        if (page === "Overview") {
          window.location.assign("/");
        }
      }}
      onRoleChange={(role) => {
        window.location.assign(`/?role=${role}`);
      }}
    >
      {/* PAGE HEADING */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <Target size={15} />
            Personal development
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your Learning Journey<span className="text-[#E88B42]">.</span>
          </h1>

          <p className="max-w-xl text-sm leading-7 text-[#A5AAA9]">
            A guided path from foundational skills to real-world projects.
            Move at your own pace, track milestones, and grow with support
            from your mentor.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#373A3C] bg-[#232527] px-4 py-3 text-xs text-[#C8C9C5]">
          <CalendarDays size={16} className="text-[#E88B42]" />
          Fall 2026 Cohort
        </div>
      </div>

      {/* PROGRESS SUMMARY */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#34271F] via-[#252424] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#E8A774]">
              <Sparkles size={16} />
              Your progress
            </div>

            <h2 className="text-2xl font-semibold">
              Keep your momentum going.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[#BFB7B0]">
              You&apos;ve completed {completedLessons} of {totalLessons} learning
              activities. Every completed lesson brings you closer to your
              goal.
            </p>

            <div className="mt-6 max-w-lg">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-[#BFB7B0]">Overall completion</span>
                <span className="font-semibold text-[#F3A66F]">{progress}%</span>
              </div>

              <div
                role="progressbar"
                aria-label="Learning roadmap completion"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2.5 overflow-hidden rounded-full bg-[#504239]"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C77737] to-[#F3A66F] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:flex-col md:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-[5px] border-[#E88B42]/50 bg-[#231D1A] shadow-[0_0_32px_rgba(232,139,66,0.09)]">
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#F3A66F]">
                  {progress}%
                </span>
                <span className="text-[10px] text-[#BFB7B0]">
                  Complete
                </span>
              </div>
            </div>

            <span className="text-xs text-[#D5B69D]">
              {completedMilestones} / {milestones.length} milestones
            </span>
          </div>
        </div>
      </section>

      {/* SMALL STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Completed milestones",
            value: `${completedMilestones}/${milestones.length}`,
            icon: Trophy,
          },
          {
            label: "Lessons finished",
            value: `${completedLessons}/${totalLessons}`,
            icon: CheckCircle2,
          },
          {
            label: "Current module",
            value: currentMilestone ? `0${currentMilestone.id}` : "Done",
            icon: BookOpen,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-2xl border border-[#343638] bg-[#232527] p-5"
            >
              <div>
                <p className="text-xs text-[#A5AAA9]">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              </div>

              <div className="rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
                <Icon size={21} />
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN ROADMAP */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(270px,1fr)]">
        <section className="min-w-0 rounded-2xl border border-[#343638] bg-[#232527] p-5 sm:p-7">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.15em] text-[#E88B42]">
              Structured learning
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Full Stack Development Path
            </h2>
            <p className="mt-2 text-sm text-[#A5AAA9]">
              Expand a milestone to explore its learning activities.
            </p>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const isExpanded = expanded.includes(milestone.id);
              const status = statusStyles[milestone.status];
              const finished = milestone.lessons.filter(
                (lesson) => lesson.completed
              ).length;

              return (
                <article
                  key={milestone.id}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    milestone.status === "current"
                      ? "border-[#805439] bg-[#2E2925]"
                      : "border-[#3A3D3F] bg-[#292C2E]"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(milestone.id)}
                    className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        milestone.status === "completed"
                          ? "bg-[#294133] text-[#A9C9AE]"
                          : milestone.status === "current"
                            ? "bg-[#E88B42]/15 text-[#F3A66F]"
                            : "bg-[#383C3D] text-[#8C9490]"
                      }`}
                    >
                      {milestone.status === "completed" ? (
                        <Check size={20} />
                      ) : milestone.status === "locked" ? (
                        <LockKeyhole size={18} />
                      ) : (
                        <Code2 size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#F0EDEA]">
                          {milestone.title}
                        </h3>

                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] ${status.text} ${status.background} ${status.border}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-6 text-[#A5AAA9]">
                        {milestone.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#B7BDBA]">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} />
                          {finished}/{milestone.lessons.length} lessons
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {milestone.duration}
                        </span>
                      </div>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`mt-2 shrink-0 text-[#A5AAA9] transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#3A3D3F] px-4 py-4 sm:px-5">
                      <div className="space-y-2">
                        {milestone.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex flex-wrap items-center gap-3 rounded-lg p-3 transition hover:bg-[#353637]"
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                lesson.completed
                                  ? "bg-[#294133] text-[#A9C9AE]"
                                  : "bg-[#3A3B3B] text-[#B7BDBA]"
                              }`}
                            >
                              {lesson.completed ? (
                                <Check size={15} />
                              ) : (
                                <Circle size={15} />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-[#E6E6E2]">
                                {lesson.title}
                              </p>
                              <p className="mt-1 text-xs text-[#999F9C]">
                                {lesson.duration}
                              </p>
                            </div>

                            {lesson.completed ? (
                              <span className="text-xs text-[#A9C9AE]">
                                Done
                              </span>
                            ) : milestone.status === "current" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  completeLesson(milestone.id, lesson.id)
                                }
                                className="rounded-lg border border-[#805439] bg-[#E88B42]/10 px-3 py-2 text-xs font-medium text-[#F3A66F] transition hover:bg-[#E88B42]/20"
                              >
                                Mark done
                              </button>
                            ) : (
                              <LockKeyhole
                                size={15}
                                className="text-[#777F7B]"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* RIGHT SIDEBAR CONTENT */}
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-[#343638] bg-[#232527] p-6">
            <div className="mb-5 flex items-center gap-2">
              <Target className="text-[#E88B42]" size={19} />
              <h3 className="font-semibold">Current focus</h3>
            </div>

            {currentMilestone ? (
              <>
                <p className="text-sm font-medium text-[#ECEBE8]">
                  {currentMilestone.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#A5AAA9]">
                  {currentMilestone.description}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#A9C9AE]">
                Congratulations! You completed every milestone.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-[#343638] bg-[#232527] p-6">
            <h3 className="font-semibold">Your mentor</h3>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#453225] font-semibold text-[#E88B42]">
                SA
              </div>

              <div>
                <p className="text-sm font-medium">Sarah Ahmed</p>
                <p className="mt-1 text-xs text-[#A5AAA9]">
                  Full Stack Development
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-[#A5AAA9]">
              Your mentor can review completed assignments and help
              guide your next steps.
            </p>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] to-[#232527] p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#E88B42]/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-[#E88B42]/10 p-3 text-[#F3A66F]">
                <Sparkles size={22} />
              </div>

              <h3 className="text-lg font-semibold">
                Learn with AI
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#C5B7AC]">
                Need help with a difficult concept? Your AI
                companion will help you understand the next step.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-xs text-[#F3A66F]">
                AI companion coming soon
                <ArrowRight size={15} />
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Learning Roadmap · Demo data only
      </footer>
    </DashboardLayout>
  );
}
