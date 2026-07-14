import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const EXPECTED_SHA256 = '933930b61a6b4b47485258483aa6b07ed5fb56dbbd007b7988d7f676959a5f6d';
const source = new URL('./wpa-sublimate-engine-v0.3.0.tar.gz.b64', import.meta.url);
const outDir = new URL('./extracted/', import.meta.url);
const archive = new URL('./extracted/wpa-sublimate-engine-v0.3.0.tar.gz', import.meta.url);
await mkdir(outDir, { recursive: true });
const encoded = (await readFile(source, 'utf8')).replace(/\s+/g, '');
const bytes = Buffer.from(encoded, 'base64');
const actual = createHash('sha256').update(bytes).digest('hex');
if (actual !== EXPECTED_SHA256) throw new Error(`Checksum mismatch: ${actual}`);
await writeFile(archive, bytes);
const result = spawnSync('tar', ['-xzf', path.fileURLToPath(archive), '-C', path.fileURLToPath(outDir)], { stdio: 'inherit' });
if (result.status !== 0) throw new Error('tar extraction failed');
console.log(`Extracted and verified ${bytes.length} bytes.`);
