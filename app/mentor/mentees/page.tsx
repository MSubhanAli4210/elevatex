
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  MessageSquare,
  Route,
  Search,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type MenteeStatus = "On track" | "Needs attention";
type StatusFilter = "all" | "on-track" | "attention";
type ProgramFilter = "all" | "fullstack" | "frontend" | "backend";

type Milestone = {
  title: string;
  completed: boolean;
};

type Mentee = {
  id: number;
  name: string;
  initials: string;
  program: string;
  programKey: Exclude<ProgramFilter, "all">;
  progress: number;
  currentMilestone: string;
  status: MenteeStatus;
  completedAssignments: number;
  totalAssignments: number;
  upcomingSession: string;
  bio: string;
  strengths: string[];
  milestones: Milestone[];
};

const mentees: Mentee[] = [
  {
    id: 1,
    name: "Alex Morgan",
    initials: "AM",
    program: "Full Stack Development",
    programKey: "fullstack",
    progress: 68,
    currentMilestone: "Building REST APIs",
    status: "On track",
    completedAssignments: 3,
    totalAssignments: 5,
    upcomingSession: "Oct 15, 2026",
    bio: "Alex is developing full-stack engineering skills with a focus on practical application development, APIs, and system architecture.",
    strengths: [
      "HTML & CSS",
      "JavaScript",
      "Problem solving",
    ],
    milestones: [
      { title: "HTML & CSS Foundations", completed: true },
      { title: "JavaScript Fundamentals", completed: true },
      { title: "Building REST APIs", completed: false },
      { title: "Full Stack Application", completed: false },
    ],
  },
  {
    id: 2,
    name: "Daniel Kim",
    initials: "DK",
    program: "Full Stack Development",
    programKey: "fullstack",
    progress: 42,
    currentMilestone: "JavaScript Fundamentals",
    status: "Needs attention",
    completedAssignments: 2,
    totalAssignments: 6,
    upcomingSession: "Oct 19, 2026",
    bio: "Daniel is strengthening his JavaScript fundamentals before moving into backend development. Additional guidance with asynchronous programming would be useful.",
    strengths: ["HTML & CSS", "UI Implementation"],
    milestones: [
      { title: "HTML & CSS Foundations", completed: true },
      { title: "JavaScript Fundamentals", completed: false },
      { title: "Building REST APIs", completed: false },
      { title: "Full Stack Application", completed: false },
    ],
  },
  {
    id: 3,
    name: "Olivia Chen",
    initials: "OC",
    program: "Frontend Engineering",
    programKey: "frontend",
    progress: 85,
    currentMilestone: "Final Portfolio Project",
    status: "On track",
    completedAssignments: 7,
    totalAssignments: 8,
    upcomingSession: "Oct 16, 2026",
    bio: "Olivia is approaching completion of the frontend engineering program and is currently refining her final portfolio project.",
    strengths: [
      "React",
      "Responsive Design",
      "Accessibility",
    ],
    milestones: [
      { title: "Web Fundamentals", completed: true },
      { title: "JavaScript & TypeScript", completed: true },
      { title: "React Applications", completed: true },
      { title: "Final Portfolio Project", completed: false },
    ],
  },
  {
    id: 4,
    name: "James Wilson",
    initials: "JW",
    program: "Backend Development",
    programKey: "backend",
    progress: 54,
    currentMilestone: "Database Integration",
    status: "On track",
    completedAssignments: 4,
    totalAssignments: 7,
    upcomingSession: "Not scheduled",
    bio: "James is developing backend engineering skills, with particular interest in API design, relational databases, and maintainable server architecture.",
    strengths: [
      "Node.js",
      "Express",
      "API Design",
    ],
    milestones: [
      { title: "Backend Fundamentals", completed: true },
      { title: "REST API Development", completed: true },
      { title: "Database Integration", completed: false },
      { title: "Deployment & Security", completed: false },
    ],
  },
];

function Avatar({
  initials,
  large = false,
}: {
  initials: string;
  large?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-[#745139] bg-[#493225] font-semibold text-[#F3A66F] ${
        large
          ? "h-20 w-20 text-2xl"
          : "h-12 w-12 text-sm"
      }`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: MenteeStatus;
}) {
  const onTrack = status === "On track";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${
        onTrack
          ? "border-[#466B52] bg-[#294033] text-[#A6D5B0]"
          : "border-[#805439] bg-[#453323] text-[#F3A66F]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          onTrack ? "bg-[#A6D5B0]" : "bg-[#E88B42]"
        }`}
      />
      {status}
    </span>
  );
}

