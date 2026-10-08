
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileCode2,
  GitBranch,
  MessageSquare,
  RotateCcw,
  Search,
  Send,
  Star,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type ReviewStatus = "pending" | "approved" | "revision";
type ReviewFilter = "all" | ReviewStatus;

type Submission = {
  id: number;
  mentee: string;
  initials: string;
  assignment: string;
  program: string;
  submitted: string;
  description: string;
  requirements: string[];
  projectUrl: string;
  note: string;
  status: ReviewStatus;
  score: number | null;
  feedback: string;
};

const STORAGE_KEY = "elevatex-mentor-reviews-v1";

const initialSubmissions: Submission[] = [
  {
    id: 1,
    mentee: "Alex Morgan",
    initials: "AM",
    assignment: "Authentication System",
    program: "Full Stack Development",
    submitted: "Oct 6, 2026",
    description:
      "Build a secure registration and login workflow using Node.js and Express.",
    requirements: [
      "Create registration and login endpoints",
      "Hash passwords before storage",
      "Protect routes using authentication",
      "Handle errors and invalid credentials",
      "Document setup instructions",
    ],
    projectUrl: "https://github.com/example/auth-system",
    note: "Implemented registration, login, and protected routes.",
    status: "pending",
    score: null,
    feedback: "",
  },
  {
    id: 2,
    mentee: "Daniel Kim",
    initials: "DK",
    assignment: "JavaScript Task Manager",
    program: "Full Stack Development",
    submitted: "Oct 5, 2026",
    description:
      "Create an interactive task management application with JavaScript.",
    requirements: [
      "Add and delete tasks",
      "Mark tasks as completed",
      "Persist tasks using localStorage",
      "Provide basic form validation",
      "Support smaller screens",
    ],
    projectUrl: "https://github.com/example/task-manager",
    note: "The main features are complete. I would appreciate feedback on validation.",
    status: "pending",
    score: null,
    feedback: "",
  },
  {
    id: 3,
    mentee: "James Wilson",
    initials: "JW",
    assignment: "Database Schema Design",
    program: "Backend Development",
    submitted: "Oct 3, 2026",
    description:
      "Design a relational database schema and document the relationships.",
    requirements: [
      "Create related database tables",
      "Define primary and foreign keys",
      "Document relationships",
      "Include SQL setup instructions",
    ],
    projectUrl: "https://github.com/example/database-schema",
    note: "Added the SQL schema and an entity relationship diagram.",
    status: "pending",
    score: null,
    feedback: "",
  },
  {
    id: 4,
    mentee: "Olivia Chen",
    initials: "OC",
    assignment: "React Component Library",
    program: "Frontend Engineering",
    submitted: "Sep 28, 2026",
    description:
      "Build reusable React interface components with accessibility in mind.",
    requirements: [
      "Create reusable components",
      "Define TypeScript prop types",
      "Add keyboard accessibility",
      "Document component usage",
    ],
    projectUrl: "https://github.com/example/component-library",
    note: "Components include buttons, dialogs, and form inputs.",
    status: "approved",
    score: 94,
    feedback:
      "Well-structured components and clear documentation. Great attention to accessibility.",
  },
  {
    id: 5,
    mentee: "Daniel Kim",
    initials: "DK",
    assignment: "Asynchronous JavaScript",
    program: "Full Stack Development",
    submitted: "Sep 24, 2026",
    description:
      "Use async/await and Fetch API to retrieve and display external data.",
    requirements: [
      "Use async/await correctly",
      "Handle loading and error states",
      "Display API data in the UI",
      "Avoid unhandled promise rejections",
    ],
    projectUrl: "https://github.com/example/async-js",
    note: "Added a data-fetching interface.",
    status: "revision",
    score: 66,
    feedback:
      "The basic request works, but please add error handling and a visible loading state.",
  },
];

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles = {
    pending:
      "border-[#805439] bg-[#453323] text-[#F3A66F]",
    approved:
      "border-[#466B52] bg-[#294033] text-[#A6D5B0]",
    revision:
      "border-[#73534A] bg-[#44302D] text-[#F1AEA6]",
  };

  const labels = {
    pending: "Pending review",
    approved: "Approved",
    revision: "Revision requested",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#745139] bg-[#493225] text-sm font-semibold text-[#F3A66F]">
      {initials}
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
        <p className="text-sm text-[#A5AAA9]">{label}</p>
        <div className="rounded-xl bg-[#E88B42]/10 p-2.5 text-[#E88B42]">
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function isSubmission(value: unknown): value is Submission {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "number" &&
    typeof item.mentee === "string" &&
    typeof item.initials === "string" &&
    typeof item.assignment === "string" &&
    typeof item.program === "string" &&
    typeof item.submitted === "string" &&
    typeof item.description === "string" &&
    Array.isArray(item.requirements) &&
    item.requirements.every(
      (requirement) => typeof requirement === "string"
    ) &&
    typeof item.projectUrl === "string" &&
    typeof item.note === "string" &&
    (item.status === "pending" ||
      item.status === "approved" ||
      item.status === "revision") &&
    (item.score === null ||
      (typeof item.score === "number" &&
        Number.isFinite(item.score) &&
        item.score >= 0 &&
        item.score <= 100)) &&
    typeof item.feedback === "string"
  );
}

