const fs = require('fs');

const targetHtml = fs.readFileSync('../../target/notenest_landing_page_v1/code.html', 'utf8');

// Extract the contents between <body> and </body>
const bodyMatch = targetHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// Replace standard HTML attributes with React equivalents
bodyContent = bodyContent.replace(/class=/g, 'className=');
bodyContent = bodyContent.replace(/fill-rule="evenodd"/g, 'fillRule="evenodd"');
bodyContent = bodyContent.replace(/clip-rule="evenodd"/g, 'clipRule="evenodd"');

// Fix unclosed tags if any (the img and br tags actually look closed but let's be safe if they aren't)
// bodyContent = bodyContent.replace(/<img([^>]+[^\/])>/g, '<img$1 />');

// Remove script tags from body if any
bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// we also want to remove <nav> ... </nav> inside the body mapping? NO, the HTML has <nav>, <main>, <footer>. We keep them!
// We will wrap them in a fragment or a div, since the current Home component uses <main className="...">...

const newPageTsx = `import type { Metadata } from "next";
import Link from "next/link";
import { ResponsiveScaler } from "@/components/ui/ResponsiveScaler";

export const metadata: Metadata = {
  title: "NoteNest - Collaborative Knowledge Base for Teams",
  description: "NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.",
};

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans antialiased transition-colors duration-300">
      <ResponsiveScaler>
        ${bodyContent}
      </ResponsiveScaler>
    </div>
  );
}
`;

fs.writeFileSync('app/page.tsx', newPageTsx, 'utf8');
console.log('Successfully generated app/page.tsx');
