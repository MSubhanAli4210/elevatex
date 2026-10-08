
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  MessageSquare,
  Plus,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type Session = {
  id: string;
  title: string;
  menteeId: number;
  mentee: string;
  date: string;
  time: string;
  duration: number;
  agenda: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  isDemoBooking?: boolean;
};

type Filter = "upcoming" | "past" | "all";

type CalendarMonth = {
  year: number;
  month: number;
};

const STORAGE_KEY = "elevatex-mentor-sessions-v1";

const mentees = [
  { id: 1, name: "Alex Morgan", initials: "AM" },
  { id: 2, name: "Daniel Kim", initials: "DK" },
  { id: 3, name: "Olivia Chen", initials: "OC" },
  { id: 4, name: "James Wilson", initials: "JW" },
];

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(base: Date, days: number): string {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function formatDate(value: string): string {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  const hour = hours % 12 || 12;

  return `${hour}:${String(minutes).padStart(2, "0")} ${
    hours >= 12 ? "PM" : "AM"
  }`;
}

function timestamp(session: Session): number {
  return new Date(
    `${session.date}T${session.time}:00`
  ).getTime();
}

function createSeedSessions(today: Date): Session[] {
  return [
    {
      id: "mentor-demo-1",
      title: "Backend Architecture Review",
      menteeId: 1,
      mentee: "Alex Morgan",
      date: addDays(today, 3),
      time: "15:00",
      duration: 45,
      agenda:
        "Discuss REST API design, route organization, and request validation.",
      notes: "Ask Alex to prepare his API structure.",
      status: "scheduled",
    },
    {
      id: "mentor-demo-2",
      title: "Final Portfolio Feedback",
      menteeId: 3,
      mentee: "Olivia Chen",
      date: addDays(today, 5),
      time: "11:00",
      duration: 30,
      agenda:
        "Review portfolio responsiveness, accessibility, and project presentation.",
      notes: "Focus on the quality of project case studies.",
      status: "scheduled",
    },
    {
      id: "mentor-demo-3",
      title: "JavaScript Learning Check-in",
      menteeId: 2,
      mentee: "Daniel Kim",
      date: addDays(today, 8),
      time: "14:00",
      duration: 30,
      agenda:
        "Identify challenges with asynchronous JavaScript and error handling.",
      notes: "Prepare a simple async/await exercise.",
      status: "scheduled",
    },
    {
      id: "mentor-demo-4",
      title: "Database Schema Review",
      menteeId: 4,
      mentee: "James Wilson",
      date: addDays(today, -5),
      time: "10:00",
      duration: 45,
      agenda:
        "Discuss relational schema design, primary keys, and foreign keys.",
      notes: "Reviewed the schema and suggested improvements.",
      status: "completed",
    },
  ];
}

function isValidSession(value: unknown): value is Session {
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
    typeof item.title === "string" &&
    typeof item.menteeId === "number" &&
    typeof item.mentee === "string" &&
    typeof item.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
    typeof item.time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time) &&
    typeof item.duration === "number" &&
    typeof item.agenda === "string" &&
    typeof item.notes === "string" &&
    (item.status === "scheduled" ||
      item.status === "completed" ||
      item.status === "cancelled")
  );
}

function Avatar({ name }: { name: string }) {
  const person = mentees.find((item) => item.name === name);

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#745139] bg-[#493225] text-xs font-semibold text-[#F3A66F]">
      {person?.initials ?? "MX"}
    </div>
  );
}

