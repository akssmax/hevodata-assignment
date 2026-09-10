import Dexie, { type EntityTable } from "dexie";
import type { Issue, MetaRow } from "./types";

export const db = new Dexie("dayline-app") as Dexie & {
  issues: EntityTable<Issue, "id">;
  meta: EntityTable<MetaRow, "key">;
};

db.version(1).stores({
  issues: "id, identifier, status, priority, startAt, dueDate, [status+rank]",
  meta: "key",
});

db.version(2)
  .stores({
    issues: "id, identifier, ownerId, kind, status, priority, startAt, dueDate, [ownerId+status], [status+rank]",
    meta: "key",
  })
  .upgrade(async (tx) => {
    await tx
      .table("issues")
      .toCollection()
      .modify((issue: Partial<Issue>) => {
        if (!issue.ownerId) issue.ownerId = "arjun";
        if (!issue.kind) issue.kind = "task";
      });
  });

db.version(3)
  .stores({
    issues: "id, identifier, ownerId, kind, status, priority, startAt, dueDate, [ownerId+status], [status+rank]",
    meta: "key",
  })
  .upgrade(async (tx) => {
    await tx
      .table("issues")
      .toCollection()
      .modify((issue: Partial<Issue>) => {
        if (!issue.comments) issue.comments = [];
        if (!issue.attachments) issue.attachments = [];
      });
  });

const PERSONAL_SEED_TITLES = new Set([
  "Gym",
  "Yoga class",
  "Grocery run",
  "Dentist appointment",
  "Call mom",
  "Pick up dry cleaning",
]);

db.version(4)
  .stores({
    issues:
      "id, identifier, ownerId, scope, kind, status, priority, startAt, dueDate, [ownerId+scope], [ownerId+status], [status+rank]",
    meta: "key",
  })
  .upgrade(async (tx) => {
    await tx
      .table("issues")
      .toCollection()
      .modify((issue: Partial<Issue>) => {
        if (!issue.scope) {
          issue.scope = issue.title && PERSONAL_SEED_TITLES.has(issue.title) ? "personal" : "work";
        }
      });
  });
