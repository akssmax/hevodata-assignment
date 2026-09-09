import { atLocalTime, dateKeyOffset } from "./dates";
import { db } from "./db";
import { PERSONAS } from "./personas";
import type { Issue, IssueKind, MeetingPlatform, Priority, Status } from "./types";

interface SeedIssue {
  title: string;
  description: string;
  kind: IssueKind;
  status: Status;
  priority: Priority;
  rank: string;
  dueOffset?: number;
  start?: [dayOffset: number, hour: number, minute?: number];
  end?: [dayOffset: number, hour: number, minute?: number];
  meetingPlatform?: MeetingPlatform;
  meetingUrl?: string;
}

const SEEDS: Record<string, SeedIssue[]> = {
  arjun: [
    {
      title: "Daily standup",
      description: "Sync with the team on yesterday, today, blockers.",
      kind: "event",
      status: "todo",
      priority: "medium",
      rank: "1000",
      start: [0, 9, 30],
      end: [0, 10, 0],
      meetingPlatform: "google_meet",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
    },
    {
      title: "Review Priya's PR: board drag state",
      description: "Check the rank calculation and optimistic update path.",
      kind: "task",
      status: "todo",
      priority: "high",
      rank: "2000",
      dueOffset: 0,
    },
    {
      title: "Deep work: calendar week grid",
      description: "Rebuild the hour gutter, no native date inputs.",
      kind: "task",
      status: "in_progress",
      priority: "urgent",
      rank: "3000",
      start: [0, 11, 0],
      end: [0, 13, 0],
      dueOffset: 0,
    },
    {
      title: "1:1 with engineering manager",
      description: "Growth plan and scope of the Dayline prototype.",
      kind: "event",
      status: "todo",
      priority: "medium",
      rank: "4000",
      start: [0, 15, 0],
      end: [0, 15, 30],
      meetingPlatform: "microsoft_teams",
      meetingUrl:
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_arjun1on1%40thread.v2/0?context=%7b%22Tid%22%3a%22dayline%22%7d",
    },
    {
      title: "Fix overdue: timezone bug in seed data",
      description: "Blocks were landing on the wrong day in IST.",
      kind: "task",
      status: "todo",
      priority: "urgent",
      rank: "5000",
      dueOffset: -1,
    },
    {
      title: "Sprint planning",
      description: "Estimate next week's tickets with the team.",
      kind: "event",
      status: "todo",
      priority: "high",
      rank: "6000",
      start: [1, 10, 0],
      end: [1, 11, 30],
      meetingPlatform: "google_meet",
      meetingUrl: "https://meet.google.com/xyz-abcd-efg",
    },
    {
      title: "Triage new bug reports",
      description: "Label and prioritise anything filed this week.",
      kind: "task",
      status: "backlog",
      priority: "low",
      rank: "7000",
    },
    {
      title: "Ship Dayline v2",
      description: "Personas, dashboard, theming, motion.",
      kind: "task",
      status: "in_progress",
      priority: "high",
      rank: "8000",
      dueOffset: 0,
    },
    {
      title: "Gym",
      description: "Protect the evening block.",
      kind: "event",
      status: "todo",
      priority: "none",
      rank: "9000",
      start: [0, 18, 30],
      end: [0, 19, 30],
    },
    {
      title: "Read: React Aria date pickers",
      description: "Understand DateValue and segment composition.",
      kind: "task",
      status: "backlog",
      priority: "low",
      rank: "10000",
    },
  ],
  maya: [
    {
      title: "Design critique: onboarding flow",
      description: "Present the empty-state explorations, collect feedback.",
      kind: "event",
      status: "todo",
      priority: "high",
      rank: "1000",
      start: [0, 10, 0],
      end: [0, 11, 0],
      meetingPlatform: "google_meet",
      meetingUrl: "https://meet.google.com/mya-crit-001",
    },
    {
      title: "Synthesize user interviews",
      description: "Five sessions on day-planning habits. Tag themes in Dovetail.",
      kind: "task",
      status: "in_progress",
      priority: "urgent",
      rank: "2000",
      dueOffset: 0,
    },
    {
      title: "Wireframe review with Arjun",
      description: "Walk through the dashboard strip and persona switcher.",
      kind: "event",
      status: "todo",
      priority: "medium",
      rank: "3000",
      start: [0, 12, 30],
      end: [0, 13, 0],
      meetingPlatform: "microsoft_teams",
      meetingUrl:
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_wireframe%40thread.v2/0?context=%7b%22Tid%22%3a%22dayline%22%7d",
    },
    {
      title: "Overdue: update journey map",
      description: "Was due yesterday — add the attention section findings.",
      kind: "task",
      status: "todo",
      priority: "high",
      rank: "4000",
      dueOffset: -1,
    },
    {
      title: "Design-system audit: accent tokens",
      description: "Move status colors to Tailwind 300 shades for dark mode.",
      kind: "task",
      status: "todo",
      priority: "medium",
      rank: "5000",
      dueOffset: 1,
    },
    {
      title: "Figma handoff: calendar interactions",
      description: "Annotate hover, drag, and slot-create behaviors.",
      kind: "task",
      status: "todo",
      priority: "medium",
      rank: "6000",
      start: [1, 14, 0],
      end: [1, 15, 0],
    },
    {
      title: "Weekly design sync",
      description: "Team critique and roadmap check-in.",
      kind: "event",
      status: "todo",
      priority: "low",
      rank: "7000",
      start: [2, 16, 0],
      end: [2, 17, 0],
      meetingPlatform: "microsoft_teams",
      meetingUrl:
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_designsync%40thread.v2/0?context=%7b%22Tid%22%3a%22dayline%22%7d",
    },
    {
      title: "Explore Linear's command menu",
      description: "Note patterns worth borrowing for Dayline.",
      kind: "task",
      status: "backlog",
      priority: "none",
      rank: "8000",
    },
    {
      title: "Usability test: day strip",
      description: "Three participants, focus on glanceability.",
      kind: "event",
      status: "backlog",
      priority: "medium",
      rank: "9000",
      start: [3, 11, 0],
      end: [3, 12, 0],
    },
  ],
  kavya: [
    {
      title: "Screening call: frontend candidate",
      description: "30 min intro call, scorecard after.",
      kind: "event",
      status: "todo",
      priority: "high",
      rank: "1000",
      start: [0, 9, 0],
      end: [0, 9, 30],
      meetingPlatform: "google_meet",
      meetingUrl: "https://meet.google.com/kav-screen-001",
    },
    {
      title: "Panel interview: senior designer",
      description: "Second round with Maya and the design lead.",
      kind: "event",
      status: "todo",
      priority: "urgent",
      rank: "2000",
      start: [0, 11, 0],
      end: [0, 12, 0],
      dueOffset: 0,
      meetingPlatform: "microsoft_teams",
      meetingUrl:
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_panel%40thread.v2/0?context=%7b%22Tid%22%3a%22dayline%22%7d",
    },
    {
      title: "Send offer letter: backend role",
      description: "Was due yesterday — candidate is waiting.",
      kind: "task",
      status: "todo",
      priority: "urgent",
      rank: "3000",
      dueOffset: -1,
    },
    {
      title: "Onboarding session: new joiners",
      description: "Tools walkthrough and buddy introductions.",
      kind: "event",
      status: "todo",
      priority: "medium",
      rank: "4000",
      start: [0, 14, 0],
      end: [0, 15, 0],
      meetingPlatform: "microsoft_teams",
      meetingUrl:
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_onboard%40thread.v2/0?context=%7b%22Tid%22%3a%22dayline%22%7d",
    },
    {
      title: "Update leave policy doc",
      description: "Reflect the new comp-off rules.",
      kind: "task",
      status: "todo",
      priority: "medium",
      rank: "5000",
      dueOffset: 0,
    },
    {
      title: "1:1: check-in with Arjun",
      description: "Workload and prototype crunch this week.",
      kind: "event",
      status: "todo",
      priority: "low",
      rank: "6000",
      start: [1, 16, 0],
      end: [1, 16, 30],
      meetingPlatform: "google_meet",
      meetingUrl: "https://meet.google.com/kav-arjun-1on1",
    },
    {
      title: "Review interview scorecards",
      description: "Chase two pending submissions.",
      kind: "task",
      status: "in_progress",
      priority: "high",
      rank: "7000",
      dueOffset: 0,
    },
    {
      title: "Plan team offsite",
      description: "Shortlist venues and dates.",
      kind: "task",
      status: "backlog",
      priority: "low",
      rank: "8000",
    },
    {
      title: "Payroll cutoff reminder",
      description: "Send the monthly note to all managers.",
      kind: "task",
      status: "backlog",
      priority: "none",
      rank: "9000",
      dueOffset: 4,
    },
  ],
};

