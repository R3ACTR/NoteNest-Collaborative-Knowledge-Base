"use client";

import React, { useEffect, useState } from "react";
import { Presence } from "@/types/types";

interface CursorOverlayProps {
  presences: Presence[];
  currentUserId: string;
  editorContainer: HTMLElement | null;
}

interface CursorPosition {
  userId: string;
  displayName: string;
  color: string;
  x: number;
  y: number;
}

const CursorOverlay: React.FC<CursorOverlayProps> = ({
  presences,
  currentUserId,
  editorContainer,
}) => {
  const [cursorPositions, setCursorPositions] = useState<CursorPosition[]>([]);

  useEffect(() => {
    // Update cursor positions based on presences
    const positions: CursorPosition[] = presences
      .filter((p) => p.userId !== currentUserId && p.cursor !== null)
      .map((presence) => ({
        userId: presence.userId,
        displayName: presence.displayName,
        color: presence.color,
        x: Math.random() * (editorContainer?.clientWidth || 800), // Placeholder position
        y: Math.random() * (editorContainer?.clientHeight || 600),
      }));

    setCursorPositions(positions);
  }, [presences, currentUserId, editorContainer]);

  if (!editorContainer) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {cursorPositions.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-75"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
          }}
        >
          {/* Cursor line */}
          <div
            className="w-0.5 h-5 opacity-75"
            style={{ backgroundColor: cursor.color }}
          />

          {/* Cursor label */}
          <div
            className="absolute left-1 top-6 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap font-semibold"
            style={{ 
              backgroundColor: cursor.color,
              opacity: 0.9
            }}
          >
            {cursor.displayName}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorOverlay;
