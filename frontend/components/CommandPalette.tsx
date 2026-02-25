"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { apiService } from "@/lib/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Note } from "../../shared/types";
import { Search, FileText, Plus, List, Home, Info } from "lucide-react";

export type CommandPaletteCommand = {
  id: string;
  label: string;
  keywords?: string[];
  action: () => void;
  icon?: React.ReactNode;
};

const isTypingElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  const role = target.getAttribute?.("role") ?? "";
  if (target.getAttribute?.("contenteditable") === "true") return true;
  if (tagName === "input" || tagName === "textarea" || tagName === "select") return true;
  if (role === "textbox" || role === "searchbox") return true;
  return false;
};

function filterCommands(commands: CommandPaletteCommand[], query: string): CommandPaletteCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((c) => {
    const labelMatch = c.label.toLowerCase().includes(q);
    const keywordMatch = c.keywords?.some((k) => k.toLowerCase().includes(q));
    return labelMatch || keywordMatch;
  });
}

interface CommandPaletteProps {
  /** Commands to show. If not provided, default MVP commands are used. */
  commands?: CommandPaletteCommand[];
}

export default function CommandPalette({ commands: customCommands }: CommandPaletteProps = {}) {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultCommands: CommandPaletteCommand[] = [
    {
      id: "create-note",
      label: "Create New Note",
      keywords: ["new", "add", "note", "create"],
      action: () => router.push(`/workspace/${activeWorkspace.id}/notes?new=1`),
      icon: <span className="bg-green-100 text-green-700 p-1.5 rounded-lg"><Plus className="w-4 h-4" /></span>
    },
    {
      id: "go-dashboard",
      label: "Go to Dashboard",
      keywords: ["dashboard", "home", "stats"],
      action: () => router.push(`/workspace/${activeWorkspace.id}/dashboard`),
      icon: <span className="bg-purple-100 text-purple-700 p-1.5 rounded-lg"><Home className="w-4 h-4" /></span>
    },
    {
      id: "go-notes",
      label: "Browse All Notes",
      keywords: ["notes", "list", "all"],
      action: () => router.push(`/workspace/${activeWorkspace.id}/notes`),
      icon: <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><List className="w-4 h-4" /></span>
    },
    {
      id: "help-shortcuts",
      label: "Keyboard Shortcuts",
      keywords: ["help", "kbd", "shortcuts"],
      action: () => {
        setOpen(false);
        // Placeholder for shortcuts modal
        alert("Keyboard Shortcuts:\nCtrl+K: Open Global Search\nCtrl+S: Save Note\n(More coming soon!)");
      },
      icon: <span className="bg-gray-100 text-gray-700 p-1.5 rounded-lg"><Info className="w-4 h-4" /></span>
    },
  ];

  const noteCommands: CommandPaletteCommand[] = notes.map(note => ({
    id: `note-${note._id}`,
    label: note.title || "Untitled Note",
    keywords: ["note", ...(note.tags || [])],
    action: () => router.push(`/workspace/${activeWorkspace.id}/notes?id=${note._id}`),
    icon: <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-lg"><FileText className="w-4 h-4" /></span>
  }));

  const commands = customCommands ?? [...defaultCommands, ...noteCommands];
  const filtered = filterCommands(commands, query);
  const selectedCommand = filtered[selectedIndex] ?? null;

  const fetchNotes = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      setIsLoadingNotes(true);
      const data = await apiService.getNotesForWorkspace(activeWorkspace.id);
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes for search:", err);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [activeWorkspace?.id]);

  const openPalette = useCallback(() => {
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    setQuery("");
    setSelectedIndex(0);
    fetchNotes();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [fetchNotes]);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
    requestAnimationFrame(() => {
      previousActiveRef.current?.focus?.();
      previousActiveRef.current = null;
    });
  }, []);

  const runCommand = useCallback(
    (cmd: CommandPaletteCommand) => {
      closePalette();
      cmd.action();
    },
    [closePalette]
  );

  // Open on Cmd+K / Ctrl+K; close on same shortcut when open (even if focus in search input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "k" || (!e.metaKey && !e.ctrlKey)) return;
      if (open) {
        e.preventDefault();
        closePalette();
        return;
      }
      if (isTypingElement(e.target)) return;
      e.preventDefault();
      openPalette();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, openPalette, closePalette]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
      }
    };
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [open, closePalette]);

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Clamp selected index to filtered length
  useEffect(() => {
    if (selectedIndex >= filtered.length && filtered.length > 0) {
      setSelectedIndex(filtered.length - 1);
    }
  }, [filtered.length, selectedIndex]);

  // Keyboard navigation inside palette (Arrow Up/Down, Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(1, filtered.length));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length));
      return;
    }
    if (e.key === "Enter" && selectedCommand) {
      e.preventDefault();
      runCommand(selectedCommand);
      return;
    }
  };

  // Focus trap: keep focus within dialog when tabbing
  useEffect(() => {
    if (!open || !containerRef.current) return;
    const el = containerRef.current;
    const focusables = el.querySelectorAll<HTMLElement>(
      'input, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-fade-in"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      ref={containerRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: "var(--color-background)",
          borderColor: "var(--color-border-light)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--color-border-light)" }}>
          <svg
            className="w-5 h-5 shrink-0"
            style={{ color: "var(--color-text-muted)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Search commands"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:opacity-70"
            style={{
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-base)",
            }}
          />
          <kbd
            className="hidden sm:inline-flex items-center rounded px-2 py-0.5 text-xs font-medium shrink-0"
            style={{
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border-light)",
              background: "var(--color-background)",
            }}
          >
            Esc
          </kbd>
        </div>
        <ul
          ref={listRef}
          className="max-h-[min(60vh,400px)] overflow-auto py-2"
          role="listbox"
          aria-label="Commands"
          aria-activedescendant={selectedCommand ? `cmd-${selectedCommand.id}` : undefined}
        >
          {filtered.length === 0 ? (
            <li
              className="px-4 py-3 text-sm"
              style={{ color: "var(--color-text-muted)" }}
              role="option"
            >
              No commands found.
            </li>
          ) : (
            filtered.map((cmd, i) => (
              <li
                key={cmd.id}
                id={`cmd-${cmd.id}`}
                role="option"
                aria-selected={i === selectedIndex}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: i === selectedIndex ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  color: i === selectedIndex ? "var(--color-info)" : "var(--color-text-primary)",
                }}
                onClick={() => runCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {cmd.icon ?? (
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{
                      background: i === selectedIndex ? "rgba(59, 130, 246, 0.15)" : "var(--color-border-light)",
                      color: i === selectedIndex ? "var(--color-info)" : "var(--color-text-muted)",
                    }}
                    aria-hidden
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                )}
                <span className="font-medium text-sm">{cmd.label}</span>
              </li>
            ))
          )}
        </ul>
        <div
          className="px-4 py-2 border-t flex items-center gap-2 text-xs"
          style={{ borderColor: "var(--color-border-light)", color: "var(--color-text-muted)" }}
        >
          <span>↑↓ navigate</span>
          <span>·</span>
          <span>↵ select</span>
          <span>·</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
}
