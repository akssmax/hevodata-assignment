"use client";

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-default/60 p-1">
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.id;
        return (
          <Button
            key={option.id}
            size="sm"
            variant={active ? "secondary" : "ghost"}
            className="flex-1 text-xs"
            onPress={() => setTheme(option.id)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
