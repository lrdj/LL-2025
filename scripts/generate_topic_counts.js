#!/usr/bin/env node
/**
 * Generate meta_topic_counts.json mapping topic_id -> lecture count.
 * - Reads assets/data/lectures.json
 * - Tallies occurrences of lecture.topics[].id
 * - Writes assets/data/meta_topic_counts.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'assets', 'data');
const LECTURES = path.join(DATA_DIR, 'lectures.json');
const OUTPUT = path.join(DATA_DIR, 'meta_topic_counts.json');

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

function main() {
  if (!fs.existsSync(LECTURES)) {
    console.error(`[error] Source not found: ${path.relative(process.cwd(), LECTURES)}`);
    process.exit(1);
  }
  const lectures = readJson(LECTURES);
  if (!Array.isArray(lectures)) {
    console.error('[error] lectures.json is not an array');
    process.exit(1);
  }

  const counts = Object.create(null);
  for (const lec of lectures) {
    if (!lec || !Array.isArray(lec.topics)) continue;
    for (const t of lec.topics) {
      const id = (t && (t.id ?? t.topic_id));
      if (id == null) continue;
      const key = String(id);
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(counts));
  const unique = Object.keys(counts).length;
  console.log(`[ok] meta_topic_counts.json: ${unique} topics tallied -> ${path.relative(process.cwd(), OUTPUT)}`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(e.stack || e.message);
    process.exit(1);
  }
}

