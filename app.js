import api from './js/api.js';
import store from './js/store.js';
import Router from './js/router-core.js';
import Search from './js/search.js';

const Theme = {
  init() {
    const saved = localStorage.getItem('hejiu-theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    this.updateToggleIcon();
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('hejiu-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('hejiu-theme', 'dark');
    }
    this.updateToggleIcon();
  },
  updateToggleIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
};

async function initApp() {
  try {
    // 阶段1：加载核心元数据（4个文件，快速）
    const [core, continents, countries, chinaProvinces] = await Promise.all([
      api.loadModule('./zh/index.json'),
      api.loadModule('./zh/world/continents.json'),
      api.loadModule('./zh/world/countries.json'),
      api.loadModule('./zh/china/china_index.json')
    ]);
    store.setCoreData(core);
    store.setContinentData(continents);
    store.setCountryData(countries);
    store.setChinaProvinceData(chinaProvinces);

    // 立即渲染首页（此时可能仅有核心数据，酒品/酒馆计数为0）
    Theme.init();
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      document.documentElement.setAttribute('data-standalone', '');
    }
    Router.init();
    Search.init();
    document.getElementById('theme-toggle').addEventListener('click', () => Theme.toggle());

    // 阶段2：优先加载酒馆数据（首页"今日名馆"核心内容）
    const chinaFiles = [
      'guizhou', 'sichuan', 'shanxi', 'zhejiang', 'shandong', 'jiangsu',
      'beijing', 'taiwan', 'anhui', 'hubei', 'henan', 'shaanxi',
      'guangdong', 'guangxi', 'xinjiang', 'yunnan', 'neimenggu', 'heilongjiang',
      'hebei', 'hunan', 'liaoning', 'jiangxi', 'xizang', 'shanghai',
      'tianjin', 'chongqing', 'fujian', 'gansu', 'ningxia',
      'qinghai', 'jilin', 'hainan'
    ];
    const worldFiles = [
      'france', 'italy', 'japan', 'uk', 'usa', 'germany',
      'mexico', 'russia', 'korea', 'spain', 'portugal', 'ireland',
      'brazil', 'australia', 'cuba', 'belgium', 'netherlands', 'greece',
      'poland', 'hungary', 'argentina', 'austria', 'canada', 'chile',
      'czech', 'india', 'morocco', 'new_zealand', 'scotland',
      'south_africa', 'sweden', 'switzerland', 'thailand', 'vietnam',
      'finland', 'peru', 'ethiopia'
    ];
    const pubFiles = [
      'ireland', 'uk', 'france', 'germany', 'italy', 'belgium',
      'spain', 'portugal', 'austria', 'usa', 'netherlands', 'czech',
      'hungary', 'switzerland', 'japan', 'russia', 'scotland', 'sweden',
      'china', 'vietnam', 'thailand', 'india', 'korea', 'south_africa',
      'argentina', 'australia', 'brazil', 'chile', 'morocco', 'mexico',
      'canada', 'new_zealand', 'cuba', 'finland', 'greece', 'poland',
      'denmark', 'norway', 'turkey', 'peru', 'ethiopia', 'singapore',
      'egypt'
    ];

    // 先加载酒馆文件（43个文件，首页核心内容所需）
    const pubLoads = pubFiles.map(f =>
      api.loadModule(`./zh/pub/${f}.json`).then(data => store.addPubs(data))
    );
    await Promise.all(pubLoads);

    // 酒馆数据就绪，刷新首页（酒品统计暂为占位，但"今日名馆"已显示）
    const curPage = Router.currentParams.page;
    if (curPage === 'home') Router.handleRoute();

    // 阶段3：后台加载全部酒品数据
    const liquorLoads = [
      ...chinaFiles.map(f => api.loadModule(`./zh/china/${f}.json`).then(data => store.addLiquors(data))),
      ...worldFiles.map(f => api.loadModule(`./zh/world/${f}.json`).then(data => store.addLiquors(data)))
    ];
    await Promise.all(liquorLoads);

    // 全部数据就绪，刷新当前页
    if (['home', 'china', 'world', 'pub'].includes(Router.currentParams.page)) {
      Router.handleRoute();
    }

    // 空闲时预加载高频页面
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        import('./js/china.js');
        import('./js/world.js');
        import('./js/pub.js');
        import('./js/categories.js');
      });
    }

  } catch (err) {
    console.error('App init error:', err);
    document.getElementById('main-content').innerHTML =
      '<div class="empty"><span class="empty__icon">🏺</span><h2>加载中...</h2><p>请稍候，正在为您探寻美酒佳酿与传奇酒馆</p></div>';
  }
}

// ===== 移动端底部导航栏高亮 =====
function updateBottomNav() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 'home';
  document.querySelectorAll('.bottom-nav__item').forEach(el => {
    el.classList.toggle('bottom-nav__item--active', el.dataset.page === page);
  });
}

initApp();

// 底部导航高亮：每次主内容更新后刷新
const mainEl = document.getElementById('main-content');
if (mainEl) {
  new MutationObserver(() => updateBottomNav()).observe(mainEl, { childList: true });
}