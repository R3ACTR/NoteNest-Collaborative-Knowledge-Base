import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NoteNest - Collaborative Knowledge Base for Teams",
  description: "NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.",
};

export default function Home() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" precedence="default" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" precedence="default" />
      <style dangerouslySetInnerHTML={{__html: `
        .font-display { font-family: 'Instrument Serif', serif !important; }
        .font-sans { font-family: 'Inter', sans-serif !important; }
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 1.5rem;
        }
      `}} />
      <div className="bg-[#F3F0E6] text-slate-800 font-sans antialiased transition-colors duration-300 overflow-x-hidden">
        
<nav className="fixed top-0 w-full z-50 bg-[#F3F0E6]/90 backdrop-blur-sm border-b border-stone-200/50">
<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-display text-xl pt-1">N</div>
<span className="font-display text-2xl font-bold tracking-tight">NoteNest</span>
</div>
<div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
<a className="hover:text-black :text-white transition-colors" href="#features">Features</a>
<a className="hover:text-black :text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Community</a>
<a className="hover:text-black :text-white transition-colors" href="#docs">Docs</a>
</div>
<div className="flex items-center gap-4">
<a className="hidden md:block text-sm font-medium hover:text-black :text-white transition-colors" href="/login">Log in</a>
<a className="bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 group" href="/dashboard">
                    Get Started <span className="material-icons-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
</a>
</div>
</div>
</nav>
<main className="pt-32 pb-24 px-6">
<div className="max-w-7xl mx-auto mb-32">
<div className="grid lg:grid-cols-2 gap-16 items-center">
<div className="space-y-8">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-300 bg-white/50 text-xs font-semibold tracking-wide uppercase">
<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        MIT License • Open Source
                    </div>
<h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] text-stone-900">
                        Knowledge base for <span className="italic text-stone-500">teams.</span>
</h1>
<p className="text-xl text-stone-600 max-w-lg leading-relaxed">
                        NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.
                    </p>
<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
<a className="bg-[#18181b] hover:bg-[#27272a] text-white px-8 py-4 rounded-full text-lg font-medium transition-all flex items-center gap-2 group" href="/dashboard">
                            Start Writing
                            <span className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
