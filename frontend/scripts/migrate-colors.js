
const fs = require('fs');
const path = require('path');

// Color mappings based on design tokens
const MAPPINGS = [
    { hex: '#F3F0E6', class: 'brand-beige' },
    { hex: '#1A1A1A', class: 'brand-dark' },
    { hex: '#FF6B6B', class: 'brand-accent' },
    { hex: '#FFD93D', class: 'brand-yellow' },
    { hex: '#4A4A4A', class: 'text-secondary' },
    { hex: '#6B6B6B', class: 'text-muted' },
    { hex: '#FFFFFF', class: 'bg-card' }, // Careful with this one, might be bg-white too
];

// Directories to scan
const SCAN_DIRS = [
    'frontend/components/landing',
    'frontend/components/layout',
    'frontend/components/ui',
    'frontend/app'
];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function migrateColors() {
    let totalFiles = 0;
    let totalReplacements = 0;

    const rootDir = process.cwd(); // Should be project root

    console.log(`Starting migration from root: ${rootDir}`);

    let allFiles = [];
    SCAN_DIRS.forEach(dir => {
        const fullPath = path.join(rootDir, dir);
        if (fs.existsSync(fullPath)) {
            allFiles = allFiles.concat(getAllFiles(fullPath));
        } else {
            console.warn(`Directory not found: ${fullPath}`);
        }
    });

    console.log(`Found ${allFiles.length} files to scan.`);

    allFiles.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;
        let fileReplacements = 0;

        MAPPINGS.forEach(mapping => {
            // Create regex for different utility patterns
            // 1. bg-[#hex]
            const bgRegex = new RegExp(`bg-\\[${mapping.hex}\\]`, 'gi');
            // 2. text-[#hex]
            const textRegex = new RegExp(`text-\\[${mapping.hex}\\]`, 'gi');
            // 3. border-[#hex]
            const borderRegex = new RegExp(`border-\\[${mapping.hex}\\]`, 'gi');

            // Replace bg colors
            if (content.match(bgRegex)) {
                const count = (content.match(bgRegex) || []).length;
                content = content.replace(bgRegex, `bg-${mapping.class}`);
                fileReplacements += count;
            }

            // Replace text colors
            if (content.match(textRegex)) {
                const count = (content.match(textRegex) || []).length;
                content = content.replace(textRegex, `text-${mapping.class}`);
                fileReplacements += count;
            }

            // Replace border colors
            if (content.match(borderRegex)) {
                const count = (content.match(borderRegex) || []).length;
                content = content.replace(borderRegex, `border-${mapping.class}`);
                fileReplacements += count;
            }
        });

        // Special case for opacity: text-[#1A1A1A]/80 -> text-brand-dark/80
        // The previous regex might catch the main part, but let's check custom opacity values
        // Actually, the above replacement handles it because `bg-[#hex]/80` becomes `bg-brand-beige/80` naturally if only the hex part is replaced?
        // Wait, regex `bg-\[#hex\]` matches exact string. If it's `bg-[#hex]/80`, it won't match.
        // We need to handle opacity variants: `bg-[#hex]/[0-9]+`

        MAPPINGS.forEach(mapping => {
            const bgOpacityRegex = new RegExp(`bg-\\[${mapping.hex}\\]/([0-9]+)`, 'gi');
            const textOpacityRegex = new RegExp(`text-\\[${mapping.hex}\\]/([0-9]+)`, 'gi');

            if (content.match(bgOpacityRegex)) {
                const count = (content.match(bgOpacityRegex) || []).length;
                content = content.replace(bgOpacityRegex, `bg-${mapping.class}/$1`);
                fileReplacements += count;
            }

            if (content.match(textOpacityRegex)) {
                const count = (content.match(textOpacityRegex) || []).length;
                content = content.replace(textOpacityRegex, `text-${mapping.class}/$1`);
                fileReplacements += count;
            }
        });

        if (originalContent !== content) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file} (${fileReplacements} replacements)`);
            totalFiles++;
            totalReplacements += fileReplacements;
        }
    });

    console.log('--------------------------------------------------');
    console.log(`Migration Complete.`);
    console.log(`Files updated: ${totalFiles}`);
    console.log(`Total replacements: ${totalReplacements}`);
}

migrateColors();
