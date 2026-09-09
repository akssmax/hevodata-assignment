import { Chip } from "@heroui/react";
import { STATUS_CHIP } from "@/lib/constants";
import type { Status } from "@/lib/types";

export function StatusChip({ status, size = "sm" }: { status: Status; size?: "sm" | "md" }) {
  const config = STATUS_CHIP[status];
  return (
    <Chip color={config.color} size={size} variant="soft">
      {config.label}
    </Chip>
  );
}
