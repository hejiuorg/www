import Utils from './utils.js';
import store from './store.js';

export function renderWorld(main) {
  const continents = store.continentData.map(c => {
    const count = Utils.getLiquorsByContinent(c.id).length;
    return { ...c, count };
  }).filter(c => c.count > 0);

  const allWorldLiqs = Utils.shuffle(store.liquors.filter(l => { const c = store.countryData.find(c => c.id === l.origin); return c && !Utils.isChinaLiquor(l); }));

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">🌍 世界酒</h1>
      <p class="page-header__sub">World Liquors</p>
      <p class="page-header__count">${continents.length} 个大洲 · ${allWorldLiqs.length} 款酒</p>
    </div>
    <section>
      <h2 class="section__title">大洲</h2>
      <div class="grid grid--cards">
        ${continents.map(c => Utils.geoCard(c, c.count, 'continent', '')).join('')}
      </div>
    </section>
    <section>
      <h2 class="section__title">随机展示</h2>
      <div class="grid grid--masonry" id="world-masonry"></div>
    </section>
  `;
  Utils.renderMasonryGrid('world-masonry', allWorldLiqs);
}

export function renderContinent(main, id) {
  const cont = Utils.getContinent(id);
  if (!cont) { main.innerHTML = '<div class="empty"><h2>大洲未找到</h2></div>'; return; }

  const countries = cont.countries.map(cid => {
    const c = Utils.getCountry(cid);
    if (!c) return null;
    const count = c.hasProvinces ? store.liquors.filter(l => Utils.isChinaLiquor(l)).length : Utils.getLiquorsByCountry(cid).length;
    return { id: c.id, name: c.name, nameEn: c.nameEn, count, icon: c.hasProvinces ? '🏮' : (c.flag || '🌍'), hasProvinces: c.hasProvinces };
  }).filter(Boolean);

  const liqs = Utils.shuffle(Utils.getLiquorsByContinent(id));

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${cont.name} <span class="page-header__sub">${cont.nameEn}</span></h1>
      <p class="page-header__count">${countries.length} 个国家 · ${liqs.length} 款酒</p>
    </div>
    <section>
      <h2 class="section__title">国家</h2>
      <div class="grid grid--cards">${countries.map(c => Utils.geoCard(c, c.count, c.hasProvinces ? 'china' : 'country', '')).join('')}</div>
    </section>
    <section>
      <h2 class="section__title">随机展示</h2>
      <div class="grid grid--masonry" id="cont-masonry"></div>
    </section>
  `;
  Utils.renderMasonryGrid('cont-masonry', liqs);
}

export function renderCountry(main, id) {
  const country = Utils.getCountry(id);
  if (!country) { main.innerHTML = '<div class="empty"><h2>国家未找到</h2></div>'; return; }
  if (country.hasProvinces) { window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'china' } })); return; }

  const liqs = Utils.shuffle(Utils.getLiquorsByCountry(id));
  const regions = country.regions ? [...new Set(liqs.map(l => l.region).filter(Boolean))] : [];
  const hasCats = [...new Set(liqs.map(l => l.category))];

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${country.name} <span class="page-header__sub">${country.nameEn}</span></h1>
      <p class="page-header__count">${regions.length} 个产区 · ${liqs.length} 款酒</p>
    </div>
    ${regions.length > 0 ? `
    <section>
      <h2 class="section__title">产区</h2>
      <div class="grid grid--cards">${regions.map(r => {
        const count = liqs.filter(l => l.region === r).length;
        const gid = encodeURIComponent(r);
        return Utils.geoCard({ id: gid, name: r, nameEn: '', count, icon: '🍇' }, count, 'city', 'parent=' + country.id);
      }).join('')}</div>
    </section>` : ''}
    <section>
      <h2 class="section__title">酒品种类</h2>
      <div class="grid grid--category">
        ${hasCats.map(cid => {
          const cat = Utils.getCategoryMeta(cid);
          const count = liqs.filter(l => l.category === cid).length;
          return cat ? Utils.categoryCard(cat, count) : '';
        }).join('')}
      </div>
    </section>
    <section>
      <h2 class="section__title">全部酒品</h2>
      <div class="grid grid--masonry" id="country-masonry"></div>
    </section>
  `;
  Utils.renderMasonryGrid('country-masonry', liqs);
}