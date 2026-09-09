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
