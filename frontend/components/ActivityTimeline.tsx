import React, { useEffect, useState } from 'react';
import { apiService, type AuditLog } from '../lib/api';

interface ActivityTimelineProps {
  workspaceId: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ workspaceId }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const auditLogs = await apiService.getAuditLogs(workspaceId);
        setLogs(auditLogs);
      } catch (err) {
        setError('Failed to load activity logs');
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [workspaceId]);

  const formatAction = (action: string, metadata: Record<string, any>) => {
    switch (action) {
      case 'note_created':
        return `Created note "${metadata.title}"`;
      case 'note_updated':
        return `Updated note "${metadata.title}"`;
      case 'note_deleted':
        return `Deleted note "${metadata.title}"`;
      case 'workspace_created':
        return `Created workspace "${metadata.name}"`;
      case 'member_added_to_workspace':
        return `Added user with role "${metadata.role}"`;
      case 'member_removed_from_workspace':
        return `Removed user with role "${metadata.role}"`;
      case 'member_role_updated':
        return `Changed user role from "${metadata.oldRole}" to "${metadata.newRole}"`;
      case 'user_registered':
        return `Registered as a new user`;
      case 'user_logged_in':
        return `Logged in`;
      default:
        return action.replace(/_/g, ' ');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))} minutes ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <div className="p-4">Loading activity...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error === 'Permission denied' ? 'You do not have permission to view activity logs.' : error}</div>;
  }

  if (logs.length === 0) {
    return <div className="p-4 text-gray-500">No activity yet</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Activity Timeline</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {log.actor.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{log.actor.name}</span>{' '}
                {formatAction(log.action, log.metadata)}
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(log.timestamp)} • {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
