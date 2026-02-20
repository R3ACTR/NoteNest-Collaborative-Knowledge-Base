const fs = require('fs');

// 1. Fix layout.tsx to globally include Material Icons and Google Fonts
let layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
if (!layoutContent.includes('Material+Icons+Outlined')) {
    layoutContent = layoutContent.replace(
        /<meta name="viewport" [^\/>]+\/>/i,
        `$&
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />`
    );
    fs.writeFileSync('app/layout.tsx', layoutContent, 'utf8');
    console.log('Injected Material Icons & Fonts into layout.tsx');
}

// 2. Fix globals.css conflicting overrides & add @source
let cssContent = fs.readFileSync('app/globals.css', 'utf8');

if (!cssContent.includes('@source "./app";')) {
    cssContent = cssContent.replace(
        /@import "tailwindcss";/,
        `@import "tailwindcss";\n@source "./app";\n@source "./components";`
    );
}

// Remove the conflicting max-w-7xl override
cssContent = cssContent.replace(/\/\* Large screen optimizations \*\/[\s\S]*?\}\s*\}/, '/* Large screen optimizations removed */');

fs.writeFileSync('app/globals.css', cssContent, 'utf8');
console.log('Fixed globals.css');
