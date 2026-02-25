"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { FileX, Search as SearchIcon, Copy, Check } from "lucide-react";

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
  const [sortBy, setSortBy] =
    useState<"newest" | "oldest" | "az">("newest");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null);

  const createButtonRef = useRef<HTMLButtonElement>(null);

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
  };

  const handleCreateNote = () => {
    if (!canCreateNote) return;
    setEditingNoteId(null);
    setCreateTitle("");
    setCreateContent("");
    setShowCreateModal(true);
  };

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

  const toggleSelectNote = (id: number) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedNoteIds.length} selected notes?`)) return;
    setNotes(prev => prev.filter(n => !selectedNoteIds.includes(n.id)));
    setPinnedNoteIds(prev => prev.filter(id => !selectedNoteIds.includes(id)));
    setSelectedNoteIds([]);
    setIsSelectionMode(false);
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {!isViewer && notes.length > 0 && (
                  <button
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedNoteIds([]);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {isSelectionMode ? "Cancel selection" : "Select notes"}
                  </button>
                )}

                {!isViewer && isSelectionMode && selectedNoteIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete selected ({selectedNoteIds.length})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="az">A–Z</option>
                </select>
              </div>
            </div>

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
                action={
                  !searchQuery && !pinnedOnly && canCreateNote ? (
                    <button
                      onClick={handleCreateNote}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                      Create your first note
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="space-y-3">
                {sortedNotes.map((note) => (
                  <li
                    key={note.id}
                    className="border rounded-xl p-4 bg-white flex justify-between group hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {!isViewer && isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.includes(note.id)}
                          onChange={() => toggleSelectNote(note.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold">{note.title}</h4>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(note.createdAt)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {note.content || "No content"}
                        </p>
                      </div>
                    </div>

                    {!isViewer && (
                      <div className="flex items-start gap-1">
                        {/* Copy button */}
                        <button
                          title={copiedNoteId === note.id ? "Copied!" : "Copy note"}
                          onClick={() => {
                            const text = `${note.title}\n\n${note.content || ""}`.trim();
                            navigator.clipboard.writeText(text);
                            setCopiedNoteId(note.id);
                            setTimeout(() => setCopiedNoteId(null), 2000);
                          }}
                          className={`flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors ${copiedNoteId === note.id ? 'text-green-600' : 'text-gray-400'}`}
                        >
                          {copiedNoteId === note.id ? <Check size={16} /> : <Copy size={16} />}
                        </button>

                        {/* Export button */}
                        <button
                          title="Export as Markdown"
                          onClick={() => handleExportNote(note)}
                          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          📥
                        </button>

                        <button
                          aria-label={pinnedNoteIds.includes(note.id) ? "Unpin note" : "Pin note"}
                          onClick={() => togglePin(note.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {pinnedNoteIds.includes(note.id) ? "📌" : "📍"}
                        </button>

                        <button
                          aria-label="Edit note"
                          onClick={() => handleEditNote(note)}
                          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          ✏️
                        </button>

                        <button
                          aria-label="Delete note"
                          onClick={() => handleDeleteNote(note)}
                          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
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
  );
}