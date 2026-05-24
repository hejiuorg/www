const Components = {
  liquorCard(liq) {
    const catMeta = Utils.getCategoryMeta(liq.category);
    const catClass = 'cat-' + (liq.category === 'yellow_wine' ? 'yellow_wine' : liq.category);
    const country = Utils.getCountry(liq.origin);
    const prov = Utils.getChinaProvince(liq.region);
    const originName = country ? country.name : (prov ? prov.name : liq.origin);
    const regionName = prov ? prov.name : (liq.region || '');

    return `
      <div class="liquor-card" onclick="Router.navigate('liquor/${liq.id}')">
        <div class="liquor-card-accent"></div>
        <div class="liquor-card-body">
          <div class="liquor-card-head">
            <span class="liquor-card-category ${catClass}">${catMeta ? catMeta.icon + ' ' + catMeta.name : liq.category}</span>
            <span class="liquor-card-alcohol">${liq.alcohol || ''}</span>
          </div>
          <h3 class="liquor-card-title">${liq.name}</h3>
          <p class="liquor-card-ename">${liq.nameEn || ''}</p>
          <p class="liquor-card-location">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${originName} · ${regionName}
          </p>
          <p class="liquor-card-desc">${liq.description}</p>
          <div class="liquor-card-tags">
            ${(liq.tags || []).slice(0, 3).map(t => `<span class="tag-mini" onclick="event.stopPropagation();Router.navigate('tag/${encodeURIComponent(t)}')">#${Utils.getTagName(t)}</span>`).join('')}
            ${(liq.tags || []).length > 3 ? `<span class="tag-mini tag-more">+${liq.tags.length - 3}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  pubCard(pub) {
    const country = Utils.getCountry(pub.country);
    const locationLabel = country ? country.name : pub.country;
    const flag = country ? country.flag : '🏛️';

    return `
      <div class="pub-card" onclick="Router.navigate('pub/${pub.id}')">
        <div class="pub-card-accent"></div>
        <div class="pub-card-body">
          <div class="pub-card-head">
            <span class="pub-card-founded">🏛️ ${pub.founded}</span>
            <span class="pub-card-city">${pub.city}</span>
          </div>
          <h3 class="pub-card-title">${pub.name}</h3>
          <p class="pub-card-ename">${pub.nameEn || ''}</p>
          <p class="pub-card-location">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${flag} ${locationLabel}
          </p>
          <p class="pub-card-desc">${pub.description}</p>
          <div class="pub-card-tags">
            ${(pub.specialties || []).slice(0, 3).map(s => `<span class="pub-spec-mini">${s}</span>`).join('')}
            ${(pub.specialties || []).length > 3 ? `<span class="tag-mini tag-more">+${pub.specialties.length - 3}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  geoCard(item, count, linkPrefix, label) {
    return `
      <a href="#/${linkPrefix}/${item.id}" class="geo-card">
        <span class="geo-card-icon">${item.icon || '📍'}</span>
        <h3 class="geo-card-name">${item.name}</h3>
        <p class="geo-card-en">${item.nameEn || ''}</p>
        <span class="geo-card-count">${count} ${label || '款酒'}</span>
      </a>
    `;
  },

  categoryCard(catMeta, count) {
    return `
      <a href="#/category/${catMeta.id}" class="category-card">
        <span class="category-card-icon">${catMeta.icon}</span>
        <h3 class="category-card-name">${catMeta.name}</h3>
        <p class="category-card-desc">${catMeta.desc}</p>
        <span class="category-card-count">${count} 款酒</span>
      </a>
    `;
  },

  renderMasonryGrid(containerId, liquors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = liquors.map(l => this.liquorCard(l)).join('');
  },

  renderPubGrid(containerId, pubs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = pubs.map(p => this.pubCard(p)).join('');
  }
};