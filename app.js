(function () {
  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }

  function loadScriptsParallel(scripts) {
    return Promise.all(scripts.map(s => loadScript(s)));
  }

  async function initApp() {
    try {
      await loadScript('data/index.js');
    } catch (e) { console.warn('data/index.js load failed'); }

    const worldScripts = [
      'data/world/continents.js',
      'data/world/countries.js',
      'data/world/france.js', 'data/world/italy.js', 'data/world/japan.js',
      'data/world/uk.js', 'data/world/usa.js', 'data/world/germany.js',
      'data/world/mexico.js', 'data/world/russia.js', 'data/world/korea.js',
      'data/world/spain.js', 'data/world/portugal.js', 'data/world/ireland.js',
      'data/world/brazil.js', 'data/world/australia.js', 'data/world/cuba.js',
      'data/world/belgium.js', 'data/world/netherlands.js', 'data/world/greece.js',
      'data/world/poland.js', 'data/world/hungary.js'
    ];

    const chinaScripts = [
      'data/china/china_index.js',
      'data/china/guizhou.js', 'data/china/sichuan.js', 'data/china/shanxi.js',
      'data/china/zhejiang.js', 'data/china/shandong.js', 'data/china/jiangsu.js',
      'data/china/beijing.js', 'data/china/taiwan.js', 'data/china/anhui.js',
      'data/china/hubei.js', 'data/china/henan.js', 'data/china/shaanxi.js',
      'data/china/guangdong.js', 'data/china/guangxi.js', 'data/china/xinjiang.js',
      'data/china/yunnan.js', 'data/china/neimenggu.js', 'data/china/heilongjiang.js',
      'data/china/hebei.js', 'data/china/hunan.js'
    ];

    const pubScripts = [
      'data/pub/ireland.js',
      'data/pub/uk.js',
      'data/pub/france.js',
      'data/pub/germany.js',
      'data/pub/italy.js',
      'data/pub/belgium.js',
      'data/pub/spain.js',
      'data/pub/portugal.js',
      'data/pub/austria.js',
      'data/pub/usa.js',
      'data/pub/netherlands.js',
      'data/pub/czech.js',
      'data/pub/hungary.js',
      'data/pub/switzerland.js',
      'data/pub/japan.js',
      'data/pub/russia.js',
      'data/pub/scotland.js',
      'data/pub/sweden.js',
      'data/pub/korea.js',
      'data/pub/thailand.js',
      'data/pub/india.js',
      'data/pub/vietnam.js',
      'data/pub/china.js',
      'data/pub/south_africa.js',
      'data/pub/argentina.js',
      'data/pub/australia.js',
      'data/pub/brazil.js',
      'data/pub/chile.js',
      'data/pub/morocco.js',
      'data/pub/mexico.js',
      'data/pub/canada.js',
      'data/pub/new_zealand.js'
    ];

    await loadScriptsParallel([...worldScripts, ...chinaScripts, ...pubScripts]);

    Object.keys(window.LiquorData || {}).forEach(key => {
      if (key.startsWith('_')) return;
      const items = window.LiquorData[key];
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (item && item.id && !AllLiquors.find(l => l.id === item.id)) {
            AllLiquors.push(item);
          }
        });
      }
    });

    Object.keys(window.PubData || {}).forEach(key => {
      if (key.startsWith('_')) return;
      const items = window.PubData[key];
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (item && item.id) {
            AllPubs.push(item);
          }
        });
      }
    });

    AllLiquors.forEach(liq => {
      const c = (window.CountryData || []).find(x => x.id === liq.origin);
      const prov = (window.ChinaProvinceData || []).find(x => x.id === liq.region);
      if (c) {
        liq._continent = c.continent;
        liq._country = c.id;
        liq._countryName = c.name;
      }
      if (prov) {
        liq._province = prov.id;
        liq._provinceName = prov.name;
      }
    });

    AllPubs.forEach(pub => {
      const c = (window.CountryData || []).find(x => x.id === pub.country);
      if (c) {
        pub._continent = c.continent;
        pub._countryName = c.name;
      }
      if (pub.country === 'china') {
        const pubCityMap = {
          '成都': 'sichuan', '绍兴': 'zhejiang', '上海': 'shanghai',
          '广州': 'guangdong', '汾阳': 'shanxi', '北京': 'beijing'
        };
        const pId = pubCityMap[pub.city];
        const p = (window.ChinaProvinceData || []).find(x => x.id === pId);
        if (p) {
          pub._province = p.id;
          pub._provinceName = p.name;
        }
      }
    });

    const coreModules = ['js/utils.js', 'js/theme.js', 'js/components.js', 'js/search.js', 'js/router.js'];
    for (const mod of coreModules) {
      await loadScript(mod);
    }

    Theme.init();
    Search.init();
    Router.init();

    document.getElementById('theme-toggle').addEventListener('click', () => {
      Theme.toggle();
    });
  }

  initApp().catch(err => {
    console.error('App init error:', err);
    document.getElementById('main-content').innerHTML =
      '<div class="empty-state"><span class="empty-state-icon">🏺</span><h2>加载中...</h2><p>请稍候，正在为您探寻美酒佳酿与传奇酒馆</p></div>';
  });
})();