const DATA_VERSION = '1.0.0';
const CACHE_PREFIX = 'hjiu_cache_';

class Api {
  #memoryCache = new Map();
  #pending = new Map();

  static #instance;
  static getInstance() {
    if (!Api.#instance) {
      Api.#instance = new Api();
    }
    return Api.#instance;
  }

  /** 加载数据模块 */
  async loadModule(path) {
    return this.loadJson(path);
  }

  /** 加载 JSON 数据文件（通过 fetch）—— 全站唯一请求入口 */
  async loadJson(path) {
    const key = 'json:' + path;
    const cached = this.#memGet(key);
    if (cached !== undefined) return cached;

    if (this.#pending.has(key)) return this.#pending.get(key);

    const promise = fetch(path)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${path}`); return r.json(); })
      .then(data => {
        this.#memSet(key, data);
        this.#persist(key, data);
        return data;
      })
      .finally(() => this.#pending.delete(key));

    this.#pending.set(key, promise);
    return promise;
  }

  #memGet(key) {
    if (this.#memoryCache.has(key)) return this.#memoryCache.get(key);
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (raw) {
        const { v, d } = JSON.parse(raw);
        if (v === DATA_VERSION) { this.#memoryCache.set(key, d); return d; }
      }
    } catch { /* ignore */ }
    return undefined;
  }

  #memSet(key, data) {
    this.#memoryCache.set(key, data);
  }

  #persist(key, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: DATA_VERSION, d: data }));
    } catch { /* quota exceeded */ }
  }

  clearCache() {
    this.#memoryCache.clear();
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  }
}

export default Api.getInstance();