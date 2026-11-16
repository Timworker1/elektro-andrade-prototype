// Builds the prototype from src/page.html.
// Inlines every icon in src/icons/*.svg as an SVG <symbol> sprite (id="i-<filename>")
// in place of the <!--SPRITE--> marker, then writes:
//   index.html         full standalone document (GitHub Pages, opening locally)
//   build/artifact.html page fragment for the claude.ai artifact (it adds its own skeleton)
// Usage: node build.js
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const iconDir = path.join(dir, 'src', 'icons');

const symbols = fs.readdirSync(iconDir)
  .filter((f) => f.endsWith('.svg'))
  .sort()
  .map((f) => {
    const svg = fs.readFileSync(path.join(iconDir, f), 'utf8');
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    return `<symbol id="i-${path.basename(f, '.svg')}" viewBox="0 0 256 256">${inner}</symbol>`;
  });

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${symbols.join('')}</svg>`;
const page = fs.readFileSync(path.join(dir, 'src', 'page.html'), 'utf8');

if (!page.includes('<!--SPRITE-->')) throw new Error('src/page.html has no <!--SPRITE--> marker');

const fragment = page.replace('<!--SPRITE-->', sprite);
const full = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
</head>
<body>
${fragment}
</body>
</html>
`;

fs.mkdirSync(path.join(dir, 'build'), { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), full);
fs.writeFileSync(path.join(dir, 'build', 'artifact.html'), fragment);
console.log(`built index.html + build/artifact.html: ${symbols.length} icons`);
