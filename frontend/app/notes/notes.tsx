"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { apiService } from "@/lib/api";

const DRAFT_KEY = "notenest-note-draft";
const TITLE_MAX_LENGTH = 200;

interface Note {
  _id: string;
  id?: string;
  title: string;
  content?: string;
  tags?: string[];
  folderId?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  createdAt: string | number;
  updatedAt: string | number;
  workspaceId: string;
  author?: string;
}

/* ---------- Helpers ---------- */
function formatRelativeTime(timestamp?: string | number) {
  if (!timestamp) return "Created recently";

  const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Created just now";
  if (minutes < 60) return `Created ${minutes}m ago`;
  if (hours < 24) return `Created ${hours}h ago`;
  return `Created ${days}d ago`;
}

/* ============================= */

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const { canCreateNote, isViewer } = usePermissions();

  // Get workspaceId from URL or storage
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az" | "pinned">("pinned");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTitleError, setCreateTitleError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk actions state
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [recentlyDeleted, setRecentlyDeleted] = useState<Note | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createButtonRef = useRef<HTMLButtonElement>(null);

  /* ---------- Initialize workspace & user ---------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWorkspaceId = localStorage.getItem("currentWorkspaceId");
      const storedUserId = localStorage.getItem("userId");
      if (storedWorkspaceId) setWorkspaceId(storedWorkspaceId);
      if (storedUserId) setUserId(storedUserId);
    }
  }, []);

  /* ---------- Fetch notes ---------- */
  useEffect(() => {
    if (!workspaceId) return;

    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getNotesForWorkspace(workspaceId);
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [workspaceId]);

  /* ---------- Sync search ---------- */
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

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
      note.content?.toLowerCase().includes(q) ||
      note.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes first
    if (sortBy === "pinned") {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then sort by newest
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }

    if (sortBy === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return a.title.localeCompare(b.title);
  });

  /* ---------- Create/Edit ---------- */
  const handleCreateNote = () => {
    if (!canCreateNote) return;
    setEditingNoteId(null);
    setCreateTitle("");
    setCreateContent("");
    setCreateTitleError("");
    setShowCreateModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note._id);
    setCreateTitle(note.title);
    setCreateContent(note.content || "");
    setShowCreateModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
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

    try {
      setIsSubmitting(true);

      if (editingNoteId) {
        // Update note
        const updated = await apiService.updateNote(editingNoteId, {
          title,
          content: createContent,
          authorId: userId,
        });
        setNotes((prev) => prev.map((n) => (n._id === editingNoteId ? updated : n)));
      } else {
        // Create note
        const created = await apiService.createNote({
          title,
          content: createContent,
          workspaceId,
          authorId: userId,
        });
        setNotes((prev) => [created, ...prev]);
      }

      setShowCreateModal(false);
      setEditingNoteId(null);
      setCreateTitle("");
      setCreateContent("");
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDeleteNote = async (note: Note) => {
    try {
      await apiService.deleteNote(note._id, { authorId: userId });
      setNotes((prev) => prev.filter((n) => n._id !== note._id));
      setRecentlyDeleted(note);
      setShowUndoToast(true);

      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }

      deleteTimeoutRef.current = setTimeout(() => {
        setRecentlyDeleted(null);
        setShowUndoToast(false);
      }, 5000);
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note");
    }
  };

  /* ---------- Pin/Unpin ---------- */
  const handleTogglePin = async (note: Note) => {
    try {
      const updated = await apiService.pinNote(note._id, !note.isPinned);
      setNotes((prev) => prev.map((n) => (n._id === note._id ? updated : n)));
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  /* ---------- Selection ---------- */
  const toggleSelection = (noteId: string) => {
    const newSelected = new Set(selectedNoteIds);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNoteIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedNoteIds.size === sortedNotes.length) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(sortedNotes.map((n) => n._id)));
    }
  };

  /* ---------- Bulk Actions ---------- */
  const handleBulkPin = async () => {
    try {
      setIsSaving(true);
      await apiService.bulkPinNotes(Array.from(selectedNoteIds), true, userId);
      setNotes((prev) =>
        prev.map((n) => (selectedNoteIds.has(n._id) ? { ...n, isPinned: true } : n))
      );
      setSelectedNoteIds(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error("Failed to bulk pin notes:", error);
      alert("Failed to pin notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUnpin = async () => {
    try {
      setIsSaving(true);
      await apiService.bulkPinNotes(Array.from(selectedNoteIds), false, userId);
      setNotes((prev) =>
        prev.map((n) => (selectedNoteIds.has(n._id) ? { ...n, isPinned: false } : n))
      );
      setSelectedNoteIds(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error("Failed to unpin notes:", error);
      alert("Failed to unpin notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedNoteIds.size} note(s)? This cannot be undone.`)) {
      return;
    }

    try {
      setIsSaving(true);
      await apiService.bulkDeleteNotes(Array.from(selectedNoteIds), userId);
      setNotes((prev) => prev.filter((n) => !selectedNoteIds.has(n._id)));
      setSelectedNoteIds(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error("Failed to bulk delete notes:", error);
      alert("Failed to delete notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAddTags = async () => {
    if (!newTag.trim()) return;

    try {
      setIsSaving(true);
      const tagsArray = newTag.split(",").map((t) => t.trim()).filter(Boolean);
      await apiService.bulkAddTagsToNotes(Array.from(selectedNoteIds), tagsArray, userId);
      
      setNotes((prev) =>
        prev.map((n) => {
          if (selectedNoteIds.has(n._id)) {
            const existingTags = n.tags || [];
            const updated = tagsArray.filter((t) => !existingTags.includes(t));
            return { ...n, tags: [...existingTags, ...updated] };
          }
          return n;
        })
      );
      setNewTag("");
      setShowTagInput(false);
    } catch (error) {
      console.error("Failed to add tags:", error);
      alert("Failed to add tags");
    } finally {
      setIsSaving(false);
    }
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
            <div className="max-w-4xl mx-auto p-6">
              {/* Toolbar */}
              <div className="mb-6">
                <div className="flex justify-between items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {sortedNotes.length > 0 && !isViewer && (
                      <>
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.size === sortedNotes.length && sortedNotes.length > 0}
                          onChange={toggleSelectAll}
                          title="Select all"
                          className="w-4 h-4"
                        />
                        {selectedNoteIds.size > 0 && (
                          <span className="text-sm font-medium text-gray-700">
                            {selectedNoteIds.size} selected
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="pinned">Pinned first</option>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="az">A–Z</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedNoteIds.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      {selectedNoteIds.size} note(s) selected
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkPin}
                        disabled={isSaving}
                        className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                        title="Pin selected notes"
                      >
                        📌 Pin
                      </button>
                      
                      <button
                        onClick={handleBulkUnpin}
                        disabled={isSaving}
                        className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                        title="Unpin selected notes"
                      >
                        📍 Unpin
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setShowTagInput(!showTagInput)}
                          disabled={isSaving}
                          className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                          title="Add tags"
                        >
                          🏷️ Add Tag
                        </button>
                        {showTagInput && (
                          <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg p-3 z-20 min-w-max">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="tag1, tag2, ..."
                              className="border rounded px-2 py-1 text-sm w-full"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleBulkAddTags();
                                }
                              }}
                            />
                            <button
                              onClick={handleBulkAddTags}
                              disabled={isSaving || !newTag.trim()}
                              className="mt-2 w-full px-2 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleBulkDelete}
                        disabled={isSaving}
                        className="px-3 py-2 text-sm bg-red-50 border border-red-200 rounded text-red-600 hover:bg-red-100 disabled:opacity-50"
                        title="Delete selected notes"
                      >
                        🗑️ Delete
                      </button>

                      <button
                        onClick={() => setSelectedNoteIds(new Set())}
                        disabled={isSaving}
                        className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                        title="Cancel selection"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes List */}
              {isLoading ? (
                <SkeletonList count={4} />
              ) : sortedNotes.length === 0 ? (
                <EmptyState
                  title="No results found"
                  description="Try adjusting your search keywords or create a new note."
                />
              ) : (
                <div className="space-y-3">
                  {sortedNotes.map((note) => (
                    <div
                      key={note._id}
                      className={`border rounded-xl p-4 flex gap-4 transition-colors ${
                        selectedNoteIds.has(note._id)
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Checkbox */}
                      {!isViewer && (
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.has(note._id)}
                          onChange={() => toggleSelection(note._id)}
                          className="w-4 h-4 mt-1"
                        />
                      )}

                      {/* Content */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/notes/${note._id}`)}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {note.isPinned && <span title="Pinned">📌</span>}
                          <h4 className="font-semibold text-gray-900">{note.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatRelativeTime(note.updatedAt)}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {note.content || "No content"}
                        </p>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isViewer && (
                        <div className="flex gap-2">
                          <button
                            title={note.isPinned ? "Unpin note" : "Pin note"}
                            onClick={() => handleTogglePin(note)}
                            className="text-xl hover:opacity-70"
                          >
                            {note.isPinned ? "📌" : "📍"}
                          </button>
                          <button
                            title="Edit note"
                            onClick={() => handleEditNote(note)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✏️
                          </button>
                          <button
                            title="Delete note"
                            onClick={() => handleDeleteNote(note)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                className="w-full border p-2 mb-1 rounded"
                placeholder="Title"
              />
              <p className="text-xs text-gray-500 mb-2">
                {createTitle.length} / {TITLE_MAX_LENGTH}
              </p>

              {createTitleError && (
                <p className="text-sm text-red-600 mb-2">{createTitleError}</p>
              )}

              <textarea
                value={createContent}
                onChange={(e) => setCreateContent(e.target.value)}
                className="w-full border p-2 mb-4 rounded"
                placeholder="Content (optional)"
                rows={6}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-700"
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded flex gap-4 z-40">
          <span>Note deleted</span>
          <button
            onClick={() => {
              // Undo would require re-fetching or a separate API call
              setShowUndoToast(false);
              setRecentlyDeleted(null);
            }}
            className="underline font-semibold hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}