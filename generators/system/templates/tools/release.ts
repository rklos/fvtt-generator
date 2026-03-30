/**
 * Release script — builds the system and packages it for Foundry VTT distribution.
 *
 * Produces:
 *   release/neuro-and-shima-{version}.zip  — installable system zip
 *   release/system.json                    — manifest with download link
 *
 * Usage:
 *   npx tsx tools/release.ts
 */

import {
  readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, rmSync,
} from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

// ── Configuration ──────────────────────────────────────────────────
// UPDATE THESE to your actual full URLs before publishing
const DOWNLOAD_URL = 'https://storage.klos.dev/public.php/dav/files/frmbBooJ6YHkb4H/';
const MANIFEST_URL = 'https://storage.klos.dev/public.php/dav/files/ZRcA6kxiPHsqmiR/';
// ────────────────────────────────────────────────────────────────────

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const RELEASE_DIR = join(ROOT_DIR, 'release');
const SYSTEM_ID = 'neuro-and-shima';

function release() {
  // 1. Read version from package.json
  const packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));
  const { version } = packageJson;
  console.log(`\nPreparing release v${version}...\n`);

  // 2. Run build
  console.log('Building...');
  execFileSync('npm', [ 'run', 'build' ], { cwd: ROOT_DIR, stdio: 'inherit' });

  // 3. Verify dist exists
  if (!existsSync(DIST_DIR)) {
    throw new Error('dist/ directory not found after build');
  }

  // 4. Create release directory
  if (!existsSync(RELEASE_DIR)) {
    mkdirSync(RELEASE_DIR, { recursive: true });
  }

  // 5. Read source system.json and add manifest/download fields
  const systemJsonSrc = JSON.parse(readFileSync(join(ROOT_DIR, 'src', 'static', 'system.json'), 'utf8'));
  systemJsonSrc.version = version;
  systemJsonSrc.manifest = MANIFEST_URL;
  systemJsonSrc.download = DOWNLOAD_URL;

  // 6. Write system.json into dist (for the zip) and release (for the manifest)
  writeFileSync(join(DIST_DIR, 'system.json'), JSON.stringify(systemJsonSrc, null, 2));
  writeFileSync(join(RELEASE_DIR, 'system.json'), JSON.stringify(systemJsonSrc, null, 2));
  console.log('Generated system.json with manifest + download URLs');

  // 7. Create zip from dist/ contents, rooted as neuro-and-shima/
  const zipName = `${SYSTEM_ID}-v${version}.zip`;
  const zipPath = join(RELEASE_DIR, zipName);

  // Copy dist to a temp directory named after the system ID (Foundry expects the zip root to match)
  const tempDir = join(RELEASE_DIR, SYSTEM_ID);
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true });
  }
  cpSync(DIST_DIR, tempDir, { recursive: true });

  // Create zip
  execFileSync('zip', [ '-r', zipPath, SYSTEM_ID ], { cwd: RELEASE_DIR, stdio: 'inherit' });

  // Clean up temp directory
  rmSync(tempDir, { recursive: true });

  console.log('\nRelease ready:');
  console.log(`  ZIP:      release/${zipName}`);
  console.log('  Manifest: release/system.json');
  console.log(`  Version:  ${version}`);
  console.log(`  Download: ${DOWNLOAD_URL}`);
  console.log(`  Manifest: ${MANIFEST_URL}\n`);
}

try {
  release();
} catch (error) {
  console.error('Release failed:', error);
  process.exit(1);
}
