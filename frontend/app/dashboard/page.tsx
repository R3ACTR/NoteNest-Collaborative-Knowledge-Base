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

  useEffect(() => {
    document.body.style.background = "#000";
    document.documentElement.style.background = "#000";
  }, []);

  const cardStyle = {
    background: "#0b0b0b",
    border: "1px solid #1f1f1f",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.9)",
  };

  return (
    <RouteGuard requireAuth>
      <div style={{ background: "#000", minHeight: "100vh", display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, background: "#000" }}>
          <Header title="Dashboard" showSearch />

          <main style={{ background: "#000", minHeight: "100vh", padding: 32 }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

              {/* Welcome Section */}
              <section
                style={{ ...cardStyle, padding: "24px", borderRadius: 16 }}
              >
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Welcome back!
                </h2>

                <p
                  className="text-sm mb-3"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  This is your NoteNest dashboard. Get started by creating your
                  first note and organizing your team's knowledge.
                </p>
              </section>

              {/* Quick Actions */}
              <section style={{ ...cardStyle, borderRadius: 16, marginTop: 24 }}>
                <div style={{ padding: 20, borderBottom: "1px solid #222" }}>
                  <h3 style={{ color: "#fff" }}>Quick Actions</h3>
                </div>

                <div style={{ padding: 20, display: "flex", gap: 12 }}>
                  {canCreateNote && (
                    <Link href="/notes?new=1" className="btn-primary">
                      Create Note
                    </Link>
                  )}

                  <Link
                    href="/notes"
                    style={{
                      border: "1px solid #333",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: 8,
                    }}
                  >
                    View All Notes
                  </Link>
                </div>
              </section>

              {/* Recent Notes */}
              <section
                style={{
                  ...cardStyle,
                  borderRadius: 16,
                  marginTop: 32,
                }}
              >
                <div style={{ padding: 20, borderBottom: "1px solid #222" }}>
                  <h3
                    style={{
                      color: "#e5e7eb",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    Recent Notes
                    <span
                      style={{
                        background: "rgba(167, 139, 250, 0.15)",
                        color: "#a78bfa",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {recentNotes.length}
                    </span>
                  </h3>
                </div>

                <div style={{ padding: 20 }}>
                  {recentNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <div className="text-2xl mb-3">📝</div>
                      <div className="text-lg font-medium mb-1">
                        No recent notes
                      </div>
                      <div className="text-sm">
                        Start by creating your first note.
                      </div>

                      {canCreateNote && (
                        <Link
                          href="/notes?new=1"
                          className="mt-4 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm transition"
                        >
                          Create Note
                        </Link>
                      )}
                    </div>
                  ) : (
                    recentNotes.map((note) => (
                      <div
                        key={note.id}
                        className="
                          transition-all duration-200 ease-in-out
                          hover:scale-[1.02]
                          hover:shadow-lg
                          hover:border-gray-500/40
                          cursor-pointer
                        "
                        style={{
                          padding: 16,
                          border: "1px solid #222",
                          borderRadius: 12,
                          marginBottom: 12,
                          background: "#0f0f0f",
                        }}
                      >
                        <div style={{ color: "#fff", fontWeight: 600 }}>
                          {note.title}
                        </div>

                        <div
                          className={`text-sm font-medium ${
                            note.workspace === "Team"
                              ? "text-purple-400"
                              : note.workspace === "Personal"
                              ? "text-blue-400"
                              : note.workspace === "Product"
                              ? "text-green-400"
                              : "text-gray-400"
                          }`}
                        >
                          {note.workspace}
                        </div>

                        <div style={{ color: "#666", fontSize: 12 }}>
                          {getTimeAgo(note.createdAt)}
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
