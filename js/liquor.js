import Utils from './utils.js';

export function render(main, params) {
  const id = params.id;
  const liq = Utils.getLiquorById(id);
  if (!liq) { main.innerHTML = '<div class="empty"><span class="empty__icon">🏺</span><h2>酒品未找到</h2></div>'; return; }

  const catMeta = Utils.getCategoryMeta(liq.category);
  const country = Utils.getCountry(liq.origin);
  const isChina = country && country.hasProvinces;
  const prov = isChina ? Utils.getChinaProvince(liq.region) : null;
  const originName = isChina ? '中国' : (country ? country.name : liq.origin);
  const regionName = prov ? prov.name : (liq.region || '');
  const subMeta = Utils.getSubcategoryMeta(liq.category, liq.subcategory);
  const subName = subMeta ? subMeta.name : (liq.subcategory ? Utils.getSubcategoryName(liq.category, liq.subcategory) : '');

  const tagsHtml = (liq.tags || []).map(t =>
    `<a href="?page=tag&id=${encodeURIComponent(t)}" class="tag tag--badge">${Utils.getTagName(t)}</a>`
  ).join('');

  main.innerHTML = `
    <div class="detail detail--liquor">
      <div class="detail__header">
        <div class="detail__category" style="background:${catMeta ? catMeta.color : '#6a6a6a'}">${catMeta ? catMeta.icon + ' ' + catMeta.name : liq.category}</div>
        <h1 class="detail__title">${liq.name}</h1>
        <p class="detail__ename">${liq.nameEn || ''}</p>
        <div class="detail__meta">
          <span class="detail__meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${isChina ? `
              <a href="?page=china" style="color:var(--accent);font-weight:600">${originName}</a>
              ${regionName ? ' · <a href="?page=province&id=' + liq.region + '" style="color:var(--accent);font-weight:600">' + regionName + '</a>' : ''}
              ${liq.district ? ' · <a href="?page=city&id=' + encodeURIComponent(liq.district) + '&parent=' + liq.region + '" style="color:var(--accent);font-weight:600">' + liq.district + '</a>' : ''}
            ` : `
              <a href="?page=country&id=${liq.origin}" style="color:var(--accent);font-weight:600">${originName}</a>
              ${regionName ? ' · <a href="?page=city&id=' + encodeURIComponent(liq.region) + '&parent=' + liq.origin + '" style="color:var(--accent);font-weight:600">' + regionName + '</a>' : ''}
              ${liq.district ? ' · ' + liq.district : ''}
            `}
          </span>
          <span class="detail__alcohol">${liq.alcohol || ''}</span>
        </div>
        <div class="detail__tags">${tagsHtml}</div>
      </div>

      <div class="detail__stats">
        <div class="detail__stat">
          <span class="detail__stat-icon">🏺</span>
          <span class="detail__stat-value">${catMeta ? catMeta.name : ''}</span>
          <span class="detail__stat-label">酒种分类</span>
        </div>
        <div class="detail__stat">
          <span class="detail__stat-icon">🔬</span>
          <span class="detail__stat-value">${subName || '—'}</span>
          <span class="detail__stat-label">细分品类</span>
        </div>
        <div class="detail__stat">
          <span class="detail__stat-icon">📍</span>
          <span class="detail__stat-value">${originName}</span>
          <span class="detail__stat-label">产地</span>
        </div>
        <div class="detail__stat">
          <span class="detail__stat-icon">🌡️</span>
          <span class="detail__stat-value">${liq.alcohol || 'N/A'}</span>
          <span class="detail__stat-label">酒精度</span>
        </div>
        <div class="detail__stat">
          <span class="detail__stat-icon">🏷️</span>
          <span class="detail__stat-value">${(liq.tags || []).length}</span>
          <span class="detail__stat-label">标签</span>
        </div>
      </div>

      <section class="detail__section">
        <h2 class="detail__section-title">📝 特色介绍</h2>
        <div class="desc">
          <h3 class="desc__label">🏆 出名原因</h3>
          <p>${Array.isArray(liq.features) ? liq.features.join('，') : liq.features}</p>
        </div>
        <div class="desc">
          <h3 class="desc__label">✨ 吸引人之处</h3>
          <p>${liq.description}</p>
        </div>
      </section>

      <section class="detail__section">
        <h2 class="detail__section-title">🔬 专业分析</h2>
        <div class="desc">
          <h3 class="desc__label">📜 历史背景</h3>
          <p>${liq.history}</p>
        </div>
        <div class="desc">
          <h3 class="desc__label">🧪 专业品鉴分析</h3>
          <p>${liq.analysis}</p>
        </div>
      </section>

      <div class="disclaimer">⚠️ 免责声明：内容整理自公开信息，不保证准确完整，仅供学习参考，不构成任何建议。</div>
    </div>
  `;
}