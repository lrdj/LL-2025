
// Data loader helper for chunked JSON files
const DataLoader = {
  baseUrl: '/assets/data',
  
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
