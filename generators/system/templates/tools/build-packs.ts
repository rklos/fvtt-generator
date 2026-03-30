import { compilePack } from '@foundryvtt/foundryvtt-cli';
import fs from 'fs-extra';
import path from 'path';

const PACKS_SRC = path.resolve('src/packs');
const PACKS_DIST = path.resolve('dist/packs');

async function compilePackDir(packName: string): Promise<void> {
  const srcDir = path.join(PACKS_SRC, packName);
  const stat = await fs.stat(srcDir);

  if (!stat.isDirectory()) {
    return;
  }

  const files = await fs.readdir(srcDir);
  const jsonFiles = files.filter((f: string) => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.log(`Skipping empty pack: ${packName}`);
    return;
  }

  const distDir = path.join(PACKS_DIST, packName);
  await fs.ensureDir(distDir);

  console.log(`Compiling pack: ${packName} (${jsonFiles.length} entries)`);
  await compilePack(srcDir, distDir, { yaml: false });
}

async function buildPacks(): Promise<void> {
  const packDirs = await fs.readdir(PACKS_SRC);
  await Promise.all(packDirs.map(compilePackDir));
}

buildPacks().catch(console.error);
