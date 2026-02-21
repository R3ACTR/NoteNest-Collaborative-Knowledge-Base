"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";

const STORAGE_KEY = "notenest-notes";
const DRAFT_KEY = "notenest-note-draft";
const TITLE_MAX_LENGTH = 200;

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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] =
    useState<"newest" | "oldest" | "az">("newest");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTitleError, setCreateTitleError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Undo delete ---------- */
  const [recentlyDeleted, setRecentlyDeleted] = useState<Note | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createButtonRef = useRef<HTMLButtonElement>(null);

  /* ---------- Initial load ---------- */
  useEffect(() => {
    const stored = loadNotesFromStorage();
    setNotes(stored);
    setIsLoading(false);
  }, []);

  /* ---------- Sync search ---------- */
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  /* ---------- Persist notes ---------- */
  useEffect(() => {
    if (!isLoading) saveNotesToStorage(notes);
  }, [notes, isLoading]);

  /* ---------- Restore draft ---------- */
  useEffect(() => {
    if (!showCreateModal) return;

    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw);
      setCreateTitle(draft.title || "");
      setCreateContent(draft.content || "");
    } catch {}
  }, [showCreateModal]);

  /* ---------- Autosave draft ---------- */
  useEffect(() => {
    if (!showCreateModal) return;

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ title: createTitle, content: createContent })
    );
  }, [createTitle, createContent, showCreateModal]);

  /* ---------- Filter & sort ---------- */
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content?.toLowerCase().includes(q)
    );
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
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

  /* ---------- Edit ---------- */
  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setCreateTitle(note.title);
    setCreateContent(note.content || "");
    setShowCreateModal(true);
  };

  /* ---------- Submit ---------- */
  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const title = createTitle.trim();
    if (!title) {
      setCreateTitleError("Title is required");
      return;
    }

    if (title.length > TITLE_MAX_LENGTH) {
      setCreateTitleError(
        `Title must be ${TITLE_MAX_LENGTH} characters or less`
      );
      return;
    }

    setIsSubmitting(true);

    setNotes((prev) =>
      editingNoteId
        ? prev.map((n) =>
            n.id === editingNoteId
              ? { ...n, title, content: createContent || undefined }
              : n
          )
        : [
            ...prev,
            {
              id: Date.now(),
              title,
              content: createContent || undefined,
              createdAt: Date.now(),
            },
          ]
    );

    setShowCreateModal(false);
    setEditingNoteId(null);
    setCreateTitle("");
    setCreateContent("");
    localStorage.removeItem(DRAFT_KEY);
    setIsSubmitting(false);
  };

  /* ---------- Delete with undo ---------- */
  const handleDeleteNote = (note: Note) => {
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    setRecentlyDeleted(note);
    setShowUndoToast(true);

    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }

    deleteTimeoutRef.current = setTimeout(() => {
      setRecentlyDeleted(null);
      setShowUndoToast(false);
    }, 5000);
  };

  /* ============================= */

  return (
    <>
      <div className="flex">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Header
            title="Notes"
            showSearch
            action={
              canCreateNote && (
                <button
                  ref={createButtonRef}
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
              <div className="mb-4 flex justify-end gap-2">
                <span className="text-sm text-gray-500">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as any)
                  }
                  className="border rounded px-3 py-2"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="az">A–Z</option>
                </select>
              </div>

              {isLoading ? (
                <SkeletonList count={4} />
              ) : sortedNotes.length === 0 ? (
                <EmptyState
                  title="No results found"
                  description="Try adjusting your search keywords."
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
                          <button
                            title="Edit note"
                            onClick={() => handleEditNote(note)}
                            className="text-blue-600"
                          >
                            ✏️
                          </button>
                          <button
                            title="Delete note"
                            onClick={() => handleDeleteNote(note)}
                            className="text-red-600"
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

      {/* ---------- Modal ---------- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingNoteId ? "Edit note" : "New note"}
            </h2>

            <form onSubmit={handleSubmitCreate}>
              <input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                className="w-full border p-2 mb-1"
                placeholder="Title"
              />
              <p className="text-xs text-gray-500 mb-2">
                {createTitle.length} / {TITLE_MAX_LENGTH}
              </p>

              {createTitleError && (
                <p className="text-sm text-red-600 mb-2">
                  {createTitleError}
                </p>
              )}

              <textarea
                value={createContent}
                onChange={(e) => setCreateContent(e.target.value)}
                className="w-full border p-2 mb-4"
                placeholder="Content (optional)"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {editingNoteId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Undo Toast ---------- */}
      {showUndoToast && recentlyDeleted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded flex gap-4">
          <span>Note deleted</span>
          <button
            onClick={() => {
              setNotes((prev) => [...prev, recentlyDeleted]);
              if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
              }
              setShowUndoToast(false);
              setRecentlyDeleted(null);
            }}
            className="underline font-semibold"
          >
            Undo
          </button>
        </div>
      )}
    </>
  );
}