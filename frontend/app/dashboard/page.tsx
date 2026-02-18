"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePermissions } from "@/hooks/usePermissions";
import RouteGuard from "@/components/RouteGuard";

const CREATE_RESTRICTED_TITLE =
  "You need Editor or Admin role to create notes.";

/* ✅ NEW — Time Ago Formatter */
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

  /* ✅ UPDATED — Use timestamps instead of text */
  const [recentNotes] = useState([
    {
      id: 1,
      title: "Project Plan",
      workspace: "Team",
      createdAt: new Date().toISOString(), // Just now
    },
    {
      id: 2,
      title: "Meeting Notes",
      workspace: "Personal",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hr ago
    },
    {
      id: 3,
      title: "Design Ideas",
      workspace: "Product",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
  ]);

  useEffect(() => {
    document.body.style.background = "#000";
    document.documentElement.style.background = "#000";
  }, []);

  const cardStyle = {
    background: "#0b0b0b",
    border: "1px solid #1f1f1f",
    boxShadow: "0 10px 40px rgba(0,0,0,0.9)",
  };

  return (
    <RouteGuard requireAuth>
      <div style={{ background: "#000", minHeight: "100vh", display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, background: "#000" }}>
          <Header title="Dashboard" showSearch />

          <main style={{ background: "#000", minHeight: "100vh", padding: 32 }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

              {/* ✅ Welcome Section */}
              <section
                className={sectionCardClass}
                style={{ ...cardStyle, padding: "24px" }}
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
                  This is your NoteNest dashboard. Get started by creating your first note
                  and organizing your team's knowledge.
                </p>

                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Last updated: {lastUpdated}
                </p>
              </section>

              {/* Quick Actions */}
              <section style={{ ...cardStyle, borderRadius: 16 }}>
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
                  <h3 style={{ color: "#fff" }}>Recent Notes</h3>
                </div>

                <div style={{ padding: 20 }}>
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
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

                      <div style={{ color: "#aaa", fontSize: 13 }}>
                        {note.workspace}
                      </div>

                      {/* ✅ NEW — Dynamic Time */}
                      <div style={{ color: "#666", fontSize: 12 }}>
                        {getTimeAgo(note.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
