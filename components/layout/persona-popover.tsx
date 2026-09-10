"use client";

import { Avatar, Popover, Separator } from "@heroui/react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useWorkspace } from "@/components/workspace-provider";
import { PERSONAS, getPersona, personaAvatarStyle } from "@/lib/personas";

export function PersonaPopover({
  collapsed = false,
  compact = false,
}: {
  collapsed?: boolean;
  /** Icon-only trigger for mobile topbar. */
  compact?: boolean;
}) {
  const { activePersonaId, setActivePersona } = useWorkspace();
  const active = getPersona(activePersonaId);

  return (
    <Popover>
      <Popover.Trigger aria-label="Switch persona">
        {compact ? (
          <button
            type="button"
            className="touch-target flex shrink-0 items-center justify-center rounded-full"
          >
            <Avatar size="sm">
              <Avatar.Fallback style={personaAvatarStyle(active)}>
                {active.initials}
              </Avatar.Fallback>
            </Avatar>
          </button>
        ) : (
          <div
            className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-default/60 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <Avatar size="sm">
              <Avatar.Fallback style={personaAvatarStyle(active)}>
                {active.initials}
              </Avatar.Fallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{active.name}</p>
                <p className="truncate text-xs text-muted">{active.role}</p>
              </div>
            )}
          </div>
        )}
      </Popover.Trigger>
      <Popover.Content
        className="w-72"
        placement={compact ? "bottom" : collapsed ? "right" : "top"}
      >
        <Popover.Dialog>
          <Popover.Arrow />
          <Popover.Heading>Switch workspace</Popover.Heading>
          <div className="mt-2 flex flex-col gap-1">
            {PERSONAS.map((persona) => {
              const isActive = persona.id === activePersonaId;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setActivePersona(persona.id)}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                    isActive ? "bg-accent/10" : "hover:bg-default/60"
                  }`}
                >
                  <Avatar size="sm">
                    <Avatar.Fallback style={personaAvatarStyle(persona)}>
                      {persona.initials}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{persona.name}</p>
                    <p className="truncate text-xs text-muted">{persona.role}</p>
                  </div>
                  {isActive && (
                    <span className="size-2 rounded-full" style={{ backgroundColor: persona.color }} />
                  )}
                </button>
              );
            })}
          </div>
          <Separator className="my-3" />
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">Theme</p>
          <ThemeSwitcher />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
