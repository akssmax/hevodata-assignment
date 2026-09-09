import { IconGoogleMeet, IconMicrosoftTeams } from "@/components/icons";
import type { Issue, MeetingPlatform } from "@/lib/types";

function MeetingPlatformIcon({
  platform,
  className,
}: {
  platform?: MeetingPlatform;
  className?: string;
}) {
  if (platform === "google_meet") return <IconGoogleMeet className={className} />;
  if (platform === "microsoft_teams") return <IconMicrosoftTeams className={className} />;
  return null;
}

export function MeetingJoinLink({
  issue,
  variant = "button",
}: {
  issue: Issue;
  variant?: "button" | "inline";
}) {
  if (issue.kind !== "event" || !issue.meetingUrl) return null;

  const platformLabel =
    issue.meetingPlatform === "google_meet"
      ? "Google Meet"
      : issue.meetingPlatform === "microsoft_teams"
        ? "Microsoft Teams"
        : "Meeting";

  if (variant === "inline") {
    return (
      <a
        href={issue.meetingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
      >
        <MeetingPlatformIcon platform={issue.meetingPlatform} className="size-3.5 shrink-0" />
        Join {platformLabel}
      </a>
    );
  }

  return (
    <a
      href={issue.meetingUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      aria-label={`Join ${platformLabel}: ${issue.title}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background/80 px-2 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-accent/10"
    >
      <MeetingPlatformIcon platform={issue.meetingPlatform} className="size-3.5 shrink-0" />
      Join
    </a>
  );
}
