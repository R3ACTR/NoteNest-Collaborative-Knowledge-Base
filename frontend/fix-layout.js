const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Remove `<ResponsiveScaler>` import
content = content.replace(/import\s+{\s*ResponsiveScaler\s*}\s+from\s+"@\/components\/ui\/ResponsiveScaler";\s*/g, '');

// Remove `<ResponsiveScaler>` tags
content = content.replace(/<ResponsiveScaler>/g, '');
content = content.replace(/<\/ResponsiveScaler>\n/g, '');

// Remove all `dark:` classes
content = content.replace(/dark:[a-zA-Z0-9\-\/\[\]\.]+/g, '');

// Clean up extra spaces inside classNames
content = content.replace(/className="([^"]+)"/g, (match, classList) => {
    return `className="${classList.replace(/\s+/g, ' ').trim()}"`;
});

fs.writeFileSync('app/page.tsx', content, 'utf8');
console.log('Fixed page.tsx layout parameters');
