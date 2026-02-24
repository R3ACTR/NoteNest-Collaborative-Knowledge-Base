"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RouteGuard from "@/components/RouteGuard";
import TemplateCard, { CATEGORY_META } from "@/components/TemplateCard";
import TemplateEditorModal from "@/components/TemplateEditorModal";
import TemplatePicker from "@/components/TemplatePicker";
import { useTemplates } from "@/hooks/useTemplates";
import { usePermissions } from "@/hooks/usePermissions";
import type { Template, TemplateCategory } from "@/lib/api";

type SortKey = "name" | "usage" | "updated";
type ViewMode = "grid" | "list";

export default function TemplatesPage() {
  const params = useParams();
  const workspaceId = (params?.id as string) || "";

  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    copyTemplate,
    useTemplate,
    seedBuiltIns,
    refetch,
  } = useTemplates(workspaceId);

  const { isAdmin } = usePermissions();

  /* ── UI State ─────────────────────────────────────────────── */
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [activeVisibility, setActiveVisibility] = useState<"all" | "private" | "workspace" | "public">("all");
  const [sortKey, setSortKey] = useState<SortKey>("usage");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  /* Modal state */
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [appliedMsg, setAppliedMsg] = useState("");

  /* ── Derived data ─────────────────────────────────────────── */
  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return Array.from(cats) as TemplateCategory[];
  }, [templates]);

  const filtered = useMemo(() => {
    let list = [...templates];

    if (activeCategory !== "all") list = list.filter((t) => t.category === activeCategory);
    if (activeVisibility !== "all") list = list.filter((t) => t.visibility === activeVisibility);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortKey === "name") return a.title.localeCompare(b.title);
      if (sortKey === "usage") return b.usageCount - a.usageCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return list;
  }, [templates, activeCategory, activeVisibility, search, sortKey]);

  /* built-in vs custom split */
  const builtInTemplates = filtered.filter((t) => t.isBuiltIn);
  const customTemplates = filtered.filter((t) => !t.isBuiltIn);

  /* ── Handlers ─────────────────────────────────────────────── */
  async function handleSeed() {
    setSeeding(true);
    setSeedMsg("");
    try {
      const r = await seedBuiltIns();
      setSeedMsg(
        r.seeded === 0
          ? "Built-in templates are already up to date."
          : `Added ${r.seeded} built-in template${r.seeded !== 1 ? "s" : ""}.`
      );
    } catch {
      setSeedMsg("Failed to seed templates.");
    } finally {
      setSeeding(false);
    }
  }

  async function handleSave(data: Partial<Template>) {
    if (editTarget) {
      await updateTemplate(editTarget._id, data);
    } else {
      await createTemplate({ ...data, workspaceId });
    }
  }

  async function handleDelete(template: Template) {
    await deleteTemplate(template._id);
    setDeleteTarget(null);
  }

  async function handleCopy(template: Template) {
    await copyTemplate(template._id, "workspace");
  }

  function openEditor(template?: Template) {
    setEditTarget(template || null);
    setEditorOpen(true);
  }

  function handleApplyFromPicker(_title: string, body: string) {
    setPickerOpen(false);
    setAppliedMsg("Template applied! The content has been copied — paste it into your note.");
    setTimeout(() => setAppliedMsg(""), 5000);
    // Copy to clipboard for convenience
    if (navigator.clipboard) {
      navigator.clipboard.writeText(body).catch(() => {});
    }
  }

  /* ── Stats ─────────────────────────────────────────────────── */
  const totalUses = templates.reduce((s, t) => s + t.usageCount, 0);
  const customCount = templates.filter((t) => !t.isBuiltIn).length;

  return (
    <RouteGuard requireAuth>
      <div className="flex min-h-screen bg-[var(--color-background)] text-stone-900">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Templates" showSearch={false} />

          <main className="flex-1 overflow-auto">
            {/* ── Hero header ──────────────────────────────────── */}
            <div className="px-8 pt-8 pb-6 border-b border-stone-200">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
                      Workspace Templates
                    </h1>
                    <p className="text-stone-700 mt-1.5 text-sm max-w-xl">
                      Reusable note structures for meetings, RFCs, project briefs, and more. Apply a
                      template to start a new note with professional structure in seconds.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={handleSeed}
                      disabled={seeding}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 border border-stone-200
                        rounded-lg hover:text-stone-900 hover:border-stone-300 transition-colors disabled:opacity-50"
                    >
                      {seeding ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Sync Built-ins
                    </button>

                    <button
                      onClick={() => setPickerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 border border-stone-200
                        rounded-lg hover:text-stone-900 hover:border-stone-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Browse & Apply
                    </button>

                    <button
                      onClick={() => openEditor()}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-white text-black
                        rounded-lg hover:bg-stone-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Template
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 mt-6">
                  {[
                    { label: "Total templates", value: templates.length },
                    { label: "Custom templates", value: customCount },
                    { label: "Total uses", value: totalUses },
                    { label: "Categories", value: categories.length },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-0.5">
                      <span className="text-2xl font-bold text-stone-900">{stat.value}</span>
                      <span className="text-xs text-stone-600">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Notifications ──────────────────────────────────── */}
            {seedMsg && (
              <div className="mx-8 mt-4 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {seedMsg}
                </div>
              </div>
            )}

            {appliedMsg && (
              <div className="mx-8 mt-4">
                <div className="max-w-6xl mx-auto flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-400">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {appliedMsg}
                </div>
              </div>
            )}

            {error && (
              <div className="mx-8 mt-4">
                <div className="max-w-6xl mx-auto px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {error}
                </div>

                {/* Helpful CTA when permission is denied */}
                {error.toLowerCase().includes("permission") && (
                  <div className="max-w-6xl mx-auto mt-3 flex items-center gap-3">
                    <p className="text-sm text-stone-700">You don’t have permission to manage workspace templates. You can still browse the built-in template library.</p>
                    <button
                      onClick={() => setPickerOpen(true)}
                      className="ml-auto px-4 py-2 bg-white text-black rounded-lg shadow-sm"
                    >
                      Browse Built-ins
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Filter bar ─────────────────────────────────────── */}
            <div className="sticky top-0 z-10 bg-[var(--color-background)]/90 backdrop-blur-md border-b border-stone-200 px-8 py-3">
              <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-48 max-w-xs">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates…"
                    className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-1.5
                      text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-300"
                  />
                </div>

                {/* Category filter */}
                <div className="flex gap-1.5 overflow-x-auto">
                  <FilterChip
                    active={activeCategory === "all"}
                    onClick={() => setActiveCategory("all")}
                    label="All"
                  />
                  {categories.map((cat) => (
                    <FilterChip
                      key={cat}
                      active={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                      label={CATEGORY_META[cat]?.label ?? cat}
                      icon={CATEGORY_META[cat]?.icon}
                    />
                  ))}
                </div>

                {/* Visibility filter */}
                <select
                  value={activeVisibility}
                  onChange={(e) => setActiveVisibility(e.target.value as any)}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700
                    focus:outline-none focus:border-stone-300"
                >
                  <option value="all">All visibility</option>
                  <option value="workspace">Workspace</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>

                {/* Sort */}
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700
                    focus:outline-none focus:border-stone-300"
                >
                  <option value="usage">Sort: Most Used</option>
                  <option value="updated">Sort: Recently Updated</option>
                  <option value="name">Sort: Name A–Z</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden ml-auto">
                  <ViewToggle active={viewMode === "grid"} onClick={() => setViewMode("grid")}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </ViewToggle>
                  <ViewToggle active={viewMode === "list"} onClick={() => setViewMode("list")}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </ViewToggle>
                </div>
              </div>
            </div>

            {/* ── Content ────────────────────────────────────────── */}
            <div className="px-8 py-6">
              <div className="max-w-6xl mx-auto">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-44 bg-white/50 border border-stone-200 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState
                      hasFilters={!!(search || activeCategory !== "all")}
                      onClear={() => { setSearch(""); setActiveCategory("all"); }}
                      onCreate={() => openEditor()}
                      onSeed={handleSeed}
                      seeding={seeding}
                      onBrowse={() => setPickerOpen(true)}
                      isAdmin={isAdmin}
                    />
                ) : (
                  <div className="space-y-10">
                    {/* Built-in section */}
                    {builtInTemplates.length > 0 && (
                      <section>
                        <SectionHeader
                          title="Built-in Templates"
                          subtitle="Professional templates maintained by NoteNest"
                          count={builtInTemplates.length}
                          icon="⭐"
                        />
                        <TemplateGrid
                          templates={builtInTemplates}
                          viewMode={viewMode}
                          onPreview={setPreviewTemplate}
                          onEdit={openEditor}
                          onDelete={setDeleteTarget}
                          onCopy={handleCopy}
                          onUse={(t) => {
                            setPreviewTemplate(null);
                            setPickerOpen(false);
                            /* Open the picker for this specific template */
                            setPickerOpen(true);
                          }}
                        />
                      </section>
                    )}

                    {/* Custom section */}
                    {customTemplates.length > 0 && (
                      <section>
                        <SectionHeader
                          title="Custom Templates"
                          subtitle="Templates created by your workspace members"
                          count={customTemplates.length}
                          icon="✏️"
                        />
                        <TemplateGrid
                          templates={customTemplates}
                          viewMode={viewMode}
                          onPreview={setPreviewTemplate}
                          onEdit={openEditor}
                          onDelete={setDeleteTarget}
                          onCopy={handleCopy}
                          onUse={() => setPickerOpen(true)}
                        />
                      </section>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <TemplateEditorModal
        open={editorOpen}
        workspaceId={workspaceId}
        initial={editTarget}
        onClose={() => { setEditorOpen(false); setEditTarget(null); }}
        onSave={handleSave}
      />

      <TemplatePicker
        open={pickerOpen}
        workspaceId={workspaceId}
        onClose={() => setPickerOpen(false)}
        onApply={handleApplyFromPicker}
      />

      {/* Preview Drawer */}
      {previewTemplate && (
        <TemplatePreviewDrawer
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onEdit={() => { openEditor(previewTemplate); setPreviewTemplate(null); }}
          onCopy={() => { handleCopy(previewTemplate); setPreviewTemplate(null); }}
          onUse={() => { setPreviewTemplate(null); setPickerOpen(true); }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          template={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </RouteGuard>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function TemplateGrid({
  templates,
  viewMode,
  onPreview,
  onEdit,
  onDelete,
  onCopy,
  onUse,
}: {
  templates: Template[];
  viewMode: ViewMode;
  onPreview: (t: Template) => void;
  onEdit: (t: Template) => void;
  onDelete: (t: Template) => void;
  onCopy: (t: Template) => void;
  onUse: (t: Template) => void;
}) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {templates.map((t) => (
          <TemplateCard
            key={t._id}
            template={t}
            compact
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopy={onCopy}
            onUse={onUse}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {templates.map((t) => (
        <TemplateCard
          key={t._id}
          template={t}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
          onUse={onUse}
        />
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  count,
  icon,
}: {
  title: string;
  subtitle: string;
  count: number;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            {title}
            <span className="text-xs font-normal text-stone-500 bg-white/5 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </h2>
          <p className="text-xs text-stone-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all
        ${active
          ? "bg-white text-black"
          : "text-stone-700 border border-stone-200 hover:border-stone-300 hover:text-stone-900"
        }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

function ViewToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 transition-colors ${active ? "bg-stone-200 text-stone-900" : "text-stone-600 hover:text-stone-700"}`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
  onSeed,
  seeding,
  onBrowse,
  isAdmin,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
  onSeed: () => void;
  seeding: boolean;
  onBrowse?: () => void;
  isAdmin?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-stone-500">
      <span className="text-6xl mb-4">📋</span>
      <h3 className="text-lg font-semibold text-stone-300 mb-2">
        {hasFilters ? "No matching templates" : "No templates yet"}
      </h3>
      <p className="text-sm text-center max-w-sm mb-6">
        {hasFilters
          ? "Try adjusting your search or filters."
          : "Get started by adding the built-in professional templates or create your own custom template."}
      </p>
      <div className="flex gap-3">
        {hasFilters ? (
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Clear filters
          </button>
        ) : (
          <>
            <button
              onClick={onBrowse}
              className="px-4 py-2 text-sm font-medium text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Browse Built-ins
            </button>

            {isAdmin ? (
              <button
                onClick={onSeed}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-stone-200 disabled:opacity-50 transition-colors"
              >
                {seeding ? "Adding…" : "Sync Built-ins"}
              </button>
            ) : (
              <button
                onClick={onCreate}
                className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-stone-200 transition-colors"
              >
                Create Template
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Preview Drawer ─────────────────────────────────────────────── */
function TemplatePreviewDrawer({
  template,
  onClose,
  onEdit,
  onCopy,
  onUse,
}: {
  template: Template;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onUse: () => void;
}) {
  const meta = CATEGORY_META[template.category] ?? CATEGORY_META.general;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-[#111113] border-l border-[#222224]
          flex flex-col shadow-2xl overflow-hidden"
        role="complementary"
        aria-label="Template preview"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222224]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">{meta.icon}</span>
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate">{template.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                {template.isBuiltIn && (
                  <span className="text-[10px] text-amber-400/80 font-medium">Built-in</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Meta pills */}
        <div className="px-6 py-3 flex items-center gap-3 flex-wrap border-b border-[#1a1a1d]">
          <MetaPill icon="🔄" label={`${template.usageCount} uses`} />
          <MetaPill icon="📌" label={`v${template.version}`} />
          <MetaPill icon="🔒" label={template.visibility} />
          {template.placeholders?.length > 0 && (
            <MetaPill icon="🏷️" label={`${template.placeholders.length} variable${template.placeholders.length !== 1 ? "s" : ""}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Description */}
          {template.description && (
            <div>
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">About</h3>
              <p className="text-sm text-stone-300 leading-relaxed">{template.description}</p>
            </div>
          )}

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-stone-400 border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variables */}
          {template.placeholders && template.placeholders.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Variables</h3>
              <div className="flex flex-col gap-2">
                {template.placeholders.map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-3 bg-[#0c0c0e] border border-[#1a1a1d] rounded-lg">
                    <div>
                      <span className="text-xs font-mono text-amber-400">{`{{${p.name}}}`}</span>
                      <span className="text-xs text-stone-400 ml-2">{p.label}</span>
                      {p.description && <p className="text-[11px] text-stone-500 mt-0.5">{p.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-stone-500 bg-white/5 px-1.5 py-0.5 rounded">{p.type}</span>
                      {p.required && <span className="text-[10px] text-red-400">required</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body preview */}
          <div>
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Template Content</h3>
            <div className="bg-[#0c0c0e] border border-[#1a1a1d] rounded-xl p-4">
              <pre className="text-xs text-stone-400 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {template.body}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#222224] bg-[#0d0d0f]">
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm text-stone-400 border border-[#2a2a2d]
              rounded-lg hover:text-white hover:border-[#333336] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </button>
          {!template.isBuiltIn && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-400 border border-[#2a2a2d]
                rounded-lg hover:text-white hover:border-[#333336] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          <button
            onClick={onUse}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white text-black
              rounded-lg hover:bg-stone-200 transition-colors"
          >
            Use this template
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Delete Confirm Modal ─────────────────────────────────────── */
function DeleteConfirmModal({
  template,
  onConfirm,
  onCancel,
}: {
  template: Template;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#111113] border border-[#2a2a2d] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Delete Template</h3>
            <p className="text-sm text-stone-400">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-stone-300 mb-5">
          Are you sure you want to delete <strong className="text-white">"{template.title}"</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm text-stone-400 border border-[#2a2a2d] rounded-lg hover:text-white hover:border-[#333336] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-stone-500 bg-white/[0.04] px-2 py-1 rounded-full border border-white/[0.05]">
      <span>{icon}</span>
      {label}
    </span>
  );
}
