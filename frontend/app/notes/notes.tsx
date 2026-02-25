"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { FileX, Search as SearchIcon } from "lucide-react";

const STORAGE_KEY = "notenest-notes";
const DRAFT_KEY = "notenest-note-draft";
const TITLE_MAX_LENGTH = 200;
const PINNED_KEY = "notenest-pinned-notes";

interface Note {
  id: number;
  title: string;
  content?: string;
  createdAt: number;
}

/* ---------- Helpers ---------- */
function loadNotesFromStorage(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotesToStorage(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatRelativeTime(timestamp?: number) {
  if (!timestamp) return "Created recently";

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "Created just now";
  if (minutes < 60) return `Created ${minutes} minutes ago`;
  return `Created ${hours} hours ago`;
}

/* ============================= */

export default function NotesPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const pinnedOnly = searchParams.get("pinned") === "1";
  const { canCreateNote, isViewer } = usePermissions();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedNoteIds, setPinnedNoteIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] =
    useState<"newest" | "oldest" | "az">("newest");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTitleError, setCreateTitleError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Initial load ---------- */
  useEffect(() => {
    setNotes(loadNotesFromStorage());

    const rawPinned = localStorage.getItem(PINNED_KEY);
    if (rawPinned) {
      try {
        setPinnedNoteIds(JSON.parse(rawPinned).map(Number));
      } catch {}
    }

    setIsLoading(false);
  }, []);

  /* ---------- Sync search ---------- */
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  /* ---------- Persist ---------- */
  useEffect(() => {
    if (!isLoading) saveNotesToStorage(notes);
  }, [notes, isLoading]);

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedNoteIds));
  }, [pinnedNoteIds]);

  /* ---------- Filter & sort ---------- */
  const filteredNotes = notes.filter((note) => {
    if (pinnedOnly) return pinnedNoteIds.includes(note.id);
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content?.toLowerCase().includes(q)
    );
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const aPinned = pinnedNoteIds.includes(a.id);
    const bPinned = pinnedNoteIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    if (sortBy === "newest") return b.createdAt - a.createdAt;
    if (sortBy === "oldest") return a.createdAt - b.createdAt;
    return a.title.localeCompare(b.title);
  });

  /* ---------- Create ---------- */
  const handleCreateNote = () => {
    if (!canCreateNote) return;
    setEditingNoteId(null);
    setCreateTitle("");
    setCreateContent("");
    setCreateTitleError("");
    setShowCreateModal(true);
  };

  /* ============================= */

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          title="Notes"
          showSearch
          action={
            canCreateNote && (
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                + Create Note
              </button>
            )
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6">
            {isLoading ? (
              <SkeletonList count={4} />
            ) : sortedNotes.length === 0 ? (
              <EmptyState
                icon={searchQuery ? SearchIcon : FileX}
                title={
                  pinnedOnly
                    ? "No pinned notes"
                    : searchQuery
                    ? "No matching notes"
                    : "No notes yet"
                }
                description={
                  pinnedOnly
                    ? "You haven’t pinned any notes yet."
                    : searchQuery
                    ? `We couldn't find any notes matching "${searchQuery}".`
                    : "Start by creating your first note."
                }
              />
            ) : (
              <ul className="space-y-3">
                {sortedNotes.map((note) => (
                  <li
                    key={note.id}
                    className="border rounded-xl p-4 bg-white"
                  >
                    <h4 className="font-semibold">{note.title}</h4>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(note.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {note.content || "No content"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}