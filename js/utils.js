import store from './store.js';

// 面包屑路由表
const breadcrumbMap = {
  china: (p) => [
    { label: '亚洲', href: '?page=continent&id=asia' },
    { label: '中国', href: null }
  ],
  world: () => [{ label: '世界', href: null }],
  categories: () => [{ label: '分类', href: null }],
  tags: () => [{ label: '标签汇聚', href: null }],
  search: (p) => [{ label: '搜索: ' + (p.q || ''), href: null }],
  category: (p) => {
    const catName = Utils.getCategoryName(p.id);
    return [{ label: '分类', href: '?page=categories' }, { label: catName, href: null }];
  },
  subcategory: (p) => {
    const catName = Utils.getCategoryName(p.category);
    const subName = Utils.getSubcategoryName(p.category, p.id);
    return [
      { label: '分类', href: '?page=categories' },
      { label: catName, href: '?page=category&id=' + p.category },
      { label: subName, href: null }
    ];
  },
  continent: (p) => {
    const c = Utils.getContinent(p.id);
    return c ? [{ label: c.name, href: null }] : [];
  },
  country: (p) => {
    const country = Utils.getCountry(p.id);
    if (!country) return [];
    const cont = Utils.getContinent(country.continent);
    const crumbs = [];
    if (cont) crumbs.push({ label: cont.name, href: '?page=continent&id=' + cont.id });
    crumbs.push({ label: country.name, href: null });
    return crumbs;
  },
  province: (p) => {
    const prov = Utils.getChinaProvince(p.id);
    return [
      { label: '亚洲', href: '?page=continent&id=asia' },
      { label: '中国', href: '?page=china' },
      { label: prov ? prov.name : p.id, href: null }
    ];
  },
  city: (p) => {
    const parentId = p.parent;
    const prov = Utils.getChinaProvince(parentId);
    const country = Utils.getCountry(parentId);
    if (prov) {
      return [
        { label: '亚洲', href: '?page=continent&id=asia' },
        { label: '中国', href: '?page=china' },
        { label: prov.name, href: '?page=province&id=' + prov.id },
        { label: Utils.getCityName(p.id), href: null }
      ];
    }
    if (country) {
      const cont = Utils.getContinent(country.continent);
      const crumbs = [];
      if (cont) crumbs.push({ label: cont.name, href: '?page=continent&id=' + cont.id });
      crumbs.push({ label: country.name, href: '?page=country&id=' + country.id });
      crumbs.push({ label: p.id, href: null });
      return crumbs;
    }
    return [];
  },
  tag: (p) => [
    { label: '标签汇聚', href: '?page=tags' },
    { label: Utils.getTagName(p.id), href: null }
  ],
  liquor: (p) => {
    const liq = Utils.getLiquorById(p.id);
    if (!liq) return [];
    const prov = Utils.getChinaProvince(liq.region);
    const country = Utils.getCountry(liq.origin);
    if (prov) {
      const crumbs = [
        { label: '亚洲', href: '?page=continent&id=asia' },
        { label: '中国', href: '?page=china' },
        { label: prov.name, href: '?page=province&id=' + prov.id }
      ];
      if (liq.district) crumbs.push({ label: liq.district, href: '?page=city&id=' + encodeURIComponent(liq.district) + '&parent=' + liq.region });
      crumbs.push({ label: liq.name, href: null });
      return crumbs;
    }
    if (country && !country.hasProvinces) {
      const cont = Utils.getContinent(country.continent);
      const crumbs = [];
      if (cont) crumbs.push({ label: cont.name, href: '?page=continent&id=' + cont.id });
      crumbs.push({ label: country.name, href: '?page=country&id=' + country.id });
      if (liq.region) crumbs.push({ label: liq.region, href: '?page=city&id=' + encodeURIComponent(liq.region) + '&parent=' + liq.origin });
      crumbs.push({ label: liq.name, href: null });
      return crumbs;
    }
    if (country && country.hasProvinces) {
      const crumbs = [
        { label: '亚洲', href: '?page=continent&id=asia' },
        { label: '中国', href: '?page=china' }
      ];
      if (liq.region) {
        const p = Utils.getChinaProvince(liq.region);
        crumbs.push({ label: p ? p.name : liq.region, href: '?page=province&id=' + liq.region });
      }
      crumbs.push({ label: liq.name, href: null });
      return crumbs;
    }
    return [];
  },
  pub: (p) => {
    if (p.continent) {
      const c = Utils.getContinent(p.continent);
      return [{ label: '酒馆', href: '?page=pub' }, { label: c ? c.name : p.continent, href: null }];
    }
    if (p.city && p.country) {
      const country = Utils.getCountry(p.country);
      const cont = country ? Utils.getContinent(country.continent) : null;
      const crumbs = [{ label: '酒馆', href: '?page=pub' }];
      if (cont) crumbs.push({ label: cont.name, href: '?page=pub&continent=' + cont.id });
      if (country) crumbs.push({ label: country.name, href: '?page=pub&country=' + country.id });
      crumbs.push({ label: p.city, href: null });
      return crumbs;
    }
    if (p.country) {
      const country = Utils.getCountry(p.country);
      const cont = country ? Utils.getContinent(country.continent) : null;
      const crumbs = [{ label: '酒馆', href: '?page=pub' }];
      if (cont) crumbs.push({ label: cont.name, href: '?page=pub&continent=' + cont.id });
      if (country) crumbs.push({ label: country.name, href: null });
      return crumbs;
    }
    if (p.id) {
      const pub = Utils.getPubById(p.id);
      if (pub) {
        const country = Utils.getCountry(pub.country);
        const cont = country ? Utils.getContinent(country.continent) : null;
        const crumbs = [{ label: '酒馆', href: '?page=pub' }];
        if (cont) crumbs.push({ label: cont.name, href: '?page=pub&continent=' + cont.id });
        if (country) crumbs.push({ label: country.name, href: '?page=pub&country=' + country.id });
        if (pub.city) crumbs.push({ label: pub.city, href: '?page=pub&country=' + pub.country + '&city=' + encodeURIComponent(pub.city) });
        crumbs.push({ label: pub.name, href: null });
        return crumbs;
      }
    }
    return [{ label: '酒馆', href: null }];
  },
  home: () => []
};

