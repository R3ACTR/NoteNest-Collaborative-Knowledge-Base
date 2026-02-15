"use client";

import { useState, useEffect } from "react";
import { Tag, X } from "lucide-react";
import { apiService } from "@/lib/api";

interface TagFilterProps {
  workspaceId: string;
  selectedTag?: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({ workspaceId, selectedTag, onSelectTag }: TagFilterProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadTags();
  }, [workspaceId]);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getWorkspaceTags(workspaceId);
      setTags(data);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 items-center">
        <Tag className="w-4 h-4 text-gray-400" />
        
        {/* Selected tag */}
        {selectedTag && (
          <button
            onClick={() => onSelectTag(null)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            {selectedTag}
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Tag dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            {selectedTag ? "Change tag" : "Filter by tag"}
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[150px]">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onSelectTag(tag);
                    setShowDropdown(false);
                  }}
                  className={`
                    w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100
                    ${selectedTag === tag ? "bg-blue-50 text-blue-700" : "text-gray-700"}
                  `}
                >
                  {tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => {
                    onSelectTag(null);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 border-t"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
