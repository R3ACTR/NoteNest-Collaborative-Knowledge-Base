"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Move,
  Maximize2,
  RotateCcw,
  Copy,
} from "lucide-react";
import { Section } from "@/components/ui";
import { COLORS, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// ============================================================================
// Layout Controls
// ============================================================================
interface FAQLayout {
  // Section
  sectionX: number;
  sectionY: number;
  sectionMinHeight: number;
  // Grid
  gridGap: number;
  // Left header column
  leftX: number;
  leftY: number;
  leftScale: number;
  // Badge
  badgeX: number;
  badgeY: number;
  // Heading
  headingX: number;
  headingY: number;
  headingScale: number;
  // Subtitle
  subtitleX: number;
  subtitleY: number;
  // Right FAQ list column
  rightX: number;
  rightY: number;
  rightScale: number;
  // FAQ card container
  faqCardX: number;
  faqCardY: number;
  faqCardPadding: number;
}

const faqDefaults: FAQLayout = {
  sectionX: 0, sectionY: 0, sectionMinHeight: 0,
  gridGap: 100,
  leftX: 20, leftY: 20, leftScale: 1.12,
  badgeX: 20, badgeY: 0,
  headingX: 20, headingY: 0, headingScale: 1,
  subtitleX: 20, subtitleY: 0,
  rightX: 17, rightY: 0, rightScale: 1,
  faqCardX: 0, faqCardY: 0, faqCardPadding: 48,
};

type ControlDef = {
  key: keyof FAQLayout;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  group: string;
};

const faqControls: ControlDef[] = [
  { key: 'sectionX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Section' },
  { key: 'sectionY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Section' },
  { key: 'sectionMinHeight', label: 'Min Height', min: 0, max: 1200, step: 10, unit: 'px', group: 'Section' },
  { key: 'gridGap', label: 'Grid Gap', min: 0, max: 200, step: 4, unit: 'px', group: 'Section' },
  // Left
  { key: 'leftX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Header Column' },
  { key: 'leftY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Header Column' },
  { key: 'leftScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Header Column' },
  // Badge
  { key: 'badgeX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Badge' },
  { key: 'badgeY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Badge' },
  // Heading
  { key: 'headingX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Heading' },
  // Subtitle
  { key: 'subtitleX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Subtitle' },
  { key: 'subtitleY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Subtitle' },
  // Right
  { key: 'rightX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'FAQ List' },
  { key: 'rightY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'FAQ List' },
  { key: 'rightScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'FAQ List' },
  // FAQ card
  { key: 'faqCardX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '❓ FAQ Card' },
  { key: 'faqCardY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '❓ FAQ Card' },
  { key: 'faqCardPadding', label: 'Padding', min: 16, max: 80, step: 4, unit: 'px', group: '❓ FAQ Card' },
];

function FAQControls({
  values,
  onChange,
  onReset,
  visible,
  onToggle,
}: {
  values: FAQLayout;
  onChange: (key: keyof FAQLayout, val: number) => void;
  onReset: () => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const copyValues = useCallback(() => {
    const changed = Object.entries(values).filter(
      ([k, v]) => v !== faqDefaults[k as keyof FAQLayout]
    );
    const output = changed.length === 0
      ? '// All values at defaults'
      : `// FAQ Layout Values\n${changed.map(([k, v]) => `// ${k}: ${v}`).join('\n')}`;
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
      className="fixed bottom-16 left-4 z-[9999] bg-violet-600 text-white p-3 rounded-full shadow-xl hover:bg-violet-700 transition-colors"
      title="Toggle FAQ Layout Controls"
      style={{ transform: 'none' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );

  if (!visible) return toggleBtn;

  const groups: Record<string, ControlDef[]> = {};
  faqControls.forEach(c => {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  });

  return (
    <>
      {toggleBtn}
      <div
        className="fixed bottom-28 left-4 z-[9999] w-72 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl p-4 text-xs font-mono max-h-[60vh] overflow-y-auto"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/95 py-1">
          <span className="text-sm font-bold text-violet-700 font-sans flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" /> FAQ Controls
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
                      className="w-full h-1.5 rounded-full appearance-none bg-black/10 accent-violet-600 cursor-pointer"
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
// Data
// ============================================================================
const faqs = [
  {
    question: "Is NoteNest completely free?",
    answer: "Yes! NoteNest is open-source and free to self-host. We also offer a managed cloud version for teams who don't want to manage their own infrastructure."
  },
  {
    question: "Can I import from Notion/Obsidian?",
    answer: "Currently we support Markdown import. Direct Notion and Obsidian importers are on our roadmap for Q3 2024."
  },
  {
    question: "How does the real-time collaboration work?",
    answer: "We use a CRDT (Conflict-free Replicated Data Type) based engine (Yjs) to ensure that all changes are merged instantly without conflicts, even if you go offline."
  },
  {
    question: "Is my data encrypted?",
    answer: "Yes. All data is encrypted at rest and in transit. For the self-hosted version, you have full control over your encryption keys."
  },
  {
    question: "Do you offer an API?",
    answer: "Absolutely. NoteNest is API-first. Anything you can do in the UI, you can do via our REST API."
  }
];

const FAQItem = ({ item, isOpen, onClick }: { item: any, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-black/5 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className={cn(
          "text-lg md:text-xl font-serif font-bold transition-colors",
          isOpen ? "text-brand-dark" : "text-brand-dark/70 group-hover:text-brand-dark"
        )}>
          {item.question}
        </span>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-brand-dark border-brand-dark text-white rotate-180" : "bg-white border-black/10 text-brand-dark group-hover:border-brand-dark"
        )}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-base md:text-lg text-brand-dark/70 leading-relaxed font-medium">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// FAQ Component
// ============================================================================
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showControls, setShowControls] = useState(false);
  const [layout, setLayout] = useState<FAQLayout>(faqDefaults);

  const handleChange = useCallback((key: keyof FAQLayout, val: number) => {
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
        style={{
          ...t(layout.sectionX, layout.sectionY),
          ...(layout.sectionMinHeight > 0 ? { minHeight: `${layout.sectionMinHeight}px` } : {}),
        }}
      >
        <div
          className="grid lg:grid-cols-12 items-start"
          style={{ gap: `${layout.gridGap}px` }}
        >
          {/* Header */}
          <div
            className="lg:col-span-4"
            style={t(layout.leftX, layout.leftY, layout.leftScale)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sticky top-32"
            >
              <div
                className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-brand-beige/50 text-sm font-bold uppercase tracking-wider mb-6"
                style={t(layout.badgeX, layout.badgeY)}
              >
                Support
              </div>
              <h2
                className="text-4xl md:text-5xl font-serif font-black text-brand-dark mb-6"
                style={t(layout.headingX, layout.headingY, layout.headingScale)}
              >
                Frequently Asked Questions
              </h2>
              <p
                className="text-brand-dark/60 text-lg font-medium mb-8"
                style={t(layout.subtitleX, layout.subtitleY)}
              >
                Can't find the answer you're looking for? Join our <a href="#" className="text-brand-dark underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity">Discord community</a>.
              </p>
            </motion.div>
          </div>

          {/* List */}
          <div
            className="lg:col-span-8"
            style={t(layout.rightX, layout.rightY, layout.rightScale)}
          >
            <div
              className="bg-[#F9F9F9] rounded-3xl border border-black/5"
              style={{
                padding: `${layout.faqCardPadding}px`,
                ...t(layout.faqCardX, layout.faqCardY),
              }}
            >
              {faqs.map((item, index) => (
                <FAQItem
                  key={index}
                  item={item}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(index === openIndex ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ Layout Controls (dev tool) */}
      <FAQControls
        values={layout}
        onChange={handleChange}
        onReset={() => setLayout(faqDefaults)}
        visible={showControls}
        onToggle={() => setShowControls(!showControls)}
      />
    </>
  );
};

export default FAQ;
