import Utils from './utils.js';
import store from './store.js';

export function render(main) {
  const chinaCount = store.liquors.filter(l => Utils.isChinaLiquor(l)).length;
  const worldCount = store.liquors.filter(l => {
    const c = store.countryData.find(c => c.id === l.origin);
    return c && !Utils.isChinaLiquor(l);
  }).length;
  const pubCount = store.pubs.length;

  const poetry = store.winePoetry[Math.floor(Math.random() * store.winePoetry.length)] || null;

  const featuredPub = Utils.shuffle(store.pubs)[0];
  const pubCountry = featuredPub ? Utils.getCountry(featuredPub.country) : null;
  const patronList = featuredPub && featuredPub.famousPatrons ? featuredPub.famousPatrons.split('、') : [];
  const patronPreview = patronList.slice(0, 2).join('、') + (patronList.length > 2 ? ' 等' : '');
  const specList = featuredPub ? (featuredPub.specialties || []) : [];
  const specPreview = specList.slice(0, 2).join('、') + (specList.length > 2 ? ' 等' + specList.length + '款' : '');

  const pubHtml = featuredPub ? `
    <section class="spotlight">
      <div class="spotlight__header">
        <div class="spotlight__badge-row">
          <span class="spotlight__badge">🏆 今日名馆</span>
        </div>
        <h2 class="spotlight__title">${featuredPub.name}</h2>
        <p class="spotlight__subtitle">${featuredPub.nameEn || ''}</p>
        <p class="spotlight__location">${pubCountry ? pubCountry.flag : ''} ${pubCountry ? pubCountry.name : ''} · ${featuredPub.city}</p>
      </div>

      <div class="spotlight__facts">
        <div class="spotlight__fact">
          <span class="spotlight__fact-icon">📅</span>
          <span class="spotlight__fact-val">${featuredPub.founded}</span>
          <span class="spotlight__fact-label">创立于</span>
        </div>
        <div class="spotlight__fact">
          <span class="spotlight__fact-icon">👑</span>
          <span class="spotlight__fact-val spotlight__fact-text">${patronPreview || '—'}</span>
          <span class="spotlight__fact-label">名人足迹</span>
        </div>
        <div class="spotlight__fact">
          <span class="spotlight__fact-icon">🏺</span>
          <span class="spotlight__fact-val spotlight__fact-text">${specPreview || '—'}</span>
          <span class="spotlight__fact-label">招牌体验</span>
        </div>
      </div>

      <div class="spotlight__story">
        <p class="spotlight__story-text">${featuredPub.history}</p>
      </div>

      ${(featuredPub.tags || []).length > 0 ? `
      <div class="spotlight__tags-row">
        ${(featuredPub.tags || []).map(t => `<span class="spotlight__tag">${t}</span>`).join('')}
      </div>` : ''}

      <a href="?page=pub&id=${featuredPub.id}" class="spotlight__cta">
        深入了解这座传奇酒馆
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </section>
  ` : '';

  main.innerHTML = `
    <section class="hero">
      ${poetry ? `<p class="hero__subtitle">"${poetry.verse}"</p><p class="hero__quote-source">—— ${poetry.source}</p>` : '<p class="hero__subtitle">探寻世界美酒，邂逅百年酒馆</p>'}
    </section>

    ${pubHtml}

    <div class="stats-bar">
      <a href="?page=china" class="stats-bar__item"><span class="stats-bar__icon">🏮</span>${chinaCount} 款中国美酒</a>
      <span class="stats-bar__sep">|</span>
      <a href="?page=world" class="stats-bar__item"><span class="stats-bar__icon">🌍</span>${worldCount} 款世界美酒</a>
      <span class="stats-bar__sep">|</span>
      <a href="?page=pub" class="stats-bar__item"><span class="stats-bar__icon">🏺</span>${pubCount} 家历史酒馆</a>
    </div>
  `;
}