const Utils = {
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  getCategoryMeta(id) {
    return store.categoryMeta.find(c => c.id === id) || null;
  },

  getCategoryName(id) {
    const meta = this.getCategoryMeta(id);
    return meta ? meta.name : id;
  },

  getSubcategoryMeta(categoryId, subcategoryId) {
    const catMeta = this.getCategoryMeta(categoryId);
    if (!catMeta || !catMeta.subcategories) return null;
    return catMeta.subcategories.find(s => s.id === subcategoryId) || null;
  },

  getSubcategoryName(categoryId, subcategoryId) {
    const meta = this.getSubcategoryMeta(categoryId, subcategoryId);
    return meta ? meta.name : (store.tagDefinitions[subcategoryId] || subcategoryId);
  },

  getLiquorsBySubcategory(categoryId, subcategoryId) {
    return store.liquors.filter(l => l.category === categoryId && l.subcategory === subcategoryId);
  },

  getContinent(id) {
    return store.continentData.find(c => c.id === id);
  },

  getCountry(id) {
    return store.countryData.find(c => c.id === id);
  },

  getChinaProvince(id) {
    return store.chinaProvinceData.find(p => p.id === id);
  },

  getTagName(id) {
    return store.tagDefinitions[id] || id;
  },

  getLiquorById(id) {
    return store.liquors.find(l => l.id === id);
  },

  getLiquorsByCategory(catId) {
    return store.liquors.filter(l => l.category === catId);
  },

  getLiquorsByContinent(continentId) {
    const cont = this.getContinent(continentId);
    if (!cont) return [];
    return store.liquors.filter(l => {
      if (l.origin === 'china' && cont.id === 'asia') return true;
      return store.countryData.some(c => c.continent === continentId && c.id === l.origin);
    });
  },

  isChinaLiquor(l) {
    return l.origin === 'china' || store.chinaProvinceData.some(p => p.id === l.origin || p.id === l.region);
  },

  getLiquorsByTag(tag) {
    return store.liquors.filter(l => l.tags && l.tags.includes(tag));
  },

  getLiquorsByCountry(countryId) {
    const country = this.getCountry(countryId);
    if (!country) return [];
    return store.liquors.filter(l => {
      if (l.origin === countryId) return true;
      if (country.regions && country.regions.includes(l.region)) return true;
      return false;
    });
  },

  getAllTags() {
    const tagMap = {};
    store.liquors.forEach(l => {
      if (l.tags) {
        l.tags.forEach(t => {
          if (!tagMap[t]) tagMap[t] = 0;
          tagMap[t]++;
        });
      }
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  },

  getPubById(id) {
    return store.pubs.find(p => p.id === id);
  },

  getPubsByContinent(continentId) {
    const cont = this.getContinent(continentId);
    if (!cont) return [];
    return store.pubs.filter(p => {
      const country = this.getCountry(p.country);
      if (!country) return false;
      return country.continent === continentId;
    });
  },

  getPubsByContinentCountries(continentId) {
    const cont = this.getContinent(continentId);
    if (!cont) return [];
    const countries = {};
    this.getPubsByContinent(continentId).forEach(pub => {
      const countryId = pub.country;
      if (!countries[countryId]) countries[countryId] = [];
      countries[countryId].push(pub);
    });
    return countries;
  },

  getPubsByCountry(countryId) {
    return store.pubs.filter(p => p.country === countryId);
  },

  getPubsByCity(countryId, cityName) {
    return store.pubs.filter(p => p.country === countryId && p.city === cityName);
  },

  escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  },

  highlightInDOM(container, query) {
    if (!container || !query) return;
    const q = query.trim();
    if (!q) return;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      if (node.parentNode.tagName === 'MARK' || node.parentNode.tagName === 'SCRIPT') return;
      const text = node.textContent;
      if (!regex.test(text)) return;
      regex.lastIndex = 0;
      const span = document.createElement('span');
      span.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
      node.parentNode.replaceChild(span, node);
    });
  },

  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  getCityName(id) {
    return store.cityNameMap[id] ? store.cityNameMap[id] : id;
  },

  getBreadcrumbs(params) {
    const page = params.page;
    if (!page || page === 'home') return [];
    const crumbs = breadcrumbMap[page] ? breadcrumbMap[page](params) : [];
    if (crumbs.length > 0) crumbs.unshift({ label: '首页', href: '?page=home' });
    return crumbs;
  },

  // === 卡片渲染组件 ===

  liquorCard(liq) {
    const catMeta = this.getCategoryMeta(liq.category);
    const catClass = 'cat-' + liq.category;
    const subMeta = this.getSubcategoryMeta(liq.category, liq.subcategory);
    const subName = subMeta ? subMeta.name : (liq.subcategory ? this.getSubcategoryName(liq.category, liq.subcategory) : '');
    const country = this.getCountry(liq.origin);
    const prov = this.getChinaProvince(liq.region);
    const originName = country ? country.name : (prov ? prov.name : liq.origin);
    const regionName = prov ? prov.name : (liq.region || '');

    return `
      <a href="?page=liquor&id=${liq.id}" class="card card--liquor">
        <div class="card__accent"></div>
        <div class="card__body">
          <div class="card__head">
            <span class="card__category ${catClass}">${catMeta ? catMeta.icon + ' ' + catMeta.name : liq.category}</span>
            ${subName ? `<span class="card__subcategory" data-route="?page=subcategory&category=${liq.category}&id=${liq.subcategory}">${subMeta ? subMeta.icon + ' ' : ''}${subName}</span>` : ''}
            <span class="card__alcohol">${liq.alcohol || ''}</span>
          </div>
          <h3 class="card__title">${liq.name}</h3>
          <p class="card__ename">${liq.nameEn || ''}</p>
          <p class="card__location">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${originName} · ${regionName}
          </p>
          <p class="card__desc">${liq.description}</p>
          <div class="card__tags">
            ${(liq.tags || []).slice(0, 3).map(t => `<span class="tag tag--mini" data-route="?page=tag&id=${encodeURIComponent(t)}">${this.getTagName(t)}</span>`).join('')}
            ${(liq.tags || []).length > 3 ? `<span class="tag tag--mini tag--more">+${liq.tags.length - 3}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  },

  pubCard(pub) {
    const country = this.getCountry(pub.country);
    const locationLabel = country ? country.name : pub.country;
    const flag = country ? country.flag : '🏛️';

    return `
      <a href="?page=pub&id=${pub.id}" class="card card--pub">
        <div class="card__accent"></div>
        <div class="card__body">
          <div class="card__head">
            <span class="card__founded">🏛️ ${pub.founded}</span>
            <span class="card__city">${pub.city}</span>
          </div>
          <h3 class="card__title">${pub.name}</h3>
          <p class="card__ename">${pub.nameEn || ''}</p>
          <p class="card__location">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${flag} ${locationLabel}
          </p>
          <p class="card__desc">${pub.description}</p>
          <div class="card__tags">
            ${(pub.specialties || []).slice(0, 3).map(s => `<span class="tag tag--mini">${s}</span>`).join('')}
            ${(pub.specialties || []).length > 3 ? `<span class="tag tag--mini tag--more">+${pub.specialties.length - 3}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  },

  geoCard(item, count, linkPage, linkParam, label) {
    return `
      <a href="?page=${linkPage}&id=${encodeURIComponent(item.id)}${linkParam ? '&' + linkParam : ''}" class="card card--geo">
        <span class="card__icon">${item.icon || '📍'}</span>
        <h3 class="card__name">${item.name}</h3>
        <p class="card__en">${item.nameEn || ''}</p>
        <span class="card__count">${count} ${label || '款酒'}</span>
      </a>
    `;
  },

  categoryCard(catMeta, count, subCount) {
    return `
      <a href="?page=category&id=${catMeta.id}" class="card card--category">
        <span class="card__icon">${catMeta.icon}</span>
        <h3 class="card__name">${catMeta.name}</h3>
        <p class="card__desc">${catMeta.desc}</p>
        <span class="card__count">${count} 款酒${subCount ? ' · ' + subCount + ' 个细分品类' : ''}</span>
      </a>
    `;
  },

  subcategoryCard(subMeta, catId, count) {
    return `
      <a href="?page=subcategory&category=${catId}&id=${subMeta.id}" class="card card--subcategory">
        <span class="card__icon">${subMeta.icon || '🏷️'}</span>
        <h3 class="card__name">${subMeta.name}</h3>
        <p class="card__en">${subMeta.nameEn || ''}</p>
        <p class="card__desc">${subMeta.desc || ''}</p>
        <span class="card__count">${count} 款酒</span>
      </a>
    `;
  },

  renderMasonryGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = items.map(l => this.liquorCard(l)).join('');
  },

  renderPubGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = items.map(p => this.pubCard(p)).join('');
  }
};

export default Utils;