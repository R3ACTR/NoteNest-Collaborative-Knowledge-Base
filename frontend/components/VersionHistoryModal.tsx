"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { NoteVersion, Note, NoteDiff } from "../../shared/types";
import { usePermissions } from "@/hooks/usePermissions";

interface VersionHistoryModalProps {
  noteId: string;
  currentNote: Note;
  onClose: () => void;
  onNoteRestored: (restoredNote: Note) => void;
}

export default function VersionHistoryModal({
  noteId,
  currentNote,
  onClose,
  onNoteRestored,
}: VersionHistoryModalProps) {
  const { canEditNote } = usePermissions();
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [selectedFromVersion, setSelectedFromVersion] = useState<NoteVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [diff, setDiff] = useState<NoteDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSliderValue, setCurrentSliderValue] = useState(0);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const fetchedVersions = await apiService.getNoteVersions(noteId);
        setVersions(fetchedVersions);
        setSelectedVersion(fetchedVersions[0] || null); // Select latest version
        setCurrentSliderValue(fetchedVersions.length - 1); // Set slider to latest version
      } catch (err) {
        setError("Failed to load version history");
      } finally {
        setIsLoading(false);
      }
    };
    loadVersions();
  }, [noteId]);

  useEffect(() => {
    if (versions.length > 0) {
      const version = versions[currentSliderValue];
      setSelectedVersion(version);
    }
  }, [currentSliderValue, versions]);

  useEffect(() => {
    const loadDiff = async () => {
      if (selectedFromVersion && selectedVersion) {
        try {
          const diffData = await apiService.getNoteDiff(
            noteId,
            selectedFromVersion.versionNumber,
            selectedVersion.versionNumber
          );
          setDiff(diffData);
        } catch (err) {
          setError("Failed to load diff");
        }
      } else {
        setDiff(null);
      }
    };
    loadDiff();
  }, [selectedFromVersion, selectedVersion, noteId]);

  const handleRestore = async () => {
    if (!selectedVersion || !canEditNote) return;

    setIsRestoring(true);
    try {
      const result = await apiService.restoreNoteVersion(
        noteId,
        selectedVersion.versionNumber,
        "current-user-id" // TODO: get current user ID
      );
      onNoteRestored(result.note);
      onClose();
    } catch (err) {
      setError("Failed to restore version");
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-history-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-xl border shadow-xl animate-scale-in flex"
        style={{
          background: "var(--color-background)",
          borderColor: "var(--color-border-light)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Version List */}
        <div className="w-1/3 border-r flex flex-col" style={{ borderColor: "var(--color-border-light)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--color-border-light)" }}>
            <h2
              id="version-history-title"
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Version History
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : versions.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No versions found
                </p>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--color-border-light)" }}>
                {versions.map((version) => (
                  <li key={version._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedVersion(version)}
                      className={`w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset ${
                        selectedVersion?._id === version._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                      style={{
                        borderColor: selectedVersion?._id === version._id ? "var(--color-info)" : "transparent"
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                            Version {version.versionNumber}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {formatDate(version.timestamp)}
                          </p>
                          {version.metadata?.reason && (
                            <p className="text-xs mt-1 italic" style={{ color: "var(--color-text-muted)" }}>
                              {version.metadata.reason}
                            </p>
                          )}
                        </div>
                        {version.versionNumber === versions[0]?.versionNumber && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Current
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Version Preview */}
        <div className="flex-1 flex flex-col">
          {/* Time Travel Slider */}
          {versions.length > 1 && (
            <div className="p-4 border-b" style={{ borderColor: "var(--color-border-light)" }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Time Travel: Version {selectedVersion?.versionNumber || 1}
              </label>
              <input
                type="range"
                min="0"
                max={versions.length - 1}
                value={currentSliderValue}
                onChange={(e) => setCurrentSliderValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                <span>Version 1</span>
                <span>Latest</span>
              </div>
            </div>
          )}

          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border-light)" }}>
            <div>
              <h3 className="text-lg font-medium" style={{ color: "var(--color-text-primary)" }}>
                {selectedVersion ? `Version ${selectedVersion.versionNumber}` : 'Select a version'}
              </h3>
              {selectedVersion && (
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {formatDate(selectedVersion.timestamp)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {canEditNote && selectedVersion && selectedVersion.versionNumber !== versions[0]?.versionNumber && (
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="btn-primary text-sm"
                  style={{ padding: "var(--space-xs) var(--space-sm)" }}
                >
                  {isRestoring ? "Restoring…" : "Restore"}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-sm"
                style={{ padding: "var(--space-xs) var(--space-sm)" }}
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedVersion ? (
              <div className="space-y-4">
                {/* Diff Visualization */}
                {diff && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                      Changes from Version {selectedFromVersion?.versionNumber}
                    </h4>
                    <div className="space-y-2">
                      {diff.title.changed && (
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>Title:</p>
                          <div className="text-xs p-2 rounded border" style={{ background: "var(--color-background)", borderColor: "var(--color-border-light)" }}>
                            {diff.title.diff.map((part: { operation: string; text: string }, index: number) => (
                              <span
                                key={index}
                                style={{
                                  backgroundColor: part.operation === 'delete' ? '#fee2e2' : part.operation === 'insert' ? '#d1fae5' : 'transparent',
                                  textDecoration: part.operation === 'delete' ? 'line-through' : 'none',
                                  color: part.operation === 'delete' ? '#dc2626' : part.operation === 'insert' ? '#16a34a' : 'inherit'
                                }}
                              >
                                {part.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {diff.content.changed && (
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>Content:</p>
                          <div className="text-xs p-2 rounded border whitespace-pre-wrap" style={{ background: "var(--color-background)", borderColor: "var(--color-border-light)" }}>
                            {diff.content.diff.map((part: { operation: string; text: string }, index: number) => (
                              <span
                                key={index}
                                style={{
                                  backgroundColor: part.operation === 'delete' ? '#fee2e2' : part.operation === 'insert' ? '#d1fae5' : 'transparent',
                                  textDecoration: part.operation === 'delete' ? 'line-through' : 'none',
                                  color: part.operation === 'delete' ? '#dc2626' : part.operation === 'insert' ? '#16a34a' : 'inherit'
                                }}
                              >
                                {part.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Title
                  </h4>
                  <p className="text-sm p-3 rounded border" style={{ background: "var(--color-background)", borderColor: "var(--color-border-light)" }}>
                    {selectedVersion.contentSnapshot.title}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Content
                  </h4>
                  <div
                    className="text-sm p-3 rounded border whitespace-pre-wrap"
                    style={{
                      background: "var(--color-background)",
                      borderColor: "var(--color-border-light)",
                      color: "var(--color-text-secondary)"
                    }}
                  >
                    {selectedVersion.contentSnapshot.content || 'No content'}
                  </div>
                </div>

                {/* Fork and Merge Actions */}
                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "var(--color-border-light)" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedFromVersion(selectedVersion)}
                    className="btn-secondary text-xs"
                    style={{ padding: "var(--space-xs) var(--space-sm)" }}
                  >
                    Compare From Here
                  </button>
                  {canEditNote && (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsForking(true);
                          try {
                            await apiService.forkNote(noteId, {
                              authorId: "current-user-id", // TODO: get current user ID
                              branchName: `branch-${Date.now()}`
                            });
                            // TODO: refresh notes list
                            setError("Note forked successfully!");
                          } catch (err) {
                            setError("Failed to fork note");
                          } finally {
                            setIsForking(false);
                          }
                        }}
                        disabled={isForking}
                        className="btn-primary text-xs"
                        style={{ padding: "var(--space-xs) var(--space-sm)" }}
                      >
                        {isForking ? "Forking…" : "Fork"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!selectedFromVersion) return;
                          setIsMerging(true);
                          try {
                            await apiService.mergeNote(noteId, {
                              forkedNoteId: selectedFromVersion._id,
                              authorId: "current-user-id", // TODO: get current user ID
                              mergeStrategy: "overwrite"
                            });
                            onNoteRestored({ ...currentNote }); // TODO: get updated note
                            setError("Merge completed successfully!");
                          } catch (err) {
                            setError("Failed to merge note");
                          } finally {
                            setIsMerging(false);
                          }
                        }}
                        disabled={isMerging || !selectedFromVersion}
                        className="btn-primary text-xs"
                        style={{ padding: "var(--space-xs) var(--space-sm)" }}
                      >
                        {isMerging ? "Merging…" : "Merge"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Select a version to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="block sm:inline">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
