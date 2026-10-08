
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  Lightbulb,
  Menu,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardRole } from "@/components/layout/Sidebar";

type Message = {
  id: string;
  sender: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
};

const STORAGE_KEY = "elevatex-ai-demo-chats-v1";

const suggestions = [
  {
    icon: Code2,
    title: "Understand REST APIs",
    prompt: "Explain REST APIs with a simple example.",
  },
  {
    icon: BookOpen,
    title: "Break down my assignment",
    prompt: "Help me break down my REST API assignment.",
  },
  {
    icon: Database,
    title: "Learn databases",
    prompt: "Explain how databases connect to backend APIs.",
  },
  {
    icon: Lightbulb,
    title: "Prepare for mentorship",
    prompt: "What questions should I ask my mentor?",
  },
];

function createId() {
  return crypto.randomUUID();
}

function createMessage(
  sender: Message["sender"],
  content: string
): Message {
  return {
    id: createId(),
    sender,
    content,
    createdAt: new Date().toISOString(),
  };
}

// Temporary responses for the frontend demonstration.
// Replace this function with a backend API request later.
function getDemoResponse(input: string): string {
  const text = input.toLowerCase();

  if (
    text.includes("rest api") ||
    text.includes("endpoint") ||
    text.includes("express")
  ) {
    return `Let's understand REST APIs step by step.

1. A REST API allows applications to communicate using HTTP requests.
2. GET retrieves information, POST creates information, PUT or PATCH updates information, and DELETE removes information.
3. In Express, you define endpoints such as GET /tasks and POST /tasks.
4. Your frontend sends requests to these endpoints, and your backend returns responses, usually in JSON format.

For your current REST API milestone, start with a small task-management API.

Try implementing GET /tasks first, then POST /tasks.

Question: What should happen if the user requests a task that doesn't exist?`;
  }

  if (
    text.includes("assignment") ||
    text.includes("project") ||
    text.includes("break down")
  ) {
    return `Let's break your REST API assignment into manageable steps.

Step 1 — Initialize a Node.js project and install Express.

Step 2 — Create a server with a health-check endpoint.

Step 3 — Define a task resource with an ID, title, and completion status.

Step 4 — Implement CRUD operations.

Step 5 — Add validation and appropriate HTTP status codes.

Step 6 — Test the endpoints and document them in your README.

Step 7 — Push the finished project to GitHub.

Start with the simplest working endpoint before adding more features.

Which step would you like to understand better?`;
  }

  if (
    text.includes("database") ||
    text.includes("postgres") ||
    text.includes("sql")
  ) {
    return `A database stores information that your application needs to keep.

For example, a mentorship platform may store users, programs, assignments, and submissions.

A typical request works like this:

1. The frontend sends a request to your backend.
2. The backend checks authorization and validates the request.
3. The backend queries PostgreSQL.
4. PostgreSQL returns the requested data.
5. The backend sends a JSON response to the frontend.

For a REST API assignment, you can begin with a tasks table containing id, title, completed, and created_at.

Would you like to explore database relationships or how to connect PostgreSQL with Express?`;
  }

  if (
    text.includes("react") ||
    text.includes("next.js") ||
    text.includes("frontend")
  ) {
    return `React helps you build user interfaces using reusable components.

Three important concepts are:

1. Components — Reusable parts of your interface.
2. Props — Information passed into components.
3. State — Information that changes as users interact.

Next.js builds on React and adds features such as routing and server-side rendering.

For practice, build a task list that can add, display, and complete tasks.

Then connect that task list to your REST API.

What part of React or Next.js would you like to practice?`;
  }

  if (
    text.includes("mentor") ||
    text.includes("session") ||
    text.includes("question")
  ) {
    return `A productive mentorship session works best when you arrive with specific questions.

For your current backend milestone, you could ask:

1. Is my API structured clearly?
2. How should I handle validation errors?
3. What security issues should I consider?
4. How should I organize routes and controllers?
5. What would make my project more maintainable?

Before your session, prepare a short summary of what you've built and where you're stuck.

Remember that your human mentor can review your actual implementation and provide more personalized feedback.`;
  }

  if (
    text.includes("roadmap") ||
    text.includes("progress") ||
    text.includes("learn")
  ) {
    return `Your sample learning roadmap follows four stages:

1. HTML and CSS foundations.
2. JavaScript fundamentals.
3. Building REST APIs.
4. Developing a full-stack application.

You're currently working on the REST API milestone.

Focus on understanding HTTP requests, Express routing, validation, and database integration before moving to a larger project.

Choose one small goal for your next study session. Consistency matters more than rushing through milestones.`;
  }

  return `I can help you explore software development concepts and plan your learning.

For this demonstration, I support sample guidance about REST APIs, React, databases, assignments, learning roadmaps, and mentorship sessions.

Try asking:

"Explain REST APIs with an example."

Or:

"Help me plan my backend assignment."

These are predefined demonstration responses. When the AI service is integrated, this workspace will support more flexible conversations.`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatConversationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function AICompanionPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [activeId, setActiveId] = useState<string | null>(
    null
  );

  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );

  // Restore demo conversations from browser storage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const saved: unknown = JSON.parse(raw);

        if (Array.isArray(saved)) {
          const valid = saved.filter(
            (item): item is Conversation =>
              item !== null &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.title === "string" &&
              typeof item.updatedAt === "string" &&
              Array.isArray(item.messages) &&
              item.messages.every(
                (message: unknown) =>
                  message !== null &&
                  typeof message === "object" &&
                  "id" in message &&
                  typeof message.id === "string" &&
                  "content" in message &&
                  typeof message.content === "string" &&
                  "sender" in message &&
                  (message.sender === "user" ||
                    message.sender === "assistant") &&
                  "createdAt" in message &&
                  typeof message.createdAt === "string"
              )
          );

          setConversations(valid);
          setActiveId(valid[0]?.id ?? null);
        }
      }
    } catch {
      // Continue with an empty chat if stored data is invalid.
    }

    setStorageReady(true);
  }, []);

  // Save conversations after initial restoration.
  useEffect(() => {
    if (!storageReady) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(conversations)
      );
    } catch {
      // The demo still works if browser storage is unavailable.
    }
  }, [conversations, storageReady]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeConversation?.messages.length, activeId]);

  function newConversation() {
    setActiveId(null);
    setInput("");
    setHistoryOpen(false);
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setInput("");
    setHistoryOpen(false);
  }

  function deleteConversation(id: string) {
    const next = conversations.filter(
      (conversation) => conversation.id !== id
    );

    setConversations(next);

    if (activeId === id) {
      setActiveId(next[0]?.id ?? null);
    }
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || trimmed.length > 2000) return;

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage(
      "assistant",
      getDemoResponse(trimmed)
    );

    const now = new Date().toISOString();

    if (activeId) {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeId
            ? {
                ...conversation,
                updatedAt: now,
                messages: [
                  ...conversation.messages,
                  userMessage,
                  assistantMessage,
                ],
              }
            : conversation
        )
      );
    } else {
      const id = createId();

      const conversation: Conversation = {
        id,
        title:
          trimmed.length > 42
            ? `${trimmed.slice(0, 42)}...`
            : trimmed,
        messages: [userMessage, assistantMessage],
        updatedAt: now,
      };

      setConversations((previous) => [
        conversation,
        ...previous,
      ]);

      setActiveId(id);
    }

    setInput("");
    setHistoryOpen(false);
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleInputKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  function handleNavigate(page: string) {
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

  const sortedConversations = [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
  );

  return (
    <DashboardLayout
      role="mentee"
      activePage="AI Companion"
      onNavigate={handleNavigate}
      onRoleChange={handleRoleChange}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#E88B42]">
            <Sparkles size={16} />
            Intelligent learning support
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            AI Companion
            <span className="text-[#E88B42]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5AAA9]">
            Your dedicated space to explore concepts,
            understand assignments, and prepare for
            mentorship sessions.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[#805439] bg-[#E88B42]/10 px-4 py-2 text-xs font-medium text-[#F3A66F]">
          <span className="h-2 w-2 rounded-full bg-[#E88B42]" />
          Demo assistant
        </span>
      </div>

      {/* MAIN WORKSPACE */}
      <section className="overflow-hidden rounded-2xl border border-[#35383A] bg-[#232527]">
        <div className="flex h-[min(760px,80vh)] min-h-[540px]">
          {/* CONVERSATION HISTORY */}
          <aside
            className={`${
              historyOpen ? "flex" : "hidden"
            } w-[260px] shrink-0 flex-col border-r border-[#35383A] bg-[#191B1D] md:flex`}
          >
            <div className="border-b border-[#35383A] p-4">
              <button
                type="button"
                onClick={newConversation}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#805439] bg-[#E88B42]/10 px-4 py-3 text-sm font-medium text-[#F3A66F] transition hover:bg-[#E88B42]/20"
              >
                <Plus size={18} />
                New conversation
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <p className="mb-4 px-3 text-[11px] font-medium uppercase tracking-widest text-[#8F9692]">
                Conversation history
              </p>

              {sortedConversations.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <MessageSquare
                    size={26}
                    className="mx-auto text-[#777F7B]"
                  />
                  <p className="mt-3 text-xs leading-6 text-[#A5AAA9]">
                    Your conversations will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group flex items-center gap-1 rounded-xl border ${
                        activeId === conversation.id
                          ? "border-[#805439] bg-[#3B2C22]"
                          : "border-transparent hover:bg-[#292C2E]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          selectConversation(conversation.id)
                        }
                        className="min-w-0 flex-1 p-3 text-left"
                      >
                        <p
                          className={`truncate text-xs font-medium ${
                            activeId === conversation.id
                              ? "text-[#F3A66F]"
                              : "text-[#D5D7D2]"
                          }`}
                        >
                          {conversation.title}
                        </p>

                        <p className="mt-1 text-[10px] text-[#969D99]">
                          {formatConversationDate(
                            conversation.updatedAt
                          )}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteConversation(conversation.id)
                        }
                        aria-label={`Delete conversation: ${conversation.title}`}
                        title="Delete conversation"
                        className="mr-2 rounded-lg p-2 text-[#A5AAA9] hover:bg-[#54352D] hover:text-[#FFB6A4]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#35383A] p-4">
              <div className="flex items-start gap-2">
                <ShieldCheck
                  size={17}
                  className="shrink-0 text-[#E88B42]"
                />
                <p className="text-[11px] leading-5 text-[#A5AAA9]">
                  Chats are saved only in this browser.
                  Avoid entering sensitive information.
                </p>
              </div>
            </div>
          </aside>

          {/* CHAT AREA */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* CHAT TOOLBAR */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#35383A] px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setHistoryOpen((previous) => !previous)
                  }
                  aria-label={
                    historyOpen
                      ? "Hide chat history"
                      : "Show chat history"
                  }
                  className="rounded-lg p-2 text-[#A5AAA9] hover:bg-[#343638] md:hidden"
                >
                  {historyOpen ? (
                    <X size={19} />
                  ) : (
                    <Menu size={19} />
                  )}
                </button>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#805439] bg-[#E88B42]/10 text-[#F3A66F]">
                  <Sparkles size={19} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    ElevateX Learning Guide
                  </p>

                  <p className="text-[11px] text-[#A5AAA9]">
                    Simulated assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={newConversation}
                title="New conversation"
                aria-label="New conversation"
                className="rounded-lg border border-[#454749] p-2 text-[#B6BDB8] transition hover:border-[#E88B42] hover:text-[#E88B42]"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* CHAT MESSAGES */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#202223] px-4 py-6 sm:px-6">
              {!activeConversation ||
              activeConversation.messages.length === 0 ? (
                <div className="mx-auto flex h-full max-w-2xl flex-col justify-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#805439] bg-[#E88B42]/10 text-[#F3A66F]">
                    <Sparkles size={27} />
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight text-[#ECEBE8]">
                    What would you like to learn?
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-7 text-[#A5AAA9]">
                    Ask about your current roadmap, explore a
                    concept, or prepare for a session with
                    your mentor.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {suggestions.map((suggestion) => {
                      const Icon = suggestion.icon;

                      return (
                        <button
                          key={suggestion.title}
                          type="button"
                          onClick={() =>
                            sendMessage(suggestion.prompt)
                          }
                          className="group rounded-xl border border-[#3D4042] bg-[#292C2E] p-4 text-left transition hover:border-[#805439] hover:bg-[#312B27]"
                        >
                          <Icon
                            size={19}
                            className="mb-4 text-[#E88B42]"
                          />

                          <p className="text-sm font-medium text-[#ECEBE8]">
                            {suggestion.title}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-[#A5AAA9]">
                            {suggestion.prompt}
                          </p>

                          <ArrowRight
                            size={15}
                            className="mt-3 text-[#E88B42] transition-transform group-hover:translate-x-1"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  aria-live="polite"
                  aria-label="Conversation messages"
                  className="mx-auto max-w-3xl space-y-7"
                >
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          message.sender === "user"
                            ? "bg-[#393D40] text-[#D5D7D2]"
                            : "border border-[#805439] bg-[#E88B42]/10 text-[#F3A66F]"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <UserRound size={18} />
                        ) : (
                          <Bot size={18} />
                        )}
                      </div>

                      <div
                        className={`min-w-0 max-w-[88%] ${
                          message.sender === "user"
                            ? "text-right"
                            : ""
                        }`}
                      >
                        <div
                          className={`rounded-2xl border px-4 py-3 sm:px-5 sm:py-4 ${
                            message.sender === "user"
                              ? "rounded-tr-sm border-[#6E4A31] bg-[#3D2D23]"
                              : "rounded-tl-sm border-[#414446] bg-[#292C2E]"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-left text-sm leading-7 text-[#E6E5E1]">
                            {message.content}
                          </p>
                        </div>

                        <p className="mt-2 px-1 text-[11px] text-[#929996]">
                          {message.sender === "user"
                            ? "You"
                            : "Demo guide"}
                          {" · "}
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div ref={endRef} />
                </div>
              )}
            </div>

            {/* MESSAGE COMPOSER */}
            <div className="shrink-0 border-t border-[#35383A] bg-[#232527] p-4 sm:p-5">
              <form
                onSubmit={submitMessage}
                className="mx-auto max-w-3xl"
              >
                <div className="rounded-xl border border-[#494C4D] bg-[#191B1D] p-3 transition-colors focus-within:border-[#E88B42]">
                  <label
                    htmlFor="ai-message-input"
                    className="sr-only"
                  >
                    Ask your learning companion
                  </label>

                  <textarea
                    id="ai-message-input"
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    onKeyDown={handleInputKeyDown}
                    maxLength={2000}
                    rows={2}
                    placeholder="Ask about your assignment or a learning concept..."
                    className="w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 text-[#ECEBE8] outline-none placeholder:text-[#7F8783]"
                  />

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-[#969D99]">
                      Enter to send · Shift+Enter for new line
                    </p>

                    <button
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="Send message"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E88B42] text-[#191B1D] transition hover:bg-[#F3A66F] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-center text-[11px] leading-5 text-[#929996]">
                  Prototype only — responses are predefined
                  and may not answer every question.
                  Verify important guidance with your mentor.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEXT / ASSISTANCE CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-6">
          <div className="flex items-center gap-2">
            <BookOpen
              size={19}
              className="text-[#E88B42]"
            />

            <h2 className="font-semibold">
              Current learning focus
            </h2>
          </div>

          <p className="mt-4 text-sm font-medium text-[#E6E5E1]">
            Building REST APIs
          </p>

          <p className="mt-2 text-sm leading-7 text-[#A5AAA9]">
            Learn Express routing, API design, request
            validation, and database integration.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/mentee/roadmap")
            }
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
          >
            View learning roadmap
            <ArrowRight size={16} />
          </button>
        </section>

        <section className="rounded-2xl border border-[#35383A] bg-[#232527] p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={19}
              className="text-[#E88B42]"
            />

            <h2 className="font-semibold">
              Human mentorship matters
            </h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-[#A5AAA9]">
            Your AI learning companion can help explain
            concepts, but your assigned mentor provides
            personalized feedback and project reviews.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/mentee/mentor")
            }
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#F3A66F] hover:underline"
          >
            Visit your mentor
            <ArrowRight size={16} />
          </button>
        </section>
      </div>

      <footer className="border-t border-[#303234] pt-5 text-xs text-[#858C88]">
        ElevateX · AI Learning Companion · Frontend demonstration
      </footer>
    </DashboardLayout>
  );
}
