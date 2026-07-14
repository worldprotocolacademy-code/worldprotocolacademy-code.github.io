import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const EXPECTED_SHA256 = '933930b61a6b4b47485258483aa6b07ed5fb56dbbd007b7988d7f676959a5f6d';
const source = new URL('./wpa