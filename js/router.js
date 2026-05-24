const Router = {
  currentPath: '',

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    if (!window.location.hash) {
      window.location.hash = '#/';
    }
    this.handleRoute();

    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
      navLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
          navLinks.classList.remove('open');
        }
      });
    }
  },

  navigate(path) {
    window.location.hash = '#' + path;
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    this.currentPath = hash;
    this.render(hash);
  },

  render(path) {
    const main = document.getElementById('main-content');
    if (!main) return;

    const qIndex = path.indexOf('?');
    const cleanPath = qIndex >= 0 ? path.substring(0, qIndex) : path;
    const parts = cleanPath.split('/').filter(Boolean);

    if (path === '/' || parts.length === 0) {
      this.renderHome(main);
    } else if (parts[0] === 'china') {
      if (parts[1]) {
        this.renderProvince(main, parts[1]);
      } else {
        this.renderChinaHome(main);
      }
    } else if (parts[0] === 'world') {
      this.renderWorldHome(main);
    } else if (parts[0] === 'categories') {
      this.renderCategories(main);
    } else if (parts[0] === 'category' && parts[1]) {
      this.renderCategoryPage(main, parts[1]);
    } else if (parts[0] === 'continent' && parts[1]) {
      this.renderContinent(main, parts[1]);
    } else if (parts[0] === 'country' && parts[1]) {
      this.renderCountry(main, parts[1]);
    } else if (parts[0] === 'province' && parts[1]) {
      this.renderProvince(main, parts[1]);
    } else if (parts[0] === 'city' && parts[1]) {
      this.renderCity(main, decodeURIComponent(parts[1]), parts[2]);
    } else if (parts[0] === 'district' && parts[1]) {
      this.renderDistrict(main, decodeURIComponent(parts[1]));
    } else if (parts[0] === 'liquor' && parts[1]) {
      this.renderLiquorDetail(main, parts[1]);
    } else if (parts[0] === 'tags') {
      this.renderTagsPage(main);
    } else if (parts[0] === 'tag' && parts[1]) {
      this.renderTagPage(main, decodeURIComponent(parts[1]));
    } else if (parts[0] === 'pub') {
      if (parts[1] === 'continent' && parts[2]) {
        this.renderPubContinent(main, parts[2]);
      } else if (parts[1] === 'country' && parts[2]) {
        this.renderPubCountry(main, parts[2]);
      } else if (parts[1] === 'city' && parts[2] && parts[3]) {
        this.renderPubCity(main, parts[2], parts[3]);
      } else if (parts[1]) {
        this.renderPubDetail(main, parts[1]);
      } else {
        this.renderPubHome(main);
      }
    } else if (parts[0] === 'search') {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      this.renderSearch(main, params.get('q') || '');
    } else {
      main.innerHTML = '<div class="empty-state"><span class="empty-state-icon">🏺</span><h2>页面未找到</h2><p>请检查链接是否正确，或返回首页浏览</p></div>';
    }

    this.renderBreadcrumbs(path);
    window.scrollTo(0, 0);
  },

  renderBreadcrumbs(path) {
    const container = document.getElementById('breadcrumb');
    if (!container) return;
    const qIndex = path.indexOf('?');
    const cleanPath = qIndex >= 0 ? path.substring(0, qIndex) : path;
    const parts = cleanPath.split('/').filter(Boolean);
    if (path === '/' || parts.length === 0) {
      container.innerHTML = '';
      return;
    }
    const crumbs = Utils.getBreadcrumbs(path);
    container.innerHTML = crumbs.map((c, i) => {
      if (c.href) {
        return `<a href="${c.href}" class="breadcrumb-link">${c.label}</a>`;
      }
      return `<span class="breadcrumb-current">${c.label}</span>`;
    }).join('<span class="breadcrumb-sep">›</span>');
  },

  renderHome(main) {
    const chinaCount = AllLiquors.filter(l => l.origin === 'china' || ChinaProvinceData.some(p => p.id === l.origin || p.id === l.region)).length;
    const worldCount = AllLiquors.filter(l => { const c = CountryData.find(c => c.id === l.origin); return c && !c.hasProvinces; }).length;
    const pubCount = AllPubs.length;

    const poetry = (window.WinePoetry || [])[Math.floor(Math.random() * (window.WinePoetry || []).length)] || null;

    const featuredPub = AllPubs[Math.floor(Math.random() * AllPubs.length)];
    const pubCountry = featuredPub ? Utils.getCountry(featuredPub.country) : null;
    const patronList = featuredPub && featuredPub.famousPatrons ? featuredPub.famousPatrons.split('、') : [];
    const patronPreview = patronList.slice(0, 2).join('、') + (patronList.length > 2 ? ' 等' : '');
    const specList = featuredPub ? (featuredPub.specialties || []) : [];
    const specPreview = specList.slice(0, 2).join('、') + (specList.length > 2 ? ' 等' + specList.length + '款' : '');

    const pubHtml = featuredPub ? `
      <section class="pub-spotlight">
        <div class="pub-spotlight-header">
          <div class="pub-spotlight-badge-row">
            <span class="pub-spotlight-badge">🏆 今日名馆</span>
          </div>
          <h2 class="pub-spotlight-title">${featuredPub.name}</h2>
          <p class="pub-spotlight-subtitle">${featuredPub.nameEn || ''}</p>
          <p class="pub-spotlight-location">${pubCountry ? pubCountry.flag : ''} ${pubCountry ? pubCountry.name : ''} · ${featuredPub.city}</p>
        </div>

        <div class="pub-spotlight-facts">
          <div class="pub-spotlight-fact">
            <span class="pub-spotlight-fact-icon">📅</span>
            <span class="pub-spotlight-fact-val">${featuredPub.founded}</span>
            <span class="pub-spotlight-fact-label">创立于</span>
          </div>
          <div class="pub-spotlight-fact">
            <span class="pub-spotlight-fact-icon">👑</span>
            <span class="pub-spotlight-fact-val pub-spotlight-fact-text">${patronPreview || '—'}</span>
            <span class="pub-spotlight-fact-label">名人足迹</span>
          </div>
          <div class="pub-spotlight-fact">
            <span class="pub-spotlight-fact-icon">🏺</span>
            <span class="pub-spotlight-fact-val pub-spotlight-fact-text">${specPreview || '—'}</span>
            <span class="pub-spotlight-fact-label">招牌体验</span>
          </div>
        </div>

        <div class="pub-spotlight-story">
          <p class="pub-spotlight-story-text">${featuredPub.history}</p>
        </div>

        ${(featuredPub.tags || []).length > 0 ? `
        <div class="pub-spotlight-tags-row">
          ${(featuredPub.tags || []).map(t => `<span class="pub-spotlight-tag">${t}</span>`).join('')}
        </div>` : ''}

        <a href="#/pub/${featuredPub.id}" class="pub-spotlight-cta">
          深入了解这座传奇酒馆
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </section>
    ` : '';

    main.innerHTML = `
      <section class="hero-section">
        ${poetry ? `<p class="hero-subtitle">"${poetry.verse}"</p><p class="hero-quote-source">—— ${poetry.source}</p>` : '<p class="hero-subtitle">探寻世界美酒，邂逅百年酒馆</p>'}
      </section>

      ${pubHtml}

      <div class="home-stats-bar">
        <a href="#/china" class="home-stat-item"><span class="home-stat-icon">🏮</span>${chinaCount} 款中国美酒</a>
        <span class="home-stat-sep">|</span>
        <a href="#/world" class="home-stat-item"><span class="home-stat-icon">🌍</span>${worldCount} 款世界美酒</a>
        <span class="home-stat-sep">|</span>
        <a href="#/pub" class="home-stat-item"><span class="home-stat-icon">🏺</span>${pubCount} 家历史酒馆</a>
      </div>
    `;
  },

  renderChinaHome(main) {
    const provinces = ChinaProvinceData.map(p => {
      const count = AllLiquors.filter(l => l.origin === p.id || l.region === p.id).length;
      return { ...p, count, icon: '🏮' };
    }).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

    const allChinaLiqs = Utils.shuffle(AllLiquors.filter(l =>
      l.origin === 'china' || ChinaProvinceData.some(p => p.id === l.origin || p.id === l.region)
    ));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">🏮 中国酒</h1>
        <p class="category-name-en">Chinese Liquors</p>
        <p class="category-count">${provinces.length} 个省份 · ${allChinaLiqs.length} 款酒</p>
      </div>
      <section>
        <h2 class="section-title">省份</h2>
        <div class="cards-grid">
          ${provinces.map(p => Components.geoCard(p, p.count, 'province')).join('')}
        </div>
      </section>
      <section>
        <h2 class="section-title">随机展示</h2>
        <div class="masonry-grid" id="china-masonry"></div>
      </section>
    `;
    Components.renderMasonryGrid('china-masonry', allChinaLiqs);
  },

  renderWorldHome(main) {
    const continents = (ContinentData || []).map(c => {
      const count = Utils.getLiquorsByContinent(c.id).length;
      return { ...c, count };
    }).filter(c => c.count > 0);

    const allWorldLiqs = Utils.shuffle(AllLiquors.filter(l => { const c = CountryData.find(c => c.id === l.origin); return c && !c.hasProvinces; }));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">🌍 世界酒</h1>
        <p class="category-name-en">World Liquors</p>
        <p class="category-count">${continents.length} 个大洲 · ${allWorldLiqs.length} 款酒</p>
      </div>
      <section>
        <h2 class="section-title">大洲</h2>
        <div class="cards-grid">
          ${continents.map(c => Components.geoCard(c, c.count, 'continent')).join('')}
        </div>
      </section>
      <section>
        <h2 class="section-title">随机展示</h2>
        <div class="masonry-grid" id="world-masonry"></div>
      </section>
    `;
    Components.renderMasonryGrid('world-masonry', allWorldLiqs);
  },

  renderCategories(main) {
    const cats = CategoryMeta.map(c => {
      const count = Utils.getLiquorsByCategory(c.id).length;
      return { meta: c, count };
    }).filter(c => c.count > 0);

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">📋 品种分类</h1>
        <p class="category-name-en">Categories</p>
        <p class="category-count">${cats.length} 个酒类品种</p>
      </div>
      <div class="category-grid">
        ${cats.map(c => Components.categoryCard(c.meta, c.count)).join('')}
      </div>
    `;
  },

  renderCategoryPage(main, catId) {
    const catMeta = Utils.getCategoryMeta(catId);
    const liquors = Utils.shuffle(Utils.getLiquorsByCategory(catId));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${catMeta ? catMeta.icon : ''} ${catMeta ? catMeta.name : catId}</h1>
        <p class="category-name-en">${catMeta ? catMeta.nameEn : ''}</p>
        <p class="category-count">${liquors.length} 款酒</p>
      </div>
      ${liquors.length > 0 ? `<div class="masonry-grid" id="cat-masonry"></div>` : '<div class="empty-state"><span class="empty-state-icon">🏺</span><p>暂无该分类酒品</p></div>'}
    `;
    if (liquors.length > 0) Components.renderMasonryGrid('cat-masonry', liquors);
  },

  renderContinent(main, id) {
    const cont = Utils.getContinent(id);
    if (!cont) { main.innerHTML = '<div class="empty-state"><h2>大洲未找到</h2></div>'; return; }

    const countries = cont.countries.map(cid => {
      const c = Utils.getCountry(cid);
      if (!c) return null;
      const count = c.hasProvinces ? (AllLiquors.filter(l => l.origin === cid || ChinaProvinceData.some(p => p.id === l.origin || p.id === l.region)).length) : Utils.getLiquorsByCountry(cid).length;
      return { id: c.id, name: c.name, nameEn: c.nameEn, count, icon: c.hasProvinces ? '🏮' : (c.flag || '🌍'), hasProvinces: c.hasProvinces };
    }).filter(Boolean);

    const liqs = Utils.shuffle(Utils.getLiquorsByContinent(id));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${cont.name} <span class="category-name-en">${cont.nameEn}</span></h1>
        <p class="category-count">${countries.length} 个国家 · ${liqs.length} 款酒</p>
      </div>
      <section>
        <h2 class="section-title">国家</h2>
        <div class="cards-grid">${countries.map(c => Components.geoCard(c, c.count, c.hasProvinces ? 'china' : 'country')).join('')}</div>
      </section>
      <section>
        <h2 class="section-title">随机展示</h2>
        <div class="masonry-grid" id="cont-masonry"></div>
      </section>
    `;
    Components.renderMasonryGrid('cont-masonry', liqs);
  },

  renderCountry(main, id) {
    const country = Utils.getCountry(id);
    if (!country) { main.innerHTML = '<div class="empty-state"><h2>国家未找到</h2></div>'; return; }
    if (country.hasProvinces) { Router.navigate('china'); return; }

    const liqs = Utils.shuffle(Utils.getLiquorsByCountry(id));
    const regions = country.regions ? [...new Set(liqs.map(l => l.region).filter(Boolean))] : [];
    const hasCats = [...new Set(liqs.map(l => l.category))];

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${country.name} <span class="category-name-en">${country.nameEn}</span></h1>
        <p class="category-count">${regions.length} 个产区 · ${liqs.length} 款酒</p>
      </div>
      ${regions.length > 0 ? `
      <section>
        <h2 class="section-title">产区</h2>
        <div class="cards-grid">${regions.map(r => {
          const count = liqs.filter(l => l.region === r).length;
          return Components.geoCard({ id: encodeURIComponent(r) + '/' + country.id, name: r, nameEn: '', count, icon: '🍇' }, count, 'city');
        }).join('')}</div>
      </section>` : ''}
      <section>
        <h2 class="section-title">酒品种类</h2>
        <div class="category-grid">
          ${hasCats.map(cid => {
            const cat = Utils.getCategoryMeta(cid);
            const count = liqs.filter(l => l.category === cid).length;
            return cat ? Components.categoryCard(cat, count) : '';
          }).join('')}
        </div>
      </section>
      <section>
        <h2 class="section-title">全部酒品</h2>
        <div class="masonry-grid" id="country-masonry"></div>
      </section>
    `;
    Components.renderMasonryGrid('country-masonry', liqs);
  },

  renderProvince(main, id) {
    const prov = Utils.getChinaProvince(id);
    const liqs = Utils.shuffle(AllLiquors.filter(l => l.origin === id || l.region === id));

    if (liqs.length === 0) {
      main.innerHTML = '<div class="empty-state"><span class="empty-state-icon">🏯</span><h2>暂无数据</h2></div>';
      return;
    }

    const pinyinCities = prov ? (prov.cities || []) : [...new Set(liqs.map(l => l.region).filter(Boolean))];
    const cities = pinyinCities.map(c => ({
      id: c,
      name: Utils.getCityName(c),
      count: liqs.filter(l => {
        const cnCity = Utils.getCityName(c);
        const region = l.district || '';
        const regionCnProv = Utils.getChinaProvince(l.region);
        const regionMatch = regionCnProv ? (regionCnProv.name || '').includes(cnCity) : false;
        return region.includes(cnCity) || l.district === cnCity || regionMatch;
      }).length
    })).filter(c => c.count > 0);

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${prov ? prov.name : id} <span class="category-name-en">${prov ? prov.nameEn || '' : ''}</span></h1>
        <p class="category-count">${cities.length} 个城市 · ${liqs.length} 款酒</p>
      </div>
      ${cities.length > 0 ? `
      <section>
        <h2 class="section-title">城市</h2>
        <div class="cards-grid">${cities.map(c =>
          Components.geoCard({ id: c.id + '/' + id, name: c.name, nameEn: '', count: c.count, icon: '🏘️' }, c.count, 'city')
        ).join('')}</div>
      </section>` : ''}
      <section>
        <h2 class="section-title">全部酒品</h2>
        <div class="masonry-grid" id="prov-masonry"></div>
      </section>
    `;
    Components.renderMasonryGrid('prov-masonry', liqs);
  },

  renderCity(main, cityName, parentId) {
    const cnCityName = Utils.getCityName(cityName);
    const prov = Utils.getChinaProvince(parentId);
    const liqs = Utils.shuffle(AllLiquors.filter(l => {
      const dist = (l.district || '');
      const regionMatch = (l.region === parentId) || (l.origin === parentId);
      if (prov) {
        return regionMatch && dist.includes(cnCityName);
      }
      return (l.region === cityName || dist.includes(cityName)) && (l.origin === parentId || l.region === parentId);
    }));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${cnCityName}</h1>
        <p class="category-count">${liqs.length} 款酒</p>
      </div>
      ${liqs.length > 0 ? '<div class="masonry-grid" id="city-masonry"></div>' : '<div class="empty-state"><span class="empty-state-icon">🏘️</span><p>暂无该城市酒品</p></div>'}
    `;
    if (liqs.length > 0) Components.renderMasonryGrid('city-masonry', liqs);
  },

  renderDistrict(main, distId) {
    const liqs = Utils.shuffle(Utils.getLiquorsByDistrict(distId));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${distId}</h1>
        <p class="category-count">${liqs.length} 款酒</p>
      </div>
      ${liqs.length > 0 ? `<div class="masonry-grid" id="dist-masonry"></div>` : '<div class="empty-state"><span class="empty-state-icon">🏘️</span><p>暂无该地区酒品</p></div>'}
    `;
    if (liqs.length > 0) Components.renderMasonryGrid('dist-masonry', liqs);
  },

  renderLiquorDetail(main, id) {
    const liq = Utils.getLiquorById(id);
    if (!liq) { main.innerHTML = '<div class="empty-state"><span class="empty-state-icon">🏺</span><h2>酒品未找到</h2></div>'; return; }

    const catMeta = Utils.getCategoryMeta(liq.category);
    const country = Utils.getCountry(liq.origin);
    const isChina = country && country.hasProvinces;
    const prov = isChina ? Utils.getChinaProvince(liq.region) : null;
    const originName = isChina ? '中国' : (country ? country.name : liq.origin);
    const regionName = prov ? prov.name : (liq.region || '');

    const tagsHtml = (liq.tags || []).map(t =>
      `<a href="#/tag/${encodeURIComponent(t)}" class="tag-badge">#${Utils.getTagName(t)}</a>`
    ).join('');

    main.innerHTML = `
      <div class="liquor-detail">
        <div class="liquor-info-header">
          <div class="liquor-detail-category" style="background:${catMeta ? catMeta.color : '#6a6a6a'}">${catMeta ? catMeta.icon + ' ' + catMeta.name : liq.category}</div>
          <h1 class="liquor-detail-title">${liq.name}</h1>
          <p class="liquor-detail-ename">${liq.nameEn || ''}</p>
          <div class="liquor-detail-meta">
            <span class="liquor-detail-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <a href="#/${isChina ? 'china' : 'country/' + country.id}" style="color:var(--accent);font-weight:600">${originName}</a>${regionName ? ' · ' + regionName : ''}${liq.district ? ' · ' + liq.district : ''}
            </span>
            <span class="liquor-detail-alcohol">${liq.alcohol || ''}</span>
          </div>
          <div class="liquor-tags">${tagsHtml}</div>
        </div>

        <div class="detail-stats-grid">
          <div class="detail-stat-card">
            <span class="detail-stat-icon">🏺</span>
            <span class="detail-stat-value">${catMeta ? catMeta.name : ''}</span>
            <span class="detail-stat-label">酒种分类</span>
          </div>
          <div class="detail-stat-card">
            <span class="detail-stat-icon">📍</span>
            <span class="detail-stat-value">${originName}</span>
            <span class="detail-stat-label">产地</span>
          </div>
          <div class="detail-stat-card">
            <span class="detail-stat-icon">🌡️</span>
            <span class="detail-stat-value">${liq.alcohol || 'N/A'}</span>
            <span class="detail-stat-label">酒精度</span>
          </div>
          <div class="detail-stat-card">
            <span class="detail-stat-icon">🏷️</span>
            <span class="detail-stat-value">${(liq.tags || []).length}</span>
            <span class="detail-stat-label">标签</span>
          </div>
        </div>

        <section class="detail-section">
          <h2 class="detail-section-title">📝 特色介绍</h2>
          <div class="desc-block">
            <h3 class="desc-label">🏆 出名原因</h3>
            <p>${liq.features}</p>
          </div>
          <div class="desc-block">
            <h3 class="desc-label">✨ 吸引人之处</h3>
            <p>${liq.description}</p>
          </div>
        </section>

        <section class="detail-section">
          <h2 class="detail-section-title">🔬 专业分析</h2>
          <div class="desc-block">
            <h3 class="desc-label">📜 历史背景</h3>
            <p>${liq.history}</p>
          </div>
          <div class="desc-block">
            <h3 class="desc-label">🧪 专业品鉴分析</h3>
            <p>${liq.analysis}</p>
          </div>
        </section>
      </div>
    `;
  },

  renderTagsPage(main) {
    const tags = Utils.getAllTags();
    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">🏷️ 标签汇聚</h1>
        <p class="category-count">${tags.length} 个标签</p>
      </div>
      <div class="tags-cloud">
        ${tags.map(t => `
          <a href="#/tag/${encodeURIComponent(t.name)}" class="tag-cloud-item" style="font-size:${Math.max(0.85, Math.min(1.8, 0.85 + t.count * 0.15))}rem">
            ${Utils.getTagName(t.name)}
            <span class="tag-cloud-count">${t.count}</span>
          </a>
        `).join('')}
      </div>
    `;
  },

  renderTagPage(main, tag) {
    const liquors = Utils.shuffle(Utils.getLiquorsByTag(tag));
    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">标签: #${Utils.getTagName(tag)}</h1>
        <p class="category-count">${liquors.length} 款酒</p>
      </div>
      ${liquors.length > 0 ? `<div class="masonry-grid" id="tag-masonry"></div>` : '<div class="empty-state"><span class="empty-state-icon">🏷️</span><p>暂无该标签酒品</p></div>'}
    `;
    if (liquors.length > 0) Components.renderMasonryGrid('tag-masonry', liquors);
  },

  renderPubHome(main) {
    const continents = (window.ContinentData || []).map(cont => {
      const pubs = Utils.getPubsByContinent(cont.id);
      return { ...cont, count: pubs.length };
    }).filter(c => c.count > 0);

    const featuredPubs = AllPubs.slice(0, 4);

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">🏛️ 酒馆</h1>
        <p class="category-name-en">Historic Pubs Around the World</p>
        <p class="category-count">${AllPubs.length} 家全球历史名馆</p>
      </div>

      <section>
        <h2 class="section-title">🗺️ 按大洲探索</h2>
        <div class="cards-grid">
          ${continents.map(cont => Components.geoCard({ id: cont.id, name: cont.name, nameEn: '', count: cont.count, icon: cont.icon }, cont.count, 'pub/continent', '家酒馆')).join('')}
        </div>
      </section>

      ${featuredPubs.length > 0 ? `
      <section style="margin-top:40px;">
        <h2 class="section-title">🏛️ 精选名馆</h2>
        <div class="masonry-grid" id="featured-pubs-grid"></div>
      </section>` : ''}
    `;

    if (featuredPubs.length > 0) {
      Components.renderPubGrid('featured-pubs-grid', featuredPubs);
    }
  },

  renderPubContinent(main, continentId) {
    const continent = Utils.getContinent(continentId);
    if (!continent) { main.innerHTML = '<div class="empty-state"><span class="empty-state-icon">🗺️</span><h2>未找到该大洲</h2></div>'; return; }

    const countryMap = Utils.getPubsByContinentCountries(continentId);
    const countries = Object.keys(countryMap).map(id => {
      const c = Utils.getCountry(id);
      return c ? { ...c, count: countryMap[id].length } : null;
    }).filter(Boolean);

    const pubs = Utils.shuffle(Utils.getPubsByContinent(continentId));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${continent.name} <span class="category-name-en">${continent.nameEn}</span></h1>
        <p class="category-count">${countries.length} 个国家 · ${pubs.length} 家酒馆</p>
      </div>
      <section>
        <h2 class="section-title">国家</h2>
        <div class="cards-grid">
          ${countries.map(c => Components.geoCard({ id: c.id, name: c.name, nameEn: c.nameEn, count: c.count, icon: c.flag }, c.count, 'pub/country', '家酒馆')).join('')}
        </div>
      </section>
      <section>
        <h2 class="section-title">随机展示</h2>
        <div class="masonry-grid" id="pub-continent-masonry"></div>
      </section>
    `;
    Components.renderPubGrid('pub-continent-masonry', pubs);
  },

  renderPubCountry(main, countryId) {
    const country = Utils.getCountry(countryId);
    if (!country) { main.innerHTML = '<div class="empty-state"><span class="empty-state-icon">🏛️</span><h2>未找到该国家</h2></div>'; return; }

    const pubs = Utils.getPubsByCountry(countryId);

    const cityMap = {};
    pubs.forEach(p => {
      if (!cityMap[p.city]) cityMap[p.city] = [];
      cityMap[p.city].push(p);
    });
    const cities = Object.entries(cityMap).map(([city, ps]) => ({ name: city, count: ps.length }));

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">${country.flag} ${country.name}酒馆</h1>
        <p class="category-name-en">${country.nameEn || ''}</p>
        <p class="category-count">${cities.length} 个城市 · ${pubs.length} 家酒馆</p>
      </div>
      ${cities.length > 0 ? `
      <section>
        <h2 class="section-title">城市</h2>
        <div class="cards-grid">
          ${cities.map(c => Components.geoCard({ id: encodeURIComponent(c.name) + '/' + countryId, name: c.name, nameEn: '', count: c.count, icon: '📍' }, c.count, 'pub/city', '家酒馆')).join('')}
        </div>
      </section>` : ''}
      <section style="margin-top:${cities.length > 0 ? '32px' : '0'}">
        <h2 class="section-title">全部酒馆</h2>
        <div class="masonry-grid" id="pub-country-grid"></div>
      </section>
    `;

    Components.renderPubGrid('pub-country-grid', pubs);
  },

  renderPubCity(main, cityNameEncoded, countryId) {
    const cityName = decodeURIComponent(cityNameEncoded);
    const country = Utils.getCountry(countryId);
    const pubs = Utils.getPubsByCity(countryId, cityName);

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">📍 ${cityName}酒馆</h1>
        <p class="category-name-en">${country ? country.name : ''}</p>
        <p class="category-count">${pubs.length} 家酒馆</p>
      </div>
      ${pubs.length > 0 ? `<div class="masonry-grid" id="pub-city-grid"></div>` : '<div class="empty-state"><span class="empty-state-icon">🏛️</span><h2>暂无该城市酒馆数据</h2></div>'}
    `;

    if (pubs.length > 0) {
      Components.renderPubGrid('pub-city-grid', pubs);
    }
  },

  renderPubDetail(main, id) {
    const pub = Utils.getPubById(id);
    if (!pub) { main.innerHTML = '<div class="empty-state"><span class="empty-state-icon">🏛️</span><h2>酒馆未找到</h2></div>'; return; }

    const country = Utils.getCountry(pub.country);

    main.innerHTML = `
      <div class="pub-detail">
        <span style="display:inline-block;padding:5px 16px;border-radius:20px;font-size:0.85rem;font-weight:600;color:#fff;background:var(--accent);margin-bottom:12px;">🏛️ 建于 ${pub.founded}</span>
        <h1 class="pub-detail-title">${pub.name}</h1>
        <p class="liquor-detail-ename">${pub.nameEn || ''}</p>
        <div class="pub-detail-meta">
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${country ? country.flag : '🌍'} ${country ? country.name : ''} · ${pub.city}
          </span>
          <span>📫 ${pub.address}</span>
          ${pub.famousPatrons ? `<span>👤 知名常客: ${pub.famousPatrons}</span>` : ''}
        </div>

        <div class="detail-stats-grid">
          <div class="detail-stat-card">
            <span class="detail-stat-icon">📅</span>
            <span class="detail-stat-value">${pub.founded}</span>
            <span class="detail-stat-label">创立年份</span>
          </div>
          <div class="detail-stat-card">
            <span class="detail-stat-icon">🌍</span>
            <span class="detail-stat-value">${country ? country.name : ''}</span>
            <span class="detail-stat-label">所在国家</span>
          </div>
          <div class="detail-stat-card">
            <span class="detail-stat-icon">🏙️</span>
            <span class="detail-stat-value">${pub.city}</span>
            <span class="detail-stat-label">所在城市</span>
          </div>
          <div class="detail-stat-card">
            <span class="detail-stat-icon">🏷️</span>
            <span class="detail-stat-value">${(pub.tags || []).slice(0,2).join(', ')}</span>
            <span class="detail-stat-label">特色标签</span>
          </div>
        </div>

        <section class="detail-section">
          <h2 class="detail-section-title">📜 历史介绍</h2>
          <div class="desc-block"><p>${pub.history}</p></div>
        </section>
        <section class="detail-section">
          <h2 class="detail-section-title">🏛️ 酒馆特色</h2>
          <div class="desc-block"><p>${pub.description}</p></div>
        </section>
        <section class="detail-section">
          <h2 class="detail-section-title">🏺 特色酒品</h2>
          <div style="display:flex;gap:10px;flex-wrap:wrap">${(pub.specialties || []).map(s => `<span class="tag-badge">${s}</span>`).join('')}</div>
        </section>
        ${pub.famousPatrons ? `
        <section class="detail-section">
          <h2 class="detail-section-title">👤 知名常客</h2>
          <p>${pub.famousPatrons}</p>
        </section>` : ''}
        <section class="detail-section">
          <h2 class="detail-section-title">📍 地址</h2>
          <p>${pub.address}</p>
        </section>
        <div style="margin-top:32px;">
          <a href="#/pub" class="btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--accent);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">← 返回酒馆首页</a>
        </div>
      </div>
    `;
  },

  renderSearch(main, query) {
    const liqResults = Utils.searchLiquors(query);
    const pubResults = Utils.searchPubs(query);
    const shuffledLiqs = Utils.shuffle(liqResults);
    const shuffledPubs = Utils.shuffle(pubResults);

    main.innerHTML = `
      <div class="category-header">
        <h1 class="category-title">🔍 搜索结果: "${query}"</h1>
        <p class="category-count">找到 ${liqResults.length} 款酒 · ${pubResults.length} 家酒馆</p>
      </div>
      ${liqResults.length > 0 ? `
      <section>
        <h2 class="section-title">🏺 酒品结果</h2>
        <div class="masonry-grid" id="search-liq-masonry"></div>
      </section>` : ''}
      ${pubResults.length > 0 ? `
      <section>
        <h2 class="section-title">🏛️ 酒馆结果</h2>
        <div class="masonry-grid" id="search-pub-masonry"></div>
      </section>` : ''}
      ${liqResults.length === 0 && pubResults.length === 0 ? '<div class="empty-state"><span class="empty-state-icon">🔍</span><h2>未找到结果</h2><p>请尝试其他关键词</p></div>' : ''}
    `;

    if (liqResults.length > 0) Components.renderMasonryGrid('search-liq-masonry', shuffledLiqs);
    if (pubResults.length > 0) Components.renderPubGrid('search-pub-masonry', shuffledPubs);
  }
};