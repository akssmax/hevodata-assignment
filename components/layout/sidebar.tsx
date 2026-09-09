"use client";

import { Avatar, Button, Popover, Separator, Tooltip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBoard,
  IconCalendar,
  IconChevron,
  IconInbox,
  IconList,
  IconPlus,
  IconSwatch,
  IconToday,
  Logo,
} from "@/components/icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useWorkspace } from "@/components/workspace-provider";
import { PERSONAS, getPersona } from "@/lib/personas";

const NAV = [
  { href: "/", label: "Today", icon: IconToday },
  { href: "/board", label: "Board", icon: IconBoard },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/issues", label: "Issues", icon: IconList },
  { href: "/design-system", label: "Design system", icon: IconSwatch },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={href}
      aria-label={label}
      className={`relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
        collapsed ? "justify-center" : ""
      } ${active ? "text-foreground" : "text-muted hover:text-foreground"}`}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-md bg-accent/15"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <Icon className="relative z-10 size-4 shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="relative z-10"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <Tooltip.Trigger>{link}</Tooltip.Trigger>
      <Tooltip.Content placement="right">{label}</Tooltip.Content>
    </Tooltip>
  );
}

function PersonaPopover({ collapsed }: { collapsed: boolean }) {
  const { activePersonaId, setActivePersona } = useWorkspace();
  const active = getPersona(activePersonaId);

  return (
    <Popover>
      <Popover.Trigger aria-label="Switch persona">
        <div
          className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-default/60 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <Avatar size="sm">
            <Avatar.Fallback
              style={{ backgroundColor: `${active.color}33`, color: active.color }}
            >
              {active.initials}
            </Avatar.Fallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{active.name}</p>
              <p className="truncate text-[11px] text-muted">{active.role}</p>
            </div>
          )}
        </div>
      </Popover.Trigger>
      <Popover.Content className="w-72" placement={collapsed ? "right" : "top"}>
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
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                    isActive ? "bg-accent/10" : "hover:bg-default/60"
                  }`}
                >
                  <Avatar size="sm">
                    <Avatar.Fallback
                      style={{ backgroundColor: `${persona.color}33`, color: persona.color }}
                    >
                      {persona.initials}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{persona.name}</p>
                    <p className="truncate text-[11px] text-muted">{persona.role}</p>
                  </div>
                  {isActive && (
                    <span className="size-2 rounded-full" style={{ backgroundColor: persona.color }} />
                  )}
                </button>
              );
            })}
          </div>
          <Separator className="my-3" />
          <p className="mb-1.5 text-[11px] font-medium tracking-wide text-muted uppercase">
            Theme
          </p>
          <ThemeSwitcher />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { openCreate, sidebarCollapsed, toggleSidebar } = useWorkspace();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 224 }}
      transition={{ type: "spring", stiffness: 400, damping: 38 }}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-surface/40"
    >
      <div className={`flex items-center gap-2.5 px-4 py-4 ${sidebarCollapsed ? "justify-center px-2" : ""}`}>
        <Logo />
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-sm font-semibold tracking-tight">Dayline</p>
              <p className="text-[11px] text-muted">Personal workspace</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`px-3 pb-3 ${sidebarCollapsed ? "flex justify-center px-2" : ""}`}>
        {sidebarCollapsed ? (
          <Tooltip>
            <Tooltip.Trigger>
              <Button isIconOnly aria-label="New issue" size="sm" onPress={() => openCreate()}>
                <IconPlus className="size-3.5" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="right">New issue (C)</Tooltip.Content>
          </Tooltip>
        ) : (
          <Button className="w-full justify-start" size="sm" onPress={() => openCreate()}>
            <IconPlus className="size-3.5" />
            New issue
          </Button>
        )}
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 px-2 py-3">
        <PersonaPopover collapsed={sidebarCollapsed} />
        {sidebarCollapsed ? (
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                aria-label="Expand sidebar"
                size="sm"
                variant="ghost"
                onPress={toggleSidebar}
              >
                <IconChevron className="size-4 rotate-180" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="right">Expand</Tooltip.Content>
          </Tooltip>
        ) : (
          <div className="flex items-center justify-between px-2">
            <p className="text-[11px] text-muted">
              Press <span className="font-mono text-foreground/80">C</span> to create
            </p>
            <Button
              isIconOnly
              aria-label="Collapse sidebar"
              size="sm"
              variant="ghost"
              onPress={toggleSidebar}
            >
              <IconChevron className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
