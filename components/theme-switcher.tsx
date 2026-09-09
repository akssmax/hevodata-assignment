"use client";

import { Button } from "@heroui/react";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { id: "light", label: "Light", icon: SunIcon },
  { id: "dark", label: "Dark", icon: MoonIcon },
  { id: "system", label: "System", icon: ComputerDesktopIcon },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-default/60 p-1">
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.id;
        const Icon = option.icon;
        return (
          <Button
            key={option.id}
            size="sm"
            variant={active ? "secondary" : "ghost"}
            className="flex-1 gap-1.5 text-xs"
            onPress={() => setTheme(option.id)}
          >
            <Icon aria-hidden className="size-3.5 shrink-0" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
