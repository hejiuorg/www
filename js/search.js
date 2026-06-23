import Utils from './utils.js';
import store from './store.js';
import Router from './router-core.js';

/** 通用评分逻辑：给字符串字段打分 */
const scoreField = (value, q) => {
  if (!value) return 0;
  if (value === q) return 100;
  if (value.startsWith(q)) return 80;
  if (value.includes(q)) return 60;
  return 0;
};

/** 模糊搜索酒品（按匹配度排序） */
export function searchLiquorsFuzzy(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored = [];
  for (const l of store.liquors) {
    const name = l.name.toLowerCase();
    const nameEn = (l.nameEn || '').toLowerCase();
    const desc = l.description.toLowerCase();
    const features = l.features
      ? (Array.isArray(l.features) ? l.features.join(' ').toLowerCase() : l.features.toLowerCase())
      : '';
    const region = (l.region || '').toLowerCase();
    const district = (l.district || '').toLowerCase();
    const catName = (Utils.getCategoryName(l.category) || '').toLowerCase();
    const countryName = (Utils.getCountry(l.origin) ? Utils.getCountry(l.origin).name || '' : '').toLowerCase();
    const tags = (l.tags || []).map(t => t.toLowerCase() + ' ' + (Utils.getTagName(t) || '').toLowerCase()).join(' ');

    const score = scoreField(name, q) * 1
      + scoreField(nameEn, q) * 0.7
      + (region.includes(q) ? 20 : 0)
      + (district.includes(q) ? 15 : 0)
      + (catName.includes(q) ? 15 : 0)
      + (countryName.includes(q) ? 10 : 0)
      + (desc.includes(q) ? 5 : 0)
      + (features.includes(q) ? 5 : 0)
      + (tags.includes(q) ? 3 : 0);

    if (score > 0) scored.push({ item: l, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}

/** 模糊搜索酒馆（按匹配度排序） */
export function searchPubs(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored = [];
  for (const p of store.pubs) {
    const name = p.name.toLowerCase();
    const nameEn = (p.nameEn || '').toLowerCase();
    const desc = p.description.toLowerCase();
    const history = (p.history || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const specialties = (p.specialties || []).map(s => s.toLowerCase()).join(' ');

    const score = scoreField(name, q) * 1
      + scoreField(nameEn, q) * 0.7
      + (city.includes(q) ? 20 : 0)
      + (desc.includes(q) ? 5 : 0)
      + (history.includes(q) ? 5 : 0)
      + (specialties.includes(q) ? 3 : 0);

    if (score > 0) scored.push({ item: p, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}

const Search = {
  _initialized: false,
  init() {
    if (this._initialized) return;
    this._initialized = true;
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');
    if (!input) return;

    // 创建自动补全下拉框
    const dropdown = document.createElement('div');
    dropdown.className = 'search-autocomplete';
    dropdown.style.display = 'none';
    input.parentNode.appendChild(dropdown);

    // 执行搜索导航
    function doSearch() {
      const q = input.value.trim();
      if (!q) return;
      dropdown.style.display = 'none';
      try {
        Router.navigate('search', null, { q });
      } catch (e) {
        // 降级方案：直接跳转
        window.location.href = '?page=search&q=' + encodeURIComponent(q);
      }
    }

    // 自动补全建议（防抖 200ms）
    const suggest = Utils.debounce(() => {
      const q = input.value.trim();
      if (!q) { dropdown.style.display = 'none'; return; }

      let liquors = [], pubs = [];
      try { liquors = searchLiquorsFuzzy(q).slice(0, 5); } catch (e) {}
      try { pubs = searchPubs(q).slice(0, 3); } catch (e) {}

      if (!liquors.length && !pubs.length) { dropdown.style.display = 'none'; return; }

      let html = '';
      if (liquors.length) {
        html += '<div class="search-autocomplete__group">酒品</div>';
        liquors.forEach(l => {
          html += `<div class="search-autocomplete__item" data-type="liquor" data-id="${Utils.escapeHTML(l.id)}">
            <span class="search-autocomplete__icon">🍶</span>
            <span class="search-autocomplete__name">${Utils.escapeHTML(l.name)}</span>
            <span class="search-autocomplete__cat">${Utils.escapeHTML(Utils.getCategoryName(l.category) || '')}</span>
          </div>`;
        });
      }
      if (pubs.length) {
        html += '<div class="search-autocomplete__group">酒馆</div>';
        pubs.forEach(p => {
          html += `<div class="search-autocomplete__item" data-type="pub" data-id="${Utils.escapeHTML(p.id)}">
            <span class="search-autocomplete__icon">🏮</span>
            <span class="search-autocomplete__name">${Utils.escapeHTML(p.name)}</span>
            <span class="search-autocomplete__cat">${Utils.escapeHTML(p.city)}</span>
          </div>`;
        });
      }
      html += `<div class="search-autocomplete__item search-autocomplete__more" data-type="search" data-q="${Utils.escapeHTML(q)}">
        <span class="search-autocomplete__icon">🔍</span>
        <span class="search-autocomplete__name">查看全部「${Utils.escapeHTML(q)}」的搜索结果</span>
      </div>`;
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    }, 200);

    // 输入事件
    input.addEventListener('input', suggest);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
      if (e.key === 'Escape') { dropdown.style.display = 'none'; }
    });
    input.addEventListener('blur', () => {
      setTimeout(() => { dropdown.style.display = 'none'; }, 150);
    });

    // 下拉框点击
    dropdown.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const item = e.target.closest('.search-autocomplete__item');
      if (!item) return;
      dropdown.style.display = 'none';
      const { type } = item.dataset;
      if (type === 'liquor') Router.navigate('liquor', item.dataset.id);
      else if (type === 'pub') Router.navigate('pub', item.dataset.id);
      else if (type === 'search') {
        input.value = item.dataset.q;
        Router.navigate('search', null, { q: item.dataset.q });
      }
    });

    // 搜索按钮
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        doSearch();
      });
    }
  }
};

