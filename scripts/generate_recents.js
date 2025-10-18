#!/usr/bin/env node
/**
 * Generate a small view_recents.json for the homepage.
 * - Reads assets/data/lectures.json (source of truth)
 * - Picks the latest N by event date (fallback to added)
 * - Writes assets/data/view_recents.json with a compact shape
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'assets', 'data');
const SOURCE = path.join(DATA_DIR, 'lectures.json');
const OUTPUT = path.join(DATA_DIR, 'view_recents.json');
const LIMIT = parseInt(process.env.RECENTS_LIMIT || '60', 10);

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

function toDateSafe(lecture) {
  const d = lecture.date || lecture.added;
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

function toRecentShape(l) {
  return {
    slug: l.slug,
    title: l.title,
    date: l.date || null,
    added: l.added || null,
    image_id: l.image_id || null,
    supercategory: l.supercategory || null,
    // Keep only speaker names; homepage only needs names and count
    speakers: Array.isArray(l.speakers)
      ? l.speakers.map((s) => ({ name: s.name }))
      : [],
    // Short synopsis is used for the card excerpt
    synopsis: l.synopsis || null,
  };
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`[error] Source not found: ${path.relative(process.cwd(), SOURCE)}`);
    process.exit(1);
  }
  const all = readJson(SOURCE);
  if (!Array.isArray(all)) {
    console.error('[error] lectures.json is not an array');
    process.exit(1);
  }

  const sorted = all.slice().sort((a, b) => toDateSafe(b) - toDateSafe(a));
  const recents = sorted.slice(0, LIMIT).map(toRecentShape);

  fs.writeFileSync(OUTPUT, JSON.stringify(recents));
  console.log(`[ok] view_recents.json: wrote ${recents.length} records -> ${path.relative(process.cwd(), OUTPUT)}`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(e.stack || e.message);
    process.exit(1);
  }
}
