"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";

const STORAGE_KEY = "notenest-notes";
const TITLE_MAX_LENGTH = 200;

interface Note {
  id: number;
  title: string;
  content?: string;
  createdAt: number;
}

function loadNotesFromStorage(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotesToStorage(notes: Note[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }
}

function formatRelativeTime(timestamp?: number) {
  if (!timestamp || Number.isNaN(timestamp)) {
    return "Created recently";
  }

  const diff = Date.now() - timestamp;

  if (Number.isNaN(diff) || diff < 0) {
    return "Created recently";
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "Created just now";
  if (minutes < 60)
    return `Created ${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  return `Created ${hours} hour${hours > 1 ? "s" : ""} ago`;
}
export default function NotesPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const { canCreateNote, isViewer } = usePermissions();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTitleError, setCreateTitleError] = useState("");
  const [createSuccessMessage, setCreateSuccessMessage] =
    useState<string | null>(null);

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const createButtonRef = useRef<HTMLButtonElement>(null);

  /* ---------- ESC to close modals ---------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCreateModal(false);
        setNoteToDelete(null);
        createButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ---------- Initial Load ---------- */
  useEffect(() => {
    const stored = loadNotesFromStorage();
    const timer = setTimeout(() => {
      setNotes(
        stored.length > 0
          ? stored
          : [
            {
              id: 1,
              title: "Project Overview",
              content: "A high-level overview of the project.",
              createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
            },
            {
              id: 2,
              title: "Meeting Notes",
              content: "Key points from the last team sync.",
              createdAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
            },
          ]
      );
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  /* ---------- Sync URL search ---------- */
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  /* ---------- Persist notes ---------- */
  useEffect(() => {
    if (!isLoading) saveNotesToStorage(notes);
  }, [notes, isLoading]);

  /* ---------- Filtered notes ---------- */
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query)
    );
  });

  /* ---------- Create Note ---------- */
  const handleCreateNote = useCallback(() => {
    if (!canCreateNote) return;
    setEditingNoteId(null);
    setCreateTitle("");
    setCreateContent("");
    setCreateTitleError("");
    setShowCreateModal(true);
  }, [canCreateNote]);

  /* ---------- Edit Note ---------- */
  const handleEditNote = useCallback((note: Note) => {
    setEditingNoteId(note.id);
    setCreateTitle(note.title);
    setCreateContent(note.content || "");
    setCreateTitleError("");
    setShowCreateModal(true);
  }, []);

  /* ---------- Submit ---------- */
  const handleSubmitCreate = useCallback(
    (e: React.FormEvent) => {
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

      if (editingNoteId !== null) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === editingNoteId
              ? { ...note, title, content: createContent.trim() || undefined }
              : note
          )
        );
      } else {
        const newNote: Note = {
          id: Date.now(),
          title,
          content: createContent.trim() || undefined,
          createdAt: Date.now(),
        };
        setNotes((prev) => [...prev, newNote]);
      }

      setCreateSuccessMessage(
        editingNoteId !== null
          ? "Note updated successfully."
          : "Note created successfully."
      );

      setShowCreateModal(false);
      setEditingNoteId(null);
      setCreateTitle("");
      setCreateContent("");

      setTimeout(() => {
        setCreateSuccessMessage(null);
        setIsSubmitting(false);
      }, 2000);
    },
    [createTitle, createContent, editingNoteId]
  );

  return (
    <div className="flex min-h-screen bg-[#F3F0E6]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Notes"
          showSearch
          action={
            canCreateNote ? (
              <button
                ref={createButtonRef}
                type="button"
                onClick={handleCreateNote}
                className="bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-icons-outlined text-sm">add</span> Create Note
              </button>
            ) : null
          }
        />

        <main
          className="flex-1 overflow-y-auto"
          aria-busy={isLoading}
        >
          <div className="max-w-4xl mx-auto p-4 sm:p-8">
            {createSuccessMessage && (
              <div
                role="status"
                aria-live="polite"
                className="mb-4 text-green-600 font-medium"
              >
                {createSuccessMessage}
              </div>
            )}

            {loadError && (
              <ErrorState
                title="Unable to load notes. Please try again."
                message={loadError}
                variant="error"
              />
            )}

            {isLoading ? (
              <SkeletonList count={4} />
            ) : notes.length === 0 ? (
              <EmptyState
                title="No notes yet"
                description={
                  isViewer
                    ? "You don’t have permission to create notes, but you can view existing ones."
                    : "You don’t have any notes yet. Create your first note to get started."
                }
                action={
                  canCreateNote && (
                    <button
                      type="button"
                      onClick={handleCreateNote}
                      className="bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2"
                    >
                      Create your first note
                    </button>
                  )
                }
              />
            ) : filteredNotes.length === 0 ? (
              <EmptyState
                title="No results found"
                description="Try adjusting your search keywords."
              />
            ) : (
              <ul className="space-y-4 pt-6">
                {filteredNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-3xl border border-stone-200 p-6 bg-white shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <h4 className="font-display text-2xl font-bold text-stone-900 group-hover:text-blue-600 transition-colors">{note.title}</h4>
                      <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                        <span className="material-icons-outlined text-[14px]">schedule</span>
                        {formatRelativeTime(note.createdAt)}
                      </p>
                      <p className="text-base text-stone-600 mt-3 line-clamp-2">
                        {note.content || "No content"}
                      </p>
                    </div>

                    {!isViewer && (
                      <div className="flex gap-2 items-start shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditNote(note)}
                          aria-label="Edit note"
                          title="Edit note"
                          className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        >
                          <span className="material-icons-outlined text-sm">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNoteToDelete(note)}
                          aria-label="Delete note"
                          title="Delete note"
                          className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <span className="material-icons-outlined text-sm">delete</span>
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

      {/* Create / Edit Modal */}
      {showCreateModal && canCreateNote && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-note-title"
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="relative bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                createButtonRef.current?.focus();
              }}
              aria-label="Close dialog"
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors bg-stone-100 rounded-full w-8 h-8 flex items-center justify-center"
            >
              <span className="material-icons-outlined text-sm">close</span>
            </button>

            <h2 id="new-note-title" className="font-display text-3xl font-bold mb-6 text-stone-900">
              {editingNoteId !== null ? "Edit note" : "New note"}
            </h2>

            <form onSubmit={handleSubmitCreate} noValidate>
              <input
                type="text"
                autoFocus
                value={createTitle}
                onChange={(e) => {
                  setCreateTitle(e.target.value);
                  setCreateTitleError("");
                }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 mb-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50/50"
                placeholder="Title"
              />

              <p className="text-xs text-stone-500 mb-4 px-1">
                {createTitle.length} / {TITLE_MAX_LENGTH} characters
              </p>

              {createTitleError && (
                <p className="text-sm text-red-600 mb-4 px-1">
                  {createTitleError}
                </p>
              )}

              <textarea
                value={createContent}
                onChange={(e) => setCreateContent(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 mb-8 min-h-[150px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50/50 resize-y"
                placeholder="Content (optional)"
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    createButtonRef.current?.focus();
                  }}
                  className="px-6 py-2.5 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || createTitle.trim().length === 0}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingNoteId !== null
                      ? "Update note"
                      : "Create note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-note-title"
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6">
               <span className="material-icons-outlined text-xl">warning</span>
            </div>

            <h2
              id="delete-note-title"
              className="font-display text-2xl font-bold mb-2 text-stone-900"
            >
              Delete note
            </h2>

            <p className="text-stone-600 mb-8 leading-relaxed">
              Are you sure you want to delete this note?
              <br />
              <strong className="text-stone-900">This action cannot be undone.</strong>
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="px-6 py-2.5 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setNotes((prev) =>
                    prev.filter((n) => n.id !== noteToDelete.id)
                  );
                  setNoteToDelete(null);
                }}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}