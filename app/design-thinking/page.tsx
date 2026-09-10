import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Design thinking · Dayline",
  description: "How Dayline interprets the brief, the assumptions behind it, and the product decisions that followed.",
};

const TOC = [
  { href: "#brief", label: "The brief" },
  { href: "#assumptions", label: "Assumptions" },
  { href: "#decisions", label: "Decisions" },
  { href: "#cut", label: "What we cut" },
  { href: "#walkthrough", label: "How to walk it" },
] as const;

const BRIEF_QUESTIONS = [
  {
    question: "What do I have planned for today?",
    answer: "The greeting chips plus the schedule timeline.",
  },
  {
    question: "What tasks do I need to complete?",
    answer: "Unscheduled open work in Tasks to complete — not mixed into the meeting list.",
  },
  {
    question: "What meetings or events do I have?",
    answer: "Events on the timeline, with Meet / Teams join when a link exists.",
  },
  {
    question: "How is my day structured?",
    answer: "The day strip: a 7:00–21:00 bar of meetings vs focus blocks, with a now marker.",
  },
  {
    question: "What requires my attention?",
    answer: "Needs attention: overdue and urgent items, surfaced before the rest of the day.",
  },
] as const;

const ASSUMPTIONS = [
  {
    title: "Knowledge work, mixed days",
    body: "The user is not a student planner or a pure calendar power-user. Their day is meetings interrupted by execution work — so the home view has to hold both without making one a second-class citizen.",
  },
  {
    title: "Today is the job",
    body: "People open a day manager to answer “what now?”, not to administer a backlog. Board, calendar, and list exist so Today can stay opinionated.",
  },
  {
    title: "Issue-tracker literacy",
    body: "Status, priority, identifiers like DAY-12, and a detail drawer are familiar enough that we did not invent a new vocabulary. Linear and ClickUp are the reference, not a consumer to-do app.",
  },
  {
    title: "One person, one browser",
    body: "A 2–3 hour prototype does not need accounts, teams, or sync. Local-first storage is enough for create, drag, comment, and delete to survive a refresh — which is what makes it feel like a product instead of a mock.",
  },
  {
    title: "Tasks and events are mostly the same object",
    body: "Both have a title, owner, status, and optional time. The difference is intent: an event is a meeting on the clock; a task is work that may or may not be time-blocked. One model, a kind field.",
  },
  {
    title: "Attention is overdue + urgent",
    body: "We did not build an inbox product. If something is late or marked urgent, it belongs above the rest of today. Everything else waits its turn.",
  },
  {
    title: "Working hours are 7:00–21:00",
    body: "The strip and week grid crop to a long workday. Overnight and 24-hour views would dilute the structure question the brief asked us to answer.",
  },
  {
    title: "Desktop-first is acceptable",
    body: "The sidebar stays visible. A mobile off-canvas shell is the largest remaining gap; it is also a full layout problem, not a quick win, so it stayed out of the prototype.",
  },
  {
    title: "Personas beat empty states",
    body: "Three seeded workspaces (engineer, designer, HR) show different day shapes without login. Reviewers can switch in the sidebar and immediately see a different day, not a blank database.",
  },
  {
    title: "Meetings live on Meet or Teams",
    body: "For this audience those two platforms cover the join action. Native calendar sync and Zoom were left out so the join control could stay obvious.",
  },
  {
    title: "AI stays in the making, not the product",
    body: "The brief is explicit: use modern tools to explore and prototype; do not bolt a chatbot onto the day manager. Dayline has no AI features on purpose.",
  },
] as const;

