
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type MentorStatus = "Active" | "On leave" | "Inactive";
type StatusFilter = "All" | MentorStatus;

type Mentor = {
  id: string;
  name: string;
  title: string;
  expertise: string;
  program: string;
  mentees: number;
  capacity: number;
  experience: number;
  status: MentorStatus;
  bio: string;
};

type MentorForm = {
  name: string;
  title: string;
  expertise: string;
  program: string;
  mentees: string;
  capacity: string;
  experience: string;
  status: MentorStatus;
  bio: string;
};

const STORAGE_KEY = "elevatex-admin-mentors-v1";

const programOptions = [
  "Full Stack Development",
  "Frontend Engineering",
  "Backend Development",
  "AI & Machine Learning",
];

const initialMentors: Mentor[] = [
  {
    id: "mentor-sarah",
    name: "Sarah Ahmed",
    title: "Senior Full Stack Engineer",
    expertise: "React, Node.js, TypeScript",
    program: "Full Stack Development",
    mentees: 4,
    capacity: 6,
    experience: 7,
    status: "Active",
    bio: "Sarah mentors full-stack developers and focuses on practical engineering skills, maintainable architecture, and project delivery.",
  },
  {
    id: "mentor-michael",
    name: "Michael Roberts",
    title: "Lead Frontend Engineer",
    expertise: "React, Accessibility, UI Engineering",
    program: "Frontend Engineering",
    mentees: 5,
    capacity: 7,
    experience: 9,
    status: "Active",
    bio: "Michael helps frontend developers build accessible, performant, and maintainable applications.",
  },
  {
    id: "mentor-priya",
    name: "Priya Sharma",
    title: "Backend Architect",
    expertise: "Node.js, PostgreSQL, APIs",
    program: "Backend Development",
    mentees: 3,
    capacity: 5,
    experience: 8,
    status: "Active",
    bio: "Priya specializes in backend architecture, database modeling, and reliable API development.",
  },
  {
    id: "mentor-david",
    name: "David Lee",
    title: "Software Engineering Mentor",
    expertise: "JavaScript, Testing, System Design",
    program: "Full Stack Development",
    mentees: 6,
    capacity: 6,
    experience: 6,
    status: "Active",
    bio: "David supports emerging engineers through structured problem-solving and hands-on coding exercises.",
  },
  {
    id: "mentor-emily",
    name: "Emily Carter",
    title: "Frontend Technical Lead",
    expertise: "TypeScript, React, Design Systems",
    program: "Frontend Engineering",
    mentees: 0,
    capacity: 5,
    experience: 5,
    status: "On leave",
    bio: "Emily focuses on reusable frontend components, TypeScript practices, and scalable design systems.",
  },
];

const emptyForm: MentorForm = {
  name: "",
  title: "",
  expertise: "",
  program: programOptions[0],
  mentees: "0",
  capacity: "5",
  experience: "1",
  status: "Active",
  bio: "",
};

function isMentor(value: unknown): value is Mentor {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.title === "string" &&
    typeof item.expertise === "string" &&
    typeof item.program === "string" &&
    typeof item.bio === "string" &&
    typeof item.mentees === "number" &&
    Number.isInteger(item.mentees) &&
    item.mentees >= 0 &&
    typeof item.capacity === "number" &&
    Number.isInteger(item.capacity) &&
    item.capacity >= 1 &&
    item.mentees <= item.capacity &&
    typeof item.experience === "number" &&
    Number.isInteger(item.experience) &&
    item.experience >= 0 &&
    (item.status === "Active" ||
      item.status === "On leave" ||
      item.status === "Inactive")
  );
}

function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-[#745139] bg-[#493225] font-semibold text-[#F3A66F] ${
        large ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm"
      }`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: MentorStatus }) {
  const classes =
    status === "Active"
      ? "border-[#466B52] bg-[#294033] text-[#A6D5B0]"
      : status === "On leave"
        ? "border-[#805439] bg-[#453323] text-[#F3A66F]"
        : "border-[#484C4D] bg-[#343638] text-[#A5AAA9]";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${classes}`}
    >
      {status}
    </span>
  );
}

