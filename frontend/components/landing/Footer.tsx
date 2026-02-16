"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";
import { Container } from "@/components/ui";

// ============================================================================
// Footer Component — Production Layout (locked from 1440px tuning session)
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
  return (
    <footer
      className="bg-brand-dark text-brand-beige rounded-t-[3rem]"
      style={{
        paddingTop: '80px',     // footerPaddingY
        paddingBottom: '80px',  // footerPaddingY
        marginTop: '80px',      // footerMarginTop
        transform: 'translateY(53px)', // footerY
        transformOrigin: 'center center'
      }}
    >
      <Container>
        {/* Grid: gap 40px */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 mb-16"
          style={{ gap: '40px' }}
        >
          {/* Brand Column — translate(30px, 0) */}
          <div
            className="col-span-2 lg:col-span-2 space-y-6"
            style={{ transform: 'translateX(30px)' }}
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

          {/* Links Columns — linksGap 40px */}
          <div
            className="col-span-4 grid grid-cols-2 md:grid-cols-4"
            style={{ gap: '40px' }}
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

        {/* Bottom Bar — translate(35px, 30px) */}
        <div
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-brand-beige/40 font-medium"
          style={{ transform: 'translate(35px, 30px)' }}
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
  );
};

export default Footer;