const DECISIONS = [
  {
    title: "Today is the only home",
    body: "Opening the app lands on a daily summary, not a board or a week. The five brief questions are answered in one scroll: greeting chips, progress, day strip, attention, schedule, then leftover tasks. Day navigation was removed from this view so it stays “today”, not a disguised calendar.",
  },
  {
    title: "One Issue model, two kinds",
    body: "Tasks and events share identity, status, priority, comments, and attachments. Kind splits presentation: events get meeting chrome and indigo markers; tasks get emerald focus blocks when they have a start time. Clicking a calendar hour pre-fills an event; the create modal can still flip the kind.",
  },
  {
    title: "Four surfaces, one search",
    body: (
      <>
        <Link href="/" className="text-accent underline-offset-2 hover:underline">
          Today
        </Link>{" "}
        is orientation.{" "}
        <Link href="/board" className="text-accent underline-offset-2 hover:underline">
          Board
        </Link>{" "}
        is workflow.{" "}
        <Link href="/calendar" className="text-accent underline-offset-2 hover:underline">
          Calendar
        </Link>{" "}
        is the week and the time-block gesture.{" "}
        <Link href="/issues" className="text-accent underline-offset-2 hover:underline">
          Issues
        </Link>{" "}
        is the full inventory, grouped by status. Search is global because the same objects appear on every surface — filtering in memory, not four different queries.
      </>
    ),
  },
  {
    title: "Create is a modal, inspect is a drawer",
    body: "Creating should feel like a capture: title, kind, optional schedule, done. Editing should feel like staying in context: the drawer keeps the board or list visible underneath. Calendar clicks and empty states pass a draft in, so the modal opens already time-blocked.",
  },
  {
    title: "Personas instead of authentication",
    body: "Arjun, Maya, and Kavya are three complete local workspaces. Switching persona is switching the owner filter, not logging in. Seed data is written as a day-in-the-life so the prototype has overdue work, a 1:1, and a focus block on first paint.",
  },
  {
    title: "Local-first, with failure treated as a product state",
    body: "Dexie / IndexedDB is the database. Returning visits skip the seed. If storage is blocked (private browsing, quota, a stuck upgrade), the shell shows why and offers retry instead of an empty workspace that looks like “no tasks”.",
  },
  {
    title: "Linear density, ClickUp status dots",
    body: "The visual language is quiet: Geist, a violet accent, 12px as the floor, dark and light. Status is a colored dot, not a loud badge. Meetings and focus blocks are distinguished by indigo vs emerald so the strip and timeline stay readable at a glance.",
  },
  {
    title: "Time-blocking is a click, not a form first",
    body: "Empty hours on the week grid are buttons. Click (or Enter) opens create with start and end already set. Keyboard users get the current hour on today, otherwise 7:00 — there is no pointer position to infer from.",
  },
  {
    title: "C creates, two clicks delete",
    body: "A single-letter shortcut is the fastest capture we could add without a command palette. Destructive delete in the drawer arms first (“Confirm delete”) and forgets the arm when you change issues or wait a few seconds. Comments and uploads say when they fail; the attachment drop zone actually accepts drops.",
  },
  {
    title: "Progress is a streak, not a score",
    body: "Completing a task is the only thing that counts. The block shows streak, today, and this week vs last — enough momentum to make Today feel alive, not a dashboard of vanity metrics.",
  },
] as const;

const CUT = [
  {
    title: "Mobile shell",
    body: "The sidebar never collapses at a breakpoint. That is the largest responsive gap; it needs its own layout pass, not a handful of overflow tweaks.",
  },
  {
    title: "Recurring events and calendar sync",
    body: "Standups every weekday and Google Calendar import are real products. They also hide the core interaction we needed to prove: one mixed day, manually owned.",
  },
  {
    title: "Notifications, reminders, undo",
    body: "Attention is already on the home view. Toast-and-undo would be a feedback layer on top of mutations we already persist locally.",
  },
  {
    title: "Command palette and board keyboard drag",
    body: "C covers the highest-frequency action. Full command-K and KeyboardSensor for the board are the right next accessibility step, not the first.",
  },
  {
    title: "Multiplayer, auth, a backend",
    body: "Comments exist as notes on an issue. They are not a team product. Shipping login would have spent the assignment on plumbing.",
  },
  {
    title: "List virtualization and blob tables",
    body: "Seeded workspaces are tens of issues. Scaling storage and rows is a later problem; it would not change the day experience.",
  },
] as const;

