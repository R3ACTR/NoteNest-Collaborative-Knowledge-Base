const fs = require('fs');

let cssContent = fs.readFileSync('app/globals.css', 'utf8');

// Replace `--color-*` with just `--*` if inside @theme according to some early tailwind v4 docs,
// OR simply add the core theme variables to the root.
// Wait, Tailwind 4's correct format is indeed `--color-name: #hex;`.
// Let's check if the generic classes like `bg-stone-900` are working. If standard Tailwind classes aren't working, 
// the issue might be that the content path is wrong, or `@tailwindcss/postcss` isn't installed.

let pageContent = fs.readFileSync('app/page.tsx', 'utf8');

// The issue might be that we have `bg-primary` instead of `bg-brand-primary` if the new names aren't registering.
// Let's replace the custom names with absolute hex values or standard tailwind colors in page.tsx 
// to see if it fixes the design immediately.

pageContent = pageContent.replace(/bg-background-light/g, 'bg-[#f3f0e6]');
pageContent = pageContent.replace(/bg-background-dark/g, 'bg-[#0f0f11]');
pageContent = pageContent.replace(/border-background-light/g, 'border-[#f3f0e6]');

pageContent = pageContent.replace(/bg-primary-hover/g, 'bg-[#27272a]');
pageContent = pageContent.replace(/bg-primary/g, 'bg-[#18181b]');
pageContent = pageContent.replace(/text-primary/g, 'text-[#18181b]');

pageContent = pageContent.replace(/bg-accent-purple/g, 'bg-[#8b5cf6]');
pageContent = pageContent.replace(/text-accent-purple/g, 'text-[#8b5cf6]');

pageContent = pageContent.replace(/bg-accent-yellow/g, 'bg-[#fde047]');
pageContent = pageContent.replace(/text-accent-yellow/g, 'text-[#fde047]');

pageContent = pageContent.replace(/bg-accent-pink/g, 'bg-[#fb7185]');
pageContent = pageContent.replace(/text-accent-pink/g, 'text-[#fb7185]');

pageContent = pageContent.replace(/bg-accent-blue/g, 'bg-[#93c5fd]');
pageContent = pageContent.replace(/text-accent-blue/g, 'text-[#93c5fd]');

// Force standard typography
pageContent = pageContent.replace(/font-display/g, 'font-serif');

fs.writeFileSync('app/page.tsx', pageContent);
console.log('Injected hardcoded hex codes into page.tsx');

