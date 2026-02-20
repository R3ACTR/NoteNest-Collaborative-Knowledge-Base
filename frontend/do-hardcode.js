const fs = require('fs');

let html = fs.readFileSync('../../target/notenest_landing_page_v1/code.html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// remove dark mode variants to force light mode
bodyContent = bodyContent.replace(/\bdark:[a-zA-Z0-9\-\/\[\]\.]+/g, '');

const colors = {
    'primary-hover': '#27272a',
    'primary': '#18181b',
    'accent-purple': '#8B5CF6',
    'accent-yellow': '#FDE047',
    'accent-pink': '#FB7185',
    'accent-blue': '#93C5FD',
    'background-light': '#F3F0E6',
    'background-dark': '#0F0F11',
    'surface-light': '#FFFFFF',
    'surface-dark': '#1E1E21',
};

// Must replace primary-hover BEFORE primary, so reverse order by key length is done naturally above.
for (const [name, hex] of Object.entries(colors)) {
    const bgRegex = new RegExp(`\\bbg-${name}(/\\d+)?`, 'g');
    bodyContent = bodyContent.replace(bgRegex, (match, opacity) => opacity ? `bg-[${hex}]${opacity}` : `bg-[${hex}]`);

    const textRegex = new RegExp(`\\btext-${name}(/\\d+)?`, 'g');
    bodyContent = bodyContent.replace(textRegex, (match, opacity) => opacity ? `text-[${hex}]${opacity}` : `text-[${hex}]`);

    const borderRegex = new RegExp(`\\bborder-${name}(/\\d+)?`, 'g');
    bodyContent = bodyContent.replace(borderRegex, (match, opacity) => opacity ? `border-[${hex}]${opacity}` : `border-[${hex}]`);
}

// Map HTML to React
bodyContent = bodyContent.replace(/class=/g, 'className=');
bodyContent = bodyContent.replace(/fill-rule=\"evenodd\"/g, 'fillRule="evenodd"');
bodyContent = bodyContent.replace(/clip-rule=\"evenodd\"/g, 'clipRule="evenodd"');
bodyContent = bodyContent.replace(/clip-path=\"evenodd\"/g, 'clipPath="evenodd"');

// Unescaped quotes in JSX text
bodyContent = bodyContent.replace(/>([^<]*)'([^<]*)</g, />$1&apos;$2</);
bodyContent = bodyContent.replace(/>([^<]*)'([^<]*)</g, />$1&apos;$2</); // second pass for multiple quotes in same node

// Remove scripts
bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// Self-closing tags fixing (img)
bodyContent = bodyContent.replace(/<img([^>]+)(?<!\/)>/g, '<img$1 />');

// Clean up left over empty class spaces from removing dark mode
bodyContent = bodyContent.replace(/className="([^"]+)"/g, (match, classList) => {
    return `className="${classList.replace(/\s+/g, ' ').trim()}"`;
});

const newPageTsx = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NoteNest - Collaborative Knowledge Base for Teams",
  description: "NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.",
};

export default function Home() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" precedence="default" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" precedence="default" />
      <style dangerouslySetInnerHTML={{__html: \`
        .font-display { font-family: 'Instrument Serif', serif !important; }
        .font-sans { font-family: 'Inter', sans-serif !important; }
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 1.5rem;
        }
      \`}} />
      <div className="bg-[#F3F0E6] text-slate-800 font-sans antialiased transition-colors duration-300 overflow-x-hidden">
        ${bodyContent}
      </div>
    </>
  );
}
`;

fs.writeFileSync('app/page.tsx', newPageTsx, 'utf8');
console.log('Successfully hardcoded app/page.tsx');
