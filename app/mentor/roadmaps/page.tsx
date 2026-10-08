
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock3,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
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

type MilestoneStatus = "completed" | "current" | "upcoming";

type Milestone = {
  id: number;
  title: string;
  description: string;
  lessons: string[];
  status: MilestoneStatus;
  duration: string;
};

type MenteeRoadmap = {
  id: number;
  name: string;
  initials: string;
  program: string;
  progress: number;
  needsAttention: boolean;
  milestones: Milestone[];
};

type MentorNote = {
  id: string;
  menteeId: number;
  milestoneId: number;
  content: string;
};

const STORAGE_KEY = "elevatex-mentor-roadmap-notes-v1";

const roadmapData: MenteeRoadmap[] = [
  {
    id: 1,
    name: "Alex Morgan",
    initials: "AM",
    program: "Full Stack Development",
    progress: 68,
    needsAttention: false,
    milestones: [
      {
        id: 1,
        title: "HTML & CSS Foundations",
        description:
          "Build accessible and responsive user interfaces.",
        lessons: [
          "Semantic HTML",
          "CSS layouts and Flexbox",
          "Responsive design",
        ],
        status: "completed",
        duration: "2 weeks",
      },
      {
        id: 2,
        title: "JavaScript Fundamentals",
        description:
          "Understand programming fundamentals and browser interactions.",
        lessons: [
          "Variables, functions, and arrays",
          "DOM manipulation",
          "Asynchronous JavaScript",
        ],
        status: "completed",
        duration: "3 weeks",
      },
      {
        id: 3,
        title: "Building REST APIs",
        description:
          "Create backend endpoints using Node.js and Express.",
        lessons: [
          "HTTP methods and status codes",
          "Express routing",
          "Validation and error handling",
          "API testing",
        ],
        status: "current",
        duration: "4 weeks",
      },
      {
        id: 4,
        title: "Full Stack Application",
        description:
          "Connect frontend and backend components into a complete project.",
        lessons: [
          "Application architecture",
          "Database integration",
          "Authentication",
          "Deployment",
        ],
        status: "upcoming",
        duration: "5 weeks",
      },
    ],
  },
  {
    id: 2,
    name: "Daniel Kim",
    initials: "DK",
    program: "Full Stack Development",
    progress: 42,
    needsAttention: true,
    milestones: [
      {
        id: 1,
        title: "HTML & CSS Foundations",
        description:
          "Learn website structure and responsive styling.",
        lessons: [
          "Semantic HTML",
          "CSS layout",
          "Responsive interfaces",
        ],
        status: "completed",
        duration: "2 weeks",
      },
      {
        id: 2,
        title: "JavaScript Fundamentals",
        description:
          "Strengthen core programming and asynchronous JavaScript skills.",
        lessons: [
          "Functions and arrays",
          "DOM events",
          "Promises and async/await",
          "Error handling",
        ],
        status: "current",
        duration: "3 weeks",
      },
      {
        id: 3,
        title: "Building REST APIs",
        description:
          "Learn to create and test backend endpoints.",
        lessons: [
          "Node.js basics",
          "Express routing",
          "CRUD operations",
        ],
        status: "upcoming",
        duration: "4 weeks",
      },
      {
        id: 4,
        title: "Full Stack Application",
        description:
          "Develop an application with frontend and backend integration.",
        lessons: [
          "Frontend integration",
          "Database access",
          "Deployment",
        ],
        status: "upcoming",
        duration: "5 weeks",
      },
    ],
  },
  {
    id: 3,
    name: "Olivia Chen",
    initials: "OC",
    program: "Frontend Engineering",
    progress: 85,
    needsAttention: false,
    milestones: [
      {
        id: 1,
        title: "Web Fundamentals",
        description:
          "Create accessible, responsive web pages.",
        lessons: [
          "HTML structure",
          "Modern CSS",
          "Responsive layouts",
        ],
        status: "completed",
        duration: "2 weeks",
      },
      {
        id: 2,
        title: "JavaScript & TypeScript",
        description:
          "Write maintainable and type-safe frontend code.",
        lessons: [
          "Modern JavaScript",
          "TypeScript fundamentals",
          "API requests",
        ],
        status: "completed",
        duration: "3 weeks",
      },
      {
        id: 3,
        title: "React Applications",
        description:
          "Build reusable and interactive React applications.",
        lessons: [
          "Components and props",
          "State management",
          "Routing and forms",
        ],
        status: "completed",
        duration: "4 weeks",
      },
      {
        id: 4,
        title: "Final Portfolio Project",
        description:
          "Deliver a polished portfolio demonstrating frontend skills.",
        lessons: [
          "Project planning",
          "UI implementation",
          "Accessibility review",
          "Deployment",
        ],
        status: "current",
        duration: "3 weeks",
      },
    ],
  },
  {
    id: 4,
    name: "James Wilson",
    initials: "JW",
    program: "Backend Development",
    progress: 54,
    needsAttention: false,
    milestones: [
      {
        id: 1,
        title: "Backend Fundamentals",
        description:
          "Understand Node.js and server-side programming.",
        lessons: [
          "Node.js fundamentals",
          "Server setup",
          "Middleware",
        ],
        status: "completed",
        duration: "2 weeks",
      },
      {
        id: 2,
        title: "REST API Development",
        description:
          "Design reliable RESTful interfaces.",
        lessons: [
          "CRUD endpoints",
          "Validation",
          "API testing",
        ],
        status: "completed",
        duration: "3 weeks",
      },
      {
        id: 3,
        title: "Database Integration",
        description:
          "Use relational databases with backend applications.",
        lessons: [
          "PostgreSQL basics",
          "Table relationships",
          "Queries and transactions",
        ],
        status: "current",
        duration: "4 weeks",
      },
      {
        id: 4,
        title: "Deployment & Security",
        description:
          "Prepare applications for production environments.",
        lessons: [
          "Authentication",
          "Environment configuration",
          "Deployment",
        ],
        status: "upcoming",
        duration: "3 weeks",
      },
    ],
  },
];

