
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  MessageCircle,
  Send,
  Sparkles,
  Target,
  Users,
  Video,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type Message = {
  id: number;
  sender: "mentor" | "mentee";
  text: string;
  time: string;
};

type Session = {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  status: "upcoming" | "completed";
};

const expertise = [
  "React & Next.js",
  "Node.js",
  "System Design",
  "REST APIs",
  "Career Guidance",
];

const goals = [
  {
    title: "Master frontend fundamentals",
    progress: 100,
  },
  {
    title: "Build production-ready APIs",
    progress: 65,
  },
  {
    title: "Complete a full-stack project",
    progress: 25,
  },
];

const initialSessions: Session[] = [
  {
    id: 1,
    title: "Backend Architecture Review",
    date: "2026-10-15",
    time: "3:00 PM",
    duration: "45 minutes",
    status: "upcoming",
  },
  {
    id: 2,
    title: "JavaScript Progress Review",
    date: "2026-10-03",
    time: "4:00 PM",
    duration: "30 minutes",
    status: "completed",
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "mentor",
    text: "Hi Alex! Great work on your JavaScript assignment. Your fundamentals are improving.",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "mentee",
    text: "Thank you! I'm currently working on the REST API milestone.",
    time: "10:35 AM",
  },
  {
    id: 3,
    sender: "mentor",
    text: "Excellent. Focus on route structure and error handling. We can discuss your approach in our next session.",
    time: "10:38 AM",
  },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#ECEBE8]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function MyMentorPage() {
  const router = useRouter();

  const [messages, setMessages] =
    useState<Message[]>(initialMessages);
  const [messageText, setMessageText] = useState("");
  const [sessions, setSessions] =
    useState<Session[]>(initialSessions);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("15:00");
  const [bookingError, setBookingError] = useState("");
  const [confirmation, setConfirmation] = useState("");

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

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = messageText.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "mentee",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ]);

    setMessageText("");
  }

  function bookSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bookingDate || !bookingTime) {
      setBookingError("Please select a date and time.");
      return;
    }

    const sessionDate = new Date(
      `${bookingDate}T${bookingTime}:00`
    );

    if (
      Number.isNaN(sessionDate.getTime()) ||
      sessionDate <= new Date()
    ) {
      setBookingError("Please select a future date and time.");
      return;
    }

    const formattedTime = new Intl.DateTimeFormat(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(sessionDate);

    setSessions((current) => [
      ...current,
      {
        id: Date.now(),
        title: "Mentorship Check-in",
        date: bookingDate,
        time: formattedTime,
        duration: "30 minutes",
        status: "upcoming",
      },
    ]);

    setBookingOpen(false);
    setBookingDate("");
    setBookingError("");
    setConfirmation(
      "Demo session added. Your mentor has not been notified."
    );
  }

  const upcomingSessions = sessions
    .filter((session) => session.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <DashboardLayout
      role="mentee"
      activePage="My Mentor"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE INTRODUCTION */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
          <Users size={16} />
          Personal mentorship
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          My Mentor
          <span className="text-[#E88B42]">.</span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
          Learn from experience, receive guidance, and
          build meaningful progress toward your goals.
        </p>
      </div>

      {/* MENTOR HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#35261E] via-[#262525] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-[#A66B42]/40 bg-[#4B3225] text-3xl font-semibold text-[#F3A66F]">
              SA
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#805439] bg-[#E88B42]/10 px-3 py-1 text-xs text-[#F3A66F]">
                <CheckCircle2 size={13} />
                Assigned mentor
              </span>

              <h2 className="mt-3 text-2xl font-semibold text-[#F2EEE9]">
                Sarah Ahmed
              </h2>

              <p className="mt-2 text-sm text-[#C5B7AC]">
                Senior Full Stack Engineer
              </p>

              <p className="mt-2 text-xs text-[#B9A89A]">
                Web Development Mentorship Program
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBookingOpen(true);
              setConfirmation("");
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F]"
          >
            <CalendarDays size={17} />
            Book demo session
          </button>
        </div>
      </section>

      {confirmation && (
        <div
          role="status"
          className="rounded-xl border border-[#42664F] bg-[#263B2E] p-4 text-sm text-[#B2DCBB]"
        >
          {confirmation}
        </div>
      )}

      {/* MENTOR DETAILS */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <Panel title="About your mentor">
            <p className="text-sm leading-8 text-[#B7BDB9]">
              Sarah is a full stack engineer passionate about
              helping emerging developers grow their practical
              engineering skills. Her mentorship focuses on
              problem-solving, clean architecture, and
              building real-world projects.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Award,
                  value: "7+ years",
                  label: "Experience",
                },
                {
                  icon: Users,
                  value: "24",
                  label: "Mentees guided",
                },
                {
                  icon: GraduationCap,
                  value: "Full Stack",
                  label: "Specialization",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#393C3E] bg-[#292C2E] p-4"
                  >
                    <Icon
                      size={19}
                      className="text-[#E88B42]"
                    />

                    <p className="mt-4 text-lg font-semibold">
                      {item.value}
                    </p>

                    <p className="mt-1 text-xs text-[#A5AAA9]">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Mentorship goals">
            <div className="space-y-6">
              {goals.map((goal) => (
                <div key={goal.title}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-[#E3E3DF]">
                      {goal.title}
                    </p>

                    <span className="text-xs font-medium text-[#E8A774]">
                      {goal.progress}%
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={goal.title}
                    aria-valuenow={goal.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 overflow-hidden rounded-full bg-[#3D4041]"
                  >
                    <div
                      className="h-full rounded-full bg-[#E88B42]"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* MESSAGES */}
          <Panel
            title="Mentor conversation"
            action={
              <span className="rounded-full border border-[#454749] px-3 py-1 text-[11px] text-[#A5AAA9]">
                Demo chat
              </span>
            }
          >
            <div className="mb-4 rounded-lg border border-[#514436] bg-[#362C24] px-4 py-3 text-xs leading-5 text-[#D7BB9D]">
              Messages are only visible in this demo.
              They are not delivered to a real mentor.
            </div>

            <div
              aria-label="Mentor conversation messages"
              className="max-h-[380px] space-y-4 overflow-y-auto rounded-xl border border-[#393C3E] bg-[#1B1D1F] p-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "mentee"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.sender === "mentee"
                        ? "rounded-br-sm border border-[#70472C] bg-[#493122]"
                        : "rounded-bl-sm border border-[#404346] bg-[#292C2E]"
                    }`}
                  >
                    <p className="text-sm leading-6 text-[#E9E7E3]">
                      {message.text}
                    </p>

                    <p className="mt-2 text-right text-[10px] text-[#ADB1AC]">
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={sendMessage}
              className="mt-4 flex items-end gap-3"
            >
              <label
                htmlFor="mentor-message"
                className="sr-only"
              >
                Write your message
              </label>

              <textarea
                id="mentor-message"
                rows={2}
                maxLength={1000}
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                placeholder="Write a message to your mentor..."
                className="min-w-0 flex-1 resize-none rounded-xl border border-[#404346] bg-[#191B1D] p-3 text-sm leading-6 text-[#ECEBE8] outline-none focus:border-[#E88B42]"
              />

              <button
                type="submit"
                disabled={!messageText.trim()}
                aria-label="Send demo message"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E88B42] text-[#191B1D] transition hover:bg-[#F3A66F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={19} />
              </button>
            </form>
          </Panel>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Panel title="Areas of expertise">
            <div className="flex flex-wrap gap-2">
              {expertise.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-[#514334] bg-[#362B23] px-3 py-2 text-xs text-[#E7B489]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Panel>

          <Panel
            title="Upcoming sessions"
            action={
              <CalendarDays
                size={18}
                className="text-[#E88B42]"
              />
            }
          >
            <div className="space-y-3">
              {upcomingSessions.length ? (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-[#393C3E] bg-[#292C2E] p-4"
                  >
                    <p className="text-sm font-medium">
                      {session.title}
                    </p>

                    <div className="mt-3 space-y-2 text-xs text-[#B7BDB9]">
                      <p className="flex items-center gap-2">
                        <CalendarDays
                          size={14}
                          className="text-[#E88B42]"
                        />
                        {formatDate(session.date)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Clock3
                          size={14}
                          className="text-[#E88B42]"
                        />
                        {session.time} · {session.duration}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#A5AAA9]">
                  No upcoming sessions.
                </p>
              )}
            </div>
          </Panel>

          <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] to-[#232527] p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#E88B42]/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
                <Sparkles size={23} />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                AI learning support
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#C5B7AC]">
                Get help understanding concepts and
                preparing questions for your mentor.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/mentee/ai")
                }
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
              >
                Open AI Companion
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
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
            className="w-full max-w-md rounded-2xl border border-[#49423B] bg-[#232527] p-6"
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
                aria-label="Close booking dialog"
                onClick={() => setBookingOpen(false)}
                className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#35383A]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#A5AAA9]">
              Add a practice session to your demo schedule.
              This does not reserve your mentor&apos;s time.
            </p>

            <form
              onSubmit={bookSession}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-2 block text-sm"
                >
                  Session date
                </label>

                <input
                  id="booking-date"
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(event) => {
                    setBookingDate(event.target.value);
                    setBookingError("");
                  }}
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm text-[#ECEBE8]"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-time"
                  className="mb-2 block text-sm"
                >
                  Preferred time
                </label>

                <select
                  id="booking-time"
                  value={bookingTime}
                  onChange={(event) =>
                    setBookingTime(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 text-sm text-[#ECEBE8]"
                >
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
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
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] hover:bg-[#F3A66F]"
              >
                <CalendarDays size={17} />
                Add demo session
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Personal Mentorship · Demo data only
      </footer>
    </DashboardLayout>
  );
}
