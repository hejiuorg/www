import Utils from './utils.js';
import store from './store.js';

export function render(main, params) {
  if (params.continent) {
    renderPubContinent(main, params.continent);
  } else if (params.country && params.city) {
    renderPubCity(main, params.city, params.country);
  } else if (params.country) {
    renderPubCountry(main, params.country);
  } else if (params.id) {
    renderPubDetail(main, params.id);
  } else {
    renderPubHome(main);
  }
}

function renderPubHome(main) {
  const continents = store.continentData.map(cont => {
    const pubs = Utils.getPubsByContinent(cont.id);
    return { ...cont, count: pubs.length };
  }).filter(c => c.count > 0);

  const featuredPubs = Utils.shuffle(store.pubs).slice(0, 4);

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">🏛️ 酒馆</h1>
      <p class="page-header__sub">Historic Pubs Around the World</p>
      <p class="page-header__count">${store.pubs.length} 家全球历史名馆</p>
    </div>

    <section>
      <h2 class="section__title">🗺️ 按大洲探索</h2>
      <div class="grid grid--cards">
        ${continents.map(cont => Utils.geoCard({ id: cont.id, name: cont.name, nameEn: '', count: cont.count, icon: cont.icon }, cont.count, 'pub', 'continent=' + cont.id, '家酒馆')).join('')}
      </div>
    </section>

    ${featuredPubs.length > 0 ? `
    <section style="margin-top:40px;">
      <h2 class="section__title">🏛️ 精选名馆</h2>
      <div class="grid grid--masonry" id="featured-pubs-grid"></div>
    </section>` : ''}
  `;

  if (featuredPubs.length > 0) {
    Utils.renderPubGrid('featured-pubs-grid', featuredPubs);
  }
}

function renderPubContinent(main, continentId) {
  const continent = Utils.getContinent(continentId);
  if (!continent) { main.innerHTML = '<div class="empty"><span class="empty__icon">🗺️</span><h2>未找到该大洲</h2></div>'; return; }

  const countryMap = Utils.getPubsByContinentCountries(continentId);
  const countries = Object.keys(countryMap).map(id => {
    const c = Utils.getCountry(id);
    return c ? { ...c, count: countryMap[id].length } : null;
  }).filter(Boolean);

  const pubs = Utils.shuffle(Utils.getPubsByContinent(continentId));

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${continent.name} <span class="page-header__sub">${continent.nameEn}</span></h1>
      <p class="page-header__count">${countries.length} 个国家 · ${pubs.length} 家酒馆</p>
    </div>
    <section>
      <h2 class="section__title">国家</h2>
      <div class="grid grid--cards">
        ${countries.map(c => Utils.geoCard({ id: c.id, name: c.name, nameEn: c.nameEn, count: c.count, icon: c.flag }, c.count, 'pub', 'country=' + c.id, '家酒馆')).join('')}
      </div>
    </section>
    <section>
      <h2 class="section__title">随机展示</h2>
      <div class="grid grid--masonry" id="pub-continent-masonry"></div>
    </section>
  `;
  Utils.renderPubGrid('pub-continent-masonry', pubs);
}

function renderPubCountry(main, countryId) {
  const country = Utils.getCountry(countryId);
  if (!country) { main.innerHTML = '<div class="empty"><span class="empty__icon">🏛️</span><h2>未找到该国家</h2></div>'; return; }

  const pubs = Utils.getPubsByCountry(countryId);

  const cityMap = {};
  pubs.forEach(p => {
    if (!cityMap[p.city]) cityMap[p.city] = [];
    cityMap[p.city].push(p);
  });
  const cities = Object.entries(cityMap).map(([city, ps]) => ({ name: city, count: ps.length }));

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${country.flag} ${country.name}酒馆</h1>
      <p class="page-header__sub">${country.nameEn || ''}</p>
      <p class="page-header__count">${cities.length} 个城市 · ${pubs.length} 家酒馆</p>
    </div>
    ${cities.length > 0 ? `
    <section>
      <h2 class="section__title">城市</h2>
      <div class="grid grid--cards">
        ${cities.map(c => Utils.geoCard({ id: encodeURIComponent(c.name), name: c.name, nameEn: '', count: c.count, icon: '📍' }, c.count, 'pub', `country=${countryId}&city=${encodeURIComponent(c.name)}`, '家酒馆')).join('')}
      </div>
    </section>` : ''}
    <section style="margin-top:${cities.length > 0 ? '32px' : '0'}">
      <h2 class="section__title">全部酒馆</h2>
      <div class="grid grid--masonry" id="pub-country-grid"></div>
    </section>
  `;

  Utils.renderPubGrid('pub-country-grid', pubs);
}

function renderPubCity(main, cityName, countryId) {
  const country = Utils.getCountry(countryId);
  const pubs = Utils.getPubsByCity(countryId, cityName);

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">📍 ${cityName}酒馆</h1>
      <p class="page-header__sub">${country ? country.name : ''}</p>
      <p class="page-header__count">${pubs.length} 家酒馆</p>
    </div>
    ${pubs.length > 0 ? `<div class="grid grid--masonry" id="pub-city-grid"></div>` : '<div class="empty"><span class="empty__icon">🏛️</span><h2>暂无该城市酒馆数据</h2></div>'}
  `;

  if (pubs.length > 0) {
    Utils.renderPubGrid('pub-city-grid', pubs);
  }
}