function toIssue(ownerId: string, index: number, seed: SeedIssue, createdAt: string): Issue {
  return {
    id: crypto.randomUUID(),
    identifier: `DAY-${index}`,
    ownerId,
    kind: seed.kind,
    title: seed.title,
    description: seed.description,
    status: seed.status,
    priority: seed.priority,
    rank: seed.rank,
    dueDate: seed.dueOffset !== undefined ? dateKeyOffset(seed.dueOffset) : undefined,
    startAt: seed.start ? atLocalTime(seed.start[0], seed.start[1], seed.start[2] ?? 0) : undefined,
    endAt: seed.end ? atLocalTime(seed.end[0], seed.end[1], seed.end[2] ?? 0) : undefined,
    meetingPlatform: seed.meetingPlatform,
    meetingUrl: seed.meetingUrl,
    comments: [],
    attachments: [],
    createdAt,
    updatedAt: createdAt,
  };
}

async function seedOnce() {
  await db.transaction("rw", db.issues, db.meta, async () => {
    const createdAt = new Date().toISOString();
    let seq = Number((await db.meta.get("issueSeq"))?.value ?? 0);

    for (const persona of PERSONAS) {
      const existing = await db.issues.where("ownerId").equals(persona.id).count();
      if (existing > 0) continue;

      const seeds = SEEDS[persona.id] ?? [];
      const issues = seeds.map((seed) => toIssue(persona.id, ++seq, seed, createdAt));
      await db.issues.bulkAdd(issues);
    }

    await db.meta.put({ key: "issueSeq", value: seq });
  });
}

let seedPromise: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedOnce();
  }
  return seedPromise;
}
