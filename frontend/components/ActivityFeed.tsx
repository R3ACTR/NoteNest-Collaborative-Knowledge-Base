"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

interface Activity {
  _id: string;
  actorId: string;
  action: string;
  target: string;
  targetType: string;
  targetTitle?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ActivityFeedProps {
  workspaceId?: string;
  noteId?: string;
  limit?: number;
  showTitle?: boolean;
}

export default function ActivityFeed({
  workspaceId,
  noteId,
  limit = 15,
  showTitle = true,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data;
      if (noteId) {
        data = await apiService.getNoteActivity(noteId, limit);
      } else if (workspaceId) {
        data = await apiService.getWorkspaceActivity(workspaceId, limit);
      } else {
        return;
      }

      setActivities(data.activities as Activity[]);
    } catch (err) {
      console.error("Failed to fetch activity feed:", err);
      setError("Failed to load activity feed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, noteId, limit]);

  const formatAction = (action: string, metadata: Record<string, unknown>): string => {
    switch (action) {
      case "note_created":
        return `Created note "${String(metadata.title || "Untitled")}"`;
      case "note_updated":
        return `Updated note "${String(metadata.title || "Untitled")}"`;
      case "note_deleted":
        return `Deleted note "${String(metadata.title || "Untitled")}"`;
      case "member_added":
        return `Added member with role "${String(metadata.role)}"`;
      case "member_removed":
        return `Removed member`;
      case "member_role_updated":
        return `Changed role from "${String(metadata.oldRole)}" to "${String(metadata.newRole)}"`;
      default:
        return action.replace(/_/g, " ");
    }
  };

  const getActionIcon = (action: string): string => {
    switch (action) {
      case "note_created":
        return "📝";
      case "note_updated":
        return "✏️";
      case "note_deleted":
        return "🗑️";
      case "member_added":
        return "➕";
      case "member_removed":
        return "➖";
      case "member_role_updated":
        return "🔑";
      default:
        return "📌";
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-stone-500">
        <p className="text-sm">Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center text-stone-500">
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && (
        <h2 className="px-6 pt-6 font-semibold text-stone-900 mb-4">Recent Activity</h2>
      )}

      <div className="space-y-3 px-6 pb-6">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="border rounded-lg p-4 bg-white hover:bg-stone-50 transition-colors border-stone-200"
          >
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">
                {getActionIcon(activity.action)}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {formatAction(activity.action, activity.metadata)}
                    </p>
                    {activity.actorId && (
                      <p className="text-xs text-stone-500 mt-1">
                        By user {activity.actorId.substring(0, 8)}...
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-stone-400 flex-shrink-0">
                    {formatTime(activity.createdAt)}
                  </span>
                </div>

                {activity.targetTitle && (
                  <p className="text-xs text-stone-500 mt-2">
                    <strong>{activity.targetTitle}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
