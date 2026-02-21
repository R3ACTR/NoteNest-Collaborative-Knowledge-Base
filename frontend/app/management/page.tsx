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
      <div className="flex min-h-screen bg-[#F3F0E6]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Management" />
          <main className="flex-1 p-4 sm:p-8 overflow-auto flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-6">
                <span className="material-icons-outlined text-2xl">admin_panel_settings</span>
              </div>
              <h2 className="font-display text-2xl font-bold mb-2 text-stone-900">
                Admin only
              </h2>
              <p className="text-stone-600 leading-relaxed mb-8">
                You need the Admin role to access Management. This area is for workspace settings, members, and roles.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex px-6 py-3 rounded-full border border-stone-200 text-stone-900 hover:bg-stone-50 font-medium transition-colors whitespace-nowrap w-full justify-center"
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
    <div className="flex min-h-screen bg-[#F3F0E6]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Management" />
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
              <div className="border-b border-stone-100 pb-6 mb-6">
                <h2 className="font-display text-2xl font-bold text-stone-900">
                  Hierarchical RBAC Management
                </h2>
                <p className="text-stone-500 text-sm mt-2">
                  Manage groups, permissions, and access links for granular control over workspace resources.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 border-b border-[#222] pb-1">
                {[
                  { id: 'groups', label: 'Groups' },
                  { id: 'permissions', label: 'Permissions' },
                  { id: 'access-links', label: 'Access Links' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#18181b] text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'groups' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h3 className="font-display text-xl font-bold text-stone-900">
                      User Groups
                    </h3>
                    <button className="bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                      <span className="material-icons-outlined text-[16px]">add</span> Create Group
                    </button>
                  </div>
                  <div className="space-y-3">
                    {groups.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50/50 rounded-2xl border border-stone-200 border-dashed">
                        <span className="material-icons-outlined text-4xl mb-3">group</span>
                        <p className="text-sm font-medium text-stone-600">No groups created yet.</p>
                      </div>
                    ) : (
                      groups.map((group) => (
                        <div key={group._id} className="flex items-center justify-between p-4 border border-stone-200 rounded-2xl bg-white hover:border-stone-300 transition-colors group/card">
                          <div>
                            <p className="font-bold text-stone-900">{group.name}</p>
                            <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                              <span className="material-icons-outlined text-[14px]">person</span> {group.members.length} members
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors" title="Edit">
                               <span className="material-icons-outlined text-[16px]">edit</span>
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                               <span className="material-icons-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h3 className="font-display text-xl font-bold text-stone-900">
                      Resource Permissions
                    </h3>
                    <button className="bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                      <span className="material-icons-outlined text-[16px]">vpn_key</span> Grant Permission
                    </button>
                  </div>
                  <div className="space-y-3">
                    {permissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50/50 rounded-2xl border border-stone-200 border-dashed">
                        <span className="material-icons-outlined text-4xl mb-3">gavel</span>
                        <p className="text-sm font-medium text-stone-600">No permissions granted yet.</p>
                      </div>
                    ) : (
                      permissions.map((perm) => (
                        <div key={perm._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-stone-200 rounded-2xl bg-white hover:border-stone-300 transition-colors">
                          <div>
                            <p className="font-bold text-stone-900">{perm.resourcePath}</p>
                            <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                              <span className="material-icons-outlined text-[14px]">
                                {perm.subjectType === 'user' ? 'person' : 'group'}
                              </span>
                              {perm.subjectType}: {perm.subjectId} • {perm.permissions.join(', ')}
                            </p>
                          </div>
                          <button className="bg-white border border-stone-200 text-red-600 hover:bg-red-50 hover:border-red-200 px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shadow-sm">
                            Revoke
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'access-links' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h3 className="font-display text-xl font-bold text-stone-900">
                      Temporary Access Links
                    </h3>
                    <button className="bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                       <span className="material-icons-outlined text-[16px]">link</span> Create Access Link
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50/50 rounded-2xl border border-stone-200 border-dashed">
                     <span className="material-icons-outlined text-4xl mb-3">construction</span>
                    <p className="text-sm font-medium text-stone-600">Access links functionality coming soon.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
              <div className="border-b border-stone-100 pb-6 mb-6">
                <h2 className="font-display text-2xl font-bold text-stone-900">
                  Feature Flags
                </h2>
                <p className="text-stone-500 text-sm mt-2">
                  Control experimental and optional features. Changes are saved automatically.
                </p>
              </div>
              <FeatureFlagExample />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
