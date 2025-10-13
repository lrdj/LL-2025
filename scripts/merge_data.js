#!/usr/bin/env node
/**
 * Merge chunked JSON files into monolithic assets/data/*.json
 *
 * - Scans assets/data for files like lectures_#.json, speakers_#.json, institutions_#.json
 * - Concatenates their arrays and writes to the corresponding monolith file
 * - Leaves ordering as chunk index order; pages can sort client-side as needed
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'assets', 'data');

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${file}: ${e.message}`);
  }
}

function writeJson(file, data) {
  // Minified to keep repo size reasonable
  fs.writeFileSync(file, JSON.stringify(data));
}

function mergePrefix(prefix) {
  const re = new RegExp(`^${prefix}_(\\d+)\\.json$`);
  const files = fs
    .readdirSync(DATA_DIR)
    .map((f) => ({ f, m: f.match(re) }))
    .filter(({ m }) => !!m)
    .map(({ f, m }) => ({ file: f, chunk: parseInt(m[1], 10) }))
    .sort((a, b) => a.chunk - b.chunk);

  if (files.length === 0) {
    console.log(`[warn] No chunks found for ${prefix}`);
    return { count: 0 };
  }

  const all = [];
  for (const { file, chunk } of files) {
    const fp = path.join(DATA_DIR, file);
    const arr = readJson(fp);
    if (!Array.isArray(arr)) {
      throw new Error(`Chunk is not an array: ${fp}`);
    }
    all.push(...arr);
  }

  const outFile = path.join(DATA_DIR, `${prefix}.json`);
  writeJson(outFile, all);
  console.log(`[ok] ${prefix}: merged ${files.length} chunks -> ${all.length} records -> ${path.relative(process.cwd(), outFile)}`);
  return { count: all.length, chunks: files.length, outFile };
}

function main() {
  const prefixes = ['lectures', 'speakers', 'institutions'];
  for (const p of prefixes) {
    mergePrefix(p);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(e.stack || e.message);
    process.exit(1);
  }
}