export default function MentorReviewsPage() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>(
    initialSubmissions
  );
  const [loaded, setLoaded] = useState(false);

  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(
    null
  );
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  // Restore saved frontend-only reviews after mounting.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.every(isSubmission)
        ) {
          setSubmissions(parsed);
        }
      }
    } catch {
      // Continue with demo data if storage is unavailable.
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(submissions)
      );
    } catch {
      // Reviews remain usable without localStorage.
    }
  }, [submissions, loaded]);

  const selectedSubmission =
    submissions.find((item) => item.id === selectedId) ??
    null;

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return submissions.filter((item) => {
      const matchesFilter =
        filter === "all" || item.status === filter;

      const matchesSearch =
        !query ||
        [
          item.mentee,
          item.assignment,
          item.program,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [submissions, filter, search]);

  const pendingCount = submissions.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = submissions.filter(
    (item) => item.status === "approved"
  ).length;

  const revisionCount = submissions.filter(
    (item) => item.status === "revision"
  ).length;

  function openReview(item: Submission) {
    setSelectedId(item.id);
    setScore(item.score === null ? "" : String(item.score));
    setFeedback(item.feedback);
    setFormError("");
  }

  function closeReview() {
    setSelectedId(null);
    setScore("");
    setFeedback("");
    setFormError("");
  }

  function saveReview(status: "approved" | "revision") {
    if (!selectedSubmission) return;

    const parsedScore = Number(score);

    if (
      score.trim() === "" ||
      !Number.isInteger(parsedScore) ||
      parsedScore < 0 ||
      parsedScore > 100
    ) {
      setFormError(
        "Enter a whole-number score between 0 and 100."
      );
      return;
    }

    if (feedback.trim().length < 10) {
      setFormError(
        "Please provide at least 10 characters of actionable feedback."
      );
      return;
    }

    setSubmissions((previous) =>
      previous.map((item) =>
        item.id === selectedSubmission.id
          ? {
              ...item,
              status,
              score: parsedScore,
              feedback: feedback.trim(),
            }
          : item
      )
    );

    setNotice(
      status === "approved"
        ? "Assignment approved in the demo. No real mentee was notified."
        : "Revision requested in the demo. No real mentee was notified."
    );

    closeReview();
  }

  function resetDemoReviews() {
    setSubmissions(initialSubmissions);
    setFilter("pending");
    setSearch("");
    setNotice("Demo review data reset.");
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
      activePage="Reviews"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <ClipboardCheck size={16} />
            Mentor workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Assignment Reviews
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Review submitted work, recognize progress,
            and provide feedback your mentees can act on.
          </p>
        </div>

        <button
          type="button"
          onClick={resetDemoReviews}
          disabled={!loaded}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#454749] bg-[#292C2E] px-4 py-3 text-sm text-[#D7D8D5] transition hover:bg-[#35383A] disabled:opacity-50"
        >
          <RotateCcw size={16} />
          Reset demo
        </button>
      </div>

      {/* FEEDBACK NOTICE */}
      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-4 rounded-xl border border-[#466B52] bg-[#294033] p-4 text-sm text-[#B8DCC0]"
        >
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* METRICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total submissions"
          value={submissions.length}
          icon={BookOpen}
        />
        <StatCard
          label="Pending reviews"
          value={pendingCount}
          icon={Clock3}
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          icon={CheckCircle2}
        />
        <StatCard
          label="Revisions requested"
          value={revisionCount}
          icon={MessageSquare}
        />
      </div>

      {/* FOCUS CARD */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#E8A774]">
              Your review queue
            </p>
            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
              {pendingCount === 0
                ? "All caught up."
                : `${pendingCount} assignment${
                    pendingCount === 1 ? "" : "s"
                  } waiting for feedback.`}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#C5B7AC]">
              Clear, specific feedback helps learners
              understand what's working and what to improve.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFilter("pending");
              document
                .getElementById("review-list")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
          >
            View pending reviews
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* REVIEW LIST */}
      <section
        id="review-list"
        className="scroll-mt-24 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Submitted assignments
            </h2>
            <p className="mt-2 text-sm text-[#A5AAA9]">
              Select a submission to inspect its requirements
              and provide mentor feedback.
            </p>
          </div>

          <span className="text-xs text-[#A5AAA9]">
            {filteredSubmissions.length} results
          </span>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969D99]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search mentees or assignments..."
              aria-label="Search submissions"
              className="w-full rounded-xl border border-[#424648] bg-[#191B1D] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E88B42]"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as ReviewFilter)
            }
            aria-label="Filter review status"
            className="rounded-xl border border-[#424648] bg-[#191B1D] px-4 py-3 text-sm outline-none focus:border-[#E88B42]"
          >
            <option value="pending">Pending review</option>
            <option value="approved">Approved</option>
            <option value="revision">Revision requested</option>
            <option value="all">All submissions</option>
          </select>
        </div>

        {/* SUBMISSION CARDS */}
        <div className="mt-6 space-y-3">
          {!loaded ? (
            <p className="py-10 text-center text-sm text-[#A5AAA9]">
              Loading review queue...
            </p>
          ) : filteredSubmissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#454749] py-14 text-center">
              <CheckCircle2
                size={32}
                className="mx-auto text-[#A6D5B0]"
              />
              <h3 className="mt-4 font-semibold">
                No submissions found
              </h3>
              <p className="mt-2 text-sm text-[#A5AAA9]">
                Try another filter or search term.
              </p>
            </div>
          ) : (
            filteredSubmissions.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-[#3B3E40] bg-[#292C2E] p-5 transition hover:border-[#805439]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <Avatar initials={item.initials} />

                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">
                        {item.assignment}
                      </h3>

                      <p className="mt-2 text-sm text-[#B7BDB9]">
                        {item.mentee} · {item.program}
                      </p>

                      <p className="mt-2 text-xs text-[#969D99]">
                        Submitted {item.submitted}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={item.status} />

                    <button
                      type="button"
                      onClick={() => openReview(item)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#805439] bg-[#3C2E24] px-4 py-3 text-sm font-medium text-[#F3A66F] transition hover:bg-[#503827]"
                    >
                      {item.status === "pending"
                        ? "Review assignment"
                        : "View review"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {item.score !== null && (
                  <div className="mt-4 border-t border-[#3D4042] pt-4">
                    <span className="inline-flex items-center gap-2 text-xs text-[#BFC4C0]">
                      <Star size={15} className="text-[#E88B42]" />
                      Score: {item.score}/100
                    </span>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      {/* DETAILS AND REVIEW DIALOG */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReview();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#49423B] bg-[#232527] shadow-2xl"
          >
            {/* DIALOG HEADER */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#3B3E40] p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                  Assignment review
                </p>

                <h2
                  id="review-dialog-title"
                  className="mt-2 text-xl font-semibold"
                >
                  {selectedSubmission.assignment}
                </h2>

                <p className="mt-2 text-sm text-[#A5AAA9]">
                  {selectedSubmission.mentee} ·{" "}
                  {selectedSubmission.program}
                </p>

                <div className="mt-3">
                  <StatusBadge status={selectedSubmission.status} />
                </div>
              </div>

              <button
                type="button"
                onClick={closeReview}
                aria-label="Close review"
                className="shrink-0 rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={21} />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="space-y-7 overflow-y-auto p-5 sm:p-6">
              <section>
                <h3 className="text-sm font-semibold">
                  Assignment description
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#B7BDB9]">
                  {selectedSubmission.description}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold">
                  Assignment requirements
                </h3>

                <div className="mt-4 space-y-3">
                  {selectedSubmission.requirements.map(
                    (requirement, index) => (
                      <div
                        key={requirement}
                        className="flex items-start gap-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E88B42]/10 text-xs text-[#F3A66F]">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-6 text-[#B7BDB9]">
                          {requirement}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-[#3B3E40] bg-[#292C2E] p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <GitBranch size={18} className="text-[#E88B42]" />
                  Submitted project
                </h3>

                <a
                  href={selectedSubmission.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm text-[#F3A66F] hover:underline"
                >
                  {selectedSubmission.projectUrl}
                  <ExternalLink size={15} className="shrink-0" />
                </a>

                <p className="mt-4 text-sm leading-6 text-[#B7BDB9]">
                  {selectedSubmission.note}
                </p>

                <p className="mt-3 text-[11px] text-[#969D99]">
                  These repository links are placeholders for the demo.
                </p>
              </section>

              {/* REVIEW FORM */}
              <section className="border-t border-[#3B3E40] pt-6">
                <div className="flex items-center gap-2">
                  <MessageSquare
                    size={19}
                    className="text-[#E88B42]"
                  />
                  <h3 className="text-base font-semibold">
                    Mentor feedback
                  </h3>
                </div>

                <p className="mt-2 text-sm leading-6 text-[#A5AAA9]">
                  Provide a fair score and specific feedback.
                  Explain what the learner did well and what
                  they should improve.
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <label
                      htmlFor="review-score"
                      className="mb-2 block text-xs font-medium text-[#D7D8D5]"
                    >
                      Score (0–100)
                    </label>

                    <input
                      id="review-score"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={score}
                      onChange={(event) => {
                        setScore(event.target.value);
                        setFormError("");
                      }}
                      placeholder="Enter a score"
                      className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="review-feedback"
                      className="mb-2 block text-xs font-medium text-[#D7D8D5]"
                    >
                      Written feedback
                    </label>

                    <textarea
                      id="review-feedback"
                      rows={5}
                      maxLength={2000}
                      value={feedback}
                      onChange={(event) => {
                        setFeedback(event.target.value);
                        setFormError("");
                      }}
                      placeholder="Highlight strengths, explain improvements, and suggest next steps..."
                      className="w-full resize-y rounded-xl border border-[#424648] bg-[#191B1D] p-4 text-sm leading-7 outline-none focus:border-[#E88B42]"
                    />
                  </div>

                  {formError && (
                    <p
                      role="alert"
                      className="text-sm text-[#FFB6A4]"
                    >
                      {formError}
                    </p>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => saveReview("revision")}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#805439] bg-[#3C2E24] px-4 py-3 text-sm font-medium text-[#F3A66F] hover:bg-[#503827]"
                    >
                      <RotateCcw size={17} />
                      Request revision
                    </button>

                    <button
                      type="button"
                      onClick={() => saveReview("approved")}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-4 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
                    >
                      <CheckCircle2 size={17} />
                      Approve assignment
                    </button>
                  </div>

                  <p className="text-xs leading-5 text-[#969D99]">
                    Both actions update this browser's demo data
                    only. No messages or grades are sent to a learner.
                  </p>
                </div>
              </section>
            </div>

            {/* DIALOG FOOTER */}
            <div className="flex shrink-0 justify-end border-t border-[#3B3E40] p-4 sm:p-5">
              <button
                type="button"
                onClick={closeReview}
                className="rounded-lg border border-[#505456] px-5 py-2.5 text-sm hover:bg-[#343638]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Mentor Assignment Reviews · Demo data
      </footer>
    </DashboardLayout>
  );
}
