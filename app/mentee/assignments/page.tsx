
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock3,
  ClipboardList,
  ExternalLink,
  FileCode2,
  Filter,
  GitBranch,
  Link2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type AssignmentStatus =
  | "pending"
  | "submitted"
  | "reviewed"
  | "completed";

type Assignment = {
  id: number;
  title: string;
  module: string;
  description: string;
  instructions: string[];
  status: AssignmentStatus;
  dueDate: string;
  mentor: string;
  estimatedHours: number;
  submissionUrl?: string;
  submissionNote?: string;
  feedback?: string;
  score?: number;
};

type FilterType = "all" | AssignmentStatus;

const initialAssignments: Assignment[] = [
  {
    id: 1,
    title: "Build a Responsive Portfolio",
    module: "HTML & CSS Foundations",
    description:
      "Create a responsive personal portfolio using semantic HTML and modern CSS.",
    instructions: [
      "Create a responsive homepage.",
      "Include About, Skills, Projects and Contact sections.",
      "Use semantic HTML and accessible navigation.",
      "Deploy your portfolio and submit its live URL.",
    ],
    status: "completed",
    dueDate: "2026-09-15",
    mentor: "Sarah Ahmed",
    estimatedHours: 8,
    submissionUrl: "https://github.com/example/portfolio",
    feedback:
      "Excellent layout and responsiveness. Good use of semantic HTML.",
    score: 95,
  },
  {
    id: 2,
    title: "JavaScript Task Manager",
    module: "JavaScript Fundamentals",
    description:
      "Build an interactive task manager using vanilla JavaScript.",
    instructions: [
      "Allow users to create and delete tasks.",
      "Implement task completion functionality.",
      "Store tasks using localStorage.",
      "Create a responsive and accessible interface.",
    ],
    status: "reviewed",
    dueDate: "2026-10-01",
    mentor: "Sarah Ahmed",
    estimatedHours: 6,
    submissionUrl: "https://github.com/example/task-manager",
    feedback:
      "Good functionality. Improve form validation and keyboard accessibility before final completion.",
    score: 82,
  },
  {
    id: 3,
    title: "Create a REST API",
    module: "Backend Development",
    description:
      "Design and build a RESTful API using Node.js and Express.",
    instructions: [
      "Initialize a Node.js and Express project.",
      "Create CRUD endpoints for a resource.",
      "Implement request validation and error handling.",
      "Write a README with setup and API instructions.",
      "Push the project to GitHub.",
    ],
    status: "pending",
    dueDate: "2026-10-15",
    mentor: "Sarah Ahmed",
    estimatedHours: 10,
  },
  {
    id: 4,
    title: "Database Integration",
    module: "Backend Development",
    description:
      "Connect a backend application to a relational database.",
    instructions: [
      "Set up a PostgreSQL database.",
      "Design at least two related tables.",
      "Connect the database to your API.",
      "Implement basic data validation.",
      "Document your database structure.",
    ],
    status: "pending",
    dueDate: "2026-10-22",
    mentor: "Sarah Ahmed",
    estimatedHours: 8,
  },
  {
    id: 5,
    title: "Authentication System",
    module: "Full Stack Development",
    description:
      "Build a secure login and registration workflow.",
    instructions: [
      "Create registration and login endpoints.",
      "Use password hashing.",
      "Implement authenticated routes.",
      "Handle invalid credentials safely.",
    ],
    status: "submitted",
    dueDate: "2026-10-06",
    mentor: "Sarah Ahmed",
    estimatedHours: 12,
    submissionUrl: "https://github.com/example/auth-system",
    submissionNote: "Completed the main authentication flow.",
  },
];

const statusConfig: Record<
  AssignmentStatus,
  { label: string; style: string }
> = {
  pending: {
    label: "Pending",
    style:
      "border-[#756047] bg-[#453323]/50 text-[#EDB477]",
  },
  submitted: {
    label: "Submitted",
    style:
      "border-[#4A6480] bg-[#26394D] text-[#A9CBEF]",
  },
  reviewed: {
    label: "Needs revision",
    style:
      "border-[#806047] bg-[#4A3526] text-[#F1BB88]",
  },
  completed: {
    label: "Completed",
    style:
      "border-[#466B52] bg-[#294033] text-[#A6D5B0]",
  },
};

