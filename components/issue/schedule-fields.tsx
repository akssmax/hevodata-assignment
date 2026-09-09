"use client";

import { Button, Calendar, DateField, DatePicker, Label, TimeField } from "@heroui/react";
import {
  CalendarDate,
  Time,
  type DateValue,
} from "@internationalized/date";
import { toDateKey } from "@/lib/dates";

function toCalendarDate(dateKey?: string | null): CalendarDate | null {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new CalendarDate(year, month, day);
}

function fromDateValue(value: DateValue | null): string | null {
  if (!value) return null;
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

function splitIso(iso?: string | null): { day: CalendarDate | null; time: Time | null } {
  if (!iso) return { day: null, time: null };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { day: null, time: null };
  return {
    day: new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
    time: new Time(date.getHours(), date.getMinutes()),
  };
}

function combineIso(day: CalendarDate | null, time: Time | null): string | null {
  if (!day) return null;
  const date = new Date(day.year, day.month - 1, day.day, time?.hour ?? 9, time?.minute ?? 0, 0, 0);
  return date.toISOString();
}

function CalendarGrid() {
  return (
    <Calendar.Grid>
      <Calendar.GridHeader>
        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
      </Calendar.GridHeader>
      <Calendar.GridBody>
        {(date) => <Calendar.Cell date={date} />}
      </Calendar.GridBody>
    </Calendar.Grid>
  );
}

function CalendarChrome() {
  return (
    <>
      <Calendar.Header>
        <Calendar.NavButton slot="previous" />
        <Calendar.Heading />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <CalendarGrid />
    </>
  );
}

export function DueDateField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <DatePicker
      aria-label={label ?? "Due date"}
      value={toCalendarDate(value)}
      onChange={(next) => onChange(fromDateValue(next))}
    >
      {label ? <Label>{label}</Label> : null}
      <DatePicker.Trigger>
        <DateField.Group>
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.Group>
        <DatePicker.TriggerIndicator />
      </DatePicker.Trigger>
      <DatePicker.Popover>
        <Calendar aria-label={label}>
          <CalendarChrome />
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

export function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { day, time } = splitIso(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {value && (
          <Button size="sm" variant="ghost" onPress={() => onChange(null)}>
            Clear
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DatePicker
          aria-label={`${label} date`}
          className="w-40"
          value={day}
          onChange={(next) => onChange(combineIso(next, time ?? new Time(9, 0)))}
        >
          <DatePicker.Trigger>
            <DateField.Group>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.Group>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
          <DatePicker.Popover>
            <Calendar aria-label={`${label} date`}>
              <CalendarChrome />
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>
        <TimeField
          aria-label={`${label} time`}
          className="w-24"
          value={time}
          onChange={(next) => {
            if (!next) return;
            const base = day ?? toCalendarDate(toDateKey(new Date()));
            onChange(combineIso(base, next as Time));
          }}
        >
          <TimeField.Group>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
        </TimeField>
      </div>
    </div>
  );
}
