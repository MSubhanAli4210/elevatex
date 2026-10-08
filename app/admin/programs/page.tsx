
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Layers3,
  Pencil,
  Plus,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type ProgramStatus = "Active" | "Planning" | "Archived";
type StatusFilter = "All" | ProgramStatus;

type Program = {
  id: string;
  name: string;
  category: string;
  description: string;
  capacity: number;
  mentees: number;
  mentors: number;
  progress: number;
  durationWeeks: number;
  status: ProgramStatus;
};

type ProgramForm = {
  name: string;
  category: string;
  description: string;
  capacity: string;
  mentees: string;
  mentors: string;
  durationWeeks: string;
  status: ProgramStatus;
};

const STORAGE_KEY = "elevatex-admin-programs-v1";

const seedPrograms: Program[] = [
  {
    id: "program-fullstack",
    name: "Full Stack Development",
    category: "Web Engineering",
    description:
      "A comprehensive learning journey covering frontend development, backend systems, databases, APIs, and deployment.",
    capacity: 60,
    mentees: 48,
    mentors: 6,
    progress: 67,
    durationWeeks: 16,
    status: "Active",
  },
  {
    id: "program-frontend",
    name: "Frontend Engineering",
    category: "Web Engineering",
    description:
      "Learn modern HTML, CSS, JavaScript, TypeScript, React, accessibility, and user interface engineering.",
    capacity: 40,
    mentees: 32,
    mentors: 4,
    progress: 78,
    durationWeeks: 12,
    status: "Active",
  },
  {
    id: "program-backend",
    name: "Backend Development",
    category: "Software Engineering",
    description:
      "Develop backend engineering expertise through REST APIs, Node.js, PostgreSQL, authentication, and deployment.",
    capacity: 35,
    mentees: 26,
    mentors: 3,
    progress: 54,
    durationWeeks: 14,
    status: "Active",
  },
  {
    id: "program-ai",
    name: "AI & Machine Learning",
    category: "Artificial Intelligence",
    description:
      "A planned program exploring Python, machine learning fundamentals, model evaluation, and practical AI applications.",
    capacity: 30,
    mentees: 0,
    mentors: 0,
    progress: 0,
    durationWeeks: 16,
    status: "Planning",
  },
];

const emptyForm: ProgramForm = {
  name: "",
  category: "Web Engineering",
  description: "",
  capacity: "30",
  mentees: "0",
  mentors: "0",
  durationWeeks: "12",
  status: "Planning",
};

function isProgram(value: unknown): value is Program {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.description === "string" &&
    typeof item.capacity === "number" &&
    Number.isInteger(item.capacity) &&
    item.capacity >= 1 &&
    typeof item.mentees === "number" &&
    Number.isInteger(item.mentees) &&
    item.mentees >= 0 &&
    item.mentees <= item.capacity &&
    typeof item.mentors === "number" &&
    Number.isInteger(item.mentors) &&
    item.mentors >= 0 &&
    typeof item.progress === "number" &&
    item.progress >= 0 &&
    item.progress <= 100 &&
    typeof item.durationWeeks === "number" &&
    Number.isInteger(item.durationWeeks) &&
    item.durationWeeks >= 1 &&
    (item.status === "Active" ||
      item.status === "Planning" ||
      item.status === "Archived")
  );
}

function statusClasses(status: ProgramStatus) {
  if (status === "Active") {
    return "border-[#466B52] bg-[#294033] text-[#A6D5B0]";
  }

  if (status === "Planning") {
    return "border-[#805439] bg-[#453323] text-[#F3A66F]";
  }

  return "border-[#45494B] bg-[#343638] text-[#A5AAA9]";
}

function StatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${statusClasses(status)}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
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
        <p className="text-xs text-[#A5AAA9]">
          {label}
        </p>

        <p className="text-xs font-semibold text-[#F3A66F]">
          {value}%
        </p>
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
          className="h-full rounded-full bg-[#E88B42] transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminProgramsPage() {
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>(
    seedPrograms
  );
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProgramForm>(emptyForm);
  const [formError, setFormError] = useState("");

  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.every(isProgram)
        ) {
          setPrograms(parsed);
        }
      }
    } catch {
      // Keep seeded demo data if browser storage fails.
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(programs)
      );
    } catch {
      // Edits still work during this browser session.
    }
  }, [programs, loaded]);

  const selectedProgram =
    programs.find((program) => program.id === selectedId) ??
    null;

  const filteredPrograms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesSearch =
        !query ||
        [
          program.name,
          program.category,
          program.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        program.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [programs, search, statusFilter]);

  const activePrograms = programs.filter(
    (program) => program.status === "Active"
  );

  const totalMentees = activePrograms.reduce(
    (total, program) => total + program.mentees,
    0
  );

  const totalMentors = activePrograms.reduce(
    (total, program) => total + program.mentors,
    0
  );

  const totalCapacity = activePrograms.reduce(
    (total, program) => total + program.capacity,
    0
  );

  const enrollmentRate =
    totalCapacity > 0
      ? Math.round((totalMentees / totalCapacity) * 100)
      : 0;

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(program: Program) {
    setEditingId(program.id);

    setForm({
      name: program.name,
      category: program.category,
      description: program.description,
      capacity: String(program.capacity),
      mentees: String(program.mentees),
      mentors: String(program.mentors),
      durationWeeks: String(program.durationWeeks),
      status: program.status,
    });

    setSelectedId(null);
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  }

  function updateForm<K extends keyof ProgramForm>(
    key: K,
    value: ProgramForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setFormError("");
  }

  function saveProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();

    const capacity = Number(form.capacity);
    const mentees = Number(form.mentees);
    const mentors = Number(form.mentors);
    const durationWeeks = Number(form.durationWeeks);

    if (!name || !category || !description) {
      setFormError("Please complete all required text fields.");
      return;
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      !Number.isInteger(mentees) ||
      mentees < 0 ||
      !Number.isInteger(mentors) ||
      mentors < 0 ||
      !Number.isInteger(durationWeeks) ||
      durationWeeks < 1
    ) {
      setFormError(
        "Capacity and duration must be positive whole numbers. Mentees and mentors cannot be negative."
      );
      return;
    }

    if (mentees > capacity) {
      setFormError(
        "Enrolled mentees cannot exceed program capacity."
      );
      return;
    }

    const duplicate = programs.some(
      (program) =>
        program.id !== editingId &&
        program.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setFormError("A program with this name already exists.");
      return;
    }

    if (editingId) {
      setPrograms((previous) =>
        previous.map((program) =>
          program.id === editingId
            ? {
                ...program,
                name,
                category,
                description,
                capacity,
                mentees,
                mentors,
                durationWeeks,
                status: form.status,
              }
            : program
        )
      );

      setNotice("Demo program updated successfully.");
    } else {
      const newProgram: Program = {
        id: crypto.randomUUID(),
        name,
        category,
        description,
        capacity,
        mentees,
        mentors,
        durationWeeks,
        progress: 0,
        status: form.status,
      };

      setPrograms((previous) => [...previous, newProgram]);
      setNotice("New demo program created successfully.");
    }

    closeForm();
  }

  function changeProgramStatus(
    programId: string,
    status: ProgramStatus
  ) {
    setPrograms((previous) =>
      previous.map((program) =>
        program.id === programId
          ? { ...program, status }
          : program
      )
    );

    setNotice(`Program status updated to ${status}.`);
  }

  function handleNavigation(page: string) {
    const paths: Record<string, string> = {
      Overview: "/admin",
      Programs: "/admin/programs",
      Mentors: "/admin/mentors",
      Mentees: "/admin/mentees",
      Analytics: "/admin/analytics",
    };

    if (paths[page]) router.push(paths[page]);
  }

  function handleRoleChange(role: DashboardRole) {
    router.push(`/${role}`);
  }

  return (
    <DashboardLayout
      role="admin"
      activePage="Programs"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <Layers3 size={16} />
            Administration workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Programs Management
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Organize mentorship programs, monitor enrollment,
            and manage learning pathways across ElevateX.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={!loaded}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F] disabled:opacity-50"
        >
          <Plus size={18} />
          Create program
        </button>
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
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total programs"
          value={loaded ? programs.length : "—"}
          icon={Layers3}
        />

        <StatCard
          label="Active programs"
          value={loaded ? activePrograms.length : "—"}
          icon={CheckCircle2}
        />

        <StatCard
          label="Enrolled mentees"
          value={loaded ? totalMentees : "—"}
          icon={GraduationCap}
        />

        <StatCard
          label="Active mentors"
          value={loaded ? totalMentors : "—"}
          icon={Users}
        />
      </div>

      {/* ENROLLMENT HIGHLIGHT */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="w-full max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#E8A774]">
              <Target size={16} />
              Enrollment overview
            </p>

            <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
              {totalMentees} mentees across active programs.
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#C5B7AC]">
              Keep track of enrollment capacity and maintain
              a balanced learning environment across programs.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#C7B9AD]">
                  Enrollment capacity
                </span>
                <span className="font-semibold text-[#F3A66F]">
                  {totalMentees}/{totalCapacity}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label="Program enrollment capacity"
                aria-valuenow={enrollmentRate}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2.5 overflow-hidden rounded-full bg-[#514036]"
              >
                <div
                  className="h-full rounded-full bg-[#E88B42] transition-all"
                  style={{ width: `${enrollmentRate}%` }}
                />
              </div>
            </div>
          </div>

          <span className="rounded-xl border border-[#805439] bg-[#E88B42]/10 px-4 py-3 text-lg font-semibold text-[#F3A66F]">
            {enrollmentRate}%
          </span>
        </div>
      </section>

      {/* PROGRAM DIRECTORY */}
      <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Program directory
            </h2>
            <p className="mt-2 text-sm text-[#A5AAA9]">
              Browse programs and update their details.
            </p>
          </div>

          <span className="text-xs text-[#A5AAA9]">
            {filteredPrograms.length} results
          </span>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969D99]"
            />

            <input
              type="search"
              aria-label="Search programs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by program or category..."
              className="w-full rounded-xl border border-[#424648] bg-[#191B1D] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E88B42]"
            />
          </div>

          <select
            aria-label="Filter program status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="rounded-xl border border-[#424648] bg-[#191B1D] px-4 py-3 text-sm outline-none focus:border-[#E88B42]"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* PROGRAM CARDS */}
        {!loaded ? (
          <p className="py-12 text-center text-sm text-[#A5AAA9]">
            Loading programs...
          </p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {filteredPrograms.map((program) => {
              const capacityPercent = Math.round(
                (program.mentees / program.capacity) * 100
              );

              return (
                <article
                  key={program.id}
                  className="flex flex-col rounded-2xl border border-[#3B3E40] bg-[#292C2E] p-5 transition hover:border-[#805439]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#E8A774]">
                        {program.category}
                      </p>

                      <h3 className="mt-2 text-lg font-semibold">
                        {program.name}
                      </h3>
                    </div>

                    <StatusBadge status={program.status} />
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-7 text-[#A5AAA9]">
                    {program.description}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Mentees",
                        value: program.mentees,
                      },
                      {
                        label: "Mentors",
                        value: program.mentors,
                      },
                      {
                        label: "Weeks",
                        value: program.durationWeeks,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-[#3D4042] bg-[#232527] p-3"
                      >
                        <p className="text-[11px] text-[#A5AAA9]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-4">
                    <ProgressBar
                      value={capacityPercent}
                      label="Enrollment capacity"
                    />
                    <ProgressBar
                      value={program.progress}
                      label="Sample learning progress"
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-[#3D4042] pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedId(program.id)
                      }
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#60452F] bg-[#382B22] px-4 py-3 text-sm font-medium text-[#F3A66F] hover:bg-[#493426]"
                    >
                      View details
                      <ChevronRight size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(program)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#505456] px-4 py-3 text-sm text-[#D7D8D5] hover:bg-[#35383A]"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {loaded && filteredPrograms.length === 0 && (
          <div className="py-14 text-center">
            <BookOpen
              size={32}
              className="mx-auto text-[#858C88]"
            />
            <h3 className="mt-4 font-semibold">
              No programs found
            </h3>
            <p className="mt-2 text-sm text-[#A5AAA9]">
              Try another search or filter.
            </p>
          </div>
        )}
      </section>

      {/* PROGRAM DETAILS DIALOG */}
      {selectedProgram && (
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
            aria-labelledby="program-details-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#49423B] bg-[#232527] p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                  Program details
                </p>
                <h2
                  id="program-details-title"
                  className="mt-2 text-xl font-semibold"
                >
                  {selectedProgram.name}
                </h2>
                <p className="mt-2 text-xs text-[#A5AAA9]">
                  {selectedProgram.category}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close program details"
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <StatusBadge status={selectedProgram.status} />
            </div>

            <p className="mt-5 text-sm leading-7 text-[#B7BDB9]">
              {selectedProgram.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Enrolled mentees",
                  value: selectedProgram.mentees,
                },
                {
                  label: "Mentors",
                  value: selectedProgram.mentors,
                },
                {
                  label: "Capacity",
                  value: selectedProgram.capacity,
                },
                {
                  label: "Duration",
                  value: `${selectedProgram.durationWeeks} weeks`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#3D4042] bg-[#292C2E] p-4"
                >
                  <p className="text-xs text-[#A5AAA9]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <ProgressBar
                value={selectedProgram.progress}
                label="Sample learning progress"
              />
            </div>

            <div className="mt-7 border-t border-[#3D4042] pt-5">
              <label
                htmlFor="program-status"
                className="mb-2 block text-sm font-semibold"
              >
                Change program status
              </label>

              <select
                id="program-status"
                value={selectedProgram.status}
                onChange={(event) =>
                  changeProgramStatus(
                    selectedProgram.id,
                    event.target.value as ProgramStatus
                  )
                }
                className="w-full rounded-xl border border-[#424648] bg-[#191B1D] px-4 py-3 text-sm outline-none focus:border-[#E88B42]"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="Archived">Archived</option>
              </select>

              <p className="mt-3 text-xs leading-6 text-[#A5AAA9]">
                Status changes affect this admin demo only.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => openEdit(selectedProgram)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
              >
                <Pencil size={16} />
                Edit program
              </button>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-xl border border-[#505456] px-5 py-3 text-sm hover:bg-[#343638]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM DIALOG */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="program-form-title"
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#49423B] bg-[#232527]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#3D4042] p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                  Program management
                </p>
                <h2
                  id="program-form-title"
                  className="mt-2 text-xl font-semibold"
                >
                  {editingId
                    ? "Edit program"
                    : "Create new program"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close program form"
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveProgram}
              className="min-h-0 overflow-y-auto p-5 sm:p-6"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="program-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Program name
                  </label>
                  <input
                    id="program-name"
                    type="text"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(event) =>
                      updateForm("name", event.target.value)
                    }
                    placeholder="e.g. Cloud Engineering"
                    className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="program-category"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                  </label>
                  <select
                    id="program-category"
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value)
                    }
                    className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                  >
                    <option value="Web Engineering">
                      Web Engineering
                    </option>
                    <option value="Software Engineering">
                      Software Engineering
                    </option>
                    <option value="Artificial Intelligence">
                      Artificial Intelligence
                    </option>
                    <option value="Data Engineering">
                      Data Engineering
                    </option>
                    <option value="Cloud Engineering">
                      Cloud Engineering
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="program-description"
                    className="mb-2 block text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="program-description"
                    required
                    rows={4}
                    maxLength={1000}
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Describe the learning objectives..."
                    className="w-full resize-y rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm leading-6 outline-none focus:border-[#E88B42]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "capacity",
                      label: "Capacity",
                      min: 1,
                    },
                    {
                      key: "durationWeeks",
                      label: "Duration (weeks)",
                      min: 1,
                    },
                    {
                      key: "mentees",
                      label: "Enrolled mentees",
                      min: 0,
                    },
                    {
                      key: "mentors",
                      label: "Assigned mentors",
                      min: 0,
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={`program-${field.key}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        {field.label}
                      </label>
                      <input
                        id={`program-${field.key}`}
                        type="number"
                        min={field.min}
                        step={1}
                        required
                        value={
                          form[field.key as keyof Pick<
                            ProgramForm,
                            | "capacity"
                            | "durationWeeks"
                            | "mentees"
                            | "mentors"
                          >]
                        }
                        onChange={(event) =>
                          updateForm(
                            field.key as
                              | "capacity"
                              | "durationWeeks"
                              | "mentees"
                              | "mentors",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="program-form-status"
                    className="mb-2 block text-sm font-medium"
                  >
                    Program status
                  </label>

                  <select
                    id="program-form-status"
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value as ProgramStatus
                      )
                    }
                    className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="text-sm text-[#FFB6A4]"
                  >
                    {formError}
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-3 border-t border-[#3D4042] pt-5">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="min-h-11 rounded-xl border border-[#505456] px-5 py-3 text-sm hover:bg-[#343638]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
                  >
                    <CheckCircle2 size={17} />
                    {editingId
                      ? "Save changes"
                      : "Create program"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Admin Programs Management · Demo data
      </footer>
    </DashboardLayout>
  );
}