const WALK = [
  {
    step: "1",
    title: "Start on Today",
    body: "Read it top to bottom as the brief: chips, strip, attention, schedule, leftover tasks. Join a meeting from a timeline card.",
  },
  {
    step: "2",
    title: "Switch workspace",
    body: "Open the persona control in the sidebar. Maya and Kavya are different jobs with different days — same IA, different shape.",
  },
  {
    step: "3",
    title: "Capture with C",
    body: "Press C from anywhere (outside an input) to create. Or click an empty hour on Calendar to pre-fill a block.",
  },
  {
    step: "4",
    title: "Move work on the Board",
    body: "Drag a card between columns. Rank is lexicographic, Linear-style, so order inside a column is real, not visual-only.",
  },
  {
    step: "5",
    title: "Open the drawer",
    body: "Click any issue. Change priority, attach a file, leave a comment, then arm Delete without confirming — the two-step is intentional.",
  },
] as const;

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 flex flex-col gap-5">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium tracking-wide text-accent uppercase">{eyebrow}</p>
        )}
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignThinkingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-8">
      <header className="flex flex-col gap-4">
        <p className="text-xs font-medium tracking-wide text-accent uppercase">Assignment notes</p>
        <h1 className="text-2xl font-semibold tracking-tight">Design thinking</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          The brief asked for a working product that helps someone understand their day — and for a
          walkthrough of how we interpreted that. This page is that walkthrough: the problem we
          chose, the assumptions we made to finish in a few hours, and the decisions that followed.
        </p>
        <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-1">
          {TOC.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <Section
        id="brief"
        eyebrow="Problem"
        title="The brief as five questions"
        description="Requirements were intentionally missing. We treated the five things a user should “quickly understand” as the acceptance test for the home view — not as five apps."
      >
        <ol className="flex flex-col overflow-hidden rounded-xl border border-border">
          {BRIEF_QUESTIONS.map((item, index) => (
            <li
              key={item.question}
              className="grid gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[1.4fr_1fr] sm:gap-6"
            >
              <p className="text-sm font-medium">
                <span className="mr-2 font-mono text-xs text-muted">0{index + 1}</span>
                {item.question}
              </p>
              <p className="text-xs leading-relaxed text-muted sm:pt-0.5">{item.answer}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm leading-relaxed text-muted">
          The working name is Dayline: a day has a shape, and the product should make that shape
          visible in the first few seconds. Everything else is in service of that.
        </p>
      </Section>

      <Section
        id="assumptions"
        eyebrow="Constraints we chose"
        title="Assumptions"
        description="None of these were in the brief. They are the bets that let us ship a coherent prototype instead of a feature list."
      >
        <ul className="flex flex-col gap-3">
          {ASSUMPTIONS.map((item, index) => (
            <li
              key={item.title}
              className="rounded-xl border border-border bg-surface/40 px-4 py-3.5"
            >
              <p className="text-sm font-medium">
                <span className="mr-2 font-mono text-xs text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="decisions"
        eyebrow="What followed"
        title="Key decisions"
        description="Each choice below is something we could have done differently. The right-hand column is the reason we did not."
      >
        <ol className="flex flex-col gap-6">
          {DECISIONS.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span
                aria-hidden
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-medium text-accent"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="cut"
        eyebrow="Scope"
        title="What we left on the table"
        description="The brief is a few hours, not a roadmap. These are real gaps we would take next — and why they were the wrong spend for this prototype."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {CUT.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-border bg-surface/40 px-4 py-3.5"
            >
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="walkthrough"
        eyebrow="Prototype"
        title="How to walk it"
        description="Five minutes, in this order, covers the core experience the brief asked us to demonstrate."
      >
        <ol className="flex flex-col overflow-hidden rounded-xl border border-border">
          {WALK.map((item) => (
            <li
              key={item.step}
              className="flex gap-4 border-b border-border px-4 py-3.5 last:border-b-0"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-default/80 font-mono text-xs font-medium">
                {item.step}
              </span>
              <div>
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs leading-relaxed text-muted">
          Tokens and components live on{" "}
          <Link href="/design-system" className="text-accent underline-offset-2 hover:underline">
            Design system
          </Link>
          . The product itself starts on{" "}
          <Link href="/" className="text-accent underline-offset-2 hover:underline">
            Today
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
