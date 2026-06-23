import Utils from './utils.js';

// 视图加载器映射：page → import() 懒加载
const viewLoaders = {
  home:        () => import('./home.js'),
  china:       () => import('./china.js'),
  province:    () => import('./china.js'),
  city:        () => import('./china.js'),
  world:       () => import('./world.js'),
  continent:   () => import('./world.js'),
  country:     () => import('./world.js'),
  categories:  () => import('./categories.js'),
  category:    () => import('./categories.js'),
  subcategory: () => import('./categories.js'),
  liquor:      () => import('./liquor.js'),
  pub:         () => import('./pub.js'),
  tags:        () => import('./tags.js'),
  tag:         () => import('./tags.js'),
  search:      () => import('./search.js'),
};

// 模块缓存：首次加载后缓存，后续 route 切换直接复用
const viewCache = new Map();

// 路由分发表：page → [rendererName, argKeys]
const routeDispatch = {
  home:        ['render', ['main']],
  china:       ['renderChina', ['main', 'params']],
  province:    ['renderProvince', ['main', 'id']],
  city:        ['renderCity', ['main', 'id', 'parent']],
  world:       ['renderWorld', ['main']],
  continent:   ['renderContinent', ['main', 'id']],
  country:     ['renderCountry', ['main', 'id']],
  categories:  ['renderCategories', ['main']],
  category:    ['renderCategoryPage', ['main', 'id']],
  subcategory: ['renderSubcategoryPage', ['main', 'category', 'id']],
  liquor:      ['render', ['main', 'params']],
  pub:         ['render', ['main', 'params']],
  tags:        ['renderTagsPage', ['main']],
  tag:         ['renderTagPage', ['main', 'id']],
  search:      ['render', ['main', 'params']],
};

const Router = {
  currentParams: {},
  init() {
    // 兼容旧 hash 路由：自动跳转到查询字符串路由
    if (window.location.hash && window.location.hash.startsWith('#?')) {
      const qs = window.location.hash.substring(2);
      history.replaceState(null, '', '?' + qs);
    }

    // 首次加载：如果没有查询参数，默认跳转到首页
    if (!window.location.search) {
      history.replaceState(null, '', '?page=home');
    }

    // 监听 popstate（浏览器前进/后退）
    window.addEventListener('popstate', () => this.handleRoute());

    // 全局链接拦截：阻止查询字符串链接的完整页面刷新
    document.addEventListener('click', (e) => {
      // 优先处理 data-route 属性（用于卡片内的 span 子元素）
      const routeEl = e.target.closest('[data-route]');
      if (routeEl) {
        e.preventDefault();
        e.stopPropagation();
        const href = routeEl.getAttribute('data-route');
        if (href && href.startsWith('?')) {
          const url = new URL(href, window.location.origin);
          history.pushState(null, '', url.pathname + url.search);
          this.handleRoute();
        }
        return;
      }

      const a = e.target.closest('a');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href || !href.startsWith('?')) return;

      // 排除外部链接和下载链接
      if (a.target === '_blank' || a.download || a.rel === 'external') return;

      e.preventDefault();
      const url = new URL(href, window.location.origin);
      history.pushState(null, '', url.pathname + url.search);
      this.handleRoute();
    });

    // 移动端菜单
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
      navLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav__link')) {
          navLinks.classList.remove('open');
        }
      });
    }

    // 开始渲染
    this.handleRoute();
  },

  /** 编程式导航 */
  navigate(page, id, extra = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    if (id) params.set('id', id);
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    history.pushState(null, '', '?' + params.toString());
    this.handleRoute();
  },

  /** 解析 URL 查询参数 */
  parseParams() {
    const params = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      params[k] = decodeURIComponent(v);
    });
    if (!params.page) params.page = 'home';
    return params;
  },

  /** 路由处理入口 */
  async handleRoute() {
    const params = this.parseParams();
    this.currentParams = params;

    const main = document.getElementById('main-content');
    if (!main) return;

    const page = params.page;

    // 动态加载视图模块
    const loader = viewLoaders[page];
    if (!loader) {
      main.innerHTML = '<div class="empty"><span class="empty__icon">🏺</span><h2>页面未找到</h2><p>请检查链接是否正确</p></div>';
      this.renderBreadcrumbs(params);
      window.scrollTo(0, 0);
      return;
    }

    let viewModule = viewCache.get(page);
    if (!viewModule) {
      try {
        viewModule = await loader();
        viewCache.set(page, viewModule);
      } catch (err) {
        console.error('Failed to load view module:', page, err);
        main.innerHTML = '<div class="empty"><span class="empty__icon">🏺</span><h2>加载失败</h2><p>请刷新页面重试</p></div>';
        return;
      }
    }

    // 路由分发表调度
    const dispatch = routeDispatch[page];
    if (dispatch) {
      const [fnName, argKeys] = dispatch;
      const args = argKeys.map(k => {
        if (k === 'main') return main;
        if (k === 'params') return params;
        return params[k];
      });
      viewModule[fnName](...args);
    } else {
      main.innerHTML = '<div class="empty"><span class="empty__icon">🏺</span><h2>页面未找到</h2><p>请检查链接是否正确</p></div>';
    }

    this.renderBreadcrumbs(params);
    window.scrollTo(0, 0);
  },

  /** 渲染面包屑导航 */
  renderBreadcrumbs(params) {
    const container = document.getElementById('breadcrumb');
    if (!container) return;
    const crumbs = Utils.getBreadcrumbs(params);
    if (crumbs.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = crumbs.map((c, i) => {
      if (c.href) {
        return `<a href="${c.href}" class="breadcrumb__link">${c.label}</a>`;
      }
      return `<span class="breadcrumb__current">${c.label}</span>`;
    }).join('<span class="breadcrumb__sep">›</span>');
  }
};

export default Router;