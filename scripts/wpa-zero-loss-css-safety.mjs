#!/usr/bin/env node
import fs from 'node:fs';

const unifiedPath = 'styles/wpa-unified-zero-loss-v1.css';
const loaderPath = 'styles/wpa-pilot20-badge.css';
const institutePath = 'institute.html';

const unified = fs.readFileSync(unifiedPath, 'utf8');
const loader = fs.readFileSync(loaderPath, 'utf8');
const institute = fs.readFileSync(institutePath, 'utf8');
const