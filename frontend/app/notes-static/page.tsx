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
    <div className="flex min-h-screen bg-[#F3F0E6]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Static Notes List" />

        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4">
              {MOCK_NOTES.map((note) => (
                <li
                  key={note.id}
                  className="rounded-3xl border border-stone-200 p-6 bg-white transition hover:shadow-md group"
                >
                  <h3 className="font-display text-2xl font-bold mb-2 text-stone-900 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </h3>

                  <p className="text-base text-stone-600 mb-4 line-clamp-2">
                    {note.preview}
                  </p>

                  <span className="text-sm text-stone-500 font-medium flex items-center gap-1">
                    <span className="material-icons-outlined text-[14px]">schedule</span> Updated {note.updatedAt}
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
