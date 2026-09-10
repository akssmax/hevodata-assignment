export const STATUSES = ["backlog", "todo", "in_progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["urgent", "high", "medium", "low", "none"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const KINDS = ["task", "event"] as const;
export type IssueKind = (typeof KINDS)[number];

export const SCOPES = ["work", "personal"] as const;
export type IssueScope = (typeof SCOPES)[number];

export const MEETING_PLATFORMS = ["google_meet", "microsoft_teams"] as const;
export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  identifier: string;
  ownerId: string;
  scope: IssueScope;
  kind: IssueKind;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  rank: string;
  dueDate?: string;
  startAt?: string;
  endAt?: string;
  meetingPlatform?: MeetingPlatform;
  meetingUrl?: string;
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface MetaRow {
  key: string;
  value: number | string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  ownerId: string;
  scope?: IssueScope;
  kind?: IssueKind;
  status?: Status;
  priority?: Priority;
  dueDate?: string;
  startAt?: string;
  endAt?: string;
  meetingPlatform?: MeetingPlatform;
  meetingUrl?: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  kind?: IssueKind;
  scope?: IssueScope;
  status?: Status;
  priority?: Priority;
  rank?: string;
  dueDate?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  meetingPlatform?: MeetingPlatform | null;
  meetingUrl?: string | null;
}