<span className="material-icons-outlined text-sm">arrow_forward</span>
</span>
</a>
<div className="flex items-center gap-3 px-4 py-2">
<div className="flex -space-x-3">
<img alt="User 1" className="w-10 h-10 rounded-full border-2 border-[#F3F0E6]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP848b4C-K8rTq5beq9YjfCEPiPgRTPpDcZVqPScPGoBwbzOamDUlXNg0QZrJg_-SiKfb6tciKAP1EQru1qdNlEa6z8qQXLSicbSxJeo3im36rHWKYR-CoedBrOBRiXgejj1eBZ3UhtMTQyQKspjF9ZVhcybqYJqDEJqviYg4PoTBLPcusflvq5EOWEet5--TD5xxRykGJ_nVnIAJDpvnbYz4dky7ac_BOCxUeKynEiQ5YfSmkyJ9jbuaEiwcCu6JczKiv7L_ociA"/>
<img alt="User 2" className="w-10 h-10 rounded-full border-2 border-[#F3F0E6]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyhXgUBGGZOrVXdnduKOMfBWPO8evgtkdAheyki3EUQLhAkEvcmi1DxYqBLWt2_NI5fZx6JRGj51csFP6k4lXhjIFuvB3FGfXZIWJJ-kunVFPB2qiw2GJqwv3GnHsrlJl1y87GnD-00S5Emx06piNs8EDhUxN2fIcFXoaKQh5F_pa4E57tVBUfOwA6bHxfY9vzHdg5XMfkWFNbhrtERqK8hrLovQM-od6DqYX_JGURhfT_UI8vzXcuqgGdb-j--p146tlgBWOGp7U"/>
<img alt="User 3" className="w-10 h-10 rounded-full border-2 border-[#F3F0E6]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlksjxoZHf3kksPwl47vxWVokLCdZ_QlIsh2d0ss1U6y6wZA34pjHaDFv4GtwDhumsx_Xm-cTEtFTaMBormqlW6XMh-1NQc5NcXnPrZ-5d9Ur1oSIKswcRP53r9UG7Gda_lWe6AbqRtptxbSAXZ8agtH6Gbn_yNXe8que9cjMejKyMYJvAwC8NCYlo6vnKhXbRyjRvnkCT0hyc8aC1XPXtg1Yw-HXg_SKVtdrehgGR_7Ec75QOWRgjiIuLHj6T8LPaVfiUaRwfAN0"/>
<div className="w-10 h-10 rounded-full border-2 border-[#F3F0E6] bg-stone-200 flex items-center justify-center text-xs font-bold">+4k</div>
</div>
<span className="text-sm font-medium text-stone-600">Trusted by 4,000+ teams</span>
</div>
</div>
</div>
<div className="relative hidden lg:block">
<div className="absolute right-0 top-10 w-[450px] bg-black text-white p-8 rounded-3xl shadow-2xl z-20 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
<div className="flex justify-between items-center mb-12">
<h3 className="font-display text-3xl">My Notes</h3>
<button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
<span className="material-icons-outlined text-sm">more_horiz</span>
</button>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-[#8B5CF6] text-white p-5 rounded-2xl h-40 flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
<div>
<h4 className="font-bold text-xl leading-tight">Plan for<br/>The Day</h4>
</div>
<div className="flex items-center gap-2 text-white/80">
<span className="material-icons-outlined text-sm">check_circle</span>
<span className="text-sm font-medium">Gym</span>
</div>
</div>
<div className="bg-[#FDE047] text-black p-5 rounded-2xl h-40 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
<h4 className="font-bold text-xl">Ideas</h4>
<div className="absolute bottom-4 right-4 bg-black/10 w-10 h-10 rounded-lg flex items-center justify-center">
<span className="material-icons-outlined">image</span>
</div>
</div>
</div>
</div>
<div className="absolute right-16 -top-12 w-[400px] bg-white p-8 rounded-3xl shadow-xl z-10 border border-stone-200">
<div className="flex justify-between items-start mb-6">
<h3 className="font-display text-4xl text-stone-900 leading-tight">Real-time<br/>Collab</h3>
<div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
<span className="material-icons-outlined">sync</span>
</div>
</div>
<div className="flex gap-4 mt-8">
<div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
<span className="material-icons-outlined">add</span>
</div>
<div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
<span className="material-icons-outlined">image</span>
</div>
</div>
<div className="absolute -right-6 bottom-10 bg-black text-white px-4 py-2 rounded-full font-bold shadow-lg transform rotate-3 flex items-center gap-2">
                            Syncing...
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
</div>
</div>
</div>
</div>
</div>
<div id="features" className="max-w-7xl mx-auto mt-40">
<div className="mb-12 max-w-xl">
<h2 className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Capabilities</h2>
<h3 className="font-display text-4xl md:text-5xl text-stone-900 leading-tight">
                    Everything you need to <br/>
<span className="relative inline-block">
<span className="relative z-10">build knowledge.</span>
<span className="absolute bottom-2 left-0 w-full h-3 bg-[#FB7185]/30 -rotate-1"></span>
</span>
</h3>
</div>
<div className="bento-grid grid-rows-2">
<div className="col-span-12 md:col-span-7 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm overflow-hidden relative group hover:border-stone-300 :border-stone-700 transition-colors">
<div className="relative z-10">
<div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-6 text-stone-900">
<span className="material-icons-outlined">description</span>
</div>
<h4 className="font-display text-2xl text-stone-900 mb-2">Rich Note Editor</h4>
<p className="text-stone-500">Structured documentation with Markdown support.</p>
</div>
<div className="mt-8 space-y-3 opacity-50 group-hover:opacity-80 transition-opacity">
<div className="h-4 bg-stone-100 rounded w-3/4"></div>
<div className="h-4 bg-stone-100 rounded w-full"></div>
<div className="h-4 bg-stone-100 rounded w-5/6"></div>
<div className="flex gap-4 mt-6">
<div className="h-20 bg-stone-50 rounded-xl w-1/2 border border-stone-100"></div>
<div className="h-20 bg-stone-50 rounded-xl w-1/2 border border-stone-100"></div>
</div>
</div>
</div>
<div className="col-span-12 md:col-span-5 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:border-stone-300 :border-stone-700 transition-colors">
<div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-6 text-stone-900">
<span className="material-icons-outlined">groups</span>
</div>
<h4 className="font-display text-2xl text-stone-900 mb-2">Team Workspaces</h4>
<p className="text-stone-500 mb-8">Collaborative spaces for your team.</p>
<div className="flex items-center -space-x-2">
<div className="w-12 h-12 rounded-full bg-[#FDE047] flex items-center justify-center text-xs font-bold border-4 border-white">JD</div>
<div className="w-12 h-12 rounded-full bg-[#FB7185] flex items-center justify-center text-xs font-bold border-4 border-white text-white">AS</div>
<div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold border-4 border-white">MK</div>
<div className="w-12 h-12 rounded-full bg-[#93C5FD] flex items-center justify-center text-xs font-bold border-4 border-white">+</div>
</div>
</div>
<div className="col-span-12 md:col-span-4 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:border-stone-300 :border-stone-700 transition-colors">
<div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-6 text-stone-900">
<span className="material-icons-outlined">search</span>
</div>
<h4 className="font-display text-2xl text-stone-900 mb-2">Fast Search</h4>
<p className="text-stone-500 mb-6">Find notes quickly with powerful navigation.</p>
<div className="relative bg-stone-50 p-3 rounded-lg border border-stone-200">
<div className="flex items-center gap-2 text-stone-400">
<span className="material-icons-outlined text-sm">search</span>
<span className="text-xs">Search knowledge base...</span>
</div>
<span className="absolute right-3 top-3 text-[10px] bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-400">⌘K</span>
</div>
</div>
<div className="col-span-12 md:col-span-4 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:border-stone-300 :border-stone-700 transition-colors">
<div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-6 text-stone-900">
<span className="material-icons-outlined">folder_open</span>
</div>
<h4 className="font-display text-2xl text-stone-900 mb-2">Organization</h4>
<p className="text-stone-500 mb-6">Folders and tags to keep notes organized.</p>
<div className="space-y-2 text-sm">
<div className="flex items-center gap-2 p-2 bg-[#FDE047]/10 text-stone-900 rounded font-medium">
<span className="material-icons-outlined text-[#FDE047] text-lg">folder</span>
                            Engineering
                        </div>
<div className="flex items-center gap-2 px-2 py-1 text-stone-500 ml-4">
<span className="material-icons-outlined text-base">subdirectory_arrow_right</span>
<span className="material-icons-outlined text-base">folder</span>
                            Backend
                        </div>
<div className="flex items-center gap-2 px-2 py-1 text-stone-500 ml-4">
<span className="material-icons-outlined text-base">article</span>
                            API Docs
                        </div>
</div>
</div>
<div className="col-span-12 md:col-span-4 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:border-stone-300 :border-stone-700 transition-colors">
<div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-6 text-stone-900">
<span className="material-icons-outlined">verified_user</span>
</div>
<h4 className="font-display text-2xl text-stone-900 mb-2">Role-Based Access</h4>
<p className="text-stone-500 mb-6">Fine-grained permissions.</p>
<div className="space-y-2">
<div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
<span className="text-sm font-medium">Admin</span>
<span className="w-2 h-2 rounded-full bg-red-500"></span>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
<span className="text-sm font-medium">Editor</span>
<span className="w-2 h-2 rounded-full bg-[#FDE047]"></span>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
<span className="text-sm font-medium">Viewer</span>
<span className="w-2 h-2 rounded-full bg-green-500"></span>
</div>
</div>
</div>
</div>
</div>
<div id="docs" className="max-w-7xl mx-auto mt-40 grid lg:grid-cols-2 gap-20 items-center">
<div>
<h2 className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">NoteNest Methodology</h2>
<h3 className="font-display text-4xl md:text-5xl text-stone-900 leading-tight mb-4">
                    Write notes that <br/>
<span className="text-[#8B5CF6]">actually get read.</span>
</h3>
<div className="mt-12 space-y-10">
<div className="flex gap-6">
<div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xl font-display">T</div>
<div>
<h4 className="text-xl font-bold text-stone-900 mb-2">Clear Purpose</h4>
<p className="text-stone-600">Start every note with a &apos;Why&apos;. Define the context immediately.</p>
</div>
</div>
<div className="flex gap-6">
<div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0">
<span className="material-icons-outlined">segment</span>
</div>
<div>
<h4 className="text-xl font-bold text-stone-900 mb-2">Structured Content</h4>
<p className="text-stone-600">Use H1, H2, and H3s to create a scannable hierarchy.</p>
</div>
</div>
<div className="flex gap-6">
<div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0">
<span className="material-icons-outlined">code</span>
</div>
<div>
<h4 className="text-xl font-bold text-stone-900 mb-2">Actionable Info</h4>
<p className="text-stone-600">Include code snippets, commands, and direct links.</p>
</div>
</div>
</div>
</div>
<div className="relative">
<div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FDE047] rounded-full blur-3xl opacity-20"></div>
<div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8B5CF6] rounded-full blur-3xl opacity-20"></div>
<div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
<div className="p-6 border-b border-stone-100 flex justify-between items-center">
<div>
<h4 className="font-bold text-lg text-stone-900">Local Development Setup</h4>
<p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Prerequisites</p>
</div>
<div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
<span className="material-icons-outlined text-sm">check</span>
</div>
</div>
<div className="p-6 space-y-4">
<div className="text-sm text-stone-600">
<p>Node.js &gt; 18</p>
<p>NPM &gt; 9</p>
</div>
<div className="mt-4">
<p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Steps</p>
<div className="bg-[#1e1e1e] rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto">
<div className="flex gap-2 mb-2">
<span className="text-green-500"># 1. Install dependencies</span>
</div>
<div className="flex gap-2 mb-4">
<span className="text-purple-400">$</span>
<span>npm install</span>
</div>
<div className="flex gap-2 mb-2">
<span className="text-green-500"># 2. Start dev server</span>
</div>
<div className="flex gap-2">
<span className="text-purple-400">$</span>
<span>npm run dev</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<div className="max-w-3xl mx-auto mt-40 mb-20">
<h2 className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Support</h2>
<h3 className="font-display text-4xl text-stone-900 mb-8">Frequently Asked Questions</h3>
<div className="space-y-4">
<details className="group bg-white p-6 rounded-2xl border border-stone-200 cursor-pointer">
<summary className="flex justify-between items-center font-medium list-none text-lg text-stone-900">
                        Is NoteNest completely free?
                        <span className="material-icons-outlined transform group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="text-stone-600 mt-4 leading-relaxed">
                        Yes! NoteNest is open-source and free to self-host. We also offer a managed cloud version for teams that prefer a hassle-free experience.
                    </p>
