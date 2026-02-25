"use client";

import { useState, useEffect, useRef } from "react";
import type { Template, TemplateCategory, TemplateVisibility, TemplatePlaceholder } from "@/lib/api";
import { CATEGORY_META } from "./TemplateCard";

interface TemplateEditorModalProps {
  open: boolean;
  workspaceId: string;
  initial?: Template | null;
  onClose: () => void;
  onSave: (data: Partial<Template>) => Promise<void>;
}

const VISIBILITY_OPTIONS: { value: TemplateVisibility; label: string; description: string }[] = [
  { value: "workspace", label: "Workspace", description: "Visible to all workspace members" },
  { value: "private", label: "Private", description: "Only visible to you" },
  { value: "public", label: "Public", description: "Visible to anyone with the link" },
];

const PLACEHOLDER_TYPES: TemplatePlaceholder["type"][] = ["text", "date", "list", "number"];

const CATEGORY_LIST = Object.entries(CATEGORY_META) as [TemplateCategory, typeof CATEGORY_META[TemplateCategory]][];

export default function TemplateEditorModal({
  open,
  initial,
  onClose,
  onSave,
}: TemplateEditorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("general");
  const [visibility, setVisibility] = useState<TemplateVisibility>("workspace");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [placeholders, setPlaceholders] = useState<TemplatePlaceholder[]>([]);
  const [tab, setTab] = useState<"editor" | "preview" | "placeholders">("editor");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  /* Populate fields when editing */
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setCategory(initial.category);
      setVisibility(initial.visibility);
      setTags(initial.tags.join(", "));
      setBody(initial.body);
      setPlaceholders(initial.placeholders ? [...initial.placeholders] : []);
    } else {
      setTitle("");
      setDescription("");
      setCategory("general");
      setVisibility("workspace");
      setTags("");
      setBody(DEFAULT_BODY);
      setPlaceholders([]);
    }
    setErrors({});
    setTab("editor");
  }, [open, initial]);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!body.trim()) e.body = "Template body is required.";
    if (description.length > 500) e.description = "Max 500 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        visibility,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        body,
        placeholders,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  /* Insert placeholder syntax into body at cursor */
  function insertPlaceholder(name: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const inserted = `{{${name}}}`;
    setBody(before + inserted + after);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + inserted.length, start + inserted.length);
    }, 0);
  }

  function addPlaceholder() {
    setPlaceholders((prev) => [
      ...prev,
      { name: "", label: "", type: "text", defaultValue: "", description: "", required: false },
    ]);
  }

  function updatePlaceholder(index: number, field: keyof TemplatePlaceholder, value: any) {
    setPlaceholders((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  function removePlaceholder(index: number) {
    setPlaceholders((prev) => prev.filter((_, i) => i !== index));
  }

  /* Rendered preview (simple markdown-like treatment for display) */
  const previewBody = (() => {
    let rendered = body;
    placeholders.forEach((p) => {
      const regex = new RegExp(`\\{\\{\\s*${p.name}\\s*\\}\\}`, "g");
      rendered = rendered.replace(regex, `<span class="bg-amber-400/20 text-amber-300 px-1 rounded text-xs">${p.defaultValue || p.label || p.name}</span>`);
    });
    return rendered;
  })();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={initial ? "Edit Template" : "Create Template"}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#111113] border border-[#222224] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#222224] shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {initial ? "Edit Template" : "Create Template"}
            </h2>
            <p className="text-sm text-stone-400 mt-0.5">
              {initial ? `Editing v${initial.version}` : "Design a reusable note template for your workspace"}
            </p>
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

        {/* Body — split layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left panel: metadata */}
          <aside className="w-72 shrink-0 flex flex-col gap-5 p-5 border-r border-[#222224] overflow-y-auto">
            {/* Title */}
            <Field label="Title" error={errors.title} required>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly Standup Notes"
                className={INPUT_CLS}
                maxLength={120}
              />
            </Field>

            {/* Description */}
            <Field label="Description" error={errors.description}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when and how to use this template…"
                rows={3}
                className={`${INPUT_CLS} resize-none`}
                maxLength={500}
              />
              <p className="text-[10px] text-stone-600 mt-1 text-right">
                {description.length}/500
              </p>
            </Field>

            {/* Category */}
            <Field label="Category">
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORY_LIST.map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${
                        category === key
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-transparent bg-white/[0.03] text-stone-400 hover:bg-white/[0.06]"
                      }`}
                  >
                    <span>{meta.icon}</span>
                    {meta.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Tags */}
            <Field label="Tags">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="meeting, agile, engineering"
                className={INPUT_CLS}
              />
              <p className="text-[10px] text-stone-600 mt-1">Comma-separated</p>
            </Field>

            {/* Visibility */}
            <Field label="Visibility">
              <div className="flex flex-col gap-1.5">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all
                      ${
                        visibility === opt.value
                          ? "border-white/20 bg-white/[0.06]"
                          : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={visibility === opt.value}
                      onChange={() => setVisibility(opt.value)}
                      className="mt-0.5 accent-white"
                    />
                    <div>
                      <div className="text-xs font-medium text-white">{opt.label}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{opt.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Field>
          </aside>

          {/* Right panel: body editor / preview / placeholders */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-[#222224]">
              {(["editor", "placeholders", "preview"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize
                    ${
                      tab === t
                        ? "bg-[#1a1a1d] text-white border border-b-0 border-[#333336]"
                        : "text-stone-500 hover:text-stone-300"
                    }`}
                >
                  {t === "placeholders" ? `Variables (${placeholders.length})` : t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === "editor" && (
                <div className="flex flex-col gap-2 h-full">
                  {errors.body && (
                    <p className="text-xs text-red-400">{errors.body}</p>
                  )}
                  {/* Quick-insert placeholders */}
                  {placeholders.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className="text-[11px] text-stone-500 self-center">Insert:</span>
                      {placeholders.filter((p) => p.name).map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => insertPlaceholder(p.name)}
                          className="px-2 py-0.5 text-[11px] rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 hover:bg-amber-400/20 transition-colors"
                        >
                          {`{{${p.name}}}`}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea
                    ref={bodyRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your Markdown template here. Use {{placeholder_name}} for dynamic fields."
                    className="flex-1 w-full min-h-[340px] bg-[#0c0c0e] border border-[#222224] rounded-xl p-4
                      text-sm text-stone-200 font-mono placeholder-stone-600 leading-relaxed
                      focus:outline-none focus:border-stone-500 resize-none"
                    spellCheck={false}
                  />
                  <p className="text-[10px] text-stone-600">
                    Markdown supported · Use {`{{variable}}`} for dynamic placeholders
                  </p>
                </div>
              )}

              {tab === "placeholders" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Template Variables</h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Define variables that will be filled in when using this template.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addPlaceholder}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Variable
                    </button>
                  </div>

                  {placeholders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-500">
                      <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="text-sm">No variables defined yet</p>
                      <p className="text-xs mt-1">Variables let users fill in custom values when applying the template.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {placeholders.map((p, i) => (
                        <div key={i} className="bg-[#0c0c0e] border border-[#222224] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-stone-300">Variable #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removePlaceholder(i)}
                              className="text-stone-500 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Name (key)">
                              <input
                                value={p.name}
                                onChange={(e) =>
                                  updatePlaceholder(i, "name",
                                    e.target.value.replace(/\s+/g, "_").toLowerCase()
                                  )
                                }
                                placeholder="e.g. date"
                                className={INPUT_CLS}
                              />
                            </Field>
                            <Field label="Display Label">
                              <input
                                value={p.label}
                                onChange={(e) => updatePlaceholder(i, "label", e.target.value)}
                                placeholder="e.g. Meeting Date"
                                className={INPUT_CLS}
                              />
                            </Field>
                            <Field label="Type">
                              <select
                                value={p.type}
                                onChange={(e) => updatePlaceholder(i, "type", e.target.value)}
                                className={INPUT_CLS}
                              >
                                {PLACEHOLDER_TYPES.map((t) => (
                                  <option key={t} value={t}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Default Value">
                              <input
                                value={p.defaultValue || ""}
                                onChange={(e) => updatePlaceholder(i, "defaultValue", e.target.value)}
                                placeholder="Optional default"
                                className={INPUT_CLS}
                              />
                            </Field>
                            <div className="col-span-2">
                              <Field label="Description">
                                <input
                                  value={p.description || ""}
                                  onChange={(e) => updatePlaceholder(i, "description", e.target.value)}
                                  placeholder="Helper text shown to users"
                                  className={INPUT_CLS}
                                />
                              </Field>
                            </div>
                            <div className="col-span-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.required}
                                  onChange={(e) => updatePlaceholder(i, "required", e.target.checked)}
                                  className="w-3.5 h-3.5 accent-white"
                                />
                                <span className="text-xs text-stone-400">Required field</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "preview" && (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="bg-[#0c0c0e] border border-[#222224] rounded-xl p-6">
                    <div
                      className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap font-mono"
                      dangerouslySetInnerHTML={{ __html: previewBody }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-600 mt-3">
                    Variables shown with sample / default values.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-4 border-t border-[#222224] shrink-0 bg-[#0d0d0f]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-white text-black rounded-lg
              hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                {initial ? "Save Changes" : "Create Template"}
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */
const INPUT_CLS =
  "w-full bg-[#0c0c0e] border border-[#222224] rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors";

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-stone-400">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const DEFAULT_BODY = `# {{title}}

**Date:** {{date}}
**Author:** 

---

## Overview

_Brief description of the purpose of this note._

---

## Details



---

## Action Items

- [ ] 
- [ ] 

---

## References

- 
`;
