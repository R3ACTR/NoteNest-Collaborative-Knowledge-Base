"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePermissions } from "@/hooks/usePermissions";
import FeatureFlagExample from "@/components/FeatureFlagExample";

export default function ManagementPage() {
  const { canAccessManagement, isAdmin } = usePermissions();

  if (!canAccessManagement) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Management" />
          <main
            className="flex-1 p-6 overflow-auto flex items-center justify-center"
            style={{ background: "var(--color-background)" }}
          >
            <div
              className="max-w-md rounded-xl border p-6 text-center"
              style={{
                borderColor: "var(--color-border-light)",
                background: "var(--color-background)",
              }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Admin only
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                You need the Admin role to access Management. This area is for workspace settings, members, and roles.
              </p>
              <Link
                href="/dashboard"
                className="btn-secondary inline-block"
                style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-sm) var(--space-md)" }}
              >
                Back to Dashboard
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Management" />
        <main
          className="flex-1 p-6 overflow-auto"
          style={{ background: "var(--color-background)" }}
        >
          <div className="max-w-3xl mx-auto">
            <section
              className="rounded-2xl border p-6 mb-6"
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border-light)",
              }}
            >
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Workspace settings
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Admin-only area. Future: invite/remove members, change roles, workspace settings, delete workspace.
              </p>
              {isAdmin && (
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  You are signed in as Admin — full access.
                </p>
              )}
            </section>

            <section
              className="rounded-2xl border p-6"
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border-light)",
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Feature Flags
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Control experimental and optional features. Changes are saved automatically.
              </p>
              <FeatureFlagExample />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
