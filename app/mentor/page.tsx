
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  Route,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type ReviewStatus = "pending" | "reviewed";

type Review = {
  id: number;
  student: string;
  initials: string;
  assignment: string;
  module: string;
  submitted: string;
  status: ReviewStatus;
};

type Mentee = {
  id: number;
  name: string;
  initials: string;
  program: string;
  progress: number;
  currentMilestone: string;
  status: "On track" | "Needs attention";
};

const mentees: Mentee[] = [
  {
    id: 1,
    name: "Alex Morgan",
    initials: "AM",
    program: "Full Stack Development",
    progress: 68,
    currentMilestone: "Building REST APIs",
    status: "On track",
  },
  {
    id: 2,
    name: "Daniel Kim",
    initials: "DK",
    program: "Full Stack Development",
    progress: 42,
    currentMilestone: "JavaScript Fundamentals",
    status: "Needs attention",
  },
  {
    id: 3,
    name: "Olivia Chen",
    initials: "OC",
    program: "Frontend Engineering",
    progress: 85,
    currentMilestone: "Final Portfolio Project",
    status: "On track",
  },
  {
    id: 4,
    name: "James Wilson",
    initials: "JW",
    program: "Backend Development",
    progress: 54,
    currentMilestone: "Database Integration",
    status: "On track",
  },
];

const initialReviews: Review[] = [
  {
    id: 1,
    student: "Alex Morgan",
    initials: "AM",
    assignment: "Authentication System",
    module: "Full Stack Development",
    submitted: "Oct 6, 2026",
    status: "pending",
  },
  {
    id: 2,
    student: "Daniel Kim",
    initials: "DK",
    assignment: "JavaScript Task Manager",
    module: "JavaScript Fundamentals",
    submitted: "Oct 5, 2026",
    status: "pending",
  },
  {
    id: 3,
    student: "James Wilson",
    initials: "JW",
    assignment: "Database Schema Design",
    module: "Backend Development",
    submitted: "Oct 3, 2026",
    status: "pending",
  },
];

const upcomingSessions = [
  {
    id: 1,
    student: "Alex Morgan",
    initials: "AM",
    title: "Backend Architecture Review",
    date: "Oct 15, 2026",
    time: "3:00 PM",
    duration: "45 min",
  },
  {
    id: 2,
    student: "Olivia Chen",
    initials: "OC",
    title: "Final Portfolio Feedback",
    date: "Oct 16, 2026",
    time: "11:00 AM",
    duration: "30 min",
  },
  {
    id: 3,
    student: "Daniel Kim",
    initials: "DK",
    title: "JavaScript Learning Check-in",
    date: "Oct 19, 2026",
    time: "2:00 PM",
    duration: "30 min",
  },
];

