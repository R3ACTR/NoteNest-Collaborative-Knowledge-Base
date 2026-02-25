"use client";

import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/lib/api";
import type { Template } from "@/lib/api";

export type TemplateFilters = {
  category?: string;
  tags?: string;
  search?: string;
  visibility?: string;
};

export function useTemplates(workspaceId: string) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(
    async (filters?: TemplateFilters) => {
      if (!workspaceId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.getWorkspaceTemplates(workspaceId, filters);
        setTemplates(res.templates || []);
      } catch (err: any) {
        setError(err.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    },
    [workspaceId]
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(
    async (data: Omit<Partial<Template>, "_id" | "usageCount" | "isBuiltIn" | "version">) => {
      const res = await apiService.createTemplate(workspaceId, data);
      setTemplates((prev) => [res.template, ...prev]);
      return res.template;
    },
    [workspaceId]
  );

  const updateTemplate = useCallback(async (id: string, data: Partial<Template>) => {
    const res = await apiService.updateTemplate(id, data);
    setTemplates((prev) =>
      prev.map((t) => (t._id === id ? res.template : t))
    );
    return res.template;
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await apiService.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const copyTemplate = useCallback(
    async (id: string, visibility?: string) => {
      const res = await apiService.copyTemplate(id, workspaceId, visibility);
      setTemplates((prev) => [res.template, ...prev]);
      return res.template;
    },
    [workspaceId]
  );

  const useTemplate = useCallback(
    async (id: string, values: Record<string, string>) => {
      return apiService.useTemplate(id, values);
    },
    []
  );

  const seedBuiltIns = useCallback(async () => {
    const res = await apiService.seedBuiltInTemplates(workspaceId);
    await fetchTemplates();
    return res;
  }, [workspaceId, fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    copyTemplate,
    useTemplate,
    seedBuiltIns,
  };
}
