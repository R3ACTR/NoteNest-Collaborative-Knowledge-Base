"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-4 md:px-8",
          scrolled ? "pt-2" : "pt-6"
        )}
      >
        <div className="max-w-5xl mx-auto">
          <div 
            className={cn(
              "rounded-full px-6 py-3 flex justify-between items-center transition-all duration-300",
              scrolled 
                ? "bg-[#F3F0E6]/90 backdrop-blur-md shadow-sm border border-black/5" 
                : "bg-transparent"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 z-50 relative">
              <span className="text-2xl font-bold font-serif text-[#1A1A1A] tracking-tight">
                NoteNest
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-[#1A1A1A]/80 hover:text-[#1A1A1A] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center bg-[#1A1A1A] text-white text-sm font-semibold px-6 py-2.5 rounded-full overflow-hidden transition-all hover:bg-black hover:shadow-lg"
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
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
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
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
