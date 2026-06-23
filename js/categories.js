import Utils from './utils.js';
import store from './store.js';

export function renderCategories(main) {
  const cats = store.categoryMeta.map(c => {
    const count = Utils.getLiquorsByCategory(c.id).length;
    const subCount = (c.subcategories && c.subcategories.length) || 0;
    return { meta: c, count, subCount };
  }).filter(c => c.count > 0);

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">📋 品种分类</h1>
      <p class="page-header__sub">Categories</p>
      <p class="page-header__count">${cats.length} 个酒类品种</p>
    </div>
    <div class="grid grid--category">
      ${cats.map(c => Utils.categoryCard(c.meta, c.count, c.subCount)).join('')}
    </div>
  `;
}

export function renderCategoryPage(main, catId) {
  const catMeta = Utils.getCategoryMeta(catId);
  const liquors = Utils.shuffle(Utils.getLiquorsByCategory(catId));
  const subcategories = catMeta && catMeta.subcategories ? catMeta.subcategories : [];

  const subGridHtml = subcategories.length > 0 ? `
    <section>
      <h2 class="section__title">细分品类</h2>
      <div class="grid grid--subcategory">
        ${subcategories.map(s => {
          const cnt = Utils.getLiquorsBySubcategory(catId, s.id).length;
          return cnt > 0 ? Utils.subcategoryCard(s, catId, cnt) : '';
        }).join('')}
      </div>
    </section>
  ` : '';

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${catMeta ? catMeta.icon : ''} ${catMeta ? catMeta.name : catId}</h1>
      <p class="page-header__sub">${catMeta ? catMeta.nameEn : ''}</p>
      <p class="page-header__count">${subcategories.length} 个细分品类 · ${liquors.length} 款酒</p>
    </div>
    ${subGridHtml}
    ${liquors.length > 0 ? `<div class="grid grid--masonry" id="cat-masonry"></div>` : '<div class="empty"><span class="empty__icon">🏺</span><p>暂无该分类酒品</p></div>'}
  `;
  if (liquors.length > 0) Utils.renderMasonryGrid('cat-masonry', liquors);
}

export function renderSubcategoryPage(main, catId, subId) {
  const catMeta = Utils.getCategoryMeta(catId);
  const subMeta = Utils.getSubcategoryMeta(catId, subId);
  const liquors = Utils.shuffle(Utils.getLiquorsBySubcategory(catId, subId));

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${subMeta ? subMeta.icon + ' ' + subMeta.name : subId}</h1>
      <p class="page-header__sub">${catMeta ? catMeta.name : catId} · ${subMeta ? subMeta.nameEn : ''}</p>
      <p class="page-header__count">${liquors.length} 款酒</p>
    </div>
    ${liquors.length > 0 ? `<div class="grid grid--masonry" id="subcat-masonry"></div>` : '<div class="empty"><span class="empty__icon">🏷️</span><p>暂无该细分品类酒品</p></div>'}
  `;
  if (liquors.length > 0) Utils.renderMasonryGrid('subcat-masonry', liquors);
}