"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import ActivityTimeline from "@/components/ActivityTimeline";

const CREATE_RESTRICTED_TITLE = "You need Editor or Admin role to create notes.";

export default function WorkspaceDashboardPage({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { canCreateNote } = usePermissions();
  const [recentActivity, setRecentActivity] = useState<Array<{ id: number; action: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);

  const workspace = workspaces.find((w) => w.id === workspaceId);

  useEffect(() => {
    if (!workspace) {
      router.push(`/workspace/${activeWorkspace.id}/dashboard`);
    } else if (workspaceId !== activeWorkspace.id) {
      setActiveWorkspace(workspaceId);
    }
  }, [workspace, workspaceId, activeWorkspace.id, router, setActiveWorkspace]);

  if (!workspace) return null;

  useEffect(() => {
    // Simulate loading dashboard data (no backend)
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
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  };

  const sectionCardClass =
    "rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md";

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={`Dashboard - ${workspace.name}`}
          showSearch
          action={
            canCreateNote ? (
              <Link
                href={`/workspace/${workspaceId}/notes?new=1`}
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
            backgroundImage: "linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)"
          }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)" }}
            ></div>
            <div
              className="absolute bottom-32 left-10 w-96 h-96 rounded-full blur-3xl opacity-15"
              style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)" }}
            ></div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-8 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 relative z-10">
            {/* Welcome Section */}
            <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-display text-4xl font-bold mb-3 text-stone-900">
                  Welcome to {workspace.name} 👋
                </h2>
                <p className="text-lg text-stone-600 max-w-2xl">
                  {workspace.description || "This is your workspace dashboard. Get started by creating your first note."}
                </p>
              </div>
            </section>

            {loadError && (
              <ErrorState
                title="Couldn't load dashboard"
                message={loadError}
                variant="error"
                onDismiss={() => setLoadError(null)}
                action={
                  <button
                    type="button"
                    onClick={retryLoad}
                    className="btn-primary"
                    style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-sm) var(--space-md)" }}
                  >
                    Try again
                  </button>
                }
                className="mb-0"
              />
            )}

            {/* Quick Actions — card */}
            <div>
              <section
                className={sectionCardClass}
                style={{ ...cardStyle, minHeight: "160px" }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ borderBottom: "1px solid var(--color-border-light)" }}
                >
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                    style={{
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "var(--color-info)",
                    }}
                    aria-hidden
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Quick Actions
                  </h3>
                </div>
                <div className="flex-1 px-5 py-4 flex flex-wrap items-center gap-3">
                  {canCreateNote ? (
                    <Link
                      href={`/workspace/${workspaceId}/notes?new=1`}
                      className="btn-primary inline-flex items-center gap-2 min-h-[40px]"
                      style={{
                        fontSize: "var(--font-size-sm)",
                        padding: "var(--space-sm) var(--space-md)",
                      }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Note
                    </Link>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 min-h-[40px] rounded-lg border px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                      style={{
                        borderColor: "var(--color-border-light)",
                        color: "var(--color-text-muted)",
                      }}
                      title={CREATE_RESTRICTED_TITLE}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Note
                    </span>
                  )}
                  <Link
                    href={`/workspace/${workspaceId}/notes`}
                    className="btn-secondary inline-flex items-center gap-2 min-h-[40px]"
                    style={{
                      fontSize: "var(--font-size-sm)",
                      padding: "var(--space-sm) var(--space-md)",
                    }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View All Notes
                  </Link>
                </div>
              </section>
            </div>
          </div>

          {/* Toggle: rightmost, vertical center — open/close Recent Activity panel */}
          <button
            type="button"
            onClick={() => setActivityPanelOpen((open) => !open)}
            className="fixed z-30 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] focus-visible:ring-[var(--color-info)]"
            style={{
              top: "50%",
              right: "1.5rem",
              transform: "translateY(-50%)",
              background: "var(--color-info)",
              color: "white",
              borderColor: "rgba(59, 130, 246, 0.4)",
              width: "48px",
              height: "48px",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
            }}
            aria-expanded={activityPanelOpen}
            aria-label={activityPanelOpen ? "Close Recent Activity panel" : "Open Recent Activity panel"}
          >
            <svg
              className="w-5 h-5 shrink-0 transition-transform duration-200"
              style={{ transform: activityPanelOpen ? "rotate(180deg)" : "none" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Recent Activity panel — inline right column */}
          {activityPanelOpen && (
            <aside
              className="w-80 shrink-0 flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 shadow-md"
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border-light)",
                maxHeight: "calc(100vh - 8rem)",
              }}
              role="complementary"
              aria-label="Recent Activity"
            >
              <div
                className="flex items-center justify-between gap-3 px-5 py-4 shrink-0"
                style={{ borderBottom: "1px solid var(--color-border-light)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                    style={{
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "var(--color-info)",
                    }}
                    aria-hidden
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Recent Activity
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActivityPanelOpen(false)}
                  className="btn-icon rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center"
                  style={{ color: "var(--color-text-secondary)" }}
                  aria-label="Close Recent Activity panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 min-h-0">
                <ActivityTimeline workspaceId={workspaceId} />
              </div>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
