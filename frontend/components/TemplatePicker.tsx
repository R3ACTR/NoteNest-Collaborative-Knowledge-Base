"use client";

import { useState, useMemo, useEffect } from "react";
import type { Template, TemplateCategory, TemplatePlaceholder } from "@/lib/api";
import { CATEGORY_META } from "./TemplateCard";
import { apiService } from "@/lib/api";

interface TemplatePickerProps {
  open: boolean;
  workspaceId: string;
  onClose: () => void;
  /** Called when the user confirms. Returns the fully-rendered body string. */
  onApply: (title: string, body: string) => void;
}

type Step = "browse" | "fill";

export default function TemplatePicker({
  open,
  workspaceId,
  onClose,
  onApply,
}: TemplatePickerProps) {
  /* ── State ───────────────────────────────────────────────────── */
  const [step, setStep] = useState<Step>("browse");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [selected, setSelected] = useState<Template | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  /* ── Load templates ─────────────────────────────────────────── */
  useEffect(() => {
    if (!open || !workspaceId) return;
    setLoading(true);
    setStep("browse");
    setSelected(null);
    setSearch("");
    setActiveCategory("all");

    // Try to load workspace templates first. If none found or access denied,
    // fall back to the global built-in templates so users can still browse/apply.
    (async () => {
      try {
        const res = await apiService.getWorkspaceTemplates(workspaceId);
        const workTemplates = res.templates || [];
        if (workTemplates.length > 0) {
          setTemplates(workTemplates);
        } else {
          // No workspace templates yet — show built-ins for browsing
          const builtin = await apiService.getBuiltInTemplates();
          setTemplates(builtin.templates || []);
        }
      } catch (err: any) {
        // If workspace access is denied (e.g., not a member) or other error,
        // still attempt to show built-in templates so users can preview/apply.
        try {
          const builtin = await apiService.getBuiltInTemplates();
          setTemplates(builtin.templates || []);
        } catch (_) {
          setTemplates([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [open, workspaceId]);

  /* ── Filtered list ──────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = activeCategory === "all" || t.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [templates, activeCategory, search]);

  /* ── Unique categories in current list ─────────────────────── */
  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return Array.from(cats);
  }, [templates]);

  /* ── Select & advance to fill step ─────────────────────────── */
  function selectTemplate(tpl: Template) {
    setSelected(tpl);
    // Pre-populate default values
    const defaults: Record<string, string> = {};
    tpl.placeholders?.forEach((p) => {
      defaults[p.name] = p.type === "date"
        ? new Date().toLocaleDateString("en-CA") // YYYY-MM-DD
        : p.defaultValue || "";
    });
    setValues(defaults);
    setError("");
    setStep("fill");
  }

  /* ── Apply template ─────────────────────────────────────────── */
  async function handleApply() {
    if (!selected) return;

    // Validate required
    const missing = selected.placeholders?.filter(
      (p) => p.required && !values[p.name]?.trim()
    );
    if (missing && missing.length > 0) {
      setError(`Please fill in: ${missing.map((p) => p.label || p.name).join(", ")}`);
      return;
    }

    setApplying(true);
    setError("");
    try {
      const res = await apiService.useTemplate(selected._id, values);
      onApply(res.title, res.body);
    } catch {
      setError("Failed to apply template. Please try again.");
    } finally {
      setApplying(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a template"
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#111113] border border-[#222224] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#222224] shrink-0">
          <div className="flex items-center gap-3">
            {step === "fill" && (
              <button
                onClick={() => setStep("browse")}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-white">
                {step === "browse" ? "Choose a Template" : `Use: ${selected?.title}`}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {step === "browse"
                  ? `${filtered.length} template${filtered.length !== 1 ? "s" : ""} available`
                  : "Fill in the variables below to customise your note."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* ── BROWSE STEP ───────────────────────────────────────── */}
        {step === "browse" && (
          <div className="flex flex-col min-h-0 flex-1">
            {/* Search + filters */}
            <div className="flex flex-col gap-3 px-5 py-4 border-b border-[#1a1a1d]">
              <div className="relative">
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
                  className="w-full bg-[#0c0c0e] border border-[#222224] rounded-xl pl-9 pr-4 py-2
                    text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-500"
                />
              </div>

              {/* Category chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <CategoryChip
                  active={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                  label="All"
                  icon="🗂️"
                />
                {categories.map((cat) => {
                  const meta = CATEGORY_META[cat] ?? CATEGORY_META.general;
                  return (
                    <CategoryChip
                      key={cat}
                      active={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                      label={meta.label}
                      icon={meta.icon}
                    />
                  );
                })}
              </div>
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-stone-500">
                  <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading templates…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-500">
                  <span className="text-5xl mb-3">🔍</span>
                  <p className="text-sm font-medium">No templates found</p>
                  <p className="text-xs mt-1">Try different search terms or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map((tpl) => {
                    const meta = CATEGORY_META[tpl.category] ?? CATEGORY_META.general;
                    return (
                      <button
                        key={tpl._id}
                        type="button"
                        onClick={() => selectTemplate(tpl)}
                        className="text-left bg-[#0c0c0e] border border-[#222224] rounded-xl p-4 
                          hover:border-[#333336] hover:bg-[#141416] transition-all duration-150 group"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl shrink-0">{meta.icon}</span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{tpl.title}</h4>
                            <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full border ${meta.color}`}>
                              {meta.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed line-clamp-2 mb-3">
                          {tpl.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-stone-600">
                          <span>{tpl.placeholders?.length || 0} variable{tpl.placeholders?.length !== 1 ? "s" : ""}</span>
                          <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 text-white transition-opacity">
                            Use this <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FILL STEP ─────────────────────────────────────────── */}
        {step === "fill" && selected && (
          <div className="flex flex-1 min-h-0">
            {/* Left: form */}
            <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
              {selected.placeholders && selected.placeholders.length > 0 ? (
                <>
                  {selected.placeholders.map((p: TemplatePlaceholder) => (
                    <PlaceholderField
                      key={p.name}
                      placeholder={p}
                      value={values[p.name] || ""}
                      onChange={(v) => setValues((prev) => ({ ...prev, [p.name]: v }))}
                    />
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-stone-500">
                  <span className="text-4xl mb-3">✅</span>
                  <p className="text-sm font-medium text-white">No variables required</p>
                  <p className="text-xs mt-1">Click "Apply Template" to insert the note.</p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Right: mini preview */}
            <div className="w-72 shrink-0 border-l border-[#1a1a1d] flex flex-col">
              <div className="px-4 py-3 border-b border-[#1a1a1d]">
                <p className="text-xs font-medium text-stone-400">Preview</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-[11px] text-stone-200 font-mono leading-relaxed whitespace-pre-wrap line-clamp-[20]">
                  {renderPreview(selected.body, selected.placeholders, values)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {step === "fill" && (
          <footer className="flex items-center justify-between px-6 py-4 border-t border-[#222224] shrink-0 bg-[#0d0d0f]">
            <button
              onClick={() => setStep("browse")}
              className="px-4 py-2 text-sm text-stone-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-white text-black rounded-lg
                hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {applying ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Apply Template
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */
function CategoryChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
        ${active
          ? "bg-white text-black"
          : "bg-white/[0.04] text-stone-400 hover:bg-white/[0.08] border border-white/5"
        }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function PlaceholderField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: TemplatePlaceholder;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-stone-300">
        {placeholder.label || placeholder.name}
        {placeholder.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {placeholder.description && (
        <p className="text-[11px] text-stone-500">{placeholder.description}</p>
      )}
      {placeholder.type === "date" ? (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#0c0c0e] border border-[#222224] rounded-lg px-3 py-2 text-sm text-stone-200
            focus:outline-none focus:border-stone-500 transition-colors
            [color-scheme:dark]"
        />
      ) : placeholder.type === "list" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Comma-separated values…"
          rows={2}
          className="bg-[#0c0c0e] border border-[#222224] rounded-lg px-3 py-2 text-sm text-stone-200
            placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none transition-colors"
        />
      ) : (
        <input
          type={placeholder.type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder.defaultValue || `Enter ${placeholder.label || placeholder.name}…`}
          className="bg-[#0c0c0e] border border-[#222224] rounded-lg px-3 py-2 text-sm text-stone-200
            placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
        />
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */
function renderPreview(
  body: string,
  placeholders: TemplatePlaceholder[],
  values: Record<string, string>
): string {
  let result = body;
  placeholders?.forEach((p) => {
    const regex = new RegExp(`\\{\\{\\s*${p.name}\\s*\\}\\}`, "g");
    result = result.replace(regex, values[p.name] || `[${p.label || p.name}]`);
  });
  return result;
}
