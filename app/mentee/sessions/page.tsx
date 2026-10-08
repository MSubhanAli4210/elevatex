
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
  Plus,
  Video,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type SessionStatus = "scheduled" | "completed";
type SessionFilter = "upcoming" | "completed" | "all";

type Session = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  mentor: string;
  description: string;
  status: SessionStatus;
  isDemoBooking?: boolean;
};

type CalendarMonth = {
  year: number;
  month: number;
};

const STORAGE_KEY = "elevatex-mentee-sessions-v1";

const surface =
  "rounded-2xl border border-[#35383A] bg-[#232527]";

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F] disabled:cursor-not-allowed disabled:opacity-50";

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(baseDate: Date, days: number): string {
  const date = new Date(baseDate);
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

function sessionTimestamp(session: Session): number {
  return new Date(
    `${session.date}T${session.time}:00`
  ).getTime();
}

function createDemoSessions(today: Date): Session[] {
  return [
    {
      id: "demo-backend-review",
      title: "Backend Architecture Review",
      date: addDays(today, 3),
      time: "15:00",
      duration: 45,
      mentor: "Sarah Ahmed",
      description:
        "Review REST API architecture, Express routing, validation, and error handling.",
      status: "scheduled",
    },
    {
      id: "demo-fullstack-planning",
      title: "Full Stack Project Planning",
      date: addDays(today, 8),
      time: "11:00",
      duration: 60,
      mentor: "Sarah Ahmed",
      description:
        "Plan project requirements, database structure, and development milestones.",
      status: "scheduled",
    },
    {
      id: "demo-javascript-review",
      title: "JavaScript Progress Review",
      date: addDays(today, -7),
      time: "14:00",
      duration: 30,
      mentor: "Sarah Ahmed",
      description:
        "Reviewed JavaScript fundamentals, DOM manipulation, and project progress.",
      status: "completed",
    },
  ];
}

function isSession(value: unknown): value is Session {
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
    typeof item.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
    typeof item.time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time) &&
    typeof item.duration === "number" &&
    typeof item.mentor === "string" &&
    typeof item.description === "string" &&
    (item.status === "scheduled" ||
      item.status === "completed") &&
    (item.isDemoBooking === undefined ||
      typeof item.isDemoBooking === "boolean")
  );
}

