const fs = require('fs');

const css = `@import "tailwindcss";

@theme {
  --color-primary: #18181b;
  --color-primary-hover: #27272a;
  --color-accent-purple: #8b5cf6;
  --color-accent-yellow: #fde047;
  --color-accent-pink: #fb7185;
  --color-accent-blue: #93c5fd;
  --color-background-light: #f3f0e6;
  --color-background-dark: #0f0f11;
  --color-surface-light: #ffffff;
  --color-surface-dark: #1e1e21;

  --font-serif: Georgia, Cambria, "Times New Roman", Times, serif;
  --font-sans: var(--font-inter), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
  --font-display: var(--font-instrument-serif), serif;
}

:root {
  --color-background: #F3F0E6;
  --color-foreground: #1A1A1A;
}

@layer utilities {
  .mask-linear-fade {
    mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  }
}
`;

fs.writeFileSync('app/globals.css', css, 'utf8');
console.log('Successfully wiped globals.css to raw Tailwind default');