const statusStyle: Record<
  MilestoneStatus,
  { label: string; classes: string }
> = {
  completed: {
    label: "Completed",
    classes:
      "border-[#466B52] bg-[#294033] text-[#A6D5B0]",
  },
  current: {
    label: "In progress",
    classes:
      "border-[#805439] bg-[#453323] text-[#F3A66F]",
  },
  upcoming: {
    label: "Upcoming",
    classes:
      "border-[#45494B] bg-[#343638] text-[#A5AAA9]",
  },
};

function Avatar({
  initials,
  large = false,
}: {
  initials: string;
  large?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-[#745139] bg-[#493225] font-semibold text-[#F3A66F] ${
        large ? "h-14 w-14 text-lg" : "h-10 w-10 text-xs"
      }`}
    >
      {initials}
    </div>
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[#A5AAA9]">
          {label}
        </span>
        <span className="text-sm font-semibold text-[#F3A66F]">
          {value}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 overflow-hidden rounded-full bg-[#3C4041]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#C77737] to-[#F3A66F]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function isMentorNote(value: unknown): value is MentorNote {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const note = value as Record<string, unknown>;

  return (
    typeof note.id === "string" &&
    typeof note.menteeId === "number" &&
    typeof note.milestoneId === "number" &&
    typeof note.content === "string"
  );
}

export default function MentorRoadmapsPage() {
  const router = useRouter();

  const [selectedMenteeId, setSelectedMenteeId] = useState(1);
  const [search, setSearch] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedMilestoneId, setExpandedMilestoneId] =
    useState<number | null>(3);

  const [notes, setNotes] = useState<MentorNote[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [draftNote, setDraftNote] = useState("");
  const [notice, setNotice] = useState("");

  const selectedMentee =
    roadmapData.find(
      (mentee) => mentee.id === selectedMenteeId
    ) ?? roadmapData[0];

  const currentMilestone =
    selectedMentee.milestones.find(
      (milestone) => milestone.status === "current"
    ) ?? selectedMentee.milestones[0];

  const selectedMilestone =
    selectedMentee.milestones.find(
      (milestone) => milestone.id === expandedMilestoneId
    ) ?? currentMilestone;

  const filteredMentees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roadmapData.filter((mentee) => {
      const matchesSearch =
        mentee.name.toLowerCase().includes(query) ||
        mentee.program.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (!attentionOnly || mentee.needsAttention)
      );
    });
  }, [search, attentionOnly]);

  const selectedNotes = notes.filter(
    (note) =>
      note.menteeId === selectedMentee.id &&
      note.milestoneId === selectedMilestone.id
  );

  const completedMilestones =
    selectedMentee.milestones.filter(
      (milestone) => milestone.status === "completed"
    ).length;

  const averageProgress = Math.round(
    roadmapData.reduce(
      (total, mentee) => total + mentee.progress,
      0
    ) / roadmapData.length
  );

  // Restore mentor notes only after the browser mounts.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (
          Array.isArray(parsed) &&
          parsed.every(isMentorNote)
        ) {
          setNotes(parsed);
        }
      }
    } catch {
      // Continue with no saved notes.
    }

    setNotesLoaded(true);
  }, []);

  useEffect(() => {
    if (!notesLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notes)
      );
    } catch {
      // Notes still work in memory if storage is blocked.
    }
  }, [notes, notesLoaded]);

  function selectMentee(mentee: MenteeRoadmap) {
    setSelectedMenteeId(mentee.id);

    const current = mentee.milestones.find(
      (milestone) => milestone.status === "current"
    );

    setExpandedMilestoneId(
      current?.id ?? mentee.milestones[0].id
    );

    setDraftNote("");
    setNotice("");
  }

  function selectMilestone(id: number) {
    setExpandedMilestoneId(id);
    setDraftNote("");
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draftNote.trim();

    if (!notesLoaded || !content) return;

    const newNote: MentorNote = {
      id: crypto.randomUUID(),
      menteeId: selectedMentee.id,
      milestoneId: selectedMilestone.id,
      content,
    };

    setNotes((previous) => [...previous, newNote]);
    setDraftNote("");
    setNotice("Mentor note saved in this browser.");
  }

  function removeNote(id: string) {
    setNotes((previous) =>
      previous.filter((note) => note.id !== id)
    );
    setNotice("Demo note removed.");
  }

  function handleNavigation(page: string) {
    const paths: Record<string, string> = {
      Overview: "/mentor",
      "My Mentees": "/mentor/mentees",
      Reviews: "/mentor/reviews",
      Roadmaps: "/mentor/roadmaps",
      Sessions: "/mentor/sessions",
    };

    if (paths[page]) router.push(paths[page]);
  }

  function handleRoleChange(role: DashboardRole) {
    router.push(`/${role}`);
  }

  return (
    <DashboardLayout
      role="mentor"
      activePage="Roadmaps"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <Route size={16} />
            Mentor workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Learning Roadmaps
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Monitor each learner's journey, inspect
            milestones, and record recommendations
            that support consistent progress.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#45413C] bg-[#292521] px-4 py-3 text-xs text-[#D7B69A]">
          <GraduationCap
            size={17}
            className="text-[#E88B42]"
          />
          Mentor learning oversight
        </div>
      </div>

      {/* NOTIFICATION */}
      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-[#466B52] bg-[#294033] p-4 text-sm text-[#B8DCC0]"
        >
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Assigned mentees",
            value: roadmapData.length,
            icon: Users,
          },
          {
            label: "Average progress",
            value: `${averageProgress}%`,
            icon: TrendingUp,
          },
          {
            label: "Need attention",
            value: roadmapData.filter(
              (mentee) => mentee.needsAttention
            ).length,
            icon: Target,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#35383A] bg-[#232527] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#A5AAA9]">
                {label}
              </p>
              <div className="rounded-xl bg-[#E88B42]/10 p-2.5 text-[#E88B42]">
                <Icon size={19} />
              </div>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* LEARNING HIGHLIGHT */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#2C2623] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#E8A774]">
              Mentorship insight
            </p>

            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
              Turn learning progress into useful guidance.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#C5B7AC]">
              Identify challenging milestones and record
              practical next steps for your mentees.
              A good roadmap shows not just what's
              completed, but what needs attention next.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        {/* MENTEE SELECTOR */}
        <section className="min-w-0 self-start rounded-2xl border border-[#35383A] bg-[#232527] p-5">
          <h2 className="font-semibold">
            Your mentees
          </h2>

          <p className="mt-2 text-xs leading-6 text-[#A5AAA9]">
            Select a learner to view their roadmap.
          </p>

          <div className="relative mt-5">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969D99]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search mentees..."
              aria-label="Search mentee roadmaps"
              className="w-full rounded-xl border border-[#414446] bg-[#191B1D] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#E88B42]"
            />
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-3 text-xs text-[#B8BEBA]">
            <input
              type="checkbox"
              checked={attentionOnly}
              onChange={(event) =>
                setAttentionOnly(event.target.checked)
              }
              className="h-4 w-4 accent-[#E88B42]"
            />
            Needs attention only
          </label>

          <div className="mt-5 space-y-2">
            {filteredMentees.map((mentee) => {
              const active =
                mentee.id === selectedMenteeId;

              return (
                <button
                  type="button"
                  key={mentee.id}
                  onClick={() => selectMentee(mentee)}
                  aria-pressed={active}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[#805439] bg-[#382B22]"
                      : "border-transparent bg-[#292C2E] hover:border-[#4D4540]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={mentee.initials} />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${
                          active
                            ? "text-[#F3A66F]"
                            : "text-[#ECEBE8]"
                        }`}
                      >
                        {mentee.name}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-[#A5AAA9]">
                        {mentee.program}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-[#A5AAA9]">
                      Progress
                    </span>
                    <span className="font-semibold text-[#F3A66F]">
                      {mentee.progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#414345]">
                    <div
                      className="h-full rounded-full bg-[#E88B42]"
                      style={{
                        width: `${mentee.progress}%`,
                      }}
                    />
                  </div>

                  {mentee.needsAttention && (
                    <p className="mt-3 text-[11px] text-[#F3A66F]">
                      Needs additional support
                    </p>
                  )}
                </button>
              );
            })}

            {filteredMentees.length === 0 && (
              <p className="py-8 text-center text-sm text-[#A5AAA9]">
                No matching mentees.
              </p>
            )}
          </div>
        </section>

        {/* SELECTED ROADMAP */}
        <div className="min-w-0 space-y-6">
          {/* MENTEE SUMMARY */}
          <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  initials={selectedMentee.initials}
                  large
                />

                <div>
                  <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                    Individual roadmap
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {selectedMentee.name}
                  </h2>

                  <p className="mt-1 text-sm text-[#A5AAA9]">
                    {selectedMentee.program}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  selectedMentee.needsAttention
                    ? "border-[#805439] bg-[#453323] text-[#F3A66F]"
                    : "border-[#466B52] bg-[#294033] text-[#A6D5B0]"
                }`}
              >
                {selectedMentee.needsAttention
                  ? "Needs attention"
                  : "On track"}
              </span>
            </div>

            <div className="mt-7">
              <ProgressBar
                value={selectedMentee.progress}
                label="Overall program progress"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#3D4042] bg-[#292C2E] p-4">
                <CheckCircle2
                  size={19}
                  className="text-[#E88B42]"
                />

                <p className="mt-3 text-xl font-semibold">
                  {completedMilestones}/
                  {selectedMentee.milestones.length}
                </p>

                <p className="mt-1 text-xs text-[#A5AAA9]">
                  Milestones completed
                </p>
              </div>

              <div className="rounded-xl border border-[#3D4042] bg-[#292C2E] p-4">
                <Target
                  size={19}
                  className="text-[#E88B42]"
                />

                <p className="mt-3 text-sm font-semibold">
                  {currentMilestone.title}
                </p>

                <p className="mt-1 text-xs text-[#A5AAA9]">
                  Current milestone
                </p>
              </div>
            </div>
          </section>

          {/* MILESTONE LIST */}
          <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
            <div>
              <h2 className="text-lg font-semibold">
                Roadmap milestones
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#A5AAA9]">
                Select a milestone to review its lessons
                and record targeted guidance.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {selectedMentee.milestones.map(
                (milestone, index) => {
                  const expanded =
                    selectedMilestone.id === milestone.id;

                  const style =
                    statusStyle[milestone.status];

                  return (
                    <article
                      key={milestone.id}
                      className={`overflow-hidden rounded-xl border transition ${
                        expanded
                          ? "border-[#805439] bg-[#302A26]"
                          : "border-[#3D4042] bg-[#292C2E]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          selectMilestone(milestone.id)
                        }
                        aria-expanded={expanded}
                        className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            milestone.status === "completed"
                              ? "bg-[#294033] text-[#A6D5B0]"
                              : milestone.status === "current"
                                ? "bg-[#493225] text-[#F3A66F]"
                                : "bg-[#383B3D] text-[#979F9A]"
                          }`}
                        >
                          {milestone.status === "completed" ? (
                            <CheckCircle2 size={19} />
                          ) : milestone.status === "upcoming" ? (
                            <LockKeyhole size={18} />
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

                          <p className="mt-2 text-xs leading-5 text-[#A5AAA9]">
                            {milestone.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] ${style.classes}`}
                            >
                              {style.label}
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#A5AAA9]">
                              <Clock3 size={13} />
                              {milestone.duration}
                            </span>
                          </div>
                        </div>

                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-[#A5AAA9] transition-transform ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {expanded && (
                        <div className="border-t border-[#4B423B] px-4 py-5 sm:px-5">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#D4B092]">
                            Learning topics
                          </p>

                          <div className="space-y-3">
                            {milestone.lessons.map((lesson) => (
                              <div
                                key={lesson}
                                className="flex items-center gap-3 text-sm text-[#CBD0CB]"
                              >
                                {milestone.status === "completed" ? (
                                  <Check
                                    size={17}
                                    className="shrink-0 text-[#A6D5B0]"
                                  />
                                ) : (
                                  <Circle
                                    size={17}
                                    className="shrink-0 text-[#E88B42]"
                                  />
                                )}
                                {lesson}
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 rounded-lg border border-[#554536] bg-[#382D25] px-4 py-3">
                            <p className="flex items-start gap-2 text-xs leading-6 text-[#D7B99E]">
                              <Lightbulb
                                size={16}
                                className="mt-1 shrink-0 text-[#E88B42]"
                              />
                              {milestone.status === "completed"
                                ? "This milestone is marked complete in the demo roadmap."
                                : milestone.status === "current"
                                  ? "Focus your feedback on the current learning challenges."
                                  : "This milestone is upcoming. Use notes to prepare future guidance."}
                            </p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </section>

          {/* MENTOR RECOMMENDATIONS */}
          <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={19}
                className="text-[#E88B42]"
              />

              <h2 className="text-lg font-semibold">
                Mentor recommendations
              </h2>
            </div>

            <p className="mt-3 text-sm leading-7 text-[#A5AAA9]">
              Record notes for{" "}
              <span className="font-medium text-[#ECEBE8]">
                {selectedMentee.name}
              </span>{" "}
              on{" "}
              <span className="font-medium text-[#E8A774]">
                {selectedMilestone.title}
              </span>
              .
            </p>

            <div className="mt-6 space-y-3">
              {selectedNotes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#494C4D] p-6 text-center">
                  <ClipboardList
                    size={26}
                    className="mx-auto text-[#909893]"
                  />

                  <p className="mt-3 text-sm text-[#A5AAA9]">
                    No mentor notes for this milestone.
                  </p>
                </div>
              ) : (
                selectedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-[#424547] bg-[#292C2E] p-4"
                  >
                    <p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-7 text-[#CBD0CB]">
                      {note.content}
                    </p>

                    <button
                      type="button"
                      aria-label="Delete mentor note"
                      onClick={() => removeNote(note.id)}
                      className="shrink-0 rounded-lg p-2 text-[#A5AAA9] hover:bg-[#47312E] hover:text-[#F1AEA6]"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={saveNote}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="mentor-roadmap-note"
                  className="mb-2 block text-xs font-medium text-[#D7D8D5]"
                >
                  New recommendation
                </label>

                <textarea
                  id="mentor-roadmap-note"
                  rows={4}
                  maxLength={1500}
                  value={draftNote}
                  onChange={(event) =>
                    setDraftNote(event.target.value)
                  }
                  placeholder="Describe an improvement, suggested resource, or next learning step..."
                  className="w-full resize-y rounded-xl border border-[#424648] bg-[#191B1D] p-4 text-sm leading-7 text-[#ECEBE8] outline-none focus:border-[#E88B42]"
                />
              </div>

              <button
                type="submit"
                disabled={
                  !notesLoaded || !draftNote.trim()
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check size={17} />
                Save demo note
              </button>

              <p className="text-xs leading-6 text-[#909893]">
                Notes are saved locally in this browser.
                They are not sent to the mentee or backend.
              </p>
            </form>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Mentor Roadmaps · Frontend demo
      </footer>
    </DashboardLayout>
  );
}
