"use client";

import {
  Avatar,
  Button,
  Chip,
  Input,
  Label,
  Separator,
  TextArea,
  TextField,
  Tooltip,
} from "@heroui/react";
import { useState } from "react";
import {
  IconBoard,
  IconCalendar,
  IconChevron,
  IconChevronRight,
  IconInbox,
  IconList,
  IconPlus,
  IconToday,
  PriorityBars,
} from "@/components/icons";
import { StatusChip } from "@/components/issue/status-chip";
import { PRIORITY_LABELS, STATUS_DOT, STATUS_LABELS } from "@/lib/constants";
import { PERSONAS, personaAvatarStyle } from "@/lib/personas";
import { PRIORITIES, STATUSES } from "@/lib/types";

const ACCENT_SCALE: { step: number; className: string }[] = [
  { step: 50, className: "bg-accent-50" },
  { step: 100, className: "bg-accent-100" },
  { step: 200, className: "bg-accent-200" },
  { step: 300, className: "bg-accent-300" },
  { step: 400, className: "bg-accent-400" },
  { step: 500, className: "bg-accent-500" },
  { step: 600, className: "bg-accent-600" },
  { step: 700, className: "bg-accent-700" },
  { step: 800, className: "bg-accent-800" },
  { step: 900, className: "bg-accent-900" },
  { step: 950, className: "bg-accent-950" },
];

const SEMANTIC = [
  { name: "Background", className: "bg-background", token: "--background" },
  { name: "Surface", className: "bg-surface", token: "--surface" },
  { name: "Default", className: "bg-default", token: "--default" },
  { name: "Border", className: "bg-border", token: "--border" },
  { name: "Foreground", className: "bg-foreground", token: "--foreground" },
  { name: "Muted", className: "bg-muted", token: "--muted" },
  { name: "Accent", className: "bg-accent", token: "--accent" },
  { name: "Success", className: "bg-success", token: "--success" },
  { name: "Warning", className: "bg-warning", token: "--warning" },
  { name: "Danger", className: "bg-danger", token: "--danger" },
];

const KIND_COLORS = [
  { name: "Meeting / event", hex: "#a5b4fc", label: "indigo-300" },
  { name: "Focus block / task", hex: "#6ee7b7", label: "emerald-300" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
      <Separator className="mt-4" />
    </section>
  );
}

function Swatch({
  name,
  className,
  style,
  token,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  token: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="group flex flex-col gap-1.5 text-left"
      onClick={() => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      <span
        className={`h-14 w-full rounded-lg border border-border/60 transition-transform group-hover:scale-[1.03] ${className ?? ""}`}
        style={style}
      />
      <span className="text-xs font-medium">{name}</span>
      <span className="font-mono text-xs text-muted">{copied ? "Copied!" : token}</span>
    </button>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Design system</h1>
        <p className="mt-1 text-sm text-muted">
          The tokens, colors, and components that make up Dayline. Click any swatch to copy
          its token.
        </p>
      </div>

      <Section
        title="Accent scale"
        description="Violet-based accent ramp. 600 is the light-theme accent, 300 the dark-theme accent."
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {ACCENT_SCALE.map(({ step, className }) => (
            <Swatch
              key={step}
              className={className}
              name={`accent-${step}`}
              token={`--color-accent-${step}`}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Semantic colors"
        description="Theme-aware tokens that adapt between light and dark mode."
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {SEMANTIC.map((color) => (
            <Swatch
              key={color.token}
              className={color.className}
              name={color.name}
              token={color.token}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Status colors"
        description="ClickUp-style dots used on the board, list grouping, and chips."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUSES.map((status) => (
            <Swatch
              key={status}
              name={STATUS_LABELS[status]}
              style={{ backgroundColor: STATUS_DOT[status] }}
              token={STATUS_DOT[status]}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </div>
      </Section>

      <Section
        title="Kind colors"
        description="How meetings and focus blocks are distinguished in the day strip, timeline, and calendar."
      >
        <div className="grid grid-cols-2 gap-3">
          {KIND_COLORS.map((color) => (
            <Swatch
              key={color.hex}
              name={color.name}
              style={{ backgroundColor: color.hex }}
              token={color.label}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Persona colors"
        description="Each persona gets a 300-shade identity color for avatars and accents."
      >
        <div className="flex flex-wrap gap-6">
          {PERSONAS.map((persona) => (
            <div key={persona.id} className="flex items-center gap-3">
              <Avatar>
                <Avatar.Fallback style={personaAvatarStyle(persona)}>
                  {persona.initials}
                </Avatar.Fallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{persona.name}</p>
                <p className="font-mono text-xs text-muted">{persona.color}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" description="Geist Sans for UI, Geist Mono for identifiers.">
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-semibold">Heading / 2xl semibold</p>
          <p className="text-lg font-semibold">Heading / lg semibold</p>
          <p className="text-sm font-medium">Title / sm medium</p>
          <p className="text-sm">Body / sm regular — the quick brown fox jumps over the lazy dog.</p>
          <p className="text-xs text-muted">Caption / xs muted — supporting metadata and hints.</p>
          <p className="font-mono text-xs text-muted">DAY-101 / mono identifier</p>
        </div>
      </Section>

      <Section title="Buttons" description="HeroUI button variants used across the app.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button isPending>Saving</Button>
        </div>
      </Section>

      <Section title="Chips" description="Soft chips communicate status, priority, and kind.">
        <div className="flex flex-wrap gap-2">
          <Chip variant="soft">Default</Chip>
          <Chip color="accent" variant="soft">
            Accent
          </Chip>
          <Chip color="success" variant="soft">
            Success
          </Chip>
          <Chip color="warning" variant="soft">
            Warning
          </Chip>
          <Chip color="danger" variant="soft">
            Danger
          </Chip>
        </div>
      </Section>

      <Section title="Priority" description="Signal-bar icons from none to urgent.">
        <div className="flex flex-wrap items-center gap-4">
          {PRIORITIES.map((priority, index) => (
            <span key={priority} className="flex items-center gap-2 text-xs text-muted">
              <PriorityBars level={index as 0 | 1 | 2 | 3 | 4} className="size-4" />
              {PRIORITY_LABELS[priority]}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Form fields" description="HeroUI inputs with labels and placeholders.">
        <div className="grid max-w-md gap-4">
          <TextField name="demo-title">
            <Label>Title</Label>
            <Input placeholder="Design review with the team" />
          </TextField>
          <TextField name="demo-description">
            <Label>Description</Label>
            <TextArea placeholder="Add context, notes, or links..." rows={3} />
          </TextField>
        </div>
      </Section>

      <Section title="Icons" description="Heroicons (24/outline) used throughout the app.">
        <div className="flex flex-wrap gap-5">
          {[
            { name: "Today", icon: IconToday },
            { name: "Board", icon: IconBoard },
            { name: "Calendar", icon: IconCalendar },
            { name: "List", icon: IconList },
            { name: "Inbox", icon: IconInbox },
            { name: "Plus", icon: IconPlus },
            { name: "ChevronLeft", icon: IconChevron },
            { name: "ChevronRight", icon: IconChevronRight },
          ].map(({ name, icon: Icon }) => (
            <Tooltip key={name}>
              <Tooltip.Trigger>
                <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface/60 text-muted">
                  <Icon className="size-5" />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content placement="top">{name}</Tooltip.Content>
            </Tooltip>
          ))}
        </div>
      </Section>
    </div>
  );
}
