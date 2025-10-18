Stepwise plan with tests

- Step 0: Baseline
  - Record current network behavior for Home, Topics, Speaker, Institution.
  - Record current network behavior for Home, Topics, Speaker, Institution.

Step 1: Homepage recents
  - Add view_recents.json generator; switch home to prefer it with a fallback to lectures.json.
  - Test: Confirm home no longer pulls lectures.json; UI unchanged.

Step 2: Topics counts
  - Add meta_topic_counts.json generator; switch Topics to prefer it with fallback to current lectures.json counting.
  - Test: Confirm no lectures.json on Topics; totals and paths match; tabs/filtering unchanged.

Step 3: Reverse indexes + Speaker
  - Add index_speaker_lectures.json; speaker page uses it to fetch only needed shards. Fallback to loadAllLectures() if index absent.
  - Test: Compare lecture count/listing with legacy path.

Step 4: Institution + Topic detail
  - Apply same pattern with index_institution_lectures.json and index_topic_lectures.json.
  - Test: Verify counts/listings match legacy.

Step 5: CI integration
  - Run generators in Actions before jekyll build. Keep fallbacks for safety.

Step 6: Remove fallbacks later (optional)
  - Only after you’re satisfied for each page.

If that works for you, I’ll start with Step 1 (recents) and include:

- A generator script under scripts/.
- A minimal index.html patch that prefers view_recents.json and falls back cleanly.
- Notes on how to run and verify locally.

