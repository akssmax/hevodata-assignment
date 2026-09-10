"use client";

import { Label, ListBox, Select } from "@heroui/react";
import { PriorityIcon } from "@/components/issue/priority-icon";
import { STATUS_DOT } from "@/lib/constants";
import type { Priority, Status } from "@/lib/types";

export function StatusDotIcon({ status }: { status: Status }) {
  return (
    <span
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: STATUS_DOT[status] }}
    />
  );
}

export function PriorityOptionIcon({ priority }: { priority: Priority }) {
  return <PriorityIcon className="size-3.5 shrink-0" priority={priority} />;
}

export function FieldSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  renderIcon,
  compact = false,
}: {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
  renderIcon?: (id: T) => React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Select
      className="w-full"
      value={value}
      onChange={(key) => {
        if (key != null) onChange(String(key) as T);
      }}
    >
      {label ? <Label>{label}</Label> : null}
      <Select.Trigger className={compact ? "min-h-8 h-8 py-0 text-xs" : undefined}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
              <span className="flex items-center gap-2">
                {renderIcon?.(option.id)}
                {option.label}
              </span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
