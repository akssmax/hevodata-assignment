"use client";

import {
  Avatar,
  Button,
  Chip,
  Drawer,
  Input,
  Separator,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  CalendarDaysIcon,
  ClockIcon,
  FlagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { IconCalendar, IconPlus } from "@/components/icons";
import { MeetingJoinLink } from "@/components/issue/meeting-join";
import { FieldSelect, PriorityOptionIcon, StatusDotIcon } from "@/components/issue/field-select";
import { ScopeIcon, ScopeOptionIcon } from "@/components/issue/scope-badge";
import { PropertyField } from "@/components/issue/issue-property-field";
import { PriorityIcon } from "@/components/issue/priority-icon";
import { DateTimeField, DueDateField } from "@/components/issue/schedule-fields";
import { useWorkspace } from "@/components/workspace-provider";
import { useIssue } from "@/hooks/use-issues";
import { PRIORITY_LABELS, SCOPE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDayLabel, formatTime, formatTimeRange, parseDateKey } from "@/lib/dates";
import {
  addAttachment,
  addComment,
  deleteAttachment,
  deleteComment,
  deleteIssue,
  updateIssue,
} from "@/lib/issue-service";
import { getPersona, personaAvatarStyle } from "@/lib/personas";
import {
  PRIORITIES,
  SCOPES,
  STATUSES,
  type Issue,
  type IssueScope,
  type Priority,
  type Status,
} from "@/lib/types";

const STATUS_OPTIONS = STATUSES.map((id) => ({ id, label: STATUS_LABELS[id] }));
const PRIORITY_OPTIONS = PRIORITIES.map((id) => ({ id, label: PRIORITY_LABELS[id] }));
const SCOPE_OPTIONS = SCOPES.map((id) => ({ id, label: SCOPE_LABELS[id] }));

const MAX_ATTACHMENT_FILES = 5;
/** Attachments are stored inline as data URLs, so keep them small. */
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

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

function EmptyValue({ children = "Empty" }: { children?: string }) {
  return <span className="text-muted">{children}</span>;
}

function formatDueSummary(dateKey: string | null): React.ReactNode {
  if (!dateKey) return <EmptyValue />;
  return formatDayLabel(parseDateKey(dateKey));
}

function formatDateTimeSummary(iso: string | null): React.ReactNode {
  if (!iso) return <EmptyValue />;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return <EmptyValue />;
  return `${formatDayLabel(date)} · ${formatTime(iso)}`;
}

function AttachmentsSection({ issue }: { issue: Issue }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const attachments = issue.attachments ?? [];

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setNotice(null);
    setUploading(true);

    const selected = Array.from(files);
    const withinLimit = selected.slice(0, MAX_ATTACHMENT_FILES);
    const eligible = withinLimit.filter((file) => file.size <= MAX_ATTACHMENT_BYTES);
    const skipped: string[] = [];

    if (selected.length > MAX_ATTACHMENT_FILES) {
      skipped.push(`Only the first ${MAX_ATTACHMENT_FILES} files were added.`);
    }

    const oversized = withinLimit.length - eligible.length;
    if (oversized > 0) {
      skipped.push(`${oversized} file${oversized === 1 ? "" : "s"} skipped for exceeding 2 MB.`);
    }

    try {
      const results = await Promise.allSettled(
        eligible.map((file) => readFile(file).then((data) => addAttachment(issue.id, data))),
      );
      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        console.error("Attachment upload failed", failed);
        skipped.push(
          `${failed.length} file${failed.length === 1 ? "" : "s"} could not be saved. Your browser storage may be full.`,
        );
      }
    } finally {
      setUploading(false);
      setNotice(skipped.length > 0 ? skipped.join(" ") : null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div
      className="flex flex-col gap-2"
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        void onFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
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
      {notice && (
        <p role="status" className="text-xs leading-relaxed text-danger">
          {notice}
        </p>
      )}
      {attachments.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-lg border border-dashed px-3 py-4 text-center text-xs transition-colors ${
            dragActive
              ? "border-accent bg-accent/5 text-foreground"
              : "border-border text-muted hover:border-accent/50 hover:text-foreground"
          }`}
        >
          Drop files here or click to upload (max 2 MB)
        </button>
      ) : (
        <div
          className={`flex flex-col gap-1.5 rounded-lg transition-colors ${
            dragActive ? "ring-1 ring-accent ring-offset-2 ring-offset-background" : ""
          }`}
        >
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
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-accent/15 text-xs font-semibold text-accent">
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
                <p className="text-xs text-muted">{formatBytes(attachment.size)}</p>
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
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
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
                  <Avatar.Fallback style={personaAvatarStyle(author)}>
                    {author.initials}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs font-medium">{author.name}</p>
                    <p className="text-xs text-muted">{formatRelative(comment.createdAt)}</p>
                    <button
                      type="button"
                      aria-label={`Delete comment by ${author.name}`}
                      className="ml-auto min-h-11 min-w-11 text-xs text-muted opacity-100 transition-opacity hover:text-danger focus-visible:opacity-100 md:min-h-0 md:min-w-0 md:opacity-0 md:group-hover:opacity-100"
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
          <Avatar.Fallback style={personaAvatarStyle(persona)}>
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
              <span className="text-xs text-muted">⌘↵ to send</span>
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
  const { selectedIssueId, closeIssue } = useWorkspace();
  const liveIssue = useIssue(selectedIssueId);
  // Keep rendering the last issue while the drawer animates closed.
  const lastIssueRef = useRef(liveIssue);
  if (liveIssue) lastIssueRef.current = liveIssue;
  const issue = liveIssue ?? (selectedIssueId ? undefined : lastIssueRef.current);
  const loading = Boolean(selectedIssueId) && liveIssue === undefined;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("todo");
  const [scope, setScope] = useState<IssueScope>("work");
  const [priority, setPriority] = useState<Priority>("none");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<string | null>(null);
  const [endAt, setEndAt] = useState<string | null>(null);
  // Tracking the armed issue id means a pending delete can never carry over to another issue.
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const confirmingDelete = confirmTarget !== null && confirmTarget === selectedIssueId;

  useEffect(() => {
    if (!confirmingDelete) return;
    const timer = setTimeout(() => setConfirmTarget(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmingDelete]);

  useEffect(() => {
    if (!issue) return;
    setTitle(issue.title);
    setDescription(issue.description);
    setStatus(issue.status);
    setScope(issue.scope);
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
          <Drawer.Dialog className="w-full max-w-none md:w-[min(100vw,30rem)] md:max-w-[90vw]">
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
            <Drawer.Body className="flex flex-col gap-4">
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
                    <Input
                      className="border-transparent bg-transparent px-0 text-lg font-semibold shadow-none transition-colors hover:bg-surface/40 focus:bg-surface/40"
                      placeholder="Issue title"
                    />
                  </TextField>

                  <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-surface/20 px-1 py-1">
                    <PropertyField
                      label="Status"
                      icon={<StatusDotIcon status={status} />}
                      summary={
                        <span className="flex items-center gap-2">
                          <StatusDotIcon status={status} />
                          {STATUS_LABELS[status]}
                        </span>
                      }
                    >
                      <FieldSelect
                        compact
                        options={STATUS_OPTIONS}
                        renderIcon={(id) => <StatusDotIcon status={id} />}
                        value={status}
                        onChange={(next) => {
                          setStatus(next);
                          persist({ status: next });
                        }}
                      />
                    </PropertyField>

                    <PropertyField
                      label="Scope"
                      icon={<ScopeIcon scope={scope} className="size-3.5" />}
                      summary={
                        <span className="flex items-center gap-2">
                          <ScopeIcon scope={scope} />
                          {SCOPE_LABELS[scope]}
                        </span>
                      }
                    >
                      <FieldSelect
                        compact
                        options={SCOPE_OPTIONS}
                        renderIcon={(id) => <ScopeOptionIcon scope={id} />}
                        value={scope}
                        onChange={(next) => {
                          setScope(next);
                          persist({ scope: next });
                        }}
                      />
                    </PropertyField>

                    <PropertyField
                      label="Priority"
                      icon={<FlagIcon className="size-3.5" />}
                      summary={
                        priority === "none" ? (
                          <EmptyValue />
                        ) : (
                          <span className="flex items-center gap-2">
                            <PriorityIcon priority={priority} />
                            {PRIORITY_LABELS[priority]}
                          </span>
                        )
                      }
                    >
                      <FieldSelect
                        compact
                        options={PRIORITY_OPTIONS}
                        renderIcon={(id) => <PriorityOptionIcon priority={id} />}
                        value={priority}
                        onChange={(next) => {
                          setPriority(next);
                          persist({ priority: next });
                        }}
                      />
                    </PropertyField>

                    <PropertyField
                      interactive={false}
                      label="Assignee"
                      icon={<UserCircleIcon className="size-3.5" />}
                      summary={
                        <span className="flex items-center gap-2">
                          <Avatar size="sm">
                            <Avatar.Fallback style={personaAvatarStyle(owner!)}>
                              {owner!.initials}
                            </Avatar.Fallback>
                          </Avatar>
                          {owner!.name}
                        </span>
                      }
                    />

                    <PropertyField
                      label="Due date"
                      icon={<CalendarDaysIcon className="size-3.5" />}
                      summary={formatDueSummary(dueDate)}
                    >
                      <DueDateField
                        compact
                        value={dueDate}
                        onChange={(next) => {
                          setDueDate(next);
                          persist({ dueDate: next });
                        }}
                      />
                    </PropertyField>

                    <PropertyField
                      label="Starts"
                      icon={<ClockIcon className="size-3.5" />}
                      summary={formatDateTimeSummary(startAt)}
                    >
                      <DateTimeField
                        compact
                        label=""
                        ariaLabel="Start"
                        value={startAt}
                        onChange={(next) => {
                          setStartAt(next);
                          persist({ startAt: next });
                        }}
                      />
                    </PropertyField>

                    <PropertyField
                      label="Ends"
                      icon={<ClockIcon className="size-3.5" />}
                      summary={formatDateTimeSummary(endAt)}
                    >
                      <DateTimeField
                        compact
                        label=""
                        ariaLabel="End"
                        value={endAt}
                        onChange={(next) => {
                          setEndAt(next);
                          persist({ endAt: next });
                        }}
                      />
                    </PropertyField>
                  </div>

                  {issue.kind === "event" && issue.meetingUrl && (
                    <MeetingJoinLink issue={issue} variant="inline" />
                  )}

                  {timeRange && (
                    <p className="px-2 text-xs text-muted">
                      Scheduled <span className="text-foreground/80">{timeRange}</span>
                    </p>
                  )}

                  <TextField
                    name="description"
                    value={description}
                    onChange={setDescription}
                    onBlur={() => persist({ description })}
                  >
                    <TextArea
                      className="min-h-[5rem] rounded-lg border-transparent bg-default/40 px-2 shadow-none transition-colors hover:bg-surface/50 focus:bg-surface/50"
                      placeholder="Add description, or write with context..."
                      rows={4}
                    />
                  </TextField>

                  <Separator />

                  <AttachmentsSection issue={issue} />

                  <Separator />

                  <CommentsSection issue={issue} />

                  <p className="text-xs text-muted">
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
                  if (!confirmingDelete) {
                    setConfirmTarget(issue.id);
                    return;
                  }
                  await deleteIssue(issue.id);
                  setConfirmTarget(null);
                  closeIssue();
                }}
              >
                {confirmingDelete ? "Confirm delete" : "Delete"}
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
                  if (confirmingDelete) {
                    setConfirmTarget(null);
                    return;
                  }
                  closeIssue();
                }}
              >
                {confirmingDelete ? "Cancel" : "Close"}
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
