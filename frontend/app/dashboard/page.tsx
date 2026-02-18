"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import RouteGuard from "@/components/RouteGuard";

const CREATE_RESTRICTED_TITLE = "You need Editor or Admin role to create notes.";

export default function DashboardPage() {
  const { canCreateNote } = usePermissions();

  const [recentActivity, setRecentActivity] = useState<
    Array<{ id: number; action: string; timestamp: string }>
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);

  // ✅ NEW Recent Notes Mock Data
  const [recentNotes] = useState([
    { id: 1, title: "Project Plan", workspace: "Team", time: "2 hours ago" },
    { id: 2, title: "Meeting Notes", workspace: "Personal", time: "Yesterday" },
    { id: 3, title: "Design Ideas", workspace: "Product", time: "3 days ago" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecentActivity([]);
      setLoadError(null);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const retryLoad = () => {
    setLoadError(null);
    setIsLoading(true);
    setTimeout(() => {
      setRecentActivity([]);
      setIsLoading(false);
    }, 600);
  };

  const cardStyle = {
    background: "var(--color-background)",
    borderColor: "var(--color-border-light)",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  };

  const sectionCardClass =
    "rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md";

  return (
    <RouteGuard requireAuth>
      <div className="flex">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            title="Dashboard"
            showSearch
            action={
              canCreateNote ? (
                <Link
                  href="/notes?new=1"
                  className="btn-primary"
                  data-shortcut="create-note"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    padding: "var(--space-sm) var(--space-md)",
                    minHeight: "36px",
                  }}
                >
                  Create Note
                </Link>
              ) : (
                <span
                  className="inline-flex items-center rounded-lg border px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                  style={{
                    minHeight: "36px",
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-text-muted)",
                  }}
                  title={CREATE_RESTRICTED_TITLE}
                >
                  Create Note
                </span>
              )
            }
          />

          <main
            className="flex-1 overflow-auto flex gap-6 relative"
            style={{
              background: "var(--color-background)",
              backgroundImage:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)",
            }}
          >
            <div className="flex-1 min-w-0 flex flex-col gap-8 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 relative z-10">

              {/* Quick Actions */}
              <section
                className={sectionCardClass}
                style={{ ...cardStyle, minHeight: "160px" }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{
                    borderBottom: "1px solid var(--color-border-light)",
                  }}
                >
                  <h3
                    className="text-base font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Quick Actions
                  </h3>
                </div>

                <div className="flex-1 px-5 py-4 flex flex-wrap items-center gap-3">
                  {canCreateNote && (
                    <Link href="/notes?new=1" className="btn-primary">
                      Create Note
                    </Link>
                  )}

                  <Link href="/notes" className="btn-secondary">
                    View All Notes
                  </Link>
                </div>
              </section>

              {/* ✅ Recent Notes Section */}
              <section className={sectionCardClass} style={cardStyle}>
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{
                    borderBottom: "1px solid var(--color-border-light)",
                  }}
                >
                  <h3
                    className="text-base font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Recent Notes
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border p-4 flex justify-between items-center hover:shadow-sm transition"
                      style={cardStyle}
                    >
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {note.title}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {note.workspace}
                        </div>
                      </div>

                      <div
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {note.time}
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
