
// Data loader helper for chunked JSON files
const DataLoader = {
  baseUrl: '/assets/data',
  
  // Load multiple lectures by slug, fetching only necessary chunks
  async loadLecturesBySlugs(slugs) {
    if (!Array.isArray(slugs) || slugs.length === 0) return [];
    const index = await this.loadIndex('lectures');
    // Map slugs -> chunk ids, collect unique chunks
    const chunkMap = new Map();
    for (const slug of slugs) {
      const chunkId = index[slug];
      if (chunkId === undefined) continue;
      if (!chunkMap.has(chunkId)) chunkMap.set(chunkId, []);
      chunkMap.get(chunkId).push(slug);
    }
    const results = [];
    for (const [chunkId, wants] of chunkMap.entries()) {
      const chunk = await this.loadChunk('lectures', chunkId);
      // Filter only desired slugs in this chunk
      const set = new Set(wants);
      for (const item of chunk) {
        if (set.has(item.slug)) results.push(item);
      }
    }
    // Keep original order of requested slugs
    const bySlug = new Map(results.map(r => [r.slug, r]));
    return slugs.map(s => bySlug.get(s)).filter(Boolean);
  },
  
  // Load lecture by slug
  async loadLecture(slug) {
    const index = await this.loadIndex('lectures');
    const chunkId = index[slug];
    if (chunkId === undefined) {
      throw new Error(`Lecture not found: ${slug}`);
    }
    const chunk = await this.loadChunk('lectures', chunkId);
    return chunk.find(item => item.slug === slug);
  },
  
  // Load speaker by slug
  async loadSpeaker(slug) {
    const index = await this.loadIndex('speakers');
    const chunkId = index[slug];
    if (chunkId === undefined) {
      throw new Error(`Speaker not found: ${slug}`);
    }
    const chunk = await this.loadChunk('speakers', chunkId);
    return chunk.find(item => item.slug === slug);
  },
  
  // Load institution by slug
  async loadInstitution(slug) {
    const index = await this.loadIndex('institutions');
    const chunkId = index[slug];
    if (chunkId === undefined) {
      throw new Error(`Institution not found: ${slug}`);
    }
    const chunk = await this.loadChunk('institutions', chunkId);
    return chunk.find(item => item.slug === slug);
  },

  // Load institution by numeric id (uses monolith)
  async loadInstitutionById(id) {
    const response = await fetch(`${this.baseUrl}/institutions.json`);
    const all = await response.json();
    for (const inst of all) {
      if (inst && inst.id === id) return inst;
    }
    throw new Error(`Institution not found by id: ${id}`);
  },
  
  // Load all lectures (for browse/search - still large!)
  async loadAllLectures() {
    const response = await fetch(`${this.baseUrl}/lectures.json`);
    return await response.json();
  },
  
  // Cache for loaded data
  _cache: {},
  
  // Load index file
  async loadIndex(type) {
    const cacheKey = `${type}_index`;
    if (this._cache[cacheKey]) {
      return this._cache[cacheKey];
    }
    const response = await fetch(`${this.baseUrl}/${type}_index.json`);
    const data = await response.json();
    this._cache[cacheKey] = data;
    return data;
  },
  
  // Load chunk file
  async loadChunk(type, chunkId) {
    const cacheKey = `${type}_${chunkId}`;
    if (this._cache[cacheKey]) {
      return this._cache[cacheKey];
    }
    const response = await fetch(`${this.baseUrl}/${type}_${chunkId}.json`);
    const data = await response.json();
    this._cache[cacheKey] = data;
    return data;
  }
};
