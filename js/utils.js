const Utils = {
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  getCategoryMeta(id) {
    return CategoryMeta.find(c => c.id === id) || null;
  },

  getCategoryColor(id) {
    const meta = this.getCategoryMeta(id);
    return meta ? meta.color : '#6a6a6a';
  },

  getCategoryName(id) {
    const meta = this.getCategoryMeta(id);
    return meta ? meta.name : id;
  },

  getContinent(id) {
    return (window.ContinentData || []).find(c => c.id === id);
  },

  getCountry(id) {
    return (window.CountryData || []).find(c => c.id === id);
  },

  getChinaProvince(id) {
    return (window.ChinaProvinceData || []).find(p => p.id === id);
  },

  getTagName(id) {
    return TagDefinitions[id] || id;
  },

  getLiquorById(id) {
    return AllLiquors.find(l => l.id === id);
  },

  getLiquorsByCategory(catId) {
    return AllLiquors.filter(l => l.category === catId);
  },

  getLiquorsByOrigin(originId) {
    return AllLiquors.filter(l => l.origin === originId);
  },

  getLiquorsByRegion(regionId) {
    return AllLiquors.filter(l => l.region === regionId);
  },

  getLiquorsByDistrict(districtId) {
    return AllLiquors.filter(l => l.district === districtId);
  },

  getLiquorsByContinent(continentId) {
    const cont = this.getContinent(continentId);
    if (!cont) return [];
    return AllLiquors.filter(l => {
      if (cont.countries.includes(l.origin)) return true;
      if (l.origin === 'china' && cont.id === 'asia') return true;
      return CountryData.some(c => c.continent === continentId && c.id === l.origin);
    });
  },

  getLiquorsByTag(tag) {
    return AllLiquors.filter(l => l.tags && l.tags.includes(tag));
  },

  getLiquorsByCountry(countryId) {
    const country = this.getCountry(countryId);
    if (!country) return [];
    return AllLiquors.filter(l => {
      if (l.origin === countryId) return true;
      if (country.regions && country.regions.includes(l.region)) return true;
      return false;
    });
  },

  getAllTags() {
    const tagMap = {};
    AllLiquors.forEach(l => {
      if (l.tags) {
        l.tags.forEach(t => {
          if (!tagMap[t]) tagMap[t] = 0;
          tagMap[t]++;
        });
      }
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  },

  getPubById(id) {
    return AllPubs.find(p => p.id === id);
  },

  getPubsByContinent(continentId) {
    const cont = this.getContinent(continentId);
    if (!cont) return [];
    return AllPubs.filter(p => {
      const country = this.getCountry(p.country);
      if (!country) return false;
      return country.continent === continentId;
    });
  },

  getPubsByContinentCountries(continentId) {
    const cont = this.getContinent(continentId);
    if (!cont) return [];
    const countries = {};
    this.getPubsByContinent(continentId).forEach(pub => {
      const countryId = pub.country;
      if (!countries[countryId]) countries[countryId] = [];
      countries[countryId].push(pub);
    });
    return countries;
  },

  getPubsByCountry(countryId) {
    return AllPubs.filter(p => p.country === countryId);
  },

  getPubsByCity(countryId, cityName) {
    return AllPubs.filter(p => p.country === countryId && p.city === cityName);
  },

  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  searchLiquors(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return AllLiquors.filter(l => {
      return l.name.toLowerCase().includes(q) ||
        (l.nameEn && l.nameEn.toLowerCase().includes(q)) ||
        l.description.toLowerCase().includes(q) ||
        l.features.toLowerCase().includes(q) ||
        (l.tags && l.tags.some(t => t.toLowerCase().includes(q) || (this.getTagName(t) || '').includes(q))) ||
        (l.region && l.region.toLowerCase().includes(q)) ||
        (l.district && l.district.toLowerCase().includes(q)) ||
        (this.getCategoryName(l.category) || '').includes(q) ||
        (this.getCountry(l.origin) && (this.getCountry(l.origin).name || '').includes(q));
    });
  },

  searchPubs(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return AllPubs.filter(p => {
      return p.name.toLowerCase().includes(q) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        p.history.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.specialties && p.specialties.some(s => s.toLowerCase().includes(q)));
    });
  },

  getBreadcrumbs(path) {
    const crumbs = [{ label: '首页', href: '#/' }];
    const qIndex = path.indexOf('?');
    const cleanPath = qIndex >= 0 ? path.substring(0, qIndex) : path;
    const parts = cleanPath.split('/').filter(Boolean);

    if (path === '/' || parts.length === 0) {
      return crumbs;
    }

    if (parts[0] === 'world') {
      crumbs.push({ label: '世界', href: null });
    } else if (parts[0] === 'categories') {
      crumbs.push({ label: '分类', href: null });
    } else if (parts[0] === 'category' && parts[1]) {
      crumbs.push({ label: '分类', href: '#/categories' });
      crumbs.push({ label: this.getCategoryName(parts[1]), href: null });
    } else if (parts[0] === 'continent' && parts[1]) {
      const c = this.getContinent(parts[1]);
      crumbs.push({ label: '世界', href: '#/world' });
      if (c) crumbs.push({ label: c.name, href: null });
    } else if (parts[0] === 'country' && parts[1]) {
      const country = this.getCountry(parts[1]);
      if (country) {
        const cont = this.getContinent(country.continent);
        crumbs.push({ label: '世界', href: '#/world' });
        if (cont) crumbs.push({ label: cont.name, href: '#/continent/' + cont.id });
        crumbs.push({ label: country.name, href: null });
      }
    } else if (parts[0] === 'china') {
      if (parts[1]) {
        const prov = this.getChinaProvince(parts[1]);
        crumbs.push({ label: '世界', href: '#/world' });
        crumbs.push({ label: '亚洲', href: '#/continent/asia' });
        crumbs.push({ label: '中国', href: '#/china' });
        if (prov) crumbs.push({ label: prov.name, href: null });
      } else {
        crumbs.push({ label: '世界', href: '#/world' });
        crumbs.push({ label: '亚洲', href: '#/continent/asia' });
        crumbs.push({ label: '中国', href: null });
      }
    } else if (parts[0] === 'province' && parts[1]) {
      const prov = this.getChinaProvince(parts[1]);
      crumbs.push({ label: '世界', href: '#/world' });
      crumbs.push({ label: '亚洲', href: '#/continent/asia' });
      crumbs.push({ label: '中国', href: '#/china' });
      if (prov) crumbs.push({ label: prov.name, href: null });
    } else if (parts[0] === 'city' && parts[1]) {
      const parentId = parts[2];
      const prov = this.getChinaProvince(parentId);
      const country = this.getCountry(parentId);
      if (prov) {
        crumbs.push({ label: '世界', href: '#/world' });
        crumbs.push({ label: '亚洲', href: '#/continent/asia' });
        crumbs.push({ label: '中国', href: '#/china' });
        crumbs.push({ label: prov.name, href: '#/province/' + prov.id });
        crumbs.push({ label: this.getCityName(decodeURIComponent(parts[1])), href: null });
      } else if (country) {
        const cont = this.getContinent(country.continent);
        crumbs.push({ label: '世界', href: '#/world' });
        if (cont) crumbs.push({ label: cont.name, href: '#/continent/' + cont.id });
        crumbs.push({ label: country.name, href: '#/country/' + country.id });
        crumbs.push({ label: decodeURIComponent(parts[1]), href: null });
      } else {
        crumbs.push({ label: decodeURIComponent(parts[1]), href: null });
      }
    } else if (parts[0] === 'district' && parts[1]) {
      crumbs.push({ label: decodeURIComponent(parts[1]), href: null });
    } else if (parts[0] === 'liquor' && parts[1]) {
      const liq = this.getLiquorById(parts[1]);
      if (liq) {
        const prov = this.getChinaProvince(liq.region);
        const country = this.getCountry(liq.origin);
        if (prov) {
          crumbs.push({ label: '世界', href: '#/world' });
          crumbs.push({ label: '亚洲', href: '#/continent/asia' });
          crumbs.push({ label: '中国', href: '#/china' });
          crumbs.push({ label: prov.name, href: '#/province/' + prov.id });
          if (liq.district) {
            const cityPinyin = this.findCityByDistrict(liq.district, prov.id);
            crumbs.push({ label: liq.district, href: cityPinyin ? '#/city/' + cityPinyin + '/' + prov.id : null });
          }
          crumbs.push({ label: liq.name, href: null });
        } else if (country && !country.hasProvinces) {
          crumbs.push({ label: '世界', href: '#/world' });
          const cont = this.getContinent(country.continent);
          if (cont) crumbs.push({ label: cont.name, href: '#/continent/' + cont.id });
          crumbs.push({ label: country.name, href: '#/country/' + country.id });
          if (liq.region) {
            crumbs.push({ label: liq.region, href: '#/city/' + encodeURIComponent(liq.region) + '/' + country.id });
          }
          if (liq.district) {
            crumbs.push({ label: liq.district, href: null });
          }
          crumbs.push({ label: liq.name, href: null });
        } else if (country && country.hasProvinces) {
          crumbs.push({ label: '世界', href: '#/world' });
          crumbs.push({ label: '亚洲', href: '#/continent/asia' });
          crumbs.push({ label: '中国', href: '#/china' });
          if (liq.region) {
            const p = this.getChinaProvince(liq.region);
            crumbs.push({ label: p ? p.name : liq.region, href: '#/province/' + liq.region });
          }
          if (liq.district) {
            crumbs.push({ label: liq.district, href: null });
          }
          crumbs.push({ label: liq.name, href: null });
        } else {
          if (liq.region) crumbs.push({ label: liq.region, href: null });
          crumbs.push({ label: liq.name, href: null });
        }
      }
    } else if (parts[0] === 'tags') {
      crumbs.push({ label: '标签汇聚', href: null });
    } else if (parts[0] === 'tag' && parts[1]) {
      crumbs.push({ label: '标签汇聚', href: '#/tags' });
      crumbs.push({ label: this.getTagName(decodeURIComponent(parts[1])), href: null });
    } else if (parts[0] === 'pub') {
      if (parts[1] === 'continent' && parts[2]) {
        const cont = this.getContinent(parts[2]);
        crumbs.push({ label: '酒馆', href: '#/pub' });
        if (cont) crumbs.push({ label: cont.name, href: null });
      } else if (parts[1] === 'country' && parts[2]) {
        const country = this.getCountry(parts[2]);
        if (country) {
          const cont = this.getContinent(country.continent);
          crumbs.push({ label: '酒馆', href: '#/pub' });
          if (cont) crumbs.push({ label: cont.name, href: '#/pub/continent/' + cont.id });
          crumbs.push({ label: country.name, href: null });
        }
      } else if (parts[1] === 'city' && parts[2] && parts[3]) {
        const country = this.getCountry(parts[3]);
        if (country) {
          const cont = this.getContinent(country.continent);
          crumbs.push({ label: '酒馆', href: '#/pub' });
          if (cont) crumbs.push({ label: cont.name, href: '#/pub/continent/' + cont.id });
          crumbs.push({ label: country.name, href: '#/pub/country/' + country.id });
          crumbs.push({ label: decodeURIComponent(parts[2]), href: null });
        }
      } else if (parts[1]) {
        const pub = this.getPubById(parts[1]);
        crumbs.push({ label: '酒馆', href: '#/pub' });
        if (pub) {
          const country = this.getCountry(pub.country);
          if (country) {
            const cont = this.getContinent(country.continent);
            if (cont) crumbs.push({ label: cont.name, href: '#/pub/continent/' + cont.id });
            crumbs.push({ label: country.name, href: '#/pub/country/' + country.id });
          }
          crumbs.push({ label: pub.name, href: null });
        }
      } else {
        crumbs.push({ label: '酒馆', href: null });
      }
    } else if (parts[0] === 'search') {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      crumbs.push({ label: '搜索: ' + (params.get('q') || ''), href: null });
    }

    return crumbs;
  },

  getCountryRegionLabel(countryId) {
    const country = this.getCountry(countryId);
    if (country && country.hasProvinces) return '省/州';
    return '产区';
  },

  getCityName(id) {
    return (window.CityNameMap && window.CityNameMap[id]) ? window.CityNameMap[id] : id;
  },

  findCityByDistrict(district, provId) {
    const prov = this.getChinaProvince(provId);
    if (!prov || !prov.cities) return null;
    for (const pinyinCity of prov.cities) {
      const cnName = this.getCityName(pinyinCity);
      if (cnName && district.indexOf(cnName) === 0) {
        return pinyinCity;
      }
    }
    return null;
  }
};