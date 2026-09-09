"use client";

import { Button, Input, Label, Modal, TextArea, TextField } from "@heroui/react";
import { useEffect, useState } from "react";
import { FieldSelect, PriorityOptionIcon, StatusDotIcon } from "@/components/issue/field-select";
import { DateTimeField, DueDateField } from "@/components/issue/schedule-fields";
import { useWorkspace } from "@/components/workspace-provider";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { createIssue } from "@/lib/issue-service";
import {
  PRIORITIES,
  STATUSES,
  type IssueKind,
  type Priority,
  type Status,
} from "@/lib/types";

const STATUS_OPTIONS = STATUSES.map((id) => ({ id, label: STATUS_LABELS[id] }));
const PRIORITY_OPTIONS = PRIORITIES.map((id) => ({ id, label: PRIORITY_LABELS[id] }));

export function CreateIssueModal() {
  const { createOpen, createDraft, closeCreate, openIssue, activePersonaId } = useWorkspace();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<IssueKind>("task");
  const [status, setStatus] = useState<Status>("todo");
  const [priority, setPriority] = useState<Priority>("none");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<string | null>(null);
  const [endAt, setEndAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!createOpen) return;
    setTitle("");
    setDescription("");
    setKind(createDraft.kind ?? "task");
    setStatus(createDraft.status ?? "todo");
    setPriority("none");
    setDueDate(createDraft.dueDate ?? null);
    setStartAt(createDraft.startAt ?? null);
    setEndAt(createDraft.endAt ?? null);
  }, [createOpen, createDraft]);

  async function submit() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const issue = await createIssue({
        title,
        description,
        ownerId: activePersonaId,
        kind,
        status,
        priority,
        dueDate: dueDate ?? undefined,
        startAt: startAt ?? undefined,
        endAt: endAt ?? undefined,
      });
      closeCreate();
      openIssue(issue.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={createOpen} onOpenChange={(open) => !open && closeCreate()}>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New issue</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <div className="flex gap-2">
                {(["task", "event"] as const).map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={kind === option ? "secondary" : "ghost"}
                    className="flex-1 capitalize"
                    onPress={() => setKind(option)}
                  >
                    {option === "task" ? "Task" : "Event"}
                  </Button>
                ))}
              </div>
              <TextField isRequired name="title" value={title} onChange={setTitle}>
                <Label>Title</Label>
                <Input autoFocus placeholder="What needs to happen?" />
              </TextField>
              <TextField name="description" value={description} onChange={setDescription}>
                <Label>Description</Label>
                <TextArea placeholder="Add context, notes, or a time-box..." rows={3} />
              </TextField>
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Status"
                  options={STATUS_OPTIONS}
                  renderIcon={(id) => <StatusDotIcon status={id} />}
                  value={status}
                  onChange={setStatus}
                />
                <FieldSelect
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  renderIcon={(id) => <PriorityOptionIcon priority={id} />}
                  value={priority}
                  onChange={setPriority}
                />
              </div>
              <DueDateField label="Due date" value={dueDate} onChange={setDueDate} />
              <div className="grid grid-cols-1 gap-3">
                <DateTimeField label="Starts" value={startAt} onChange={setStartAt} />
                <DateTimeField label="Ends" value={endAt} onChange={setEndAt} />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={closeCreate}>
                Cancel
              </Button>
              <Button isDisabled={!title.trim()} isPending={saving} onPress={submit}>
                Create issue
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
