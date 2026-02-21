"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePermissions } from "@/hooks/usePermissions";
import RouteGuard from "@/components/RouteGuard";

const CREATE_RESTRICTED_TITLE =
  "You need Editor or Admin role to create notes.";

/* ✅ Time Ago Formatter */
function getTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds} sec ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default function DashboardPage() {
  const { canCreateNote } = usePermissions();

  /* ✅ Badge Color Logic (NEW) */
  const getWorkspaceBadgeClass = (workspace: string) => {
    switch (workspace) {
      case "Team":
        return "bg-purple-500/10 text-purple-400";
      case "Personal":
        return "bg-blue-500/10 text-blue-400";
      case "Product":
        return "bg-green-500/10 text-green-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  /* ✅ UPDATED — Use timestamps instead of text */
  const [recentNotes] = useState([
    {
      id: 1,
      title: "Project Plan",
      workspace: "Team",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Meeting Notes",
      workspace: "Personal",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      title: "Design Ideas",
      workspace: "Product",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  return (
    <RouteGuard requireAuth>
      <div className="flex min-h-screen bg-[#F3F0E6]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Dashboard" showSearch />

          <main className="flex-1 overflow-auto p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

              {/* Welcome Section */}
              <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
                <h2 className="font-display text-4xl font-bold mb-3 text-stone-900">
                  Welcome back!
                </h2>

                <p className="text-lg text-stone-600">
                  This is your NoteNest dashboard. Get started by creating your
                  first note and organizing your team's knowledge.
                </p>
              </section>

              {/* Quick Actions */}
              <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
                <h3 className="font-display text-2xl font-bold mb-6 text-stone-900">Quick Actions</h3>

                <div className="flex flex-wrap gap-4 items-center">
                  {canCreateNote && (
                    <Link href="/notes?new=1" className="bg-[#18181b] hover:bg-[#27272a] text-white px-6 py-3 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                       <span className="material-icons-outlined text-sm">add</span> Create Note
                    </Link>
                  )}

                  <Link href="/notes" className="bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 px-6 py-3 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">article</span> View All Notes
                  </Link>
                </div>
              </section>

              {/* Recent Notes */}
              <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="font-display text-2xl font-bold text-stone-900">
                    Recent Notes
                  </h3>
                  <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold border border-stone-200">
                    {recentNotes.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentNotes.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
                      <span className="material-icons-outlined text-4xl mb-3">description</span>
                      <div className="text-lg font-medium text-stone-900 mb-1">
                        No recent notes
                      </div>
                      <div className="text-sm">
                        Start by creating your first note.
                      </div>

                      {canCreateNote && (
                        <Link
                          href="/notes?new=1"
                          className="mt-4 px-6 py-2 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-sm font-medium transition flex items-center gap-2"
                        >
                          <span className="material-icons-outlined text-sm">add</span> Create Note
                        </Link>
                      )}
                    </div>
                  ) : (
                    recentNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-6 bg-white border border-stone-200 rounded-2xl cursor-pointer hover:border-stone-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="font-semibold text-lg text-stone-900 group-hover:text-blue-600 transition-colors">
                            {note.title}
                          </div>
                          <button className="text-stone-400 hover:text-stone-900 transition-colors">
                            <span className="material-icons-outlined text-sm">more_horiz</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                          <div
                            className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                              note.workspace === "Team"
                                ? "bg-purple-100 text-purple-700"
                                : note.workspace === "Personal"
                                ? "bg-blue-100 text-blue-700"
                                : note.workspace === "Product"
                                ? "bg-green-100 text-green-700"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {note.workspace}
                          </div>

                          <div className="text-stone-500 text-xs font-medium flex items-center gap-1">
                            <span className="material-icons-outlined text-[14px]">schedule</span>
                            {getTimeAgo(note.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
