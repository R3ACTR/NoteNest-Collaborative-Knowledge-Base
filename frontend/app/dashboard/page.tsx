"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ActivityFeed from "@/components/ActivityFeed";
import { usePermissions } from "@/hooks/usePermissions";
import RouteGuard from "@/components/RouteGuard";

/* -------- Time Ago Helper -------- */
function getTimeAgo(value: string | number | undefined) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "Recently";

  const now = new Date();
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

/* -------- Safe LocalStorage Read -------- */
function loadNotesSafely() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("notenest-notes");
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { canCreateNote } = usePermissions();
  const [notes, setNotes] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>("");

  /* Load notes safely */
  useEffect(() => {
    setNotes(loadNotesSafely());

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentWorkspaceId");
      if (stored) setWorkspaceId(stored);
    }
  }, []);

  /* Recent notes (latest 5) */
  const recentNotes = [...notes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <RouteGuard requireAuth>
      <div className="flex min-h-screen bg-black">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Dashboard" showSearch />

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-8">

              {/* Welcome */}
              <section className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Welcome back!
                </h2>
                <p className="text-gray-400">
                  Manage and organize your notes from one place.
                </p>
              </section>
              {/* Stats */}
              <section className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-6">
                <div className="flex gap-6 text-sm text-gray-400">

                <span
  className="cursor-pointer hover:underline"
  onClick={() => router.push("/notes")}
>
  {notes.length} total notes
</span>

<span
  className="cursor-pointer hover:underline"
  onClick={() => router.push("/notes")}
>
  {notes.filter((n) => n.isPinned).length} pinned notes
</span>

                </div>
              </section>
              {/* Quick Actions */}
              <section className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>

                <div className="flex gap-4">
                  {canCreateNote && (
                    <Link
                      href="/notes?new=1"
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      + Create Note
                    </Link>
                  )}

                  <Link
                    href="/notes"
                    className="px-5 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-800"
                  >
                    View All Notes
                  </Link>
                </div>
              </section>

              {/* Recent Notes */}
              <section className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Recent Notes
                  </h3>
                  <span className="text-sm text-gray-400">
                    {recentNotes.length}
                  </span>
                </div>

                {recentNotes.length === 0 ? (
                  <div className="text-gray-400 text-center py-10">
                    No recent notes found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentNotes.map((note) => (
                      <div
                        key={note.id}
                        className="border border-gray-800 rounded-xl p-4 bg-[#0f0f0f]"
                      >
                        <div className="text-white font-semibold">
                          {note.title}
                        </div>

                        <div className="text-sm text-gray-400 mt-1">
                          {note.workspace ?? "Personal"}
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                          {getTimeAgo(note.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

                </div>

                {/* Activity Feed Sidebar */}
                {workspaceId && (
                  <div className="lg:col-span-1">
                    <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl overflow-hidden">
                      <ActivityFeed workspaceId={workspaceId} limit={10} showTitle={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}