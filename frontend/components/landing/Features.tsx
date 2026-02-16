"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Folder,
  FileText,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Move,
  Maximize2,
  RotateCcw,
  Copy,
} from "lucide-react";
import { Section, FeatureCard } from "@/components/ui";
import { SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// ============================================================================
// Features Layout Controls
// ============================================================================
interface FeaturesLayout {
  // Section
  sectionX: number;
  sectionY: number;
  // Header
  headerX: number;
  headerY: number;
  headerScale: number;
  headerMaxWidth: number;
  // Heading
  headingX: number;
  headingY: number;
  headingScale: number;
  // Subtitle
  subtitleX: number;
  subtitleY: number;
  // Grid
  gridX: number;
  gridY: number;
  gridGap: number;
  // Cards 1–6
  card1X: number; card1Y: number; card1Scale: number;
  card2X: number; card2Y: number; card2Scale: number;
  card3X: number; card3Y: number; card3Scale: number;
  card4X: number; card4Y: number; card4Scale: number;
  card5X: number; card5Y: number; card5Scale: number;
  card6X: number; card6Y: number; card6Scale: number;
}

const featuresDefaults: FeaturesLayout = {
  sectionX: 0, sectionY: -26,
  headerX: 34, headerY: 20, headerScale: 1.06, headerMaxWidth: 768,
  headingX: 0, headingY: 0, headingScale: 1,
  subtitleX: 0, subtitleY: 0,
  gridX: 0, gridY: 0, gridGap: 80,
  card1X: 38, card1Y: 55, card1Scale: 1.12,
  card2X: 130, card2Y: 55, card2Scale: 1.12,
  card3X: 200, card3Y: 55, card3Scale: 1.12,
  card4X: 40, card4Y: -8, card4Scale: 1.12,
  card5X: 115, card5Y: -8, card5Scale: 1.12,
  card6X: 200, card6Y: -8, card6Scale: 1.12,
};

type ControlDef = {
  key: keyof FeaturesLayout;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  group: string;
};

const featuresControls: ControlDef[] = [
  // Section
  { key: 'sectionX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Section' },
  { key: 'sectionY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Section' },
  // Header
  { key: 'headerX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Header' },
  { key: 'headerY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Header' },
  { key: 'headerScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Header' },
  { key: 'headerMaxWidth', label: 'Max Width', min: 300, max: 1200, step: 10, unit: 'px', group: 'Header' },
  // Heading
  { key: 'headingX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Heading' },
  // Subtitle
  { key: 'subtitleX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Subtitle' },
  { key: 'subtitleY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Subtitle' },
  // Grid
  { key: 'gridX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Grid' },
  { key: 'gridY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Grid' },
  { key: 'gridGap', label: 'Gap', min: 0, max: 80, step: 4, unit: 'px', group: 'Grid' },
  // Cards
  { key: 'card1X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 1 Collab' },
  { key: 'card1Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 1 Collab' },
  { key: 'card1Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Card 1 Collab' },
  { key: 'card2X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 2 Search' },
  { key: 'card2Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 2 Search' },
  { key: 'card2Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Card 2 Search' },
  { key: 'card3X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 3 Org' },
  { key: 'card3Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 3 Org' },
  { key: 'card3Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Card 3 Org' },
  { key: 'card4X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 4 Editor' },
  { key: 'card4Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 4 Editor' },
  { key: 'card4Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Card 4 Editor' },
  { key: 'card5X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 5 Security' },
  { key: 'card5Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 5 Security' },
  { key: 'card5Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Card 5 Security' },
  { key: 'card6X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 6 Fast' },
  { key: 'card6Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Card 6 Fast' },
  { key: 'card6Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Card 6 Fast' },
];

function FeaturesControls({
  values,
  onChange,
  onReset,
  visible,
  onToggle,
}: {
  values: FeaturesLayout;
  onChange: (key: keyof FeaturesLayout, val: number) => void;
  onReset: () => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const copyValues = useCallback(() => {
    const changed = Object.entries(values).filter(
      ([k, v]) => v !== featuresDefaults[k as keyof FeaturesLayout]
    );
    const output = changed.length === 0
      ? '// All values at defaults'
      : `// Features Layout Values\n${changed.map(([k, v]) => `// ${k}: ${v}`).join('\n')}`;
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
      className="fixed bottom-4 left-[340px] z-[9999] bg-emerald-600 text-white p-3 rounded-full shadow-xl hover:bg-emerald-700 transition-colors"
      title="Toggle Features Layout Controls"
      style={{ transform: 'none' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );

  if (!visible) return toggleBtn;

  // Group controls
  const groups: Record<string, ControlDef[]> = {};
  featuresControls.forEach(c => {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  });

  return (
    <>
      {toggleBtn}
      <div
        className="fixed bottom-16 left-[340px] z-[9999] w-72 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl p-4 text-xs font-mono max-h-[70vh] overflow-y-auto"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/95 py-1">
          <span className="text-sm font-bold text-emerald-700 font-sans flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" /> Features Controls
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
                      className="w-full h-1.5 rounded-full appearance-none bg-black/10 accent-emerald-600 cursor-pointer"
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
// Features Component
// ============================================================================
const Features = () => {
  const [showControls, setShowControls] = useState(false);
  const [layout, setLayout] = useState<FeaturesLayout>(featuresDefaults);

  const handleChange = useCallback((key: keyof FeaturesLayout, val: number) => {
    setLayout(prev => ({ ...prev, [key]: val }));
  }, []);

  const t = (x: number, y: number, scale?: number) => ({
    transform: `translate(${x}px, ${y}px)${scale !== undefined ? ` scale(${scale})` : ''}`,
    transformOrigin: 'center center' as const,
  });

  return (
    <>
      <Section
        spacing="large"
        background="bg-white"
        id="features"
        style={t(layout.sectionX, layout.sectionY)}
      >
        {/* Section Header */}
        <div
          className="text-left mb-16 lg:mb-24"
          style={{
            maxWidth: `${layout.headerMaxWidth}px`,
            ...t(layout.headerX, layout.headerY, layout.headerScale),
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block py-1 px-3 rounded-full bg-brand-beige text-brand-dark text-sm font-bold tracking-wide uppercase mb-4"
          >
            Powerful Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6"
            style={t(layout.headingX, layout.headingY, layout.headingScale)}
          >
            Everything you need to <br /> build knowledge.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 leading-relaxed"
            style={t(layout.subtitleX, layout.subtitleY)}
          >
            NoteNest is built for speed and collaboration. Experience a new way of organizing your team's collective intelligence.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div
          className="grid md:grid-cols-3"
          style={{
            gap: `${layout.gridGap}px`,
            ...t(layout.gridX, layout.gridY),
          }}
        >
          {/* Card 1: Real-time Collaboration (Large) */}
          <div style={t(layout.card1X, layout.card1Y, layout.card1Scale)}>
            <FeatureCard
              title="Real-time Collaboration"
              description="Create, organize, and collaborate on documentation in real-time. See cursor movements and edits as they happen."
              icon={<Users className="w-8 h-8 text-blue-600" />}
              className="md:col-span-2 bg-brand-beige h-full"
              illustration={
                <div className="relative h-48 rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border border-white" />
                      <div className="w-6 h-6 rounded-full bg-green-100 border border-white" />
                    </div>
                    <div className="text-xs text-gray-400">3 users editing...</div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-3/4 h-2 bg-gray-100 rounded animate-pulse" />
                    <div className="w-full h-2 bg-gray-100 rounded animate-pulse delay-75" />
                    <div className="w-5/6 h-2 bg-gray-100 rounded animate-pulse delay-150" />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                    Typing...
                  </div>
                </div>
              }
            />
          </div>

          {/* Card 2: Fast Search */}
          <div style={t(layout.card2X, layout.card2Y, layout.card2Scale)}>
            <FeatureCard
              title="Instant Search"
              description="Find anything in seconds with our powerful full-text search engine."
              icon={<Search className="w-8 h-8 text-orange-500" />}
              background="bg-orange-50/50"
              className="h-full"
            />
          </div>

          {/* Card 3: Organization */}
          <div style={t(layout.card3X, layout.card3Y, layout.card3Scale)}>
            <FeatureCard
              title="Smart Organization"
              description="Nested folders, tags, and bi-directional linking for better structure."
              icon={<Folder className="w-8 h-8 text-yellow-500" />}
              background="bg-yellow-50/50"
              className="h-full"
            />
          </div>

          {/* Card 4: Rich Text Editor */}
          <div style={t(layout.card4X, layout.card4Y, layout.card4Scale)}>
            <FeatureCard
              title="Rich Text Editor"
              description="A distraction-free editor with markdown support and slash commands."
              icon={<FileText className="w-8 h-8 text-gray-700" />}
              background="bg-gray-50"
              className="h-full"
            />
          </div>

          {/* Card 5: Security */}
          <div style={t(layout.card5X, layout.card5Y, layout.card5Scale)}>
            <FeatureCard
              title="Enterprise Security"
              description="Your data is secure with end-to-end encryption and granular permissions."
              icon={<ShieldCheck className="w-8 h-8 text-green-600" />}
              className="md:col-span-1 bg-green-50/30 h-full"
            />
          </div>

          {/* Card 6: Lightning Fast */}
          <div style={t(layout.card6X, layout.card6Y, layout.card6Scale)}>
            <FeatureCard
              title="Lightning Fast"
              description="Built on modern tech stack for optimal performance."
              icon={<Zap className="w-8 h-8 text-purple-600" />}
              background="bg-purple-50/30"
              className="h-full"
            />
          </div>
        </div>
      </Section>

      {/* Features Layout Controls (dev tool) */}
      <FeaturesControls
        values={layout}
        onChange={handleChange}
        onReset={() => setLayout(featuresDefaults)}
        visible={showControls}
        onToggle={() => setShowControls(!showControls)}
      />
    </>
  );
};

export default Features;
