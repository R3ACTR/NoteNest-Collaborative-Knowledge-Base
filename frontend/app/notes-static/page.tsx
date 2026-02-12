"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface StaticNote {
  id: number;
  title: string;
  preview: string;
  updatedAt: string;
}

const MOCK_NOTES: StaticNote[] = [
  {
    id: 1,
    title: "Project Planning",
    preview: "Outline milestones, deadlines, and deliverables for Q1.",
    updatedAt: "2 hours ago",
  },
  {
    id: 2,
    title: "Meeting Notes",
    preview: "Discussed API changes and frontend integration details.",
    updatedAt: "Yesterday",
  },
  {
    id: 3,
    title: "Design Ideas",
    preview: "Exploring card-based layouts and subtle hover effects.",
    updatedAt: "3 days ago",
  },
];

export default function StaticNotesPage() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Static Notes List" />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4">
              {MOCK_NOTES.map((note) => (
                <li
                  key={note.id}
                  className="rounded-xl border p-4 transition hover:shadow-md"
                  style={{
                    background: "var(--color-background)",
                    borderColor: "var(--color-border-light)",
                  }}
                >
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {note.title}
                  </h3>

                  <p
                    className="text-sm mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {note.preview}
                  </p>

                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Updated {note.updatedAt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
