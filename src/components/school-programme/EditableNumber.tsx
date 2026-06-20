"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number | null;
  onSave: (next: number | null) => Promise<void>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  width?: string;
}

// Click-to-edit number cell. Commits on Enter/blur, cancels on Escape, surfaces
// save failures (e.g. a server validation rejection) by colouring red.
export function EditableNumber({
  value,
  onSave,
  disabled,
  className,
  placeholder = "—",
  width = "w-16",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  if (disabled) {
    return (
      <span className={cn("tabular-nums text-muted-foreground", className)}>
        {value ?? placeholder}
      </span>
    );
  }

  async function commit() {
    const trimmed = draft.trim();
    const next = trimmed === "" ? null : Number(trimmed);
    if (next !== null && Number.isNaN(next)) {
      setError(true);
      return;
    }
    if (next === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(false);
    try {
      await onSave(next);
      setEditing(false);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={draft}
        disabled={saving}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value?.toString() ?? "");
            setEditing(false);
          }
        }}
        className={cn(
          width,
          "rounded border border-input bg-background px-1 py-0.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value?.toString() ?? "");
        setEditing(true);
      }}
      title="Click to edit"
      className={cn(
        // dashed underline signals an editable input vs a plain computed value
        "rounded border-b border-dashed border-muted-foreground/40 px-1 tabular-nums transition-colors hover:border-primary hover:bg-accent",
        error && "border-destructive text-destructive",
        className,
      )}
    >
      {value ?? placeholder}
    </button>
  );
}