function StatusLabel({
  past,
}: {
  past: boolean;
}) {
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${
        past
          ? "border-[#466B52] bg-[#294033] text-[#A6D5B0]"
          : "border-[#805439] bg-[#453323] text-[#F3A66F]"
      }`}
    >
      {past ? "Past" : "Upcoming"}
    </span>
  );
}

export default function MenteeSessionsPage() {
  const router = useRouter();

  // All initial state is deterministic for Next.js prerendering.
  const [initialized, setInitialized] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] =
    useState<SessionFilter>("upcoming");

  const [calendarMonth, setCalendarMonth] =
    useState<CalendarMonth>({
      year: 2000,
      month: 0,
    });

  const [today, setToday] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentTimestamp, setCurrentTimestamp] =
    useState(0);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("15:00");
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [selectedSession, setSelectedSession] =
    useState<Session | null>(null);

  const [notice, setNotice] = useState("");

  // Browser-only initialization.
  // The current date is NEVER read during initial render.
  useEffect(() => {
    const now = new Date();
    const todayValue = dateKey(now);

    setToday(todayValue);
    setSelectedDate(todayValue);
    setCurrentTimestamp(now.getTime());

    setCalendarMonth({
      year: now.getFullYear(),
      month: now.getMonth(),
    });

    let restoredSessions = createDemoSessions(now);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (
          Array.isArray(parsed) &&
          parsed.every(isSession)
        ) {
          restoredSessions = parsed;
        }
      }
    } catch {
      // Fall back to seeded demo sessions.
    }

    setSessions(restoredSessions);
    setInitialized(true);
  }, []);

  // Save after initialization so the initial empty state
  // never overwrites previously saved sessions.
  useEffect(() => {
    if (!initialized) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sessions)
      );
    } catch {
      // The page can still be used without localStorage.
    }
  }, [initialized, sessions]);

  const upcomingSessions = useMemo(() => {
    if (!initialized) return [];

    return sessions
      .filter(
        (session) =>
          session.status === "scheduled" &&
          sessionTimestamp(session) >= currentTimestamp
      )
      .sort(
        (a, b) =>
          sessionTimestamp(a) - sessionTimestamp(b)
      );
  }, [sessions, initialized, currentTimestamp]);

  const pastSessions = useMemo(() => {
    if (!initialized) return [];

    return sessions
      .filter(
        (session) =>
          session.status === "completed" ||
          sessionTimestamp(session) < currentTimestamp
      )
      .sort(
        (a, b) =>
          sessionTimestamp(b) - sessionTimestamp(a)
      );
  }, [sessions, initialized, currentTimestamp]);

  const displayedSessions = useMemo(() => {
    if (filter === "upcoming") return upcomingSessions;
    if (filter === "completed") return pastSessions;

    return [...sessions].sort(
      (a, b) =>
        sessionTimestamp(a) - sessionTimestamp(b)
    );
  }, [
    filter,
    upcomingSessions,
    pastSessions,
    sessions,
  ]);

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
  }, [initialized, calendarMonth]);

  const monthLabel = useMemo(() => {
    if (!initialized) return "Loading calendar...";

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(
      new Date(
        calendarMonth.year,
        calendarMonth.month,
        1
      )
    );
  }, [calendarMonth, initialized]);

  const selectedDaySessions = useMemo(() => {
    return sessions
      .filter(
        (session) => session.date === selectedDate
      )
      .sort(
        (a, b) =>
          sessionTimestamp(a) - sessionTimestamp(b)
      );
  }, [sessions, selectedDate]);

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

  function selectCalendarDay(day: number) {
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
    setBookingDate(date || today);
    setBookingTime("15:00");
    setBookingTopic("");
    setBookingError("");
    setBookingOpen(true);
  }

  function closeBooking() {
    setBookingOpen(false);
    setBookingError("");
  }

  function submitBooking(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const title = bookingTopic.trim();

    if (!title || !bookingDate) {
      setBookingError(
        "Please enter a session topic and date."
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
      setBookingError(
        "Please select a future date and time."
      );
      return;
    }

    const duplicate = sessions.some(
      (session) =>
        session.date === bookingDate &&
        session.time === bookingTime &&
        session.status === "scheduled"
    );

    if (duplicate) {
      setBookingError(
        "A demo session already exists at this time."
      );
      return;
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      title,
      date: bookingDate,
      time: bookingTime,
      duration: 30,
      mentor: "Sarah Ahmed",
      description:
        "Demo mentorship session requested by the mentee. No actual invitation or confirmation has been sent.",
      status: "scheduled",
      isDemoBooking: true,
    };

    setSessions((previous) => [
      ...previous,
      newSession,
    ]);

    setCurrentTimestamp(Date.now());

    setCalendarMonth({
      year: start.getFullYear(),
      month: start.getMonth(),
    });

    setSelectedDate(bookingDate);
    setFilter("upcoming");
    setBookingOpen(false);

    setNotice(
      "Demo session added successfully. No real booking has been made."
    );
  }

  function removeDemoSession(id: string) {
    setSessions((previous) =>
      previous.filter(
        (session) => session.id !== id
      )
    );

    setSelectedSession(null);

    setNotice(
      "The demo session has been removed."
    );
  }

  function handleNavigation(page: string) {
    const paths: Record<string, string> = {
      Overview: "/mentee",
      "My Roadmap": "/mentee/roadmap",
      Assignments: "/mentee/assignments",
      "My Mentor": "/mentee/mentor",
      "AI Companion": "/mentee/ai",
      Sessions: "/mentee/sessions",
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
      role="mentee"
      activePage="Sessions"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <CalendarDays size={16} />
            Mentorship schedule
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My Sessions
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Manage your upcoming sessions, review past
            mentorship discussions, and stay on track
            with your learning schedule.
          </p>
        </div>

        <button
          type="button"
          disabled={!initialized}
          onClick={() => openBooking()}
          className={primaryButton}
        >
          <Plus size={18} />
          Schedule session
        </button>
      </div>

      {/* STATUS MESSAGE */}
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

      {/* OVERVIEW STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Upcoming sessions",
            value: initialized
              ? String(upcomingSessions.length)
              : "—",
            icon: CalendarDays,
          },
          {
            label: "Past sessions",
            value: initialized
              ? String(pastSessions.length)
              : "—",
            icon: CheckCircle2,
          },
          {
            label: "Assigned mentor",
            value: "Sarah Ahmed",
            icon: GraduationCap,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className={`${surface} p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-[#A5AAA9]">
                {label}
              </p>

              <div className="rounded-lg bg-[#E88B42]/10 p-2 text-[#E88B42]">
                <Icon size={19} />
              </div>
            </div>

            <p className="mt-5 text-xl font-semibold sm:text-2xl">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        {/* CALENDAR */}
        <section className={`${surface} p-5 sm:p-7`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#E88B42]">
                Your calendar
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
                className="rounded-lg border border-[#44484A] p-2 text-[#CFD1CC] transition hover:bg-[#343638] disabled:opacity-40"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                disabled={!initialized}
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg border border-[#44484A] p-2 text-[#CFD1CC] transition hover:bg-[#343638] disabled:opacity-40"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {!initialized ? (
            <div className="flex min-h-80 items-center justify-center text-sm text-[#A5AAA9]">
              Preparing your calendar...
            </div>
          ) : (
            <>
              {/* WEEKDAY HEADINGS */}
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

                {/* CALENDAR DAYS */}
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

                  const hasSession = sessions.some(
                    (session) => session.date === value
                  );

                  const isSelected =
                    selectedDate === value;

                  const isToday = today === value;

                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() =>
                        selectCalendarDay(day)
                      }
                      aria-label={`${formatDate(value)}${
                        hasSession
                          ? ", has mentorship sessions"
                          : ""
                      }`}
                      aria-pressed={isSelected}
                      className={`flex aspect-square min-h-10 flex-col items-center justify-center gap-1 rounded-xl border text-sm transition-colors ${
                        isSelected
                          ? "border-[#E88B42] bg-[#4B3223] text-[#F3A66F]"
                          : isToday
                            ? "border-[#705039] bg-[#302A25] text-[#F3C49C]"
                            : "border-transparent text-[#D7D9D5] hover:border-[#494C4D] hover:bg-[#323436]"
                      }`}
                    >
                      {day}

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          hasSession
                            ? "bg-[#E88B42]"
                            : "bg-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* SELECTED DATE */}
              <div className="mt-7 border-t border-[#383B3D] pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    {formatDate(selectedDate)}
                  </h3>

                  <span className="text-xs text-[#A5AAA9]">
                    {selectedDaySessions.length} session(s)
                  </span>
                </div>

                {selectedDaySessions.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {selectedDaySessions.map(
                      (session) => (
                        <button
                          type="button"
                          key={session.id}
                          onClick={() =>
                            setSelectedSession(session)
                          }
                          className="flex w-full items-center gap-3 rounded-xl border border-[#45413C] bg-[#302C29] p-4 text-left transition hover:border-[#E88B42]/60"
                        >
                          <CalendarDays
                            size={18}
                            className="shrink-0 text-[#E88B42]"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {session.title}
                            </p>

                            <p className="mt-1 text-xs text-[#A5AAA9]">
                              {formatTime(session.time)}
                            </p>
                          </div>

                          <ArrowRight size={17} />
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#A5AAA9]">
                    No mentorship sessions for this day.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    openBooking(selectedDate)
                  }
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
                >
                  <Plus size={17} />
                  Add demo session
                </button>
              </div>
            </>
          )}
        </section>

        {/* SESSION HISTORY */}
        <section className={`${surface} p-5 sm:p-7`}>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#E88B42]">
              Mentorship activity
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Session history
            </h2>
          </div>

          {/* FILTER BUTTONS */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(
              [
                ["upcoming", "Upcoming"],
                ["completed", "Past"],
                ["all", "All"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                  filter === value
                    ? "border-[#805439] bg-[#E88B42]/10 text-[#F3A66F]"
                    : "border-[#424648] text-[#A5AAA9] hover:bg-[#343638]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SESSION CARDS */}
          <div className="mt-6 space-y-3">
            {!initialized ? (
              <p className="text-sm text-[#A5AAA9]">
                Loading sessions...
              </p>
            ) : displayedSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#454749] px-4 py-12 text-center">
                <CalendarDays
                  size={29}
                  className="mx-auto text-[#8C9290]"
                />

                <p className="mt-3 text-sm text-[#A5AAA9]">
                  No sessions in this category.
                </p>
              </div>
            ) : (
              displayedSessions.map((session) => {
                const isPast =
                  session.status === "completed" ||
                  sessionTimestamp(session) <
                    currentTimestamp;

                return (
                  <button
                    type="button"
                    key={session.id}
                    onClick={() =>
                      setSelectedSession(session)
                    }
                    className="w-full rounded-xl border border-[#3D4042] bg-[#292C2E] p-4 text-left transition hover:border-[#805439]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {session.title}
                        </p>

                        <p className="mt-2 text-xs text-[#A5AAA9]">
                          {session.mentor}
                        </p>
                      </div>

                      <StatusLabel past={isPast} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#B9BDB9]">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays
                          size={14}
                          className="text-[#E88B42]"
                        />
                        {formatDate(session.date)}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3
                          size={14}
                          className="text-[#E88B42]"
                        />
                        {formatTime(session.time)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#F3A66F]">
                      View details
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* GUIDANCE */}
      <section className="rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] to-[#232527] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#E88B42]/10 p-3">
            <Video
              size={23}
              className="text-[#E88B42]"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Make every mentorship session count.
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#C5B7AC]">
              Prepare your questions, review your
              assignments, and identify challenges
              before meeting with your mentor.
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING MODAL */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeBooking();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#514538] bg-[#232527] p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="booking-title"
                className="text-xl font-semibold"
              >
                Schedule a session
              </h2>

              <button
                type="button"
                onClick={closeBooking}
                aria-label="Close booking dialog"
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#A5AAA9]">
              Add a practice session to your calendar.
              This does not check mentor availability
              or send an actual booking request.
            </p>

            <form
              onSubmit={submitBooking}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="session-topic"
                  className="mb-2 block text-sm font-medium"
                >
                  Session topic
                </label>

                <input
                  id="session-topic"
                  type="text"
                  required
                  maxLength={100}
                  value={bookingTopic}
                  onChange={(event) => {
                    setBookingTopic(event.target.value);
                    setBookingError("");
                  }}
                  placeholder="e.g. Review my REST API"
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm text-[#ECEBE8] outline-none focus:border-[#E88B42]"
                />
              </div>

              <div>
                <label
                  htmlFor="session-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Date
                </label>

                <input
                  id="session-date"
                  type="date"
                  required
                  min={today || undefined}
                  value={bookingDate}
                  onChange={(event) => {
                    setBookingDate(event.target.value);
                    setBookingError("");
                  }}
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm text-[#ECEBE8] outline-none focus:border-[#E88B42]"
                />
              </div>

              <div>
                <label
                  htmlFor="session-time"
                  className="mb-2 block text-sm font-medium"
                >
                  Preferred time
                </label>

                <select
                  id="session-time"
                  value={bookingTime}
                  onChange={(event) => {
                    setBookingTime(event.target.value);
                    setBookingError("");
                  }}
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm text-[#ECEBE8] outline-none focus:border-[#E88B42]"
                >
                  {[
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
                className={`w-full ${primaryButton}`}
              >
                <Plus size={17} />
                Add demo session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SESSION DETAILS MODAL */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSession(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-details-title"
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#514538] bg-[#232527] p-6"
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
                onClick={() =>
                  setSelectedSession(null)
                }
                aria-label="Close session details"
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <GraduationCap
                  size={18}
                  className="text-[#E88B42]"
                />

                <span>
                  {selectedSession.mentor}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays
                  size={18}
                  className="text-[#E88B42]"
                />

                <span>
                  {formatDate(selectedSession.date)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock3
                  size={18}
                  className="text-[#E88B42]"
                />

                <span>
                  {formatTime(selectedSession.time)} ·{" "}
                  {selectedSession.duration} minutes
                </span>
              </div>

              <p className="leading-7 text-[#B7BDB9]">
                {selectedSession.description}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-[#514436] bg-[#362C24] p-4 text-xs leading-6 text-[#D7BB9D]">
              Video meeting links and confirmed
              availability will be available after
              backend integration.
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {selectedSession.isDemoBooking && (
                <button
                  type="button"
                  onClick={() =>
                    removeDemoSession(
                      selectedSession.id
                    )
                  }
                  className="min-h-10 rounded-lg border border-[#784A44] px-4 py-2.5 text-sm text-[#F1AEA6] transition hover:bg-[#3B2B2A]"
                >
                  Remove demo session
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedSession(null)
                }
                className="min-h-10 rounded-lg border border-[#505456] px-5 py-2.5 text-sm transition hover:bg-[#343638]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Mentorship Sessions · Frontend demonstration
      </footer>
    </DashboardLayout>
  );
}
