"use client";

import {
  Avatar,
  Button,
  Chip,
  Drawer,
  Input,
  Label,
  Separator,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { IconCalendar, IconPlus } from "@/components/icons";
import { FieldSelect } from "@/components/issue/field-select";
import { DateTimeField, DueDateField } from "@/components/issue/schedule-fields";
import { useWorkspace } from "@/components/workspace-provider";
import { useIssues } from "@/hooks/use-issues";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatTimeRange } from "@/lib/dates";
import {
  addAttachment,
  addComment,
  deleteAttachment,
  deleteComment,
  deleteIssue,
  updateIssue,
} from "@/lib/issue-service";
import { getPersona } from "@/lib/personas";
import { PRIORITIES, STATUSES, type Issue, type Priority, type Status } from "@/lib/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function readFile(file: File): Promise<{ name: string; size: number; type: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ name: file.name, size: file.size, type: file.type, dataUrl: String(reader.result) });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</p>
      {children}
    </div>
  );
}

function AttachmentsSection({ issue }: { issue: Issue }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const attachments = issue.attachments ?? [];

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 5)) {
        if (file.size > 2 * 1024 * 1024) continue; // keep IndexedDB light
        await addAttachment(issue.id, await readFile(file));
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </p>
        <Button
          isPending={uploading}
          size="sm"
          variant="ghost"
          onPress={() => fileInputRef.current?.click()}
        >
          <IconPlus className="size-3.5" />
          Add
        </Button>
        <input
          ref={fileInputRef}
          multiple
          accept="image/*,.pdf,.txt,.md"
          className="hidden"
          type="file"
          onChange={(event) => void onFiles(event.target.files)}
        />
      </div>
      {attachments.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted transition-colors hover:border-accent/50 hover:text-foreground"
        >
          Drop files here or click to upload (max 2 MB)
        </button>
      ) : (
        <div className="flex flex-col gap-1.5">
          {attachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/50 px-2.5 py-2"
            >
              {attachment.type.startsWith("image/") ? (
                <img
                  alt={attachment.name}
                  className="size-8 shrink-0 rounded object-cover"
                  src={attachment.dataUrl}
                />
              ) : (
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-accent/15 text-[10px] font-semibold text-accent">
                  {attachment.name.split(".").pop()?.slice(0, 4).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <a
                  className="block truncate text-xs font-medium hover:underline"
                  download={attachment.name}
                  href={attachment.dataUrl}
                >
                  {attachment.name}
                </a>
                <p className="text-[10px] text-muted">{formatBytes(attachment.size)}</p>
              </div>
              <Button
                isIconOnly
                aria-label={`Remove ${attachment.name}`}
                size="sm"
                variant="ghost"
                onPress={() => deleteAttachment(issue.id, attachment.id)}
              >
                ×
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsSection({ issue }: { issue: Issue }) {
  const { activePersonaId } = useWorkspace();
  const [draft, setDraft] = useState("");
  const persona = getPersona(activePersonaId);
  const comments = issue.comments ?? [];

  async function submit() {
    if (!draft.trim()) return;
    await addComment(issue.id, activePersonaId, draft);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
        Comments {comments.length > 0 && `(${comments.length})`}
      </p>
      {comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const author = getPersona(comment.authorId);
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex gap-2.5"
              >
                <Avatar size="sm">
                  <Avatar.Fallback
                    style={{ backgroundColor: `${author.color}33`, color: author.color }}
                  >
                    {author.initials}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs font-medium">{author.name}</p>
                    <p className="text-[10px] text-muted">{formatRelative(comment.createdAt)}</p>
                    <button
                      type="button"
                      className="ml-auto text-[10px] text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
                      onClick={() => deleteComment(issue.id, comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-snug whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <Avatar size="sm">
          <Avatar.Fallback
            style={{ backgroundColor: `${persona.color}33`, color: persona.color }}
          >
            {persona.initials}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-2">
          <TextArea
            aria-label="Add a comment"
            placeholder="Write a comment..."
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void submit();
              }
            }}
          />
          {draft.trim() && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-muted">⌘↵ to send</span>
              <Button size="sm" onPress={() => void submit()}>
                Comment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IssueDrawer() {
  const { selectedIssueId, closeIssue, activePersonaId } = useWorkspace();
  const issues = useIssues(activePersonaId);
  const liveIssue = issues?.find((item) => item.id === selectedIssueId);
  // Keep rendering the last issue while the drawer animates closed.
  const lastIssueRef = useRef(liveIssue);
  if (liveIssue) lastIssueRef.current = liveIssue;
  const issue = liveIssue ?? (selectedIssueId ? undefined : lastIssueRef.current);
  const loading = Boolean(selectedIssueId) && issues === undefined;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("todo");
  const [priority, setPriority] = useState<Priority>("none");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<string | null>(null);
  const [endAt, setEndAt] = useState<string | null>(null);

  useEffect(() => {
    if (!issue) return;
    setTitle(issue.title);
    setDescription(issue.description);
    setStatus(issue.status);
    setPriority(issue.priority);
    setDueDate(issue.dueDate ?? null);
    setStartAt(issue.startAt ?? null);
    setEndAt(issue.endAt ?? null);
  }, [issue]);

  async function persist(patch: Parameters<typeof updateIssue>[1]) {
    if (!issue) return;
    await updateIssue(issue.id, patch);
  }

  const owner = issue ? getPersona(issue.ownerId) : null;
  const timeRange = issue ? formatTimeRange(issue.startAt, issue.endAt) : null;

  return (
    <Drawer>
      <Drawer.Backdrop isOpen={Boolean(selectedIssueId)} onOpenChange={(open) => !open && closeIssue()}>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="w-[min(100vw,30rem)] max-w-[90vw]">
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <div className="flex items-center gap-2">
                <Drawer.Heading>{issue?.identifier ?? "Issue"}</Drawer.Heading>
                {issue && (
                  <Chip size="sm" variant="soft" color={issue.kind === "event" ? "accent" : "default"}>
                    <span className="flex items-center gap-1">
                      {issue.kind === "event" && <IconCalendar className="size-3" />}
                      {issue.kind === "event" ? "Event" : "Task"}
                    </span>
                  </Chip>
                )}
              </div>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-5">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : !issue ? (
                <p className="text-sm text-muted">This issue is no longer available.</p>
              ) : (
                <>
                  <TextField
                    name="title"
                    value={title}
                    onChange={setTitle}
                    onBlur={() => persist({ title })}
                  >
                    <Label>Title</Label>
                    <Input />
                  </TextField>
                  <TextField
                    name="description"
                    value={description}
                    onChange={setDescription}
                    onBlur={() => persist({ description })}
                  >
                    <Label>Description</Label>
                    <TextArea placeholder="Add context, notes, or links..." rows={4} />
                  </TextField>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <PropertyRow label="Status">
                      <FieldSelect
                        label=""
                        options={STATUSES.map((id) => ({ id, label: STATUS_LABELS[id] }))}
                        value={status}
                        onChange={(next) => {
                          setStatus(next);
                          persist({ status: next });
                        }}
                      />
                    </PropertyRow>
                    <PropertyRow label="Priority">
                      <FieldSelect
                        label=""
                        options={PRIORITIES.map((id) => ({ id, label: PRIORITY_LABELS[id] }))}
                        value={priority}
                        onChange={(next) => {
                          setPriority(next);
                          persist({ priority: next });
                        }}
                      />
                    </PropertyRow>
                    <PropertyRow label="Assignee">
                      <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2">
                        <Avatar size="sm">
                          <Avatar.Fallback
                            style={{
                              backgroundColor: `${owner!.color}33`,
                              color: owner!.color,
                            }}
                          >
                            {owner!.initials}
                          </Avatar.Fallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{owner!.name}</p>
                          <p className="truncate text-[10px] text-muted">{owner!.role}</p>
                        </div>
                      </div>
                    </PropertyRow>
                    <PropertyRow label="Due date">
                      <DueDateField
                        label=""
                        value={dueDate}
                        onChange={(next) => {
                          setDueDate(next);
                          persist({ dueDate: next });
                        }}
                      />
                    </PropertyRow>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
                      Schedule {timeRange && <span className="text-accent normal-case">· {timeRange}</span>}
                    </p>
                    <DateTimeField
                      label="Starts"
                      value={startAt}
                      onChange={(next) => {
                        setStartAt(next);
                        persist({ startAt: next });
                      }}
                    />
                    <DateTimeField
                      label="Ends"
                      value={endAt}
                      onChange={(next) => {
                        setEndAt(next);
                        persist({ endAt: next });
                      }}
                    />
                  </div>

                  <Separator />

                  <AttachmentsSection issue={issue} />

                  <Separator />

                  <CommentsSection issue={issue} />

                  <p className="text-[10px] text-muted">
                    Created {formatRelative(issue.createdAt)} · Updated {formatRelative(issue.updatedAt)}
                  </p>
                </>
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Button
                variant="danger"
                onPress={async () => {
                  if (!issue) return;
                  await deleteIssue(issue.id);
                  closeIssue();
                }}
              >
                Delete
              </Button>
              <Button variant="secondary" onPress={closeIssue}>
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
