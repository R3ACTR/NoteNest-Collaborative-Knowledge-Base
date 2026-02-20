const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Fix the pseudo-class typos we left behind from the bad regex
content = content.replace(/:[a-zA-Z0-9\-]+/g, (match, offset, fullStr) => {
    // If it is preceded by a space or quote, it's an orphan like :text-white or :border-stone-700
    const prevChar = fullStr[offset - 1];
    if (prevChar === ' ' || prevChar === '"') {
        return ''; // Delete the orphan pseudo prefix leftovers
    }
    return match;
});

// Clean up extra spaces
content = content.replace(/className="([^"]+)"/g, (match, classList) => {
    return `className="${classList.replace(/\s+/g, ' ').trim()}"`;
});

fs.writeFileSync('app/page.tsx', content, 'utf8');
console.log('Fixed orphaned pseudo classes');

let cssContent = fs.readFileSync('app/globals.css', 'utf8');
// Comment out the dangerous nav overrides
cssContent = cssContent.replace(/nav a,\s*nav button \{\s*color: var\(--color-text-primary\);\s*opacity: 1;\s*\}/g, '/* nav overrides removed */');
cssContent = cssContent.replace(/nav input \{\s*color: var\(--color-text-primary\);\s*background: var\(--color-background\);\s*\}/g, '/* nav input overrides removed */');

fs.writeFileSync('app/globals.css', cssContent, 'utf8');
console.log('Fixed global css overrides');
