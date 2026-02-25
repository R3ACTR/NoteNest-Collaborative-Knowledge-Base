"use client";

import type { Template, TemplateCategory } from "@/lib/api";

/* ── Category metadata ─────────────────────────────────────────── */
export const CATEGORY_META: Record<
  TemplateCategory,
  { label: string; icon: string; color: string }
> = {
  meeting: {
    label: "Meeting",
    icon: "👥",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  rfc: {
    label: "RFC",
    icon: "📐",
    color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  design: {
    label: "Design",
    icon: "🎨",
    color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  },
  project: {
    label: "Project",
    icon: "🗂️",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  bug_report: {
    label: "Bug Report",
    icon: "🐛",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  retrospective: {
    label: "Retrospective",
    icon: "🔄",
    color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  onboarding: {
    label: "Onboarding",
    icon: "🚀",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  research: {
    label: "Research",
    icon: "🔬",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  sprint: {
    label: "Sprint",
    icon: "⚡",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  general: {
    label: "General",
    icon: "📄",
    color: "bg-stone-500/10 text-stone-400 border-stone-500/20",
  },
};

interface TemplateCardProps {
  template: Template;
  onPreview?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onCopy?: (template: Template) => void;
  onUse?: (template: Template) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function TemplateCard({
  template,
  onPreview,
  onEdit,
  onDelete,
  onCopy,
  onUse,
  showActions = true,
  compact = false,
}: TemplateCardProps) {
  const meta = CATEGORY_META[template.category] ?? CATEGORY_META.general;

  return (
    <article
      className={`group relative flex flex-col bg-[#111113] border border-[#222224] rounded-xl overflow-hidden
        hover:border-[#333336] hover:shadow-lg hover:shadow-black/30
        transition-all duration-200 cursor-pointer
        ${compact ? "p-4 gap-3" : "p-5 gap-4"}`}
      onClick={() => onPreview?.(template)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPreview?.(template)}
      aria-label={`Template: ${template.title}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0" aria-hidden>
            {meta.icon}
          </span>
          <div className="min-w-0">
            <h3
              className={`font-semibold text-white leading-tight truncate
                ${compact ? "text-sm" : "text-base"}`}
            >
              {template.title}
            </h3>
            {template.isBuiltIn && (
              <span className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wider">
                Built-in
              </span>
            )}
          </div>
        </div>

        {/* Actions (hover) */}
        {showActions && (
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {onCopy && (
              <ActionButton
                title="Duplicate"
                onClick={() => onCopy(template)}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              />
            )}
            {onEdit && !template.isBuiltIn && (
              <ActionButton
                title="Edit"
                onClick={() => onEdit(template)}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              />
            )}
            {onDelete && !template.isBuiltIn && (
              <ActionButton
                title="Delete"
                onClick={() => onDelete(template)}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
                danger
              />
            )}
          </div>
        )}
      </div>

      {/* Category badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border
            ${meta.color}`}
        >
          {meta.label}
        </span>
        {template.tags.slice(0, compact ? 2 : 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-[11px] bg-white/5 text-stone-400 border border-white/5"
          >
            #{tag}
          </span>
        ))}
        {template.tags.length > (compact ? 2 : 3) && (
          <span className="text-[11px] text-stone-500">
            +{template.tags.length - (compact ? 2 : 3)}
          </span>
        )}
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-sm text-stone-400 leading-relaxed line-clamp-2 flex-1">
          {template.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {template.usageCount} uses
          </span>
          <span>v{template.version}</span>
          <span className="capitalize">{template.visibility}</span>
        </div>

        {onUse && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-white text-black hover:bg-stone-200
              transition-colors duration-150 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onUse(template);
            }}
          >
            Use template
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}

/* ── Small icon button ─────────────────────────────────────────── */
function ActionButton({
  icon,
  title,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors duration-150
        ${danger
          ? "text-stone-500 hover:text-red-400 hover:bg-red-500/10"
          : "text-stone-500 hover:text-stone-300 hover:bg-white/5"
        }`}
    >
      {icon}
    </button>
  );
}
