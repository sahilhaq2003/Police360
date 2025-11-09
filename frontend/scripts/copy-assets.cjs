const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'images');
const destDir = path.join(root, 'public', 'images');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source folder not found: ${src}`);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const items = fs.readdirSync(src);
  for (const item of items) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d);
    } else {
      try {
        fs.copyFileSync(s, d);
        console.log(`Copied ${s} -> ${d}`);
      } catch (err) {
        console.error(`Failed to copy ${s} -> ${d}:`, err.message);
      }
    }
  }
}

copyRecursive(srcDir, destDir);

console.log('Asset copy complete.');
