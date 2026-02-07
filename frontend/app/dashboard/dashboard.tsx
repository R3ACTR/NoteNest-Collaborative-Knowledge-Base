"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";

export default function DashboardPage() {
  const [recentNotes] = useState<Array<{ id: number; title: string; updatedAt: string }>>([]);
  const [recentActivity] = useState<Array<{ id: number; action: string; timestamp: string }>>([]);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Header />
        <main className="p-6" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h2 
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Welcome 👋
          </h2>
          <p 
            className="mb-8"
            style={{ 
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-base)'
            }}
          >
            This is your NoteNest dashboard. Get started by creating your first note.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notes Section */}
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Recent Notes
              </h3>
              {recentNotes.length === 0 ? (
                <div 
                  className="bg-white rounded-lg border border-gray-200 p-6"
                  style={{
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <EmptyState
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    title="No recent notes"
                    description="Notes you create or edit will appear here."
                    className="!min-h-0 !py-4"
                  />
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentNotes.map((note) => (
                    <li
                      key={note.id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {note.title}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Updated {note.updatedAt}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Activity Section */}
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <div 
                  className="bg-white rounded-lg border border-gray-200 p-6"
                  style={{
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <EmptyState
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    title="No recent activity"
                    description="Your activity will be displayed here as you use NoteNest."
                    className="!min-h-0 !py-4"
                  />
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentActivity.map((activity) => (
                    <li
                      key={activity.id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {activity.action}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {activity.timestamp}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="/notes"
                className="btn-primary"
                style={{
                  fontSize: 'var(--font-size-base)',
                  padding: 'var(--space-sm) var(--space-lg)'
                }}
              >
                Create Note
              </a>
              <a
                href="/notes"
                className="btn-secondary"
                style={{
                  fontSize: 'var(--font-size-base)',
                  padding: 'var(--space-sm) var(--space-lg)'
                }}
              >
                View All Notes
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
