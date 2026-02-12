"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
        n != null && typeof n === "object" && typeof n.id === "number" && typeof n.title === "string"
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

const CREATE_RESTRICTED_TITLE = "You need Editor or Admin role to create notes.";
const DELETE_RESTRICTED_TITLE = "You need Editor or Admin role to delete notes.";

export default function NotesPage() {
  const searchParams = useSearchParams();
  const { canCreateNote, canDeleteNote, isViewer } = usePermissions();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Create note modal (placeholder flow – local state only)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTitleError, setCreateTitleError] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createSuccessMessage, setCreateSuccessMessage] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Load notes from localStorage (or seed data) and persist on change
  useEffect(() => {
    const stored = loadNotesFromStorage();
    const timer = setTimeout(() => {
      setNotes(
        stored

      );
      setLoadError(null);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && notes.length >= 0) {
      saveNotesToStorage(notes);
    }
  }, [notes, isLoading]);

  // Open create modal when landing from "Create Your First Note" (e.g. /notes?new=1) — only if allowed
  useEffect(() => {
    if (searchParams.get("new") === "1" && canCreateNote) {
      setShowCreateModal(true);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams, canCreateNote]);

  // Close view modal on Escape
  useEffect(() => {
    if (!viewingNote) return;
    const handleEsc = () => setViewingNote(null);
    window.addEventListener("shortcut-esc", handleEsc);
    return () => window.removeEventListener("shortcut-esc", handleEsc);
  }, [viewingNote]);

  const retryLoad = () => {
    setLoadError(null);
    setIsLoading(true);
    setTimeout(() => {
      const stored = loadNotesFromStorage();
      setNotes(stored);
      setIsLoading(false);
    }, 600);
  };


  const handleCreateNote = useCallback(() => {
    if (!canCreateNote) return;
    setActionError(null);
    setCreateTitle("");
    setCreateContent("");
    setCreateTitleError("");
    setShowCreateModal(true);
  }, [canCreateNote]);

  const handleCloseCreateModal = useCallback(() => {
    if (isSubmittingCreate) return;
    setShowCreateModal(false);
    setCreateTitle("");
    setCreateContent("");
    setCreateTitleError("");
    createButtonRef.current?.focus();
  }, [isSubmittingCreate]);

  // Close create modal on Escape (keyboard shortcut)
  useEffect(() => {
    if (!showCreateModal) return;
    const handleEsc = () => handleCloseCreateModal();
    window.addEventListener("shortcut-esc", handleEsc);
    return () => window.removeEventListener("shortcut-esc", handleEsc);
  }, [showCreateModal, handleCloseCreateModal]);

  const handleSubmitCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const title = createTitle.trim();
      if (!title) {
        setCreateTitleError("Title is required");
        return;
      }
      if (title.length > TITLE_MAX_LENGTH) {
        setCreateTitleError(`Title must be ${TITLE_MAX_LENGTH} characters or less`);
        return;
      }
      setCreateTitleError("");
      setIsSubmittingCreate(true);
      const newNote: Note = {
        id: Date.now(),
        title,
        content: createContent.trim() || undefined,
      };
      setNotes((prev) => [...prev, newNote]);
      setCreateSuccessMessage("Note created");
      setShowCreateModal(false);
      setCreateTitle("");
      setCreateContent("");
      setIsSubmittingCreate(false);
      createButtonRef.current?.focus();
      setTimeout(() => setCreateSuccessMessage(null), 2000);
    },
    [createTitle, createContent]
  );

  const handleDeleteNote = (id: number) => {
    setActionError(null);
    if (viewingNote?.id === id) setViewingNote(null);
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Notes"
          showSearch
          action={
            canCreateNote && notes.length > 0 ? (
              <button
                ref={createButtonRef}
                type="button"
                onClick={handleCreateNote}
                className="btn-primary"
                aria-label="Create a new note"
              >
                Create Note
              </button>
            ) : null
          }
        />


        <main
          className="flex-1 overflow-auto relative flex justify-center"
          style={{
            background: "var(--color-background)",
            backgroundImage: "linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)"
          }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-32 right-20 w-64 h-64 rounded-full blur-3xl opacity-15"
              style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)" }}
            ></div>
            <div
              className="absolute bottom-40 left-20 w-80 h-80 rounded-full blur-3xl opacity-12"
              style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)" }}
            ></div>
          </div>

          <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 relative z-10">
            <div
              className="overflow-auto"
              style={{
                background: "var(--color-background)",
              }}
            >
              {createSuccessMessage && (
                <div
                  className="animate-fade-in-up mb-4 rounded-lg border flex items-center gap-3 px-4 py-3"
                  style={{
                    borderColor: "var(--color-success)",
                    background: "rgba(34, 197, 94, 0.08)",
                    color: "var(--color-success)",
                  }}
                  role="status"
                  aria-live="polite"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{createSuccessMessage}</span>
                </div>
              )}

              {loadError && (
                <ErrorState
                  title="Couldn't load notes"
                  message={loadError}
                  variant="error"
                  onDismiss={() => setLoadError(null)}
                  action={
                    <button type="button" onClick={retryLoad} className="btn-primary" style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-sm) var(--space-md)" }}>
                      Try again
                    </button>
                  }
                  className="mb-6"
                />
              )}

              {actionError && (
                <ErrorState
                  title="Something went wrong"
                  message={actionError}
                  variant="warning"
                  onDismiss={() => setActionError(null)}
                  action={
                    <button type="button" onClick={() => setActionError(null)} className="btn-secondary" style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-sm) var(--space-md)" }}>
                      Dismiss
                    </button>
                  }
                  className="mb-4"
                />
              )}

              {isLoading ? (
                <div
                  className="animate-fade-in rounded-xl border p-6"
                  style={{
                    background: "var(--color-background)",
                    borderColor: "var(--color-border-light)",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
                  }}
                >
                  <SkeletonList count={4} variant="list-item" />
                </div>
              ) : notes.length === 0 ? (
                <div className="state-content-enter">
                  <EmptyState
                    title="No notes yet"
                    description="You haven’t created any notes yet. Start by writing your first one."
                    action={
                      <button
                        className="btn-primary"
                        onClick={handleCreateNote}
                      >
                        Create your first note
                      </button>
                    }
                  />
                </div>
              ) : (

                <div className="state-content-enter">
                  {/* Notes header with count */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Your Notes
                      </h3>
                      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {notes.length} note{notes.length !== 1 ? 's' : ''} total
                      </p>
                    </div>
                  </div>



                  <ul className="space-y-3">
                    {notes.map((note, index) => (
                      <li
                        key={note.id}
                        className="animate-fade-in-up rounded-xl border flex items-stretch gap-5 group overflow-hidden transition-all duration-200 hover:shadow-lg hover:bg-white
 focus-within:ring-2 focus-within:ring-offset-2"
                        style={{
                          background: "var(--color-surface, #ffffff)",
                          borderColor: "rgba(0, 0, 0, 0.08)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: "backwards",
                        }}

                      >

                        <div
                          className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
                          style={{
                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                            color: "var(--color-info)"
                          }}
                          aria-hidden
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewingNote(note)}
                          className="flex-1 min-w-0 py-5 pr-3 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors"
                          style={{ "--tw-ring-color": "var(--color-info)" } as React.CSSProperties}
                        >

                          <span
                            className="block truncate font-semibold"
                            style={{
                              fontSize: "var(--font-size-base)",
                              color: "#111827", // dark gray (Tailwind gray-900)
                            }}

                          >
                            {note.title}
                          </span>

                          {note.content ? (
                            <span
                              className="block truncate mt-1"
                              style={{
                                fontSize: "var(--font-size-sm)",
                                color: "#4b5563", // gray-600
                              }}

                            >

                              {note.content.length > 80 ? `${note.content.slice(0, 80)}…` : note.content}
                            </span>
                          ) : (
                            <span className="text-sm block mt-1 italic" style={{ color: "var(--color-text-muted)" }}>
                              No content
                            </span>
                          )}
                        </button>
                        {(canDeleteNote && (
                          <div className="flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="btn-icon rounded-lg hover:bg-red-50"
                              style={{
                                padding: "var(--space-sm)",
                                color: "var(--color-error)",
                              }}
                              aria-label={`Delete ${note.title}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )) || (
                            <div className="pr-3 flex items-center">
                              <span
                                className="inline-block w-8 h-8 rounded-lg flex items-center justify-center cursor-not-allowed opacity-50"
                                style={{ color: "var(--color-text-muted)" }}
                                title={DELETE_RESTRICTED_TITLE}
                                aria-hidden
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </span>
                            </div>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Note Modal – only when user can create */}
      {showCreateModal && canCreateNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-note-title"
          onClick={handleCloseCreateModal}
        >
          <div
            className="w-full max-w-md rounded-xl border shadow-xl animate-scale-in"
            style={{
              background: "var(--color-background)",
              borderColor: "var(--color-border-light)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2
                id="create-note-title"
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                New note
              </h2>
              <form onSubmit={handleSubmitCreate} noValidate>
                <div className="mb-4">
                  <label
                    htmlFor="create-note-title-input"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Title <span style={{ color: "var(--color-error)" }} aria-label="required">*</span>
                  </label>
                  <input
                    id="create-note-title-input"
                    type="text"
                    value={createTitle}
                    maxLength={TITLE_MAX_LENGTH}
                    onChange={(e) => {
                      setCreateTitle(e.target.value);
                      setCreateTitleError("");
                    }}
                    placeholder="Note title"
                    autoFocus
                    required
                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      borderColor: createTitleError ? "var(--color-error)" : "var(--color-border-light)",
                      color: "var(--color-text-primary)",
                      fontSize: "var(--font-size-base)",
                    }}
                    aria-invalid={!!createTitleError}
                    aria-describedby={createTitleError ? "create-title-error" : "create-title-hint"}
                    aria-required="true"
                  />
                  <div className="flex justify-between items-baseline mt-1">
                    {createTitleError ? (
                      <p id="create-title-error" className="field-error" role="alert">
                        {createTitleError}
                      </p>
                    ) : (
                      <span id="create-title-hint" className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {createTitle.length}/{TITLE_MAX_LENGTH} characters
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="create-note-content"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Content (optional)
                  </label>
                  <textarea
                    id="create-note-content"
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    placeholder="Add some content…"
                    rows={4}
                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    style={{
                      borderColor: createTitleError
                        ? "var(--color-error)"
                        : "var(--color-border-light)",
                      color: "#111827",
                      backgroundColor: "#ffffff",
                      fontSize: "var(--font-size-base)",
                    }}


                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="btn-secondary"
                    style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-sm) var(--space-md)" }}
                    disabled={isSubmittingCreate}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-sm) var(--space-md)" }}
                    disabled={isSubmittingCreate}
                    aria-busy={isSubmittingCreate}
                  >
                    {isSubmittingCreate ? "Creating…" : "Create note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {viewingNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-note-title"
          onClick={() => setViewingNote(null)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] rounded-xl border shadow-xl animate-scale-in flex flex-col"
            style={{
              background: "var(--color-background)",
              borderColor: "var(--color-border-light)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6 border-b shrink-0" style={{ borderColor: "var(--color-border-light)" }}>
              <h2
                id="view-note-title"
                className="text-xl font-semibold pr-12"
                style={{ color: "var(--color-text-primary)" }}
              >
                {viewingNote.title}
              </h2>
              <button
                type="button"
                onClick={() => setViewingNote(null)}
                className="btn-icon absolute top-3 right-3"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {viewingNote.content ? (
                <p
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {viewingNote.content}
                </p>
              ) : (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No content yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

