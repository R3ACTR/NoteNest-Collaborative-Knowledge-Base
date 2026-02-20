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

export default function NotesPage() {
  const searchParams = useSearchParams();
  const { canCreateNote, isViewer } = usePermissions();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
              },
              {
                id: 2,
                title: "Meeting Notes",
                content: "Key points from the last team sync.",
              },
            ]
      );
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) saveNotesToStorage(notes);
  }, [notes, isLoading]);

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

  /* ---------- Submit (Create / Edit) ---------- */
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
    <div className="flex">
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
                className="btn-primary"
              >
                Create Note
              </button>
            ) : null
          }
        />

        <main className="flex-1 overflow-auto" aria-busy={isLoading}>
          <div className="max-w-3xl mx-auto p-6">
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
                      className="btn-primary"
                    >
                      Create your first note
                    </button>
                  )
                }
              />
            ) : (
              <ul className="space-y-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border p-4 bg-white shadow-sm flex justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-semibold">{note.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {note.content || "No content"}
                      </p>
                    </div>

                    {!isViewer && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditNote(note)}
                          aria-label="Edit note"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => setNoteToDelete(note)}
                          aria-label="Delete note"
                          className="text-red-600 hover:text-red-700"
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

      {/* Create / Edit Modal */}
      {showCreateModal && canCreateNote && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-note-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
        >
          <div className="relative bg-white p-6 rounded w-full max-w-md">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                createButtonRef.current?.focus();
              }}
              aria-label="Close dialog"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 id="new-note-title" className="text-xl font-semibold mb-4">
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
                className="w-full border p-2 mb-2"
                placeholder="Title"
              />

              <p className="text-xs text-gray-500 mb-2">
                Max {TITLE_MAX_LENGTH} characters
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    createButtonRef.current?.focus();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
        >
          <div className="bg-white p-6 rounded w-full max-w-sm">
            <h2
              id="delete-note-title"
              className="text-lg font-semibold mb-3"
            >
              Delete note
            </h2>

            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete this note?
              <br />
              <strong>This action cannot be undone.</strong>
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="btn-secondary"
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
                className="btn-danger"
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
