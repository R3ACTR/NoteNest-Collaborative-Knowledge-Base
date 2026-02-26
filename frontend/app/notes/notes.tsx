"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { FileX, Search as SearchIcon, Copy, Check, Download, Trash2, Pin, PinOff, Edit3 } from "lucide-react";

const STORAGE_KEY = "notenest-notes";
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
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az">("newest");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null);

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

  /* ---------- Sync search from URL ---------- */
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  /* ---------- Persist ---------- */
  useEffect(() => {
    if (!isLoading) {
      saveNotesToStorage(notes);
      setLastSaved(Date.now());
    }
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
    setSelectedNoteIds((prev) => prev.filter((id) => id !== note.id));
  };

  const handleCreateNote = () => {
    if (!canCreateNote) return;
    setEditingNoteId(null);
    setCreateTitle("");
    setCreateContent("");
    setShowCreateModal(true);
  };

  /* ---------- Bulk select ---------- */
  const toggleSelectNote = (id: number) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      if (prev) {
        setSelectedNoteIds([]);
      }
      return !prev;
    });
  };

  const handleBulkDelete = () => {
    if (!selectedNoteIds.length) return;
    if (!confirm(`Delete ${selectedNoteIds.length} notes?`)) return;

    setNotes((prev) => prev.filter((n) => !selectedNoteIds.includes(n.id)));
    setPinnedNoteIds((prev) => prev.filter((id) => !selectedNoteIds.includes(id)));
    setSelectedNoteIds([]);
    setIsSelectionMode(false);
  };

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

  /* ---------- Copy to Clipboard ---------- */
  const handleCopyNote = (note: Note) => {
    const text = `${note.title}\n\n${note.content || ""}`.trim();
    navigator.clipboard.writeText(text);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
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
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-xs text-stone-500 italic">
                  Last saved: {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
              {canCreateNote && (
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  + Create Note
                </button>
              )}
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            
            {/* Toolbar */}
            {!isLoading && notes.length > 0 && (
              <div className="flex justify-between items-center mb-6 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  {!isViewer && (
                    <button
                      onClick={toggleSelectionMode}
                      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        isSelectionMode 
                          ? "bg-stone-200 text-stone-800" 
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {isSelectionMode ? "Cancel Selection" : "Select Notes"}
                    </button>
                  )}
                  {isSelectionMode && selectedNoteIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 text-sm font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete {selectedNoteIds.length}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm bg-white border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="az">A–Z</option>
                  </select>
                </div>
              </div>
            )}

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
              <ul className="space-y-4">
                {sortedNotes.map((note) => (
                  <li
                    key={note.id}
                    className={`group border rounded-xl p-5 bg-white flex justify-between items-start transition-all hover:shadow-md ${
                      selectedNoteIds.includes(note.id) ? "ring-2 ring-blue-500 border-blue-500" : "border-stone-200"
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {isSelectionMode && !isViewer && (
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.includes(note.id)}
                          onChange={() => toggleSelectNote(note.id)}
                          className="mt-1.5 h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg text-stone-900 leading-tight">
                            {note.title}
                          </h4>
                          {pinnedNoteIds.includes(note.id) && (
                            <Pin size={14} className="text-blue-600 fill-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-stone-400 font-medium mb-3">
                          {formatRelativeTime(note.createdAt)}
                        </p>
                        <p className="text-stone-600 text-sm line-clamp-2 leading-relaxed">
                          {note.content || "No content"}
                        </p>
                      </div>
                    </div>

                    {!isViewer && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        {/* Copy */}
                        <button
                          title={copiedNoteId === note.id ? "Copied!" : "Copy note"}
                          onClick={() => handleCopyNote(note)}
                          className={`p-2 rounded-lg transition-colors ${
                            copiedNoteId === note.id ? "text-green-600 bg-green-50" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                          }`}
                        >
                          {copiedNoteId === note.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>

                        {/* Export */}
                        <button
                          title="Export as Markdown"
                          onClick={() => handleExportNote(note)}
                          className="p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                        </button>

                        {/* Pin */}
                        <button
                          title={pinnedNoteIds.includes(note.id) ? "Unpin note" : "Pin note"}
                          aria-label={pinnedNoteIds.includes(note.id) ? "Unpin note" : "Pin note"}
                          onClick={() => togglePin(note.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            pinnedNoteIds.includes(note.id) ? "text-blue-600 bg-blue-50" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                          }`}
                        >
                          {pinnedNoteIds.includes(note.id) ? <PinOff size={18} /> : <Pin size={18} />}
                        </button>

                        {/* Edit */}
                        <button
                          title="Edit note"
                          aria-label="Edit note"
                          onClick={() => handleEditNote(note)}
                          className="p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete note"
                          aria-label="Delete note"
                          onClick={() => handleDeleteNote(note)}
                          className="p-2 text-stone-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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

      {/* Add/Edit Modal (simplified placeholder logic) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-stone-900">
                {editingNoteId ? "Edit Note" : "Create New Note"}
              </h3>
              <div className="flex items-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1 border-stone-200 pl-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  {createContent.trim().split(/\s+/).filter(w => w.length > 0).length} words
                </span>
                <span className="flex items-center gap-1 border-l border-stone-200 pl-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {Math.ceil(createContent.trim().split(/\s+/).filter(w => w.length > 0).length / 200)} min read
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Note Title"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                className="w-full text-lg font-bold border-none focus:ring-0 placeholder:text-stone-300"
              />
              <textarea
                placeholder="Start writing..."
                value={createContent}
                onChange={(e) => setCreateContent(e.target.value)}
                className="w-full h-64 resize-none border-none focus:ring-0 text-stone-600 placeholder:text-stone-300"
              />
            </div>
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!createTitle.trim()) return;
                  if (editingNoteId) {
                    setNotes((prev) => prev.map((n) => n.id === editingNoteId ? { ...n, title: createTitle, content: createContent } : n));
                  } else {
                    const newNote: Note = {
                      id: Date.now(),
                      title: createTitle,
                      content: createContent,
                      createdAt: Date.now(),
                    };
                    setNotes((prev) => [newNote, ...prev]);
                  }
                  setShowCreateModal(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingNoteId ? "Save Changes" : "Create Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}