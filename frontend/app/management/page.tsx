"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePermissions } from "@/hooks/usePermissions";
import FeatureFlagExample from "@/components/FeatureFlagExample";
import { apiService } from "@/lib/api";

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  path: string;
}

interface Permission {
  _id: string;
  resourcePath: string;
  subjectId: string;
  subjectType: 'user' | 'group';
  permissions: string[];
  expiresAt?: string;
}

export default function ManagementPage() {
  const { canAccessManagement, isAdmin } = usePermissions();
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'groups' | 'permissions' | 'access-links'>('groups');

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
          <div className="max-w-4xl mx-auto">
            <section
              className="rounded-2xl border p-6 mb-6"
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border-light)",
              }}
            >
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Hierarchical RBAC Management
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Manage groups, permissions, and access links for granular control over workspace resources.
              </p>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6">
                {[
                  { id: 'groups', label: 'Groups' },
                  { id: 'permissions', label: 'Permissions' },
                  { id: 'access-links', label: 'Access Links' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'groups' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      User Groups
                    </h3>
                    <button className="btn-primary text-sm">Create Group</button>
                  </div>
                  <div className="space-y-3">
                    {groups.length === 0 ? (
                      <p className="text-sm text-gray-500">No groups created yet.</p>
                    ) : (
                      groups.map((group) => (
                        <div key={group._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{group.name}</p>
                            <p className="text-sm text-gray-500">{group.members.length} members</p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                            <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      Resource Permissions
                    </h3>
                    <button className="btn-primary text-sm">Grant Permission</button>
                  </div>
                  <div className="space-y-3">
                    {permissions.length === 0 ? (
                      <p className="text-sm text-gray-500">No permissions granted yet.</p>
                    ) : (
                      permissions.map((perm) => (
                        <div key={perm._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{perm.resourcePath}</p>
                            <p className="text-sm text-gray-500">
                              {perm.subjectType}: {perm.subjectId} - {perm.permissions.join(', ')}
                            </p>
                          </div>
                          <button className="text-sm text-red-600 hover:text-red-800">Revoke</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'access-links' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      Temporary Access Links
                    </h3>
                    <button className="btn-primary text-sm">Create Access Link</button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Access links functionality coming soon.</p>
                  </div>
                </div>
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
