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

  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const pinnedOnly = searchParams.get("pinned") === "1";
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  /* ---------- Actions ---------- */
  const togglePin = (id: number) => {
    setPinnedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setCreateTitle(note.title);
    setCreateContent(note.content || "");
    setShowCreateModal(true);
  };

  const handleDeleteNote = (note: Note) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    setPinnedNoteIds((prev) => prev.filter((id) => id !== note.id));
  };

  /* ============================= */

  return (
    <>
      <div className="flex">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Header title="Notes" showSearch />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6">
              {isLoading ? (
                <SkeletonList count={4} />
              ) : sortedNotes.length === 0 ? (
                <EmptyState
                  icon={searchQuery ? SearchIcon : FileX}
                  title="No notes found"
                  description="Try adjusting your search or create a new note."
                />
              ) : (
                <ul className="space-y-3">
                  {sortedNotes.map((note) => (
                    <li
                      key={note.id}
                      className="border rounded-xl p-4 bg-white flex justify-between"
                    >
                      <div>
                        <h4 className="font-semibold">{note.title}</h4>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(note.createdAt)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {note.content || "No content"}
                        </p>
                      </div>

                      {!isViewer && (
                        <div className="flex gap-2">
                          {/* PIN */}
                          <button
                            aria-label={
                              pinnedNoteIds.includes(note.id)
                                ? "Unpin note"
                                : "Pin note"
                            }
                            onClick={() => togglePin(note.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                togglePin(note.id);
                              }
                            }}
                            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          >
                            {pinnedNoteIds.includes(note.id) ? "📌" : "📍"}
                          </button>

                          {/* EDIT */}
                          <button
                            aria-label="Edit note"
                            onClick={() => handleEditNote(note)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleEditNote(note);
                              }
                            }}
                            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          >
                            ✏️
                          </button>

                          {/* DELETE */}
                          <button
                            aria-label="Delete note"
                            onClick={() => handleDeleteNote(note)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleDeleteNote(note);
                              }
                            }}
                            className="focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}