function StatusBadge({
  status,
  past,
}: {
  status: Session["status"];
  past: boolean;
}) {
  const cancelled = status === "cancelled";
  const completed = status === "completed";

  const label = cancelled
    ? "Cancelled"
    : completed
      ? "Completed"
      : past
        ? "Past"
        : "Upcoming";

  const classes = cancelled
    ? "border-[#73534A] bg-[#44302D] text-[#F1AEA6]"
    : completed
      ? "border-[#466B52] bg-[#294033] text-[#A6D5B0]"
      : past
        ? "border-[#45494B] bg-[#343638] text-[#A5AAA9]"
        : "border-[#805439] bg-[#453323] text-[#F3A66F]";

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

export default function MentorSessionsPage() {
  const router = useRouter();

  const [initialized, setInitialized] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Stable values during Next.js prerendering.
  const [calendarMonth, setCalendarMonth] =
    useState<CalendarMonth>({
      year: 2000,
      month: 0,
    });

  const [todayKey, setTodayKey] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  const [filter, setFilter] = useState<Filter>("upcoming");
  const [search, setSearch] = useState("");

  const [selectedSessionId, setSelectedSessionId] =
    useState<string | null>(null);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMenteeId, setBookingMenteeId] = useState(1);
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("15:00");
  const [bookingDuration, setBookingDuration] = useState(30);
  const [bookingAgenda, setBookingAgenda] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [notice, setNotice] = useState("");

  // Only access current time and browser storage after mounting.
  useEffect(() => {
    const now = new Date();

    setTodayKey(dateKey(now));
    setSelectedDate(dateKey(now));
    setCurrentTimestamp(now.getTime());

    setCalendarMonth({
      year: now.getFullYear(),
      month: now.getMonth(),
    });

    let restored = createSeedSessions(now);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.every(isValidSession)
        ) {
          restored = parsed;
        }
      }
    } catch {
      // Continue with default demo sessions.
    }

    setSessions(restored);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sessions)
      );
    } catch {
      // Session changes still work for this visit.
    }
  }, [sessions, initialized]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.status === "scheduled" &&
          timestamp(session) >= currentTimestamp
      )
      .sort((a, b) => timestamp(a) - timestamp(b));
  }, [sessions, currentTimestamp]);

  const pastSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.status !== "scheduled" ||
          timestamp(session) < currentTimestamp
      )
      .sort((a, b) => timestamp(b) - timestamp(a));
  }, [sessions, currentTimestamp]);

  const filteredSessions = useMemo(() => {
    const source =
      filter === "upcoming"
        ? upcomingSessions
        : filter === "past"
          ? pastSessions
          : [...sessions].sort(
              (a, b) => timestamp(a) - timestamp(b)
            );

    const query = search.trim().toLowerCase();

    return source.filter((session) =>
      `${session.title} ${session.mentee}`
        .toLowerCase()
        .includes(query)
    );
  }, [
    sessions,
    filter,
    search,
    upcomingSessions,
    pastSessions,
  ]);

  const selectedSession =
    sessions.find(
      (session) => session.id === selectedSessionId
    ) ?? null;

  const selectedDateSessions = sessions
    .filter((session) => session.date === selectedDate)
    .sort((a, b) => timestamp(a) - timestamp(b));

  const completedCount = sessions.filter(
    (session) => session.status === "completed"
  ).length;

  const calendarDays = useMemo(() => {
    if (!initialized) return [];

    const firstDay = new Date(
      calendarMonth.year,
      calendarMonth.month,
      1
    );

    const daysInMonth = new Date(
      calendarMonth.year,
      calendarMonth.month + 1,
      0
    ).getDate();

    const cells: (number | null)[] = Array(
      firstDay.getDay()
    ).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return cells;
  }, [calendarMonth, initialized]);

  const monthLabel = initialized
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(
        new Date(
          calendarMonth.year,
          calendarMonth.month,
          1
        )
      )
    : "Loading calendar...";

  function changeMonth(offset: number) {
    setCalendarMonth((previous) => {
      const next = new Date(
        previous.year,
        previous.month + offset,
        1
      );

      return {
        year: next.getFullYear(),
        month: next.getMonth(),
      };
    });
  }

  function selectDay(day: number) {
    const value = dateKey(
      new Date(
        calendarMonth.year,
        calendarMonth.month,
        day
      )
    );

    setSelectedDate(value);
  }

  function openBooking(date?: string) {
    setBookingMenteeId(1);
    setBookingTitle("");
    setBookingDate(date || todayKey);
    setBookingTime("15:00");
    setBookingDuration(30);
    setBookingAgenda("");
    setBookingError("");
    setBookingOpen(true);
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mentee = mentees.find(
      (item) => item.id === bookingMenteeId
    );

    if (!mentee || !bookingTitle.trim() || !bookingDate) {
      setBookingError(
        "Choose a mentee, enter a topic, and select a date."
      );
      return;
    }

    const start = new Date(
      `${bookingDate}T${bookingTime}:00`
    );

    if (
      Number.isNaN(start.getTime()) ||
      start.getTime() <= Date.now()
    ) {
      setBookingError("Choose a future date and time.");
      return;
    }

    const end = start.getTime() + bookingDuration * 60_000;

    const conflict = sessions.some((session) => {
      if (
        session.status !== "scheduled" ||
        session.date !== bookingDate
      ) {
        return false;
      }

      const existingStart = timestamp(session);
      const existingEnd =
        existingStart + session.duration * 60_000;

      return (
        start.getTime() < existingEnd &&
        end > existingStart
      );
    });

    if (conflict) {
      setBookingError(
        "This time overlaps another scheduled demo session."
      );
      return;
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      title: bookingTitle.trim(),
      menteeId: mentee.id,
      mentee: mentee.name,
      date: bookingDate,
      time: bookingTime,
      duration: bookingDuration,
      agenda:
        bookingAgenda.trim() ||
        "Discuss progress and current learning goals.",
      notes: "",
      status: "scheduled",
      isDemoBooking: true,
    };

    setSessions((previous) => [
      ...previous,
      newSession,
    ]);

    setCurrentTimestamp(Date.now());
    setSelectedDate(bookingDate);
    setCalendarMonth({
      year: start.getFullYear(),
      month: start.getMonth(),
    });

    setFilter("upcoming");
    setSearch("");
    setBookingOpen(false);

    setNotice(
      "Session added to your demo schedule. No invitation was sent."
    );
  }

  function cancelSession(id: string) {
    setSessions((previous) =>
      previous.map((session) =>
        session.id === id
          ? { ...session, status: "cancelled" }
          : session
      )
    );

    setSelectedSessionId(null);
    setNotice(
      "Demo session cancelled. No real meeting was affected."
    );
  }

  function markCompleted(id: string) {
    setSessions((previous) =>
      previous.map((session) =>
        session.id === id
          ? { ...session, status: "completed" }
          : session
      )
    );

    setSelectedSessionId(null);
    setNotice("Session marked complete in this demo.");
  }

  function handleNavigation(page: string) {
    const routes: Record<string, string> = {
      Overview: "/mentor",
      "My Mentees": "/mentor/mentees",
      Reviews: "/mentor/reviews",
      Roadmaps: "/mentor/roadmaps",
      Sessions: "/mentor/sessions",
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
      role="mentor"
      activePage="Sessions"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <CalendarDays size={16} />
            Mentor workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Mentorship Sessions
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Plan mentorship meetings, review upcoming
            conversations, and track completed sessions
            with your mentees.
          </p>
        </div>

        <button
          type="button"
          disabled={!initialized}
          onClick={() => openBooking()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F] disabled:opacity-50"
        >
          <Plus size={18} />
          Schedule session
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

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Upcoming sessions",
            value: upcomingSessions.length,
            icon: CalendarDays,
          },
          {
            title: "Completed sessions",
            value: completedCount,
            icon: CheckCircle2,
          },
          {
            title: "Assigned mentees",
            value: mentees.length,
            icon: Users,
          },
        ].map(({ title, value, icon: Icon }) => (
          <div
            key={title}
            className="rounded-2xl border border-[#35383A] bg-[#232527] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#A5AAA9]">
                {title}
              </p>

              <div className="rounded-xl bg-[#E88B42]/10 p-2.5 text-[#E88B42]">
                <Icon size={19} />
              </div>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {initialized ? value : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
        {/* CALENDAR */}
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                Your schedule
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {monthLabel}
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!initialized}
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg border border-[#44484A] p-2 text-[#CFD1CC] hover:bg-[#343638] disabled:opacity-40"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                disabled={!initialized}
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg border border-[#44484A] p-2 text-[#CFD1CC] hover:bg-[#343638] disabled:opacity-40"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {!initialized ? (
            <div className="flex min-h-72 items-center justify-center text-sm text-[#A5AAA9]">
              Loading calendar...
            </div>
          ) : (
            <>
              <div className="mt-7 grid grid-cols-7 gap-1 sm:gap-2">
                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-[11px] font-medium text-[#969D99]"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        aria-hidden="true"
                      />
                    );
                  }

                  const value = dateKey(
                    new Date(
                      calendarMonth.year,
                      calendarMonth.month,
                      day
                    )
                  );

                  const daySessions = sessions.filter(
                    (session) => session.date === value
                  );

                  const selected = selectedDate === value;
                  const isToday = todayKey === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectDay(day)}
                      aria-label={`${formatDate(value)}, ${daySessions.length} sessions`}
                      aria-pressed={selected}
                      className={`flex aspect-square min-h-10 flex-col items-center justify-center gap-1 rounded-xl border text-sm transition-colors ${
                        selected
                          ? "border-[#E88B42] bg-[#4B3223] text-[#F3A66F]"
                          : isToday
                            ? "border-[#705039] bg-[#302A25] text-[#F3C49C]"
                            : "border-transparent text-[#D7D9D5] hover:border-[#494C4D] hover:bg-[#323436]"
                      }`}
                    >
                      {day}

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          daySessions.length > 0
                            ? "bg-[#E88B42]"
                            : "bg-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 border-t border-[#383B3D] pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    {formatDate(selectedDate)}
                  </h3>

                  <span className="text-xs text-[#A5AAA9]">
                    {selectedDateSessions.length} session(s)
                  </span>
                </div>

                {selectedDateSessions.length === 0 ? (
                  <p className="mt-4 text-sm text-[#A5AAA9]">
                    No sessions for this date.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selectedDateSessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() =>
                          setSelectedSessionId(session.id)
                        }
                        className="flex w-full items-center gap-3 rounded-xl border border-[#45413C] bg-[#302C29] p-4 text-left transition hover:border-[#E88B42]/60"
                      >
                        <Avatar name={session.mentee} />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {session.title}
                          </p>

                          <p className="mt-1 text-xs text-[#A5AAA9]">
                            {session.mentee} ·{" "}
                            {formatTime(session.time)}
                          </p>
                        </div>

                        <ChevronRight size={17} />
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => openBooking(selectedDate)}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
                >
                  <Plus size={17} />
                  Add demo session
                </button>
              </div>
            </>
          )}
        </section>

        {/* SESSION LIST */}
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#E88B42]">
              Mentorship activity
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Session management
            </h2>
          </div>

          <div className="relative mt-6">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969D99]"
            />

            <input
              type="search"
              aria-label="Search sessions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search mentee or session..."
              className="w-full rounded-xl border border-[#424648] bg-[#191B1D] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E88B42]"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["upcoming", "Upcoming"],
                ["past", "Past"],
                ["all", "All"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                  filter === value
                    ? "border-[#805439] bg-[#E88B42]/10 text-[#F3A66F]"
                    : "border-[#424648] text-[#A5AAA9] hover:bg-[#343638]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {!initialized ? (
              <p className="py-10 text-center text-sm text-[#A5AAA9]">
                Loading sessions...
              </p>
            ) : filteredSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#454749] py-12 text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto text-[#8E9691]"
                />

                <p className="mt-3 text-sm text-[#A5AAA9]">
                  No matching sessions.
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  type="button"
                  key={session.id}
                  onClick={() =>
                    setSelectedSessionId(session.id)
                  }
                  className="w-full rounded-xl border border-[#3D4042] bg-[#292C2E] p-4 text-left transition hover:border-[#805439]"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={session.mentee} />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {session.title}
                      </p>

                      <p className="mt-1 text-xs text-[#A5AAA9]">
                        {session.mentee}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <StatusBadge
                      status={session.status}
                      past={
                        timestamp(session) < currentTimestamp
                      }
                    />

                    <span className="text-xs text-[#B7BDB9]">
                      {formatDate(session.date)} ·{" "}
                      {formatTime(session.time)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#F3A66F]">
                    View details
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      {/* HELPFUL PROMPT */}
      <section className="rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] to-[#232527] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
            <MessageSquare size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Prepare for meaningful mentorship.
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#C5B7AC]">
              Review your mentees' assignments and
              roadmap progress before each session.
              Give specific feedback and agree on
              clear next steps.
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING MODAL */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setBookingOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#514538] bg-[#232527] p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="booking-title"
                className="text-xl font-semibold"
              >
                Schedule mentorship session
              </h2>

              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                aria-label="Close booking dialog"
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#A5AAA9]">
              Create a demo session in your local
              calendar. This does not notify the mentee.
            </p>

            <form
              onSubmit={submitBooking}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="booking-mentee"
                  className="mb-2 block text-sm font-medium"
                >
                  Mentee
                </label>

                <select
                  id="booking-mentee"
                  value={bookingMenteeId}
                  onChange={(event) =>
                    setBookingMenteeId(
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                >
                  {mentees.map((mentee) => (
                    <option key={mentee.id} value={mentee.id}>
                      {mentee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="booking-topic"
                  className="mb-2 block text-sm font-medium"
                >
                  Session topic
                </label>

                <input
                  id="booking-topic"
                  type="text"
                  required
                  maxLength={100}
                  value={bookingTitle}
                  onChange={(event) =>
                    setBookingTitle(event.target.value)
                  }
                  placeholder="e.g. REST API Review"
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="mb-2 block text-sm font-medium"
                  >
                    Date
                  </label>

                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={todayKey || undefined}
                    value={bookingDate}
                    onChange={(event) =>
                      setBookingDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-time"
                    className="mb-2 block text-sm font-medium"
                  >
                    Time
                  </label>

                  <select
                    id="booking-time"
                    value={bookingTime}
                    onChange={(event) =>
                      setBookingTime(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                  >
                    {[
                      "09:00",
                      "10:00",
                      "11:00",
                      "14:00",
                      "15:00",
                      "16:00",
                    ].map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-duration"
                  className="mb-2 block text-sm font-medium"
                >
                  Duration
                </label>

                <select
                  id="booking-duration"
                  value={bookingDuration}
                  onChange={(event) =>
                    setBookingDuration(
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm outline-none focus:border-[#E88B42]"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="booking-agenda"
                  className="mb-2 block text-sm font-medium"
                >
                  Agenda (optional)
                </label>

                <textarea
                  id="booking-agenda"
                  rows={3}
                  maxLength={1000}
                  value={bookingAgenda}
                  onChange={(event) =>
                    setBookingAgenda(event.target.value)
                  }
                  placeholder="What would you like to discuss?"
                  className="w-full resize-y rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm leading-6 outline-none focus:border-[#E88B42]"
                />
              </div>

              {bookingError && (
                <p
                  role="alert"
                  className="text-sm text-[#FFB6A4]"
                >
                  {bookingError}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
              >
                <Plus size={17} />
                Add demo session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SESSION DETAILS */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSessionId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-details-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#514538] bg-[#232527] p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                  Session details
                </p>

                <h2
                  id="session-details-title"
                  className="mt-2 text-xl font-semibold"
                >
                  {selectedSession.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSessionId(null)}
                aria-label="Close session details"
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <StatusBadge
                status={selectedSession.status}
                past={
                  timestamp(selectedSession) < currentTimestamp
                }
              />
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <p className="flex items-center gap-3">
                <GraduationCap
                  size={18}
                  className="text-[#E88B42]"
                />
                {selectedSession.mentee}
              </p>

              <p className="flex items-center gap-3">
                <CalendarDays
                  size={18}
                  className="text-[#E88B42]"
                />
                {formatDate(selectedSession.date)}
              </p>

              <p className="flex items-center gap-3">
                <Clock3
                  size={18}
                  className="text-[#E88B42]"
                />
                {formatTime(selectedSession.time)} ·{" "}
                {selectedSession.duration} minutes
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-[#3D4042] bg-[#292C2E] p-4">
              <h3 className="text-sm font-semibold">
                Session agenda
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#B7BDB9]">
                {selectedSession.agenda}
              </p>
            </div>

            {selectedSession.notes && (
              <div className="mt-4 rounded-xl border border-[#3D4042] bg-[#292C2E] p-4">
                <h3 className="text-sm font-semibold">
                  Preparation notes
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#B7BDB9]">
                  {selectedSession.notes}
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-[#514436] bg-[#362C24] p-4 text-xs leading-6 text-[#D7BB9D]">
              This is a local demo schedule. Real meeting
              links, notifications, and attendance tracking
              require backend integration.
            </div>

            {selectedSession.status === "scheduled" && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    markCompleted(selectedSession.id)
                  }
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#466B52] bg-[#294033] px-4 py-3 text-sm text-[#A6D5B0] hover:bg-[#34513E]"
                >
                  <CheckCircle2 size={17} />
                  Mark complete (demo)
                </button>

                {selectedSession.isDemoBooking && (
                  <button
                    type="button"
                    onClick={() =>
                      cancelSession(selectedSession.id)
                    }
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#784A44] bg-[#3B2B2A] px-4 py-3 text-sm text-[#F1AEA6] hover:bg-[#4A3330]"
                  >
                    Cancel demo session
                  </button>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSessionId(null)}
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
        ElevateX · Mentor Sessions · Frontend demonstration
      </footer>
    </DashboardLayout>
  );
}
