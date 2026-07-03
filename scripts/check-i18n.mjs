import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const baselinePath = path.join(root, 'scripts', 'i18n-baseline.json');
const updateBaseline = process.argv.includes('--update-baseline');
const allowedPaths = new Set([
  path.normalize('src/i18n/index.js')
]);

const scannedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const turkishOrMojibakePattern = /[çğıöşüÇĞİÖŞÜ]|Ã|Ä|Å|ğŸ|â/;

const walk = (dir) => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  });
};

const files = walk(sourceRoot)
  .filter(file => scannedExtensions.has(path.extname(file)))
  .filter(file => !allowedPaths.has(path.normalize(path.relative(root, file))));

const findings = [];

for (const file of files) {
  const relative = path.relative(root, file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    if (turkishOrMojibakePattern.test(line)) {
      findings.push({
        file: relative,
        line: index + 1,
        text: line.trim().slice(0, 180)
      });
    }
  });
}

const keys = findings.map(item => `${item.file}:${item.line}:${item.text}`);

if (updateBaseline) {
  fs.writeFileSync(baselinePath, `${JSON.stringify(keys, null, 2)}\n`);
  console.log(`i18n baseline updated with ${keys.length} existing findings.`);
  process.exit(0);
}

const baseline = fs.existsSync(baselinePath)
  ? new Set(JSON.parse(fs.readFileSync(baselinePath, 'utf8')))
  : new Set();

const newFindings = findings.filter(item => !baseline.has(`${item.file}:${item.line}:${item.text}`));

if (newFindings.length) {
  console.error(`i18n check failed: ${newFindings.length} new possible hard-coded Turkish/mojibake lines found outside src/i18n.`);
  for (const item of newFindings.slice(0, 80)) {
    console.error(`${item.file}:${item.line} ${item.text}`);
  }
  if (newFindings.length > 80) {
    console.error(`...and ${newFindings.length - 80} more.`);
  }
  console.error(`Existing baseline findings: ${baseline.size}. Run npm run check:i18n:update after intentionally accepting a new baseline.`);
  process.exit(1);
}

console.log(`i18n check passed: no new findings. Existing baseline findings: ${baseline.size}.`);