</details>
<details className="group bg-white p-6 rounded-2xl border border-stone-200 cursor-pointer">
<summary className="flex justify-between items-center font-medium list-none text-lg text-stone-900">
                        Can I import from Notion/Obsidian?
                        <span className="material-icons-outlined transform group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="text-stone-600 mt-4 leading-relaxed">
                        Absolutely. We provide import tools for Markdown files, Notion exports, and Obsidian vaults so you can migrate your knowledge base easily.
                    </p>
</details>
<details className="group bg-white p-6 rounded-2xl border border-stone-200 cursor-pointer">
<summary className="flex justify-between items-center font-medium list-none text-lg text-stone-900">
                        Is my data encrypted?
                        <span className="material-icons-outlined transform group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="text-stone-600 mt-4 leading-relaxed">
                        Data security is our top priority. All data is encrypted at rest and in transit.
                    </p>
</details>
</div>
</div>
</main>
<footer className="bg-black text-stone-400 py-16 px-6 rounded-t-[3rem]">
<div className="max-w-7xl mx-auto">
<div className="grid md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
<div className="lg:col-span-2">
<div className="flex items-center gap-2 mb-6">
<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-display text-xl pt-1">N</div>
<span className="font-display text-2xl font-bold text-white tracking-tight">NoteNest</span>
</div>
<p className="mb-6 max-w-sm">
                        Open-source knowledge base for high-performance teams. Built with love and caffeine.
                    </p>
