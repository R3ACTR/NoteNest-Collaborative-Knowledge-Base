"use client";

import React, { useEffect, useState } from "react";
import { Presence } from "@/types/types";

interface PresenceListProps {
  presences: Presence[];
  currentUserId: string;
  onPresenceHover?: (userId: string | null) => void;
}

const PresenceList: React.FC<PresenceListProps> = ({
  presences,
  currentUserId,
  onPresenceHover,
}) => {
  const [highlightedUserId, setHighlightedUserId] = useState<string | null>(
    null
  );

  const handleUserHover = (userId: string) => {
    setHighlightedUserId(userId);
    onPresenceHover?.(userId);
  };

  const handleUserLeave = () => {
    setHighlightedUserId(null);
    onPresenceHover?.(null);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "away":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-stone-800 rounded-lg border border-gray-200 dark:border-stone-700">
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
        Online ({presences.length})
      </span>

      <div className="flex -space-x-2">
        {presences.map((presence) => (
          <div
            key={presence.userId}
            className="relative"
            onMouseEnter={() => handleUserHover(presence.userId)}
            onMouseLeave={handleUserLeave}
            title={`${presence.displayName}${presence.status === 'active' ? ' (active)' : presence.status === 'idle' ? ' (idle)' : ' (away)'}`}
          >
            {/* Avatar Circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-transform hover:scale-110 border-2 border-white dark:border-stone-900 ${
                highlightedUserId === presence.userId ? "ring-2 ring-offset-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: presence.color || "#999" }}
            >
              {presence.avatarUrl ? (
                <img
                  src={presence.avatarUrl}
                  alt={presence.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                presence.displayName.charAt(0).toUpperCase()
              )}

              {/* Status dot */}
              <div
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-stone-900 ${getStatusColor(
                  presence.status
                )}`}
              />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {presence.displayName}
            </div>
          </div>
        ))}
      </div>

      {presences.length === 0 && (
        <span className="text-xs text-gray-400 italic ml-2">No one else online</span>
      )}
    </div>
  );
};

export default PresenceList;
