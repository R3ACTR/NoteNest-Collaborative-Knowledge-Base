"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { FileX, Search as SearchIcon, Copy, Check } from "lucide-react";

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
  const [lastSaved, setLastSaved] = useState<number | null>(null);
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
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null);

  /* ---------- Undo delete ---------- */
  const [recentlyDeleted, setRecentlyDeleted] = useState<Note | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pinnedOnly = searchParams.get("pinned") === "1";
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [pinnedPreviewNotes, setPinnedPreviewNotes] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [pinnedNotes, setPinnedNotes] = useState(0);
const [pinsHydrated, setPinsHydrated] = useState(false);
  /* ---------- Load note stats ---------- */
  const loadNoteStats = () => {
    try {
      const rawNotes = localStorage.getItem("notenest-notes");
      const rawPinned = localStorage.getItem("notenest-pinned-notes");

      const notes = rawNotes ? JSON.parse(rawNotes) : [];
      const pinned = rawPinned ? JSON.parse(rawPinned) : [];

      setTotalNotes(Array.isArray(notes) ? notes.length : 0);
      setPinnedNotes(Array.isArray(pinned) ? pinned.length : 0);

      const preview = notes
        .filter((note: any) => pinned.includes(note.id))
        .slice(0, 3)
        .map((note: any) => ({
          id: note.id,
          title: note.title,
        }));

      setPinnedPreviewNotes(preview);
    } catch {
      setTotalNotes(0);
      setPinnedNotes(0);
      setPinnedPreviewNotes([]);
    }
  };

  /* ---------- Initial load ---------- */
  useEffect(() => {
  // Load notes
  const stored = loadNotesFromStorage();
  setNotes(stored);

  // Load pinned notes
  const rawPinned = localStorage.getItem(PINNED_KEY);
if (rawPinned) {
  try {
    const parsed = JSON.parse(rawPinned);
    // 🔑 convert all pinned IDs to numbers
    setPinnedNoteIds(parsed.map((id: any) => Number(id)));
  } catch {}
}

  // Mark loading complete
  setIsLoading(false);
}, []);

  /* ---------- Global Shortcut (Ctrl+K) ---------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  /* ---------- Sync search ---------- */
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  /* ---------- Persist notes ---------- */
  useEffect(() => {
    if (!isLoading) {
      saveNotesToStorage(notes);
      setLastSaved(Date.now());
    }
  }, [notes, isLoading])

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedNoteIds));
  }, [pinnedNoteIds]);

  /* ---------- Restore draft ---------- */
  useEffect(() => {
    if (!showCreateModal) return;

    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw);
      setCreateTitle(draft.title || "");
      setCreateContent(draft.content || "");
    } catch { }
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
  // ✅ pinned-only view
  if (pinnedOnly) {
    return pinnedNoteIds.includes(note.id);
  }

  // 🔍 normal search view
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

    // ✅ ADD THIS (keeps pinned storage in sync)
    setPinnedNoteIds((prev) =>
      prev.filter((id) => id !== note.id)
    );

    setRecentlyDeleted(note);
    setShowUndoToast(true);
  };
  /* ---------- Bulk select ---------- */
  const toggleSelectNote = (id: number) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id)
        ? prev.filter((n) => n !== id)
        : [...prev, id]
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      if (prev) {
        setSelectedNoteIds([]); // clear selections when exiting
      }
      return !prev;
    });
  };

  /* ---------- Delete with undo ---------- */
  const handleBulkDelete = () => {
    if (!selectedNoteIds.length) return;

    if (!confirm(`Delete ${selectedNoteIds.length} notes?`)) return;

    setNotes((prev) =>
      prev.filter((n) => !selectedNoteIds.includes(n.id))
    );

    setPinnedNoteIds((prev) =>
      prev.filter((id) => !selectedNoteIds.includes(id))
    );

    setSelectedNoteIds([]);
  };

  const togglePin = (noteId: number) => {
    setPinnedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  /* ---------- Export ---------- */
  const handleExportNote = (note: Note) => {
    const title = note.title || "untitled";
    const content = note.content || "";
    const markdown = `# ${title}\n\n${content}`;
    
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <span className="text-xs text-stone-500 italic">
                    Last saved: {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
                {canCreateNote && (
                  <button
                    ref={createButtonRef}
                    onClick={handleCreateNote}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
                  >
                    + Create Note
                  </button>
                )}
              </div>
            }
          />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6">
              <div className="mb-4 flex justify-end gap-2">
                {!isViewer && (
                  <button
                    onClick={toggleSelectionMode}
                    title={
                      isSelectionMode
                        ? "Exit selection mode"
                        : "Select multiple notes to delete at once"
                    }
                    className="border px-4 py-2 rounded"
                  >
                    {isSelectionMode ? "Cancel selection" : "Select notes"}
                  </button>
                )}

                {!isViewer && isSelectionMode && selectedNoteIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="mb-4 px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete selected ({selectedNoteIds.length})
                  </button>
                )}

                <span className="text-sm text-gray-500">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded px-3 py-2"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="az">A–Z</option>
                </select>
              </div>

<<<<<<< HEAD
              {isLoading ? (
                <SkeletonList count={4} />
              ) : sortedNotes.length === 0 ? (
                <EmptyState
                  icon={searchQuery ? SearchIcon : FileX}
                  title={searchQuery ? "No matching notes" : "No notes yet"}
                  description={
                    searchQuery
                      ? `We couldn't find any notes matching "${searchQuery}".`
                      : "Start your knowledge base by creating your first note."
                  }
                  action={
                    !searchQuery && canCreateNote ? (
                      <button
                        onClick={handleCreateNote}
                        className="px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-stone-800 transition-colors"
                      >
                        Create your first note
                      </button>
                    ) : undefined
                  }
                  size="large"
                />
              ) : (
                <ul className="space-y-3">
                  {sortedNotes.map((note) => (
                    <li
                      key={note.id}
                      className="border rounded-xl p-4 bg-white flex justify-between"
                    >
                      <div className="flex items-start gap-3">
                       {!isViewer && isSelectionMode && (
  <input
    type="checkbox"
    checked={selectedNoteIds.includes(note.id)}
    onChange={() => toggleSelectNote(note.id)}
    className="mt-1"
=======
{isLoading ? (  <SkeletonList count={4} />
) : sortedNotes.length === 0 ? (
  <EmptyState
    title={pinnedOnly ? "No pinned notes" : "No results found"}
    description={
      pinnedOnly
        ? "You haven’t pinned any notes yet."
        : "Try adjusting your search keywords."
    }
>>>>>>> upstream/main
  />
) : (
  <ul className="space-y-3">
    {sortedNotes.map((note) => (
      <li
        key={note.id}
        className="border rounded-xl p-4 bg-white flex justify-between"
      >
        <div className="flex items-start gap-3">
                        {!isViewer && isSelectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedNoteIds.includes(note.id)}
                            onChange={() => toggleSelectNote(note.id)}
                            className="mt-1"
                          />
                        )}

                        <div>
                          <h4 className="font-semibold">{note.title}</h4>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(note.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {note.content || "No content"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          title={copiedNoteId === note.id ? "Copied!" : "Copy note"}
                          onClick={() => {
                            const text = `${note.title}\n\n${note.content || ""}`.trim();
                            navigator.clipboard.writeText(text);
                            setCopiedNoteId(note.id);
                            setTimeout(() => setCopiedNoteId(null), 2000);
                          }}
                          className={`flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors ${copiedNoteId === note.id ? 'text-green-600' : 'text-gray-600'}`}
                        >
                          {copiedNoteId === note.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button
                          title="Export as Markdown"
                          onClick={() => handleExportNote(note)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          📥
                        </button>
                        {!isViewer && (
                          <>
                            <button
                              title={pinnedNoteIds.includes(note.id) ? "Unpin note" : "Pin note"}
                              onClick={() => togglePin(note.id)}
                            >
                              {pinnedNoteIds.includes(note.id) ? "📌" : "📍"}
                            </button>
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
                          </>
                        )}
                      </div>
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

              // ✅ keep pinned state consistent after undo
              setPinnedNoteIds((prev) => [...prev]);

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
}