function Avatar({
  initials,
  size = "normal",
}: {
  initials: string;
  size?: "normal" | "large";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-[#745139] bg-[#493225] font-semibold text-[#F3A66F] ${
        size === "large"
          ? "h-12 w-12 text-sm"
          : "h-10 w-10 text-xs"
      }`}
    >
      {initials}
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
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

      <p className="mt-2 text-xs text-[#A5AAA9]">
        {description}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#ECEBE8]">
          {title}
        </h2>

        <p className="mt-2 text-sm text-[#A5AAA9]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

export default function MentorDashboardPage() {
  const router = useRouter();

  const [reviews, setReviews] =
    useState<Review[]>(initialReviews);

  const [notification, setNotification] = useState("");

  const pendingReviews = reviews.filter(
    (review) => review.status === "pending"
  );

  const averageProgress = Math.round(
    mentees.reduce(
      (total, mentee) => total + mentee.progress,
      0
    ) / mentees.length
  );

  function completeDemoReview(id: number) {
    setReviews((previous) =>
      previous.map((review) =>
        review.id === id
          ? { ...review, status: "reviewed" }
          : review
      )
    );

    setNotification(
      "Review marked complete in this demo. No feedback was sent to the mentee."
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
      activePage="Overview"
      onNavigate={handleNavigation}
      onRoleChange={handleRoleChange}
    >
      {/* INTRODUCTION */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <GraduationCap size={16} />
            Mentor workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, Sarah
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Support your mentees, review their work,
            and keep their learning progress moving
            forward.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#45413C] bg-[#292521] px-4 py-3 text-xs text-[#D7B69A]">
          <Sparkles size={16} className="text-[#E88B42]" />
          ElevateX Mentor Portal
        </div>
      </div>

      {/* DEMO NOTIFICATION */}
      {notification && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#466B52] bg-[#294033] p-4 text-sm text-[#B8DCC0]"
        >
          <span>{notification}</span>

          <button
            type="button"
            onClick={() => setNotification("")}
            className="text-xs font-medium underline underline-offset-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned mentees"
          value={mentees.length}
          description="Learners under your guidance"
          icon={Users}
        />

        <StatCard
          label="Pending reviews"
          value={pendingReviews.length}
          description="Assignments awaiting review"
          icon={ClipboardCheck}
        />

        <StatCard
          label="Upcoming sessions"
          value={upcomingSessions.length}
          description="Scheduled mentorship meetings"
          icon={CalendarDays}
        />

        <StatCard
          label="Average progress"
          value={`${averageProgress}%`}
          description="Across your assigned mentees"
          icon={TrendingUp}
        />
      </div>

      {/* MAIN HIGHLIGHT */}
      <section className="relative overflow-hidden rounded-2xl border border-[#70472C] bg-gradient-to-br from-[#38281F] via-[#2B2623] to-[#232527] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-[#E88B42]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#E8A774]">
              <BookOpen size={16} />
              Your mentorship impact
            </div>

            <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
              Help your learners reach their next milestone.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#C7B9AD]">
              {pendingReviews.length === 0
                ? "Your demo review queue is clear. Check in with your mentees and prepare for upcoming sessions."
                : `You have ${pendingReviews.length} assignment${
                    pendingReviews.length === 1 ? "" : "s"
                  } waiting for review. Timely feedback helps learners make consistent progress.`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("mentor-review-queue")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#E88B42] px-5 py-3 text-sm font-semibold text-[#191B1D] transition hover:bg-[#F3A66F]"
          >
            View review queue
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* MENTEES + SESSIONS */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(310px,1fr)]">
        {/* MENTEE PROGRESS */}
        <section className="min-w-0 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <SectionHeading
            title="Your mentees"
            description="A quick overview of each learner's progress."
          />

          <div className="mt-6 space-y-3">
            {mentees.map((mentee) => (
              <article
                key={mentee.id}
                className="rounded-xl border border-[#3A3D3F] bg-[#292C2E] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={mentee.initials} />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#ECEBE8]">
                        {mentee.name}
                      </p>

                      <p className="mt-1 text-xs text-[#A5AAA9]">
                        {mentee.program}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] ${
                      mentee.status === "On track"
                        ? "border-[#466B52] bg-[#294033] text-[#A6D5B0]"
                        : "border-[#805439] bg-[#453323] text-[#F3A66F]"
                    }`}
                  >
                    {mentee.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[#A5AAA9]">
                    {mentee.currentMilestone}
                  </p>

                  <p className="text-xs font-semibold text-[#F3A66F]">
                    {mentee.progress}%
                  </p>
                </div>

                <div
                  role="progressbar"
                  aria-label={`${mentee.name} learning progress`}
                  aria-valuenow={mentee.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-3 h-2 overflow-hidden rounded-full bg-[#404345]"
                >
                  <div
                    className="h-full rounded-full bg-[#E88B42]"
                    style={{
                      width: `${mentee.progress}%`,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* UPCOMING SESSIONS */}
        <section className="min-w-0 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6">
          <SectionHeading
            title="Upcoming sessions"
            description="Your next mentorship conversations."
          />

          <div className="mt-6 space-y-3">
            {upcomingSessions.map((session) => (
              <article
                key={session.id}
                className="rounded-xl border border-[#3A3D3F] bg-[#292C2E] p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={session.initials} />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#ECEBE8]">
                      {session.student}
                    </p>

                    <p className="mt-1 text-xs text-[#A5AAA9]">
                      {session.title}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-[#3D4042] pt-4 text-xs text-[#B8BEBA]">
                  <span className="flex items-center gap-2">
                    <CalendarDays
                      size={15}
                      className="text-[#E88B42]"
                    />
                    {session.date}
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock3
                      size={15}
                      className="text-[#E88B42]"
                    />
                    {session.time}
                  </span>
                </div>

                <p className="mt-3 text-xs text-[#8E9691]">
                  {session.duration} · Demo schedule
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* REVIEW QUEUE */}
      <section
        id="mentor-review-queue"
        className="scroll-mt-24 rounded-2xl border border-[#35383A] bg-[#232527] p-5 sm:p-6"
      >
        <SectionHeading
          title="Assignment review queue"
          description="Track work submitted by your mentees."
          action={
            <span className="rounded-full border border-[#805439] bg-[#E88B42]/10 px-3 py-1 text-xs font-medium text-[#F3A66F]">
              {pendingReviews.length} pending
            </span>
          }
        />

        <div className="mt-6 space-y-3">
          {pendingReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#48504A] bg-[#292C2E] px-5 py-12 text-center">
              <CheckCircle2
                size={31}
                className="mx-auto text-[#A6D5B0]"
              />

              <h3 className="mt-4 text-base font-semibold">
                All caught up
              </h3>

              <p className="mt-2 text-sm text-[#A5AAA9]">
                No pending demo reviews remain.
              </p>
            </div>
          ) : (
            pendingReviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col gap-4 rounded-xl border border-[#3A3D3F] bg-[#292C2E] p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar initials={review.initials} />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {review.assignment}
                    </p>

                    <p className="mt-2 text-xs text-[#B5BAB6]">
                      {review.student} · {review.module}
                    </p>

                    <p className="mt-2 text-xs text-[#858C88]">
                      Submitted {review.submitted}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    completeDemoReview(review.id)
                  }
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#805439] bg-[#3C2E24] px-4 py-3 text-sm font-medium text-[#F3A66F] transition hover:bg-[#503827]"
                >
                  <Check size={17} />
                  Mark reviewed (demo)
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      {/* NEXT STEPS */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-6">
          <div className="inline-flex rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
            <Route size={23} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Personalized learning
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#A5AAA9]">
            Review each mentee&apos;s milestones and
            identify where additional guidance is needed.
          </p>

          <p className="mt-5 text-xs font-medium text-[#E8A774]">
            Mentor roadmaps page coming next
          </p>
        </section>

        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-6">
          <div className="inline-flex rounded-xl bg-[#E88B42]/10 p-3 text-[#E88B42]">
            <MessageSquare size={23} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Meaningful feedback
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#A5AAA9]">
            Provide clear, actionable reviews that
            help your mentees understand what to improve.
          </p>

          <p className="mt-5 text-xs font-medium text-[#E8A774]">
            Detailed assignment reviews coming soon
          </p>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · Mentor Dashboard · Demo data
      </footer>
    </DashboardLayout>
  );
}
