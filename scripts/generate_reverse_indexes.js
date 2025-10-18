#!/usr/bin/env node
/**
 * Generate reverse index files mapping entities to lecture slugs.
 * - index_topic_lectures.json: topic_id -> [lecture_slugs]
 * - index_speaker_lectures.json: speaker_id -> [lecture_slugs]
 * - index_institution_lectures.json: institution_id -> [lecture_slugs] (venue and organizer)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'assets', 'data');
const LECTURES = path.join(DATA_DIR, 'lectures.json');

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data));
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

  const topicMap = Object.create(null);        // topic_id -> [slug]
  const speakerMap = Object.create(null);      // speaker_id -> [slug]
  const institutionMap = Object.create(null);  // institution_id -> [slug]

  for (const lec of lectures) {
    const slug = lec?.slug;
    if (!slug) continue;

    // Topics
    if (Array.isArray(lec.topics)) {
      for (const t of lec.topics) {
        const id = t && (t.id ?? t.topic_id);
        if (id == null) continue;
        const key = String(id);
        (topicMap[key] ||= []).push(slug);
      }
    }

    // Speakers
    if (Array.isArray(lec.speakers)) {
      for (const s of lec.speakers) {
        const id = s && (s.id ?? s.speaker_id);
        if (id == null) continue;
        const key = String(id);
        (speakerMap[key] ||= []).push(slug);
      }
    }

    // Institutions: venue + organizer
    for (const inst of [lec.venue, lec.organizer]) {
      if (!inst) continue;
      const id = inst && (inst.id ?? inst.institution_id);
      if (id == null) continue;
      const key = String(id);
      (institutionMap[key] ||= []).push(slug);
    }
  }

  // Write files
  writeJson(path.join(DATA_DIR, 'index_topic_lectures.json'), topicMap);
  writeJson(path.join(DATA_DIR, 'index_speaker_lectures.json'), speakerMap);
  writeJson(path.join(DATA_DIR, 'index_institution_lectures.json'), institutionMap);

  console.log('[ok] index_topic_lectures.json:', Object.keys(topicMap).length, 'topics');
  console.log('[ok] index_speaker_lectures.json:', Object.keys(speakerMap).length, 'speakers');
  console.log('[ok] index_institution_lectures.json:', Object.keys(institutionMap).length, 'institutions');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(e.stack || e.message); process.exit(1); }
}