function renderPubDetail(main, id) {
  const pub = Utils.getPubById(id);
  if (!pub) { main.innerHTML = '<div class="empty"><span class="empty__icon">🏛️</span><h2>酒馆未找到</h2></div>'; return; }

  const country = Utils.getCountry(pub.country);

  main.innerHTML = `
    <div class="detail detail--pub">
      <span style="display:inline-block;padding:5px 16px;border-radius:20px;font-size:0.85rem;font-weight:600;color:#fff;background:var(--accent);margin-bottom:12px;">🏛️ 建于 ${pub.founded}</span>
      <h1 class="detail__title">${pub.name}</h1>
      <p class="detail__ename">${pub.nameEn || ''}</p>
      <div class="detail__meta">
        <span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${country ? `<a href="?page=pub&country=${pub.country}" style="color:var(--accent);font-weight:600">${country.flag} ${country.name}</a>` : '🌍'}
          · <a href="?page=pub&country=${pub.country}&city=${encodeURIComponent(pub.city)}" style="color:var(--accent);font-weight:600">${pub.city}</a>
        </span>
        <span>📫 ${pub.address}</span>
        ${pub.famousPatrons ? `<span>👤 知名常客: ${pub.famousPatrons}</span>` : ''}
      </div>

      <div class="detail__stats">
        <div class="detail__stat">
          <span class="detail__stat-icon">📅</span>
          <span class="detail__stat-value">${pub.founded}</span>
          <span class="detail__stat-label">创立年份</span>
        </div>
        <div class="detail__stat">
          <span class="detail__stat-icon">🌍</span>
          <span class="detail__stat-value">${country ? country.name : ''}</span>
          <span class="detail__stat-label">所在国家</span>
        </div>
        <div class="detail__stat">
          <span class="detail__stat-icon">🏙️</span>
          <span class="detail__stat-value">${pub.city}</span>
          <span class="detail__stat-label">所在城市</span>
        </div>
        <div class="detail__stat">
          <span class="detail__stat-icon">🏷️</span>
          <span class="detail__stat-value">${(pub.tags || []).slice(0,2).join(', ')}</span>
          <span class="detail__stat-label">特色标签</span>
        </div>
      </div>

      <section class="detail__section">
        <h2 class="detail__section-title">📜 历史介绍</h2>
        <div class="desc"><p>${pub.history}</p></div>
      </section>
      <section class="detail__section">
        <h2 class="detail__section-title">🏛️ 酒馆特色</h2>
        <div class="desc"><p>${pub.description}</p></div>
      </section>
      <section class="detail__section">
        <h2 class="detail__section-title">🏺 特色酒品</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${(pub.specialties || []).map(s => `<span class="tag tag--badge">${s}</span>`).join('')}</div>
      </section>
      ${pub.famousPatrons ? `
      <section class="detail__section">
        <h2 class="detail__section-title">👤 知名常客</h2>
        <p>${pub.famousPatrons}</p>
      </section>` : ''}
      <section class="detail__section">
        <h2 class="detail__section-title">📍 地址</h2>
        <p>${pub.address}</p>
      </section>
      <div class="disclaimer">⚠️ 免责声明：内容整理自公开信息，不保证准确完整，仅供学习参考，不构成任何建议。</div>
      <div style="margin-top:32px;">
        <a href="?page=pub" class="btn" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--accent);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">← 返回酒馆首页</a>
      </div>
    </div>
  `;
}