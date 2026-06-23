import Utils from './utils.js';
import store from './store.js';

export function renderTagsPage(main) {
  const tags = Utils.getAllTags();
  const tagCategories = store.tagCategories || {};
  const tagCountMap = {};
  tags.forEach(t => { tagCountMap[t.name] = t.count; });

  const categoryOrder = ['flavor', 'craft', 'occasion', 'culture', 'ingredient', 'texture', 'body', 'brand'];
  let sectionsHtml = '';

  categoryOrder.forEach(catKey => {
    const cat = tagCategories[catKey];
    if (!cat || !cat.tags || cat.tags.length === 0) return;
    const catTags = cat.tags
      .filter(tagId => tagCountMap[tagId] && tagCountMap[tagId] > 0)
      .sort((a, b) => (tagCountMap[b] || 0) - (tagCountMap[a] || 0));
    if (catTags.length === 0) return;

    sectionsHtml += `
      <section class="tag-category-section">
        <h2 class="section__title">${cat.icon} ${cat.name}</h2>
        <div class="tag-cloud">
          ${catTags.map(tagId => `
            <a href="?page=tag&id=${encodeURIComponent(tagId)}" class="tag-cloud__item" style="font-size:${Math.max(0.85, Math.min(1.8, 0.85 + (tagCountMap[tagId] || 1) * 0.15))}rem">
              ${Utils.getTagName(tagId)}
              <span class="tag-cloud__count">${tagCountMap[tagId] || 0}</span>
            </a>
          `).join('')}
        </div>
      </section>
    `;
  });

  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">🏷️ 标签汇聚</h1>
      <p class="page-header__count">${tags.length} 个标签</p>
    </div>
    ${sectionsHtml}
  `;
}

export function renderTagPage(main, tag) {
  const liquors = Utils.shuffle(Utils.getLiquorsByTag(tag));
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">标签: ${Utils.getTagName(tag)}</h1>
      <p class="page-header__count">${liquors.length} 款酒</p>
    </div>
    ${liquors.length > 0 ? `<div class="grid grid--masonry" id="tag-masonry"></div>` : '<div class="empty"><span class="empty__icon">🏷️</span><p>暂无该标签酒品</p></div>'}
  `;
  if (liquors.length > 0) Utils.renderMasonryGrid('tag-masonry', liquors);
}