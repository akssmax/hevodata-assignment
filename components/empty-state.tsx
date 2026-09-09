"use client";

import { Button } from "@heroui/react";
import { motion } from "framer-motion";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-8 text-center"
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-xs text-xs text-muted">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-1" size="sm" variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