<div className="flex gap-4">
<a className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-stone-800 transition-colors" href="https://twitter.com">
<span className="sr-only">Twitter</span>
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
</a>
<a className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-stone-800 transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">
<span className="sr-only">GitHub</span>
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path></svg>
</a>
</div>
</div>
<div>
<h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Product</h4>
<ul className="space-y-4 text-sm">
<li><a className="hover:text-white transition-colors" href="#features">Features</a></li>
<li><a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Roadmap</a></li>
<li><a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Changelog</a></li>
<li><a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Pricing</a></li>
</ul>
</div>
<div>
<h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Resources</h4>
<ul className="space-y-4 text-sm">
<li><a className="hover:text-white transition-colors" href="#docs">Documentation</a></li>
<li><a className="hover:text-white transition-colors" href="#docs">API Reference</a></li>
<li><a className="hover:text-white transition-colors" href="#docs">Guide</a></li>
</ul>
</div>
<div>
<h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Community</h4>
<ul className="space-y-4 text-sm">
<li><a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">GitHub</a></li>
<li><a className="hover:text-white transition-colors" href="https://discord.com">Discord</a></li>
<li><a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Blog</a></li>
</ul>
</div>
</div>
<div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
<p>© 2024 NoteNest Inc. All rights reserved.</p>
<div className="flex gap-6">
<a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Privacy</a>
<a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Terms</a>
<a className="hover:text-white transition-colors" href="https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base">Cookies</a>
</div>
</div>
</div>
</footer>


      </div>
    </>
  );
}