function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-[#A5AAA9]">
          {label}
        </span>

        <span className="text-xs font-semibold text-[#F3A66F]">
          {value}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-[#404345]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#C77737] to-[#EFA15E]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
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
    </div>
  );
}

export default function MentorMenteesPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [programFilter, setProgramFilter] =
    useState<ProgramFilter>("all");

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [followUps, setFollowUps] =
    useState<number[]>([]);

  const [notice, setNotice] = useState("");

  const selectedMentee =
    mentees.find((mentee) => mentee.id === selectedId) ??
    null;

  const filteredMentees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mentees.filter((mentee) => {
      const matchesSearch =
        !query ||
        [
          mentee.name,
          mentee.program,
          mentee.currentMilestone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "on-track" &&
          mentee.status === "On track") ||
        (statusFilter === "attention" &&
          mentee.status === "Needs attention");

      const matchesProgram =
        programFilter === "all" ||
        mentee.programKey === programFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProgram
      );
    });
  }, [search, statusFilter, programFilter]);

  const averageProgress = Math.round(
    mentees.reduce(
      (total, mentee) => total + mentee.progress,
      0
    ) / mentees.length
  );

  const needsAttention = mentees.filter(
    (mentee) => mentee.status === "Needs attention"
  ).length;

  function toggleFollowUp(id: number) {
    const alreadyMarked = followUps.includes(id);

    setFollowUps((previous) =>
      alreadyMarked
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );

    setNotice(
      alreadyMarked
        ? "Follow-up marker removed from this demo."
        : "Mentee marked for follow-up in this demo."
    );
  }

  function handleNavigation(page: string) {
    const paths: Record<string, string> = {
      Overview: "/mentor",
      "My Mentees": "/mentor/mentees",
      Reviews: "/mentor/reviews",
      Roadmaps: "/mentor/roadmaps",
      Sessions: "/mentor/sessions",
    };

    if (paths[page]) {
      router.push(paths[page]);
    }
  }

  function handleRoleChange(role: DashboardRole) {
    router.push(`/${role}`);
  }

  return (
    <DashboardLayout
      role="mentor"
      activePage="My Mentees"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <Users size={16} />
            Mentor workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My Mentees
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Track learner progress, review milestones,
            and identify where your guidance can make
            the greatest difference.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#45413C] bg-[#292521] px-4 py-3 text-xs text-[#D7B69A]">
          <GraduationCap
            size={17}
            className="text-[#E88B42]"
          />
          Full mentor portfolio
        </div>
      </div>

      {/* NOTIFICATION */}
      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-[#805439] bg-[#382B22] p-4 text-sm text-[#F3C49C]"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned mentees"
          value={mentees.length}
          icon={Users}
        />

        <StatCard
          label="On track"
          value={
            mentees.filter(
              (mentee) => mentee.status === "On track"
            ).length
          }
          icon={CheckCircle2}
        />

        <StatCard
          label="Need attention"
          value={needsAttention}
          icon={Target}
        />

        <StatCard
          label="Average progress"
          value={`${averageProgress}%`}
          icon={TrendingUp}
        />
      </div>

      {/* GUIDANCE HIGHLIGHT */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#E8A774]">
              Mentorship focus
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              Every learner progresses differently.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#C5B7AC]">
              {needsAttention} mentee currently needs
              additional attention. Review their learning
              milestones and prepare a targeted follow-up.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("attention");
              setProgramFilter("all");
              setSearch("");

              document
                .getElementById("mentee-directory")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
          >
            View priority mentees
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* DIRECTORY */}
      <section
        id="mentee-directory"
        className="scroll-mt-24 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Mentee directory
            </h2>

            <p className="mt-2 text-sm text-[#A5AAA9]">
              Browse your assigned learners and review
              their individual progress.
            </p>
          </div>

          <span className="rounded-lg border border-[#434648] bg-[#292C2E] px-3 py-2 text-xs text-[#BFC4C0]">
            {filteredMentees.length} results
          </span>
        </div>

        {/* FILTERS */}
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_190px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#919894]"
            />

            <input
              type="search"
              aria-label="Search mentees"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, program, or milestone..."
              className="w-full rounded-xl border border-[#424648] bg-[#191B1D] py-3 pl-11 pr-4 text-sm text-[#ECEBE8] outline-none transition focus:border-[#E88B42]"
            />
          </div>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as StatusFilter
              )
            }
            className="min-w-0 rounded-xl border border-[#424648] bg-[#191B1D] px-4 py-3 text-sm text-[#ECEBE8] outline-none focus:border-[#E88B42]"
          >
            <option value="all">All statuses</option>
            <option value="on-track">On track</option>
            <option value="attention">Needs attention</option>
          </select>

          <select
            aria-label="Filter by program"
            value={programFilter}
            onChange={(event) =>
              setProgramFilter(
                event.target.value as ProgramFilter
              )
            }
            className="min-w-0 rounded-xl border border-[#424648] bg-[#191B1D] px-4 py-3 text-sm text-[#ECEBE8] outline-none focus:border-[#E88B42]"
          >
            <option value="all">All programs</option>
            <option value="fullstack">Full Stack</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
          </select>
        </div>

        {/* MENTEE CARDS */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredMentees.map((mentee) => (
            <article
              key={mentee.id}
              className="flex flex-col rounded-2xl border border-[#3B3E40] bg-[#292C2E] p-5 transition hover:border-[#805439]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar initials={mentee.initials} />

                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">
                      {mentee.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#A5AAA9]">
                      {mentee.program}
                    </p>
                  </div>
                </div>

                <StatusBadge status={mentee.status} />
              </div>

              <div className="mt-6">
                <ProgressBar
                  value={mentee.progress}
                  label="Learning progress"
                />
              </div>

              <div className="mt-5 grid gap-3 rounded-xl border border-[#3B3E40] bg-[#232527] p-4 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 text-xs text-[#969D99]">
                    <Route
                      size={14}
                      className="text-[#E88B42]"
                    />
                    Current milestone
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {mentee.currentMilestone}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-xs text-[#969D99]">
                    <ClipboardCheck
                      size={14}
                      className="text-[#E88B42]"
                    />
                    Assignments
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {mentee.completedAssignments}/
                    {mentee.totalAssignments} completed
                  </p>
                </div>
              </div>

              {followUps.includes(mentee.id) && (
                <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#F3A66F]">
                  <Target size={14} />
                  Marked for follow-up in this demo
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedId(mentee.id)
                }
                className="mt-5 flex min-h-11 w-full items-center justify-between rounded-xl border border-[#60452F] bg-[#382B22] px-4 py-3 text-sm font-medium text-[#F3A66F] transition hover:bg-[#493426]"
              >
                View learner details
                <ArrowRight size={17} />
              </button>
            </article>
          ))}
        </div>

        {filteredMentees.length === 0 && (
          <div className="py-16 text-center">
            <Users
              size={34}
              className="mx-auto text-[#858C88]"
            />

            <h3 className="mt-4 font-semibold">
              No mentees found
            </h3>

            <p className="mt-2 text-sm text-[#A5AAA9]">
              Try adjusting your search or filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setProgramFilter("all");
              }}
              className="mt-5 text-sm font-medium text-[#F3A66F] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* LEARNER DETAILS MODAL */}
      {selectedMentee && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentee-details-title"
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#49423B] bg-[#232527] shadow-2xl"
          >
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#3B3E40] p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar
                  initials={selectedMentee.initials}
                  large
                />

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                    Learner profile
                  </p>

                  <h2
                    id="mentee-details-title"
                    className="mt-2 text-xl font-semibold"
                  >
                    {selectedMentee.name}
                  </h2>

                  <p className="mt-1 text-xs text-[#A5AAA9]">
                    {selectedMentee.program}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close learner details"
                onClick={() => setSelectedId(null)}
                className="shrink-0 rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-7 overflow-y-auto p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge
                  status={selectedMentee.status}
                />

                {followUps.includes(selectedMentee.id) && (
                  <span className="text-xs text-[#F3A66F]">
                    Follow-up marked
                  </span>
                )}
              </div>

              {/* BIO */}
              <section>
                <h3 className="text-sm font-semibold">
                  About this learner
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#B8BEBA]">
                  {selectedMentee.bio}
                </p>
              </section>

              {/* PROGRESS */}
              <section className="rounded-xl border border-[#424547] bg-[#292C2E] p-5">
                <h3 className="mb-5 text-sm font-semibold">
                  Learning performance
                </h3>

                <ProgressBar
                  value={selectedMentee.progress}
                  label="Overall program progress"
                />

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#3D4042] bg-[#232527] p-4">
                    <BookOpen
                      size={18}
                      className="text-[#E88B42]"
                    />

                    <p className="mt-3 text-lg font-semibold">
                      {selectedMentee.completedAssignments}/
                      {selectedMentee.totalAssignments}
                    </p>

                    <p className="mt-1 text-xs text-[#A5AAA9]">
                      Completed assignments
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#3D4042] bg-[#232527] p-4">
                    <CalendarDays
                      size={18}
                      className="text-[#E88B42]"
                    />

                    <p className="mt-3 text-sm font-semibold">
                      {selectedMentee.upcomingSession}
                    </p>

                    <p className="mt-1 text-xs text-[#A5AAA9]">
                      Next session
                    </p>
                  </div>
                </div>
              </section>

              {/* MILESTONES */}
              <section>
                <h3 className="mb-4 text-sm font-semibold">
                  Learning roadmap
                </h3>

                <div className="space-y-3">
                  {selectedMentee.milestones.map(
                    (milestone, index) => {
                      const firstIncomplete =
                        selectedMentee.milestones.findIndex(
                          (item) => !item.completed
                        );

                      const current =
                        index === firstIncomplete;

                      return (
                        <div
                          key={milestone.title}
                          className="flex items-center gap-3 rounded-xl border border-[#3D4042] bg-[#292C2E] p-4"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              milestone.completed
                                ? "bg-[#294033] text-[#A6D5B0]"
                                : current
                                  ? "bg-[#493225] text-[#F3A66F]"
                                  : "bg-[#35383A] text-[#9EA5A0]"
                            }`}
                          >
                            {milestone.completed ? (
                              <CheckCircle2 size={19} />
                            ) : (
                              <span className="text-xs font-semibold">
                                {index + 1}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {milestone.title}
                            </p>

                            <p className="mt-1 text-xs text-[#A5AAA9]">
                              {milestone.completed
                                ? "Completed"
                                : current
                                  ? "Current milestone"
                                  : "Upcoming"}
                            </p>
                          </div>

                          {current && (
                            <ChevronRight
                              size={17}
                              className="text-[#E88B42]"
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </section>

              {/* STRENGTHS */}
              <section>
                <h3 className="mb-4 text-sm font-semibold">
                  Demonstrated strengths
                </h3>

                <div className="flex flex-wrap gap-2">
                  {selectedMentee.strengths.map((strength) => (
                    <span
                      key={strength}
                      className="rounded-lg border border-[#60452F] bg-[#382B22] px-3 py-2 text-xs text-[#E7B489]"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </section>

              {/* FOLLOW-UP */}
              <section className="rounded-xl border border-[#60452F] bg-[#342A23] p-5">
                <div className="flex items-start gap-3">
                  <MessageSquare
                    size={20}
                    className="shrink-0 text-[#E88B42]"
                  />

                  <div>
                    <h3 className="text-sm font-semibold">
                      Mentorship follow-up
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#C5B7AC]">
                      Mark this learner for a follow-up
                      discussion about their progress,
                      challenges, or next milestone.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleFollowUp(selectedMentee.id)
                  }
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#805439] bg-[#493225] px-4 py-3 text-sm font-medium text-[#F3A66F] hover:bg-[#593B29]"
                >
                  <Target size={17} />
                  {followUps.includes(selectedMentee.id)
                    ? "Remove follow-up marker"
                    : "Mark for follow-up"}
                </button>
              </section>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex shrink-0 justify-end border-t border-[#3B3E40] p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg border border-[#505456] px-5 py-2.5 text-sm hover:bg-[#343638]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Mentor Mentee Management · Demo data
      </footer>
    </DashboardLayout>
  );
}