function StatusBadge({
  status,
}: {
  status: AssignmentStatus;
}) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${config.style}`}
    >
      {config.label}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof BookOpen;
}) {
  return (
    <div className="rounded-2xl border border-[#343638] bg-[#232527] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-[#A5AAA9]">
          {label}
        </p>
        <div className="rounded-lg bg-[#E88B42]/10 p-2 text-[#E88B42]">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

export default function MenteeAssignmentsPage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState(
    initialAssignments
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    null
  );

  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [formError, setFormError] = useState("");

  const selectedAssignment = assignments.find(
    (assignment) => assignment.id === selectedId
  );

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesFilter =
        filter === "all" || assignment.status === filter;

      const matchesSearch =
        `${assignment.title} ${assignment.module} ${assignment.description}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [assignments, filter, search]);

  const stats = {
    total: assignments.length,
    pending: assignments.filter(
      (item) => item.status === "pending"
    ).length,
    submitted: assignments.filter(
      (item) => item.status === "submitted"
    ).length,
    completed: assignments.filter(
      (item) => item.status === "completed"
    ).length,
  };

  const completion =
    stats.total === 0
      ? 0
      : Math.round((stats.completed / stats.total) * 100);

  function openAssignment(assignment: Assignment) {
    setSelectedId(assignment.id);
    setSubmissionUrl(assignment.submissionUrl || "");
    setSubmissionNote(assignment.submissionNote || "");
    setFormError("");
  }

  function closeAssignment() {
    setSelectedId(null);
    setSubmissionUrl("");
    setSubmissionNote("");
    setFormError("");
  }

  function submitAssignment() {
    if (!selectedAssignment) return;

    const url = submissionUrl.trim();

    try {
      const parsed = new URL(url);

      if (
        parsed.protocol !== "https:" &&
        parsed.protocol !== "http:"
      ) {
        throw new Error("Invalid URL");
      }

      if (!parsed.hostname.includes(".")) {
        throw new Error("Invalid hostname");
      }
    } catch {
      setFormError(
        "Please enter a valid GitHub or project URL."
      );
      return;
    }

    setAssignments((previous) =>
      previous.map((assignment) =>
        assignment.id === selectedAssignment.id
          ? {
              ...assignment,
              status: "submitted",
              submissionUrl: url,
              submissionNote: submissionNote.trim(),
              feedback: undefined,
              score: undefined,
            }
          : assignment
      )
    );

    closeAssignment();
  }

  function handleNavigation(page: string) {
    const routes: Record<string, string> = {
      Overview: "/mentee",
      "My Roadmap": "/mentee/roadmap",
      Assignments: "/mentee/assignments",
      "My Mentor": "/mentee/mentor",
      "AI Companion": "/mentee/ai",
      Sessions: "/mentee/sessions",
    };

    if (routes[page]) {
      router.push(routes[page]);
    }
  }

  function handleRoleChange(role: DashboardRole) {
    router.push(`/${role}`);
  }

  return (
    <DashboardLayout
      role="mentee"
      activePage="Assignments"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <ClipboardList size={16} />
            Learning workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My Assignments
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Manage your learning tasks, submit projects,
            and follow feedback from your mentor.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#373A3C] bg-[#232527] px-4 py-3 text-xs text-[#C8C9C5]">
          <CalendarDays
            size={16}
            className="text-[#E88B42]"
          />
          Fall 2026 Cohort
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total assignments"
          value={stats.total}
          icon={BookOpen}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock3}
        />
        <StatCard
          label="Awaiting review"
          value={stats.submitted}
          icon={Send}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
        />
      </div>

      {/* PROGRESS */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#E8A774]">
                <Target size={16} />
                Assignment progress
              </div>

              <h2 className="mt-3 text-xl font-semibold">
                Keep moving forward.
              </h2>

              <p className="mt-2 text-sm text-[#C5B7AC]">
                {stats.completed} of {stats.total} assignments completed.
              </p>
            </div>

            <p className="text-3xl font-semibold text-[#F3A66F]">
              {completion}%
            </p>
          </div>

          <div
            role="progressbar"
            aria-label="Assignment completion"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#504239]"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C77737] to-[#F3A66F] transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </section>

      {/* ASSIGNMENT LIST */}
      <section className="rounded-2xl border border-[#343638] bg-[#232527] p-5 sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Your learning tasks
            </h2>

            <p className="mt-2 text-sm text-[#A5AAA9]">
              Select an assignment to view instructions
              and submission details.
            </p>
          </div>

          <span className="text-xs text-[#A5AAA9]">
            {filteredAssignments.length} assignments
          </span>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D9490]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search assignments..."
              aria-label="Search assignments"
              className="w-full rounded-xl border border-[#3B3E40] bg-[#191B1D] py-3 pl-11 pr-4 text-sm text-[#ECEBE8] outline-none transition focus:border-[#E88B42] focus-visible:ring-2 focus-visible:ring-[#E88B42]/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter
              size={17}
              className="text-[#A5AAA9]"
            />

            <select
              aria-label="Filter assignments"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as FilterType)
              }
              className="w-full rounded-xl border border-[#3B3E40] bg-[#191B1D] px-4 py-3 text-sm text-[#ECEBE8] outline-none focus:border-[#E88B42] md:w-auto"
            >
              <option value="all">All assignments</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Needs revision</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* CARDS */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredAssignments.map((assignment) => (
            <article
              key={assignment.id}
              className="flex flex-col rounded-2xl border border-[#3A3D3F] bg-[#292C2E] p-5 transition-colors hover:border-[#805439]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#E8A774]">
                  {assignment.module}
                </span>

                <StatusBadge
                  status={assignment.status}
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {assignment.title}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-6 text-[#A5AAA9]">
                {assignment.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-[#3D4042] pt-4 text-xs text-[#B4BAB6]">
                <span className="flex items-center gap-2">
                  <CalendarDays
                    size={15}
                    className="text-[#E88B42]"
                  />
                  {formatDate(assignment.dueDate)}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3
                    size={15}
                    className="text-[#E88B42]"
                  />
                  {assignment.estimatedHours} hours
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  openAssignment(assignment)
                }
                className="mt-5 inline-flex min-h-11 items-center justify-between rounded-xl border border-[#60452F] bg-[#382B22] px-4 py-3 text-sm font-medium text-[#F3A66F] transition hover:bg-[#493426]"
              >
                View assignment
                <ArrowRight size={17} />
              </button>
            </article>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen
              size={34}
              className="mx-auto text-[#8D9490]"
            />
            <h3 className="mt-4 font-medium">
              No assignments found
            </h3>
            <p className="mt-2 text-sm text-[#A5AAA9]">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </section>

      {/* ASSIGNMENT DETAILS MODAL */}
      {selectedAssignment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAssignment();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-dialog-title"
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#49423B] bg-[#232527] shadow-2xl"
          >
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#3B3E40] p-5 sm:p-6">
              <div>
                <p className="text-xs text-[#E8A774]">
                  {selectedAssignment.module}
                </p>

                <h2
                  id="assignment-dialog-title"
                  className="mt-2 text-xl font-semibold"
                >
                  {selectedAssignment.title}
                </h2>

                <div className="mt-3">
                  <StatusBadge
                    status={selectedAssignment.status}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={closeAssignment}
                aria-label="Close assignment details"
                className="shrink-0 rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-7 overflow-y-auto p-5 sm:p-6">
              {/* DESCRIPTION */}
              <section>
                <h3 className="text-sm font-semibold">
                  About this assignment
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#B6BDB8]">
                  {selectedAssignment.description}
                </p>
              </section>

              {/* INSTRUCTIONS */}
              <section>
                <h3 className="text-sm font-semibold">
                  Requirements
                </h3>

                <div className="mt-4 space-y-3">
                  {selectedAssignment.instructions.map(
                    (instruction, index) => (
                      <div
                        key={instruction}
                        className="flex items-start gap-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E88B42]/10 text-xs text-[#F3A66F]">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-6 text-[#B6BDB8]">
                          {instruction}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* DETAILS */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#3B3E40] bg-[#292C2E] p-4">
                  <p className="text-xs text-[#A5AAA9]">
                    Due date
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {formatDate(
                      selectedAssignment.dueDate
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-[#3B3E40] bg-[#292C2E] p-4">
                  <p className="text-xs text-[#A5AAA9]">
                    Assigned mentor
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {selectedAssignment.mentor}
                  </p>
                </div>
              </div>

              {/* EXISTING SUBMISSION */}
              {selectedAssignment.submissionUrl && (
                <section className="rounded-xl border border-[#3B3E40] bg-[#292C2E] p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <GitBranch
                      size={17}
                      className="text-[#E88B42]"
                    />
                    Submitted project
                  </h3>

                  <a
                    href={selectedAssignment.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 break-all text-sm text-[#F3A66F] hover:underline"
                  >
                    {selectedAssignment.submissionUrl}
                    <ExternalLink
                      size={15}
                      className="shrink-0"
                    />
                  </a>

                  {selectedAssignment.submissionNote && (
                    <p className="mt-3 text-sm leading-6 text-[#B6BDB8]">
                      {selectedAssignment.submissionNote}
                    </p>
                  )}
                </section>
              )}

              {/* MENTOR FEEDBACK */}
              {selectedAssignment.feedback && (
                <section className="rounded-xl border border-[#5E513F] bg-[#302B25] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <MessageSquare
                        size={17}
                        className="text-[#E88B42]"
                      />
                      Mentor feedback
                    </h3>

                    {selectedAssignment.score !== undefined && (
                      <span className="text-sm font-semibold text-[#F3A66F]">
                        {selectedAssignment.score}/100
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[#D0C6BC]">
                    {selectedAssignment.feedback}
                  </p>
                </section>
              )}

              {/* SUBMISSION FORM */}
              {(selectedAssignment.status === "pending" ||
                selectedAssignment.status === "reviewed") && (
                <section className="border-t border-[#3B3E40] pt-6">
                  <h3 className="text-base font-semibold">
                    {selectedAssignment.status === "reviewed"
                      ? "Resubmit assignment"
                      : "Submit your assignment"}
                  </h3>

                  <p className="mt-2 text-sm text-[#A5AAA9]">
                    Share your GitHub repository or
                    deployed project link.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label
                        htmlFor="submission-url"
                        className="mb-2 block text-xs font-medium text-[#D7D8D5]"
                      >
                        Project URL
                      </label>

                      <div className="relative">
                        <Link2
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D9490]"
                        />

                        <input
                          id="submission-url"
                          type="url"
                          value={submissionUrl}
                          onChange={(event) => {
                            setSubmissionUrl(
                              event.target.value
                            );
                            setFormError("");
                          }}
                          placeholder="https://github.com/..."
                          className="w-full rounded-xl border border-[#3B3E40] bg-[#191B1D] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E88B42]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="submission-note"
                        className="mb-2 block text-xs font-medium text-[#D7D8D5]"
                      >
                        Notes (optional)
                      </label>

                      <textarea
                        id="submission-note"
                        value={submissionNote}
                        onChange={(event) =>
                          setSubmissionNote(
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Describe your implementation..."
                        className="w-full resize-y rounded-xl border border-[#3B3E40] bg-[#191B1D] p-4 text-sm leading-6 outline-none focus:border-[#E88B42]"
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

                    <button
                      type="button"
                      onClick={submitAssignment}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F]"
                    >
                      <Send size={17} />
                      Submit assignment
                    </button>
                  </div>
                </section>
              )}

              {/* SUBMITTED STATE */}
              {selectedAssignment.status === "submitted" && (
                <div className="flex items-start gap-3 rounded-xl border border-[#4A6480] bg-[#26394D]/60 p-4">
                  <Clock3
                    size={19}
                    className="shrink-0 text-[#A9CBEF]"
                  />

                  <p className="text-sm leading-6 text-[#B5D0E8]">
                    Your assignment has been submitted
                    and is awaiting mentor review.
                  </p>
                </div>
              )}

              {selectedAssignment.status === "completed" && (
                <div className="flex items-start gap-3 rounded-xl border border-[#466B52] bg-[#294033]/60 p-4">
                  <CircleCheck
                    size={19}
                    className="shrink-0 text-[#A6D5B0]"
                  />

                  <p className="text-sm leading-6 text-[#B8D8BE]">
                    Assignment completed and approved
                    by your mentor.
                  </p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-[#3B3E40] p-4 sm:p-5">
              <button
                type="button"
                onClick={closeAssignment}
                className="rounded-lg border border-[#505456] px-5 py-2.5 text-sm text-[#D7D8D5] hover:bg-[#343638]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEMO NOTE */}
      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Assignment workspace · Demo data
      </footer>
    </DashboardLayout>
  );
}
