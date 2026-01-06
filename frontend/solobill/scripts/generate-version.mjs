import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const pkgPath = path.resolve(__dirname, '../package.json');
const versionJsonPath = path.resolve(__dirname, '../public/version.json');

// Read package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

// --- Increment patch version ---
function incrementPatch(version) {
  const parts = version.split('.').map(Number);
  parts[2] += 1; // patch
  return parts.join('.');
}

const newVersion = incrementPatch(pkg.version);
pkg.version = newVersion;

// Write updated package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json version updated to ${newVersion}`);

// Generate version.json
const versionInfo = {
  version: newVersion,
  buildTime: new Date().toISOString(),
};

fs.writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2) + '\n');
console.log('version.json generated:', versionInfo);
