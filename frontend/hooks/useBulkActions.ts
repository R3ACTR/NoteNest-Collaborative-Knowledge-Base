import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

interface BulkActionsState {
  selectedNoteIds: Set<string>;
  isSaving: boolean;
  error: string | null;
}

export const useBulkActions = () => {
  const [state, setState] = useState<BulkActionsState>({
    selectedNoteIds: new Set(),
    isSaving: false,
    error: null,
  });

  // 切換單個筆記選擇
  const toggleSelection = useCallback((noteId: string) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedNoteIds);
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId);
      } else {
        newSelected.add(noteId);
      }
      return { ...prev, selectedNoteIds: newSelected };
    });
  }, []);

  // 全選/取消全選
  const toggleSelectAll = useCallback((allNoteIds: string[]) => {
    setState((prev) => {
      const allCount = allNoteIds.length;
      const selectedCount = prev.selectedNoteIds.size;

      if (selectedCount === allCount) {
        // 取消全選
        return { ...prev, selectedNoteIds: new Set() };
      } else {
        // 全選
        return { ...prev, selectedNoteIds: new Set(allNoteIds) };
      }
    });
  }, []);

  // 清除選擇
  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedNoteIds: new Set(),
      error: null,
    }));
  }, []);

  // 批量 Pin
  const bulkPin = useCallback(
    async (authorId: string) => {
      if (state.selectedNoteIds.size === 0) return;

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        await apiService.bulkPinNotes(
          Array.from(state.selectedNoteIds),
          true,
          authorId
        );
        clearSelection();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: `Failed to pin notes: ${errorMessage}`,
        }));
      }
    },
    [state.selectedNoteIds, clearSelection]
  );

  // 批量 Unpin
  const bulkUnpin = useCallback(
    async (authorId: string) => {
      if (state.selectedNoteIds.size === 0) return;

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        await apiService.bulkPinNotes(
          Array.from(state.selectedNoteIds),
          false,
          authorId
        );
        clearSelection();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: `Failed to unpin notes: ${errorMessage}`,
        }));
      }
    },
    [state.selectedNoteIds, clearSelection]
  );

  // 批量刪除
  const bulkDelete = useCallback(
    async (authorId: string) => {
      if (state.selectedNoteIds.size === 0) return;

      if (!confirm(`Delete ${state.selectedNoteIds.size} note(s)? This cannot be undone.`)) {
        return;
      }

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        await apiService.bulkDeleteNotes(Array.from(state.selectedNoteIds), authorId);
        clearSelection();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: `Failed to delete notes: ${errorMessage}`,
        }));
      }
    },
    [state.selectedNoteIds, clearSelection]
  );

  // 批量添加標籤
  const bulkAddTags = useCallback(
    async (tags: string[], authorId: string) => {
      if (state.selectedNoteIds.size === 0 || tags.length === 0) return;

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        await apiService.bulkAddTagsToNotes(
          Array.from(state.selectedNoteIds),
          tags,
          authorId
        );
        clearSelection();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: `Failed to add tags: ${errorMessage}`,
        }));
      }
    },
    [state.selectedNoteIds, clearSelection]
  );

  // 批量移動到資料夾
  const bulkMoveToFolder = useCallback(
    async (folderId: string | null, authorId: string) => {
      if (state.selectedNoteIds.size === 0) return;

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        await apiService.bulkMoveNotesToFolder(
          Array.from(state.selectedNoteIds),
          folderId,
          authorId
        );
        clearSelection();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: `Failed to move notes: ${errorMessage}`,
        }));
      }
    },
    [state.selectedNoteIds, clearSelection]
  );

  return {
    // State
    selectedNoteIds: state.selectedNoteIds,
    isSaving: state.isSaving,
    error: state.error,
    isSelected: state.selectedNoteIds.size > 0,
    selectedCount: state.selectedNoteIds.size,

    // Actions
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    bulkPin,
    bulkUnpin,
    bulkDelete,
    bulkAddTags,
    bulkMoveToFolder,
  };
};