function WorkloadBar({
  mentees,
  capacity,
}: {
  mentees: number;
  capacity: number;
}) {
  const percentage = Math.round((mentees / capacity) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-[#A5AAA9]">Mentor workload</span>
        <span className="font-semibold text-[#F3A66F]">
          {mentees}/{capacity} mentees
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Mentor workload"
        aria-valuenow={mentees}
        aria-valuemin={0}
        aria-valuemax={capacity}
        className="h-2 overflow-hidden rounded-full bg-[#404345]"
      >
        <div
          className={`h-full rounded-full ${
            percentage >= 100 ? "bg-[#C78573]" : "bg-[#E88B42]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminMentorsPage() {
  const router = useRouter();

  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [programFilter, setProgramFilter] = useState("All");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MentorForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.every(isMentor)) {
          setMentors(parsed);
        }
      }
    } catch {
      // Keep the initial demo records if storage is unavailable.
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mentors));
    } catch {
      // Changes remain available until the page is refreshed.
    }
  }, [mentors, loaded]);

  const filteredMentors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mentors.filter((mentor) => {
      const matchesSearch =
        !query ||
        [
          mentor.name,
          mentor.title,
          mentor.expertise,
          mentor.program,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || mentor.status === statusFilter;

      const matchesProgram =
        programFilter === "All" || mentor.program === programFilter;

      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [mentors, search, statusFilter, programFilter]);

  const selectedMentor =
    mentors.find((mentor) => mentor.id === selectedId) ?? null;

  const activeMentors = mentors.filter(
    (mentor) => mentor.status === "Active"
  );

  const assignedMentees = activeMentors.reduce(
    (total, mentor) => total + mentor.mentees,
    0
  );

  const availableSlots = activeMentors.reduce(
    (total, mentor) => total + mentor.capacity - mentor.mentees,
    0
  );

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(mentor: Mentor) {
    setEditingId(mentor.id);
    setSelectedId(null);
    setForm({
      name: mentor.name,
      title: mentor.title,
      expertise: mentor.expertise,
      program: mentor.program,
      mentees: String(mentor.mentees),
      capacity: String(mentor.capacity),
      experience: String(mentor.experience),
      status: mentor.status,
      bio: mentor.bio,
    });
    setFormError("");
    setFormOpen(true);
  }

  function updateForm<K extends keyof MentorForm>(
    key: K,
    value: MentorForm[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormError("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  }

  function saveMentor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const title = form.title.trim();
    const expertise = form.expertise.trim();
    const bio = form.bio.trim();

    const menteeCount = Number(form.mentees);
    const capacity = Number(form.capacity);
    const experience = Number(form.experience);

    if (!name || !title || !expertise || !bio) {
      setFormError("Please complete all required text fields.");
      return;
    }

    if (
      !Number.isInteger(menteeCount) ||
      menteeCount < 0 ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      !Number.isInteger(experience) ||
      experience < 0
    ) {
      setFormError("Enter valid whole numbers for workload and experience.");
      return;
    }

    if (menteeCount > capacity) {
      setFormError("Assigned mentees cannot exceed mentor capacity.");
      return;
    }

    const duplicate = mentors.some(
      (mentor) =>
        mentor.id !== editingId &&
        mentor.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setFormError("A demo mentor with this name already exists.");
      return;
    }

    if (editingId) {
      setMentors((previous) =>
        previous.map((mentor) =>
          mentor.id === editingId
            ? {
                ...mentor,
                name,
                title,
                expertise,
                program: form.program,
                mentees: menteeCount,
                capacity,
                experience,
                status: form.status,
                bio,
              }
            : mentor
        )
      );
      setNotice("Mentor profile updated in this demo.");
    } else {
      const newMentor: Mentor = {
        id: crypto.randomUUID(),
        name,
        title,
        expertise,
        program: form.program,
        mentees: menteeCount,
        capacity,
        experience,
        status: form.status,
        bio,
      };

      setMentors((previous) => [...previous, newMentor]);
      setNotice("New demo mentor added successfully.");
    }

    closeForm();
  }

  function changeStatus(id: string, status: MentorStatus) {
    setMentors((previous) =>
      previous.map((mentor) =>
        mentor.id === id ? { ...mentor, status } : mentor
      )
    );

    setNotice(`Mentor status changed to ${status} in this demo.`);
  }

  function handleNavigation(page: string) {
    const routes: Record<string, string> = {
      Overview: "/admin",
      Programs: "/admin/programs",
      Mentors: "/admin/mentors",
      Mentees: "/admin/mentees",
      Analytics: "/admin/analytics",
    };

    if (routes[page]) router.push(routes[page]);
  }

  function handleRoleChange(role: DashboardRole) {
    router.push(`/${role}`);
  }

  return (
    <DashboardLayout
      role="admin"
      activePage="Mentors"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <ShieldCheck size={16} />
            Administration workspace
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Mentor Management
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Manage mentor profiles, review expertise,
            monitor workloads, and organize program assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={!loaded}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F] disabled:opacity-50"
        >
          <Plus size={18} />
          Add mentor
        </button>
      </div>

      {/* NOTICE */}
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

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total mentors",
            value: mentors.length,
            icon: Users,
          },
          {
            label: "Active mentors",
            value: activeMentors.length,
            icon: CheckCircle2,
          },
          {
            label: "Assigned mentees",
            value: assignedMentees,
            icon: GraduationCap,
          },
          {
            label: "Available slots",
            value: availableSlots,
            icon: Target,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#35383A] bg-[#232527] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#A5AAA9]">{label}</p>
              <span className="rounded-xl bg-[#E88B42]/10 p-2.5 text-[#E88B42]">
                <Icon size={19} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold">
              {loaded ? value : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* HIGHLIGHT */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#292522] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-[#E88B42]/10 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#E8A774]">
            <Award size={16} />
            Mentorship operations
          </p>
          <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
            Balance workloads. Improve learner support.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#C5B7AC]">
            Review mentor capacity before assigning additional
            learners. Mentors at full capacity may need
            workload adjustments or additional support.
          </p>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Mentor directory</h2>
            <p className="mt-2 text-sm text-[#A5AAA9]">
              Search profiles and review mentor assignments.
            </p>
          </div>
          <span className="text-xs text-[#A5AAA9]">
            {filteredMentors.length} results
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_210px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969D99]"
            />
            <input
              type="search"
              aria-label="Search mentors"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search names, skills, or programs..."
              className="w-full rounded-xl border border-[#424648] bg-[#191B1D] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E88B42]"
            />
          </div>

          <select
            aria-label="Filter mentor status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="min-w-0 rounded-xl border border-[#424648] bg-[#191B1D] px-3 py-3 text-sm outline-none focus:border-[#E88B42]"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="On leave">On leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            aria-label="Filter mentor program"
            value={programFilter}
            onChange={(event) => setProgramFilter(event.target.value)}
            className="min-w-0 rounded-xl border border-[#424648] bg-[#191B1D] px-3 py-3 text-sm outline-none focus:border-[#E88B42]"
          >
            <option value="All">All programs</option>
            {programOptions.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>

        {!loaded ? (
          <p className="py-12 text-center text-sm text-[#A5AAA9]">
            Loading mentors...
          </p>
        ) : filteredMentors.length === 0 ? (
          <div className="py-14 text-center">
            <Users size={30} className="mx-auto text-[#858C88]" />
            <p className="mt-4 font-medium">No mentors found</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setProgramFilter("All");
              }}
              className="mt-3 text-sm text-[#F3A66F] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {filteredMentors.map((mentor) => (
              <article
                key={mentor.id}
                className="flex flex-col rounded-2xl border border-[#3B3E40] bg-[#292C2E] p-5 transition hover:border-[#805439]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={mentor.name} />
                    <div className="min-w-0">
                      <h3 className="font-semibold">{mentor.name}</h3>
                      <p className="mt-1 text-xs text-[#A5AAA9]">
                        {mentor.title}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={mentor.status} />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <BookOpen
                      size={17}
                      className="mt-0.5 shrink-0 text-[#E88B42]"
                    />
                    <div>
                      <p className="text-xs text-[#A5AAA9]">
                        Assigned program
                      </p>
                      <p className="mt-1">{mentor.program}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Award
                      size={17}
                      className="mt-0.5 shrink-0 text-[#E88B42]"
                    />
                    <div>
                      <p className="text-xs text-[#A5AAA9]">
                        Expertise
                      </p>
                      <p className="mt-1">{mentor.expertise}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#3D4042] bg-[#232527] p-4">
                  <WorkloadBar
                    mentees={mentor.mentees}
                    capacity={mentor.capacity}
                  />
                </div>

                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => setSelectedId(mentor.id)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#60452F] bg-[#382B22] px-4 py-3 text-sm font-medium text-[#F3A66F] hover:bg-[#493426]"
                  >
                    View profile
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(mentor)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#505456] px-4 py-3 text-sm hover:bg-[#35383A]"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* PROFILE DIALOG */}
      {selectedMentor && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentor-profile-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#49423B] bg-[#232527] p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar name={selectedMentor.name} large />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                    Mentor profile
                  </p>
                  <h2
                    id="mentor-profile-title"
                    className="mt-2 text-xl font-semibold"
                  >
                    {selectedMentor.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#A5AAA9]">
                    {selectedMentor.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close profile"
                onClick={() => setSelectedId(null)}
                className="shrink-0 rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6">
              <StatusBadge status={selectedMentor.status} />
            </div>

            <p className="mt-5 text-sm leading-7 text-[#B7BDB9]">
              {selectedMentor.bio}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#3D4042] bg-[#292C2E] p-4">
                <p className="text-xs text-[#A5AAA9]">Experience</p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedMentor.experience} years
                </p>
              </div>
              <div className="rounded-xl border border-[#3D4042] bg-[#292C2E] p-4">
                <p className="text-xs text-[#A5AAA9]">
                  Available slots
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {Math.max(
                    0,
                    selectedMentor.capacity - selectedMentor.mentees
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-[#A5AAA9]">
                  Assigned program
                </p>
                <p className="mt-2 text-sm font-medium">
                  {selectedMentor.program}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#A5AAA9]">
                  Expertise
                </p>
                <p className="mt-2 text-sm font-medium">
                  {selectedMentor.expertise}
                </p>
              </div>
              <WorkloadBar
                mentees={selectedMentor.mentees}
                capacity={selectedMentor.capacity}
              />
            </div>

            <div className="mt-7 border-t border-[#3D4042] pt-5">
              <label
                htmlFor="mentor-profile-status"
                className="mb-2 block text-sm font-medium"
              >
                Update mentor status
              </label>
              <select
                id="mentor-profile-status"
                value={selectedMentor.status}
                onChange={(event) =>
                  changeStatus(
                    selectedMentor.id,
                    event.target.value as MentorStatus
                  )
                }
                className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
              >
                <option value="Active">Active</option>
                <option value="On leave">On leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => openEdit(selectedMentor)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
              >
                <Pencil size={16} />
                Edit mentor
              </button>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="min-h-11 rounded-xl border border-[#505456] px-4 py-3 text-sm hover:bg-[#343638]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentor-form-title"
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#49423B] bg-[#232527]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#3D4042] p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                  Mentor administration
                </p>
                <h2
                  id="mentor-form-title"
                  className="mt-2 text-xl font-semibold"
                >
                  {editingId ? "Edit mentor" : "Add new mentor"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close mentor form"
                onClick={closeForm}
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveMentor}
              className="min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6"
            >
              {(
                [
                  ["name", "Full name", "e.g. Jordan Smith"],
                  ["title", "Professional title", "e.g. Senior Developer"],
                  ["expertise", "Expertise", "e.g. React, Node.js, Testing"],
                ] as const
              ).map(([field, label, placeholder]) => (
                <div key={field}>
                  <label
                    htmlFor={`mentor-${field}`}
                    className="mb-2 block text-sm font-medium"
                  >
                    {label}
                  </label>
                  <input
                    id={`mentor-${field}`}
                    type="text"
                    required
                    maxLength={120}
                    value={form[field]}
                    onChange={(event) =>
                      updateForm(field, event.target.value)
                    }
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="mentor-program"
                  className="mb-2 block text-sm font-medium"
                >
                  Assigned program
                </label>
                <select
                  id="mentor-program"
                  value={form.program}
                  onChange={(event) =>
                    updateForm("program", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                >
                  {programOptions.includes(form.program) ? null : (
                    <option value={form.program}>{form.program}</option>
                  )}
                  {programOptions.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["mentees", "Assigned mentees", 0],
                    ["capacity", "Max capacity", 1],
                    ["experience", "Experience (years)", 0],
                  ] as const
                ).map(([field, label, minimum]) => (
                  <div key={field}>
                    <label
                      htmlFor={`mentor-${field}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      {label}
                    </label>
                    <input
                      id={`mentor-${field}`}
                      type="number"
                      required
                      min={minimum}
                      step={1}
                      value={form[field]}
                      onChange={(event) =>
                        updateForm(field, event.target.value)
                      }
                      className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label
                  htmlFor="mentor-form-status"
                  className="mb-2 block text-sm font-medium"
                >
                  Status
                </label>
                <select
                  id="mentor-form-status"
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value as MentorStatus
                    )
                  }
                  className="w-full rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                >
                  <option value="Active">Active</option>
                  <option value="On leave">On leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="mentor-bio"
                  className="mb-2 block text-sm font-medium"
                >
                  Mentor biography
                </label>
                <textarea
                  id="mentor-bio"
                  rows={4}
                  maxLength={1200}
                  required
                  value={form.bio}
                  onChange={(event) =>
                    updateForm("bio", event.target.value)
                  }
                  placeholder="Describe this mentor's experience and approach..."
                  className="w-full resize-y rounded-xl border border-[#424648] bg-[#191B1D] p-3 text-sm leading-6 outline-none focus:border-[#E88B42]"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm text-[#FFB6A4]">
                  {formError}
                </p>
              )}

              <p className="text-xs leading-6 text-[#A5AAA9]">
                Updating a program or workload here changes
                only this demo record. It does not create
                real assignments or user accounts.
              </p>

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
                  {editingId ? "Save changes" : "Add mentor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Admin Mentor Management · Demo data
      </footer>
    </DashboardLayout>
  );
}