export default Search;

// === 搜索结果页渲染 ===

export function render(main, params) {
  try {
    const query = params.q || '';
    const liqResults = searchLiquorsFuzzy(query);
    const pubResults = searchPubs(query);

    main.innerHTML = `
      <div class="page-header">
        <h1 class="page-header__title">🔍 搜索结果: "${query}"</h1>
        <p class="page-header__count">找到 ${liqResults.length} 款酒 · ${pubResults.length} 家酒馆</p>
      </div>
      ${liqResults.length > 0 ? `
      <section>
        <h2 class="section__title">🏺 酒品结果</h2>
        <div class="grid grid--masonry" id="search-liq-masonry"></div>
      </section>` : ''}
      ${pubResults.length > 0 ? `
      <section>
        <h2 class="section__title">🏛️ 酒馆结果</h2>
        <div class="grid grid--masonry" id="search-pub-masonry"></div>
      </section>` : ''}
      ${liqResults.length === 0 && pubResults.length === 0 ? '<div class="empty"><span class="empty__icon">🔍</span><h2>未找到结果</h2><p>请尝试其他关键词</p></div>' : ''}
    `;

    try {
      if (liqResults.length > 0) {
        Utils.renderMasonryGrid('search-liq-masonry', liqResults);
        Utils.highlightInDOM(document.getElementById('search-liq-masonry'), query);
      }
    } catch (e) {
      console.error('renderMasonryGrid error:', e);
      main.innerHTML += '<div class="empty"><p>酒品渲染失败: ' + e.message + '</p></div>';
    }

    try {
      if (pubResults.length > 0) {
        Utils.renderPubGrid('search-pub-masonry', pubResults);
        Utils.highlightInDOM(document.getElementById('search-pub-masonry'), query);
      }
    } catch (e) {
      console.error('renderPubGrid error:', e);
      main.innerHTML += '<div class="empty"><p>酒馆渲染失败: ' + e.message + '</p></div>';
    }
  } catch (err) {
    console.error('Search render error:', err);
    main.innerHTML = '<div class="empty"><span class="empty__icon">🔍</span><h2>搜索出错</h2><p>' + err.message + '</p></div>';
  }
}