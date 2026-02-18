"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Move, Maximize2, RotateCcw, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Layout Controls Panel (dev tool)
// ============================================================================
interface LayoutValues {
  navX: number;
  navY: number;
  pillX: number;
  pillY: number;
  pillScale: number;
  pillMaxWidth: number;
  pillPaddingX: number;
}

const defaultValues: LayoutValues = {
  navX: 0,
  navY: 0,
  pillX: 0,
  pillY: 0,
  pillScale: 1,
  pillMaxWidth: 800, // max-w-5xl
  pillPaddingX: 24,   // px-6
};

function LayoutControls({
  values,
  onChange,
  onReset,
  visible,
  onToggle,
}: {
  values: LayoutValues;
  onChange: (key: keyof LayoutValues, val: number) => void;
  onReset: () => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyValues = useCallback(() => {
    const output = `// Navbar Layout Values (paste into Navbar.tsx)
// Nav offset: translateX(${values.navX}px) translateY(${values.navY}px)
// Pill offset: translateX(${values.pillX}px) translateY(${values.pillY}px)
// Pill scale: ${values.pillScale}
// Pill max-width: ${values.pillMaxWidth}px
// Pill padding-x: ${values.pillPaddingX}px`;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [values]);

  // Toggle button (always visible)
  const toggleBtn = (
    <button
      onClick={onToggle}
      className="fixed bottom-4 right-4 z-[9999] bg-brand-dark text-white p-3 rounded-full shadow-xl hover:bg-black transition-colors"
      title="Toggle Navbar Layout Controls"
      style={{ transform: 'none' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );

  if (!visible) return toggleBtn;

  const controls: { key: keyof LayoutValues; label: string; min: number; max: number; step: number; unit: string }[] = [
    { key: 'navX', label: 'Nav ← →', min: -200, max: 200, step: 1, unit: 'px' },
    { key: 'navY', label: 'Nav ↑ ↓', min: -100, max: 100, step: 1, unit: 'px' },
    { key: 'pillX', label: 'Pill ← →', min: -200, max: 200, step: 1, unit: 'px' },
    { key: 'pillY', label: 'Pill ↑ ↓', min: -50, max: 50, step: 1, unit: 'px' },
    { key: 'pillScale', label: 'Pill Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x' },
    { key: 'pillMaxWidth', label: 'Pill Max Width', min: 400, max: 1400, step: 10, unit: 'px' },
    { key: 'pillPaddingX', label: 'Pill Padding X', min: 0, max: 80, step: 2, unit: 'px' },
  ];

  return (
    <>
      {toggleBtn}
      <div
        className="fixed bottom-16 right-4 z-[9999] w-72 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl p-4 space-y-3 text-xs font-mono"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-brand-dark font-sans flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" /> Navbar Controls
          </span>
          <div className="flex gap-1">
            <button
              onClick={copyValues}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              title="Copy values"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              title="Reset all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {copied && (
          <div className="text-green-600 text-center text-[11px] font-sans font-medium">
            ✓ Values copied to clipboard
          </div>
        )}

        {controls.map((c) => (
          <div key={c.key} className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-brand-dark/70 font-sans font-medium">{c.label}</span>
              <span className="text-brand-dark font-bold">
                {c.key === 'pillScale' ? values[c.key].toFixed(2) : values[c.key]}{c.unit}
              </span>
            </div>
            <input
              type="range"
              min={c.min}
              max={c.max}
              step={c.step}
              value={values[c.key]}
              onChange={(e) => onChange(c.key, parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-black/10 accent-brand-dark cursor-pointer"
            />
          </div>
        ))}

        <div className="pt-1 border-t border-black/5 text-[10px] text-brand-dark/40 font-sans text-center">
          Nudge: drag sliders · Reset: ↻ · Copy: ⎘
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Navbar Component
// ============================================================================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [layout, setLayout] = useState<LayoutValues>(defaultValues);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLayoutChange = useCallback((key: keyof LayoutValues, val: number) => {
    setLayout((prev) => ({ ...prev, [key]: val }));
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Community", href: "https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base" },
    { name: "Docs", href: "#docs" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
          scrolled ? "pt-2" : "pt-6"
        )}
        style={{
          transform: `translate(${layout.navX}px, ${layout.navY}px)`,
        }}
      >
        <div
          className={cn(
            "mx-auto rounded-full flex justify-between items-center transition-all duration-300",
            scrolled
              ? "bg-brand-beige/90 backdrop-blur-md shadow-sm border border-black/5 py-3"
              : "bg-transparent py-3"
          )}
          style={{
            maxWidth: `${layout.pillMaxWidth}px`,
            paddingLeft: `${layout.pillPaddingX}px`,
            paddingRight: `${layout.pillPaddingX}px`,
            transform: `translate(${layout.pillX}px, ${layout.pillY}px) scale(${layout.pillScale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50 relative">
            <span className="text-2xl font-bold font-serif text-brand-dark tracking-tight">
              NoteNest
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-brand-dark/80 hover:text-brand-dark transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center bg-brand-dark text-white text-sm font-semibold px-6 py-2.5 rounded-full overflow-hidden transition-all hover:bg-black hover:shadow-lg"
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden z-50 relative p-2 text-brand-dark hover:bg-black/5 rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {
          mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-40 bg-brand-beige flex flex-col pt-32 px-6 pb-8 md:hidden"
            >
              <div className="flex flex-col gap-6 text-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-serif font-medium text-brand-dark"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px w-full bg-brand-dark/10 my-4" />
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-brand-dark/70"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-brand-dark text-white text-lg font-medium py-3 rounded-full hover:bg-black transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence>

      {/* Layout Controls (dev tool) */}
      <LayoutControls
        values={layout}
        onChange={handleLayoutChange}
        onReset={() => setLayout(defaultValues)}
        visible={showControls}
        onToggle={() => setShowControls(!showControls)}
      />
    </>
  );
};

export default Navbar;
