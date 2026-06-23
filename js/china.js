import Utils from './utils.js';
import store from './store.js';

export function renderChina(main, params) {
  if (params.id) {
    renderProvince(main, params.id);
    return;
  }

  const provinces = store.chinaProvinceData.map(p => {
    const count = store.liquors.filter(l => l.origin === p.id || l.region === p.id).length;
    return { ...p, count, icon: '🏮' };
  }).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

  const allChinaLiqs = Utils.shuffle(store.liquors.filter(l => Utils.isChinaLiquor(l)));

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">🏮 中国酒</h1>
      <p class="page-header__sub">Chinese Liquors</p>
      <p class="page-header__count">${provinces.length} 个省份 · ${allChinaLiqs.length} 款酒</p>
    </div>
    <section>
      <h2 class="section__title">省份</h2>
      <div class="grid grid--cards">
        ${provinces.map(p => Utils.geoCard(p, p.count, 'province', '')).join('')}
      </div>
    </section>
    <section>
      <h2 class="section__title">随机展示</h2>
      <div class="grid grid--masonry" id="china-masonry"></div>
    </section>
  `;
  Utils.renderMasonryGrid('china-masonry', allChinaLiqs);
}

export function renderProvince(main, id) {
  const prov = Utils.getChinaProvince(id);
  const liqs = Utils.shuffle(store.liquors.filter(l => l.origin === id || l.region === id));

  if (liqs.length === 0) {
    main.innerHTML = '<div class="empty"><span class="empty__icon">🏯</span><h2>暂无数据</h2></div>';
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
    <div class="page-header">
      <h1 class="page-header__title">${prov ? prov.name : id} <span class="page-header__sub">${prov ? prov.nameEn || '' : ''}</span></h1>
      <p class="page-header__count">${cities.length} 个城市 · ${liqs.length} 款酒</p>
    </div>
    ${cities.length > 0 ? `
    <section>
      <h2 class="section__title">城市</h2>
      <div class="grid grid--cards">${cities.map(c =>
        Utils.geoCard({ id: c.id, name: c.name, nameEn: '', count: c.count, icon: '🏘️' }, c.count, 'city', 'parent=' + id)
      ).join('')}</div>
    </section>` : ''}
    <section>
      <h2 class="section__title">全部酒品</h2>
      <div class="grid grid--masonry" id="prov-masonry"></div>
    </section>
  `;
  Utils.renderMasonryGrid('prov-masonry', liqs);
}

export function renderCity(main, cityName, parentId) {
  const cnCityName = Utils.getCityName(cityName);
  const prov = Utils.getChinaProvince(parentId);
  const liqs = Utils.shuffle(store.liquors.filter(l => {
    const dist = (l.district || '');
    const regionMatch = (l.region === parentId) || (l.origin === parentId);
    if (prov) {
      return regionMatch && dist.includes(cnCityName);
    }
    return (l.region === cityName || dist.includes(cityName)) && (l.origin === parentId || l.region === parentId);
  }));

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${cnCityName}</h1>
      <p class="page-header__count">${liqs.length} 款酒</p>
    </div>
    ${liqs.length > 0 ? '<div class="grid grid--masonry" id="city-masonry"></div>' : '<div class="empty"><span class="empty__icon">🏘️</span><p>暂无该城市酒品</p></div>'}
  `;
  if (liqs.length > 0) Utils.renderMasonryGrid('city-masonry', liqs);
}