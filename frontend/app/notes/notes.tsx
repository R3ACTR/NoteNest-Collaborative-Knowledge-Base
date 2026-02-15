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
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is Note =>
        n != null &&
        typeof n === "object" &&
        typeof n.id === "number" &&
        typeof n.title === "string"
    );
  } catch {
    return [];
  }
}

function saveNotesToStorage(notes: Note[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

const CREATE_RESTRICTED_TITLE =
  "You need Editor or Admin role to create notes.";
const DELETE_RESTRICTED_TITLE =
  "You need Editor or Admin role to delete notes.";

export default function NotesPage() {
  const searchParams = useSearchParams();
  const { canCreateNote, canDeleteNote, isViewer } = usePermissions();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTitleError, setCreateTitleError] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createSuccessMessage, setCreateSuccessMessage] =
    useState<string | null>(null);

  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  /* ---------- Initial Load ---------- */
  useEffect(() => {
    const stored = loadNotesFromStorage();
    const timer = setTimeout(() => {
      setNotes(
        stored.length > 0
          ? stored
          : [
              { id: 1, title: "Project Overview", content: "A high-level overview of the project." },
              { id: 2, title: "Meeting Notes", content: "Key points from the last team sync." },
            ]
      );
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) saveNotesToStorage(notes);
  }, [notes, isLoading]);

  /* ---------- Retry Load ---------- */
  const retryLoad = () => {
    setLoadError(null);
    setIsLoading(true);
    setTimeout(() => {
      setNotes(loadNotesFromStorage());
      setIsLoading(false);
    }, 600);
  };

  /* ---------- ?new=1 ---------- */
  useEffect(() => {
    if (searchParams.get("new") === "1" && canCreateNote) {
      setShowCreateModal(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, canCreateNote]);

  /* ---------- Keyboard ---------- */
  useEffect(() => {
    if (!viewingNote) return;
    const esc = () => setViewingNote(null);
    window.addEventListener("shortcut-esc", esc);
    return () => window.removeEventListener("shortcut-esc", esc);
  }, [viewingNote]);

  /* ---------- Create Note ---------- */
  const handleCreateNote = useCallback(() => {
    if (!canCreateNote) return;
    setCreateTitle("");
    setCreateContent("");
    setCreateTitleError("");
    setShowCreateModal(true);
  }, [canCreateNote]);

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

      const newNote: Note = {
        id: Date.now(),
        title,
        content: createContent.trim() || undefined,
      };

      setNotes((prev) => [...prev, newNote]);
      setCreateSuccessMessage("Note created successfully.");
      setShowCreateModal(false);
      setTimeout(() => setCreateSuccessMessage(null), 2000);
    },
    [createTitle, createContent]
  );

  const handleDeleteNote = (id: number) => {
    if (viewingNote?.id === id) setViewingNote(null);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

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
                className="btn-primary"
                onClick={handleCreateNote}
              >
                Create Note
              </button>
            ) : (
              <span title={CREATE_RESTRICTED_TITLE}>Create Note</span>
            )
          }
        />

        <main
          className="flex-1 overflow-auto flex justify-center"
          aria-busy={isLoading}
        >
          <div className="max-w-3xl w-full p-6">
            {createSuccessMessage && (
              <div className="mb-4 text-green-600 font-medium">
                {createSuccessMessage}
              </div>
            )}

            {loadError && (
              <ErrorState
                title="Unable to load notes. Please try again."
                message={loadError}
                variant="error"
                action={
                  <button className="btn-primary" onClick={retryLoad}>
                    Try again
                  </button>
                }
              />
            )}

            {isLoading ? (
              <SkeletonList count={4} />
            ) : notes.length === 0 ? (
              <EmptyState
                title="No notes yet"
                description={
                  isViewer
                    ? "You can view notes only."
                    : "Get started by creating your first note."
                }
                action={
                  canCreateNote && (
                    <button
                      className="btn-primary"
                      onClick={handleCreateNote}
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
                    className="rounded-xl border flex gap-4 p-4 bg-white shadow-sm group"
                  >
                    <button
                      type="button"
                      onClick={() => setViewingNote(note)}
                      className="flex-1 text-left"
                      aria-label={`View note: ${note.title}`}
                    >
                      <h4 className="font-semibold truncate">{note.title}</h4>
                      <p className="text-sm truncate mt-1">
                        {note.content || "No content"}
                      </p>
                    </button>

                    {canDeleteNote ? (
                      <button
                        className="btn-icon text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        title="Delete note"
                        aria-label={`Delete ${note.title}`}
                      >
                        🗑
                      </button>
                    ) : (
                      <span title={DELETE_RESTRICTED_TITLE}>🔒</span>
                    )}
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
