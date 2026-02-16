"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Github,
  Twitter,
  Linkedin,
  Heart,
  Move,
  Maximize2,
  RotateCcw,
  Copy,
} from "lucide-react";
import { Section, Container } from "@/components/ui";
import { COLORS } from "@/lib/design-tokens";

// ============================================================================
// Layout Controls
// ============================================================================
interface FooterLayout {
  // Footer wrapper
  footerX: number;
  footerY: number;
  footerPaddingY: number;
  footerMarginTop: number;
  // Grid
  gridGap: number;
  // Brand column
  brandX: number;
  brandY: number;
  brandScale: number;
  // Link columns
  linksX: number;
  linksY: number;
  linksGap: number;
  // Bottom bar
  bottomX: number;
  bottomY: number;
  bottomScale: number;
}

const ftDefaults: FooterLayout = {
  footerX: 0, footerY: 53, footerPaddingY: 80, footerMarginTop: 80,
  gridGap: 40,
  brandX: 30, brandY: 0, brandScale: 1,
  linksX: 0, linksY: 0, linksGap: 40,
  bottomX: 35, bottomY: 30, bottomScale: 1,
};

type ControlDef = {
  key: keyof FooterLayout;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  group: string;
};

const ftControls: ControlDef[] = [
  { key: 'footerX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Footer' },
  { key: 'footerY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Footer' },
  { key: 'footerPaddingY', label: 'Padding Y', min: 20, max: 200, step: 4, unit: 'px', group: 'Footer' },
  { key: 'footerMarginTop', label: 'Margin Top', min: 0, max: 200, step: 4, unit: 'px', group: 'Footer' },
  { key: 'gridGap', label: 'Grid Gap', min: 0, max: 100, step: 4, unit: 'px', group: 'Footer' },
  // Brand
  { key: 'brandX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🏷️ Brand' },
  { key: 'brandY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🏷️ Brand' },
  { key: 'brandScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: '🏷️ Brand' },
  // Links
  { key: 'linksX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🔗 Link Columns' },
  { key: 'linksY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🔗 Link Columns' },
  { key: 'linksGap', label: 'Gap', min: 0, max: 80, step: 4, unit: 'px', group: '🔗 Link Columns' },
  // Bottom
  { key: 'bottomX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '⬇️ Bottom Bar' },
  { key: 'bottomY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '⬇️ Bottom Bar' },
  { key: 'bottomScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: '⬇️ Bottom Bar' },
];

function FooterControls({
  values,
  onChange,
  onReset,
  visible,
  onToggle,
}: {
  values: FooterLayout;
  onChange: (key: keyof FooterLayout, val: number) => void;
  onReset: () => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const copyValues = useCallback(() => {
    const changed = Object.entries(values).filter(
      ([k, v]) => v !== ftDefaults[k as keyof FooterLayout]
    );
    const output = changed.length === 0
      ? '// All values at defaults'
      : `// Footer Layout Values\n${changed.map(([k, v]) => `// ${k}: ${v}`).join('\n')}`;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [values]);

  const toggleGroup = (group: string) => {
    setCollapsed(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleBtn = (
    <button
      onClick={onToggle}
      className="fixed bottom-28 left-4 z-[9999] bg-teal-600 text-white p-3 rounded-full shadow-xl hover:bg-teal-700 transition-colors"
      title="Toggle Footer Layout Controls"
      style={{ transform: 'none' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );

  if (!visible) return toggleBtn;

  const groups: Record<string, ControlDef[]> = {};
  ftControls.forEach(c => {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  });

  return (
    <>
      {toggleBtn}
      <div
        className="fixed bottom-40 left-4 z-[9999] w-72 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl p-4 text-xs font-mono max-h-[60vh] overflow-y-auto"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/95 py-1">
          <span className="text-sm font-bold text-teal-700 font-sans flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" /> Footer
          </span>
          <div className="flex gap-1">
            <button onClick={copyValues} className="p-1.5 rounded-lg hover:bg-black/5" title="Copy values">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={onReset} className="p-1.5 rounded-lg hover:bg-black/5" title="Reset all">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {copied && (
          <div className="text-green-600 text-center text-[11px] font-sans font-medium mb-2">
            ✓ Values copied to clipboard
          </div>
        )}

        {Object.entries(groups).map(([group, ctrls]) => (
          <div key={group} className="mb-1">
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex justify-between items-center py-1.5 px-1 text-[11px] font-sans font-bold text-brand-dark/60 hover:text-brand-dark uppercase tracking-wider"
            >
              {group}
              <span className="text-[10px]">{collapsed[group] ? '▸' : '▾'}</span>
            </button>
            {!collapsed[group] && (
              <div className="space-y-2 pl-1 pb-2">
                {ctrls.map((c) => (
                  <div key={c.key} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-brand-dark/70 font-sans font-medium">{c.label}</span>
                      <span className="text-brand-dark font-bold">
                        {c.unit === 'x' ? values[c.key].toFixed(2) : values[c.key]}{c.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      value={values[c.key]}
                      onChange={(e) => onChange(c.key, parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none bg-black/10 accent-teal-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================================
// Footer Component
// ============================================================================
const LINK_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Guide", href: "/guide" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com" },
      { label: "Discord", href: "https://discord.com" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

const Footer = () => {
  const [showControls, setShowControls] = useState(false);
  const [layout, setLayout] = useState<FooterLayout>(ftDefaults);

  const handleChange = useCallback((key: keyof FooterLayout, val: number) => {
    setLayout(prev => ({ ...prev, [key]: val }));
  }, []);

  const t = (x: number, y: number, scale?: number) => ({
    transform: `translate(${x}px, ${y}px)${scale !== undefined ? ` scale(${scale})` : ''}`,
    transformOrigin: 'center center' as const,
  });

  return (
    <>
      <footer
        className="bg-brand-dark text-brand-beige rounded-t-[3rem]"
        style={{
          paddingTop: `${layout.footerPaddingY}px`,
          paddingBottom: `${layout.footerPaddingY}px`,
          marginTop: `${layout.footerMarginTop}px`,
          ...t(layout.footerX, layout.footerY),
        }}
      >
        <Container>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 mb-16"
            style={{ gap: `${layout.gridGap}px` }}
          >
            {/* Brand Column */}
            <div
              className="col-span-2 lg:col-span-2 space-y-6"
              style={t(layout.brandX, layout.brandY, layout.brandScale)}
            >
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <span className="text-3xl font-serif font-bold text-brand-beige">
                  NoteNest
                </span>
              </Link>
              <p className="text-brand-beige/60 max-w-xs leading-relaxed font-medium">
                Open-source knowledge base for high-performance teams. Built with love and caffeine.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div
              className="col-span-4 grid grid-cols-2 md:grid-cols-4"
              style={{
                gap: `${layout.linksGap}px`,
                ...t(layout.linksX, layout.linksY),
              }}
            >
              {LINK_COLUMNS.map((col) => (
                <div key={col.title} className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-brand-beige/40">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="text-brand-beige/80 hover:text-white transition-colors font-medium">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-brand-beige/40 font-medium"
            style={t(layout.bottomX, layout.bottomY, layout.bottomScale)}
          >
            <p>© 2026 NoteNest. Open Source Quest.</p>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>by open source contributors.</span>
            </div>
          </div>
        </Container>
      </footer>

      {/* Footer Layout Controls (dev tool) */}
      <FooterControls
        values={layout}
        onChange={handleChange}
        onReset={() => setLayout(ftDefaults)}
        visible={showControls}
        onToggle={() => setShowControls(!showControls)}
      />
    </>
  );
};

export default Footer;
