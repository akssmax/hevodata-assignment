import { db } from "./db";
import { rankBetween } from "./rank";
import type { Attachment, Comment, CreateIssueInput, Issue, Status, UpdateIssueInput } from "./types";

function nowIso() {
  return new Date().toISOString();
}

async function nextIdentifier() {
  return db.transaction("rw", db.meta, async () => {
    const row = await db.meta.get("issueSeq");
    const next = Number(row?.value ?? 0) + 1;
    await db.meta.put({ key: "issueSeq", value: next });
    return `DAY-${next}`;
  });
}

async function lastRank(status: Status) {
  const last = await db.issues.where("[status+rank]").between([status, ""], [status, "\uffff"]).last();
  return last?.rank;
}

/** Ensure endAt is after startAt; default to +1h when missing, +30min when inverted. */
function normalizeSchedule(startAt?: string, endAt?: string) {
  if (!startAt) return { startAt, endAt: undefined };
  const start = new Date(startAt).getTime();
  if (Number.isNaN(start)) return { startAt: undefined, endAt: undefined };
  if (!endAt) {
    return { startAt, endAt: new Date(start + 60 * 60 * 1000).toISOString() };
  }
  const end = new Date(endAt).getTime();
  if (Number.isNaN(end) || end <= start) {
    return { startAt, endAt: new Date(start + 30 * 60 * 1000).toISOString() };
  }
  return { startAt, endAt };
}

export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  const createdAt = nowIso();
  const status = input.status ?? "todo";
  const schedule = normalizeSchedule(input.startAt, input.endAt);
  const [identifier, lastRankValue] = await Promise.all([nextIdentifier(), lastRank(status)]);
  const issue: Issue = {
    id: crypto.randomUUID(),
    identifier,
    ownerId: input.ownerId,
    kind: input.kind ?? "task",
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    status,
    priority: input.priority ?? "none",
    rank: rankBetween(lastRankValue),
    dueDate: input.dueDate,
    startAt: schedule.startAt,
    endAt: schedule.endAt,
    comments: [],
    attachments: [],
    createdAt,
    updatedAt: createdAt,
  };

  await db.issues.add(issue);
  return issue;
}

export async function updateIssue(id: string, patch: UpdateIssueInput): Promise<void> {
  const current = await db.issues.get(id);
  if (!current) return;

  const next: Issue = {
    ...current,
    title: patch.title?.trim() ?? current.title,
    description: patch.description !== undefined ? patch.description : current.description,
    kind: patch.kind ?? current.kind,
    status: patch.status ?? current.status,
    priority: patch.priority ?? current.priority,
    rank: patch.rank ?? current.rank,
    updatedAt: nowIso(),
  };

  if (patch.dueDate === null) {
    delete next.dueDate;
  } else if (patch.dueDate !== undefined) {
    next.dueDate = patch.dueDate;
  }

  if (patch.startAt === null) {
    delete next.startAt;
  } else if (patch.startAt !== undefined) {
    next.startAt = patch.startAt;
  }

  if (patch.endAt === null) {
    delete next.endAt;
  } else if (patch.endAt !== undefined) {
    next.endAt = patch.endAt;
  }

  // Edge case: keep end after start when either side changes
  if (next.startAt && next.endAt) {
    const start = new Date(next.startAt).getTime();
    const end = new Date(next.endAt).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      next.endAt = new Date(start + 30 * 60 * 1000).toISOString();
    }
  }

  await db.issues.put(next);
}

export async function deleteIssue(id: string): Promise<void> {
  await db.issues.delete(id);
}

export async function addComment(issueId: string, authorId: string, body: string): Promise<void> {
  const text = body.trim();
  if (!text) return;
  await db.issues
    .where("id")
    .equals(issueId)
    .modify((issue) => {
      const comment: Comment = {
        id: crypto.randomUUID(),
        authorId,
        body: text,
        createdAt: nowIso(),
      };
      issue.comments = [...(issue.comments ?? []), comment];
      issue.updatedAt = nowIso();
    });
}

export async function deleteComment(issueId: string, commentId: string): Promise<void> {
  await db.issues
    .where("id")
    .equals(issueId)
    .modify((issue) => {
      issue.comments = (issue.comments ?? []).filter((comment) => comment.id !== commentId);
      issue.updatedAt = nowIso();
    });
}

export async function addAttachment(
  issueId: string,
  file: { name: string; size: number; type: string; dataUrl: string },
): Promise<void> {
  await db.issues
    .where("id")
    .equals(issueId)
    .modify((issue) => {
      const attachment: Attachment = {
        id: crypto.randomUUID(),
        ...file,
        createdAt: nowIso(),
      };
      issue.attachments = [...(issue.attachments ?? []), attachment];
      issue.updatedAt = nowIso();
    });
}

export async function deleteAttachment(issueId: string, attachmentId: string): Promise<void> {
  await db.issues
    .where("id")
    .equals(issueId)
    .modify((issue) => {
      issue.attachments = (issue.attachments ?? []).filter((item) => item.id !== attachmentId);
      issue.updatedAt = nowIso();
    });
}

export async function moveIssue(
  id: string,
  status: Status,
  beforeRank?: string,
  afterRank?: string,
): Promise<void> {
  await updateIssue(id, {
    status,
    rank: rankBetween(beforeRank, afterRank),
  });
}

export function matchesQuery(issue: Issue, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    issue.title.toLowerCase().includes(needle) ||
    issue.identifier.toLowerCase().includes(needle) ||
    issue.description.toLowerCase().includes(needle)
  );
}
