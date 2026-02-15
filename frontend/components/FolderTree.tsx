"use client";

import { useState, useEffect } from "react";
import { Folder, ChevronRight, ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import { apiService } from "@/lib/api";

interface FolderData {
  _id: string;
  name: string;
  workspaceId: string;
  parentId: string | null;
  path: string;
  createdBy: string;
}

interface FolderTreeProps {
  workspaceId: string;
  selectedFolderId?: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export default function FolderTree({ workspaceId, selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, [workspaceId]);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getFolders(workspaceId);
      setFolders(data);
    } catch (error) {
      console.error("Failed to load folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Build tree structure from flat list
  const buildTree = (parentId: string | null = null): FolderData[] => {
    return folders
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderFolder = (folder: FolderData, level: number = 0) => {
    const children = buildTree(folder._id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = selectedFolderId === folder._id;

    return (
      <div key={folder._id}>
        <div
          className={`
            flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer
            hover:bg-gray-100 transition-colors
            ${isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelectFolder(folder._id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder._id);
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <span className="w-4" />
            )}
          </button>
          <Folder className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium truncate">{folder.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const rootFolders = buildTree(null);

  return (
    <div className="py-2">
      {/* Root/All Notes option */}
      <div
        className={`
          flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer
          hover:bg-gray-100 transition-colors
          ${selectedFolderId === null ? "bg-blue-50 text-blue-700" : "text-gray-700"}
        `}
        onClick={() => onSelectFolder(null)}
      >
        <Folder className="w-4 h-4" />
        <span className="text-sm font-medium">All Notes</span>
      </div>

      {/* Folder tree */}
      {rootFolders.map((folder) => renderFolder(folder))}

      {rootFolders.length === 0 && (
        <p className="text-sm text-gray-400 px-3 py-2">No folders yet</p>
      )}
    </div>
  );
}
