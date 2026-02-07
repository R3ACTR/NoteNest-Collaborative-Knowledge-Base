"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import EmptyState from "@/components/EmptyState";

interface Note {
  id: number;
  title: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, title: "Project Overview" },
    { id: 2, title: "Meeting Notes" },
  ]);

  const handleCreateNote = () => {
    // In a real app, this would open a modal or navigate to create page
    console.log("Create note clicked");
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notes</h1>
          <button 
            onClick={handleCreateNote}
            className="btn-primary"
            style={{
              fontSize: 'var(--font-size-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              minHeight: '36px'
            }}
          >
            Create Note
          </button>
        </div>

        {notes.length === 0 ? (
          <EmptyState
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No notes yet"
            description="Get started by creating your first note. Organize your thoughts, ideas, and knowledge in one place."
            action={
              <button 
                onClick={handleCreateNote}
                className="btn-primary"
                style={{
                  fontSize: 'var(--font-size-base)',
                  padding: 'var(--space-sm) var(--space-lg)'
                }}
              >
                Create Your First Note
              </button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex items-center justify-between group"
              >
                <span className="text-gray-900 font-medium">{note.title}</span>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 p-1"
                  aria-label={`Delete ${note.title}`}
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    padding: 'var(--space-xs)'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
