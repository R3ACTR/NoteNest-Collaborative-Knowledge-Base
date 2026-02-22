"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiService } from "@/lib/api";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  workspaceId?: string;
}

export default function NotificationCenter({ workspaceId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications(workspaceId, 10);
      setNotifications(data.notifications as Notification[]);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch notifications on mount and when workspace changes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      await apiService.dismissNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => {
        const dismissedNotif = notifications.find((n) => n._id === notificationId);
        return dismissedNotif && !dismissedNotif.isRead ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead(workspaceId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention":
        return "💬";
      case "comment":
        return "💭";
      case "permission_invite":
        return "🔑";
      case "note_shared":
        return "📤";
      case "member_added":
        return "👥";
      default:
        return "📢";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-stone-200/50 rounded-lg transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-stone-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
            <h2 className="font-semibold text-stone-900">Notifications</h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {notifications.map((notif) => (
                  <li
                    key={notif._id}
                    className={`p-4 hover:bg-stone-50 transition-colors cursor-pointer ${
                      !notif.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notif.type)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-stone-900">
                          {notif.title}
                        </h3>
                        <p className="text-sm text-stone-600 line-clamp-2 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-stone-400 mt-2">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>

                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif._id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(notif._id);
                        }}
                        className="text-xs text-stone-500 hover:text-stone-700 font-medium ml-auto"
                      >
                        Dismiss
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
