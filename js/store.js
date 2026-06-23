class Store {
  constructor() {
    this._liquors = [];
    this._pubs = [];
    this._continentData = [];
    this._countryData = [];
    this._chinaProvinceData = [];
    this._winePoetry = [];
    this._categoryMeta = [];
    this._tagDefinitions = {};
    this._tagCategories = {};
    this._cityNameMap = {};
  }

  get liquors() { return this._liquors; }
  get pubs() { return this._pubs; }
  get continentData() { return this._continentData; }
  get countryData() { return this._countryData; }
  get chinaProvinceData() { return this._chinaProvinceData; }
  get winePoetry() { return this._winePoetry; }
  get categoryMeta() { return this._categoryMeta; }
  get tagDefinitions() { return this._tagDefinitions; }
  get tagCategories() { return this._tagCategories; }
  get cityNameMap() { return this._cityNameMap; }

  setCoreData({ WinePoetry, CategoryMeta, TagDefinitions, TagCategories, CityNameMap }) {
    this._winePoetry = WinePoetry || [];
    this._categoryMeta = CategoryMeta || [];
    this._tagDefinitions = TagDefinitions || {};
    this._tagCategories = TagCategories || {};
    this._cityNameMap = CityNameMap || {};
  }

  setContinentData(data) { this._continentData = data || []; }
  setCountryData(data) { this._countryData = data || []; }
  setChinaProvinceData(data) { this._chinaProvinceData = data || []; }

  addLiquors(data) {
    if (!Array.isArray(data)) return;
    if (!this._liquorIds) this._liquorIds = new Set(this._liquors.map(l => l.id));
    for (const item of data) {
      if (item && item.id && !this._liquorIds.has(item.id)) {
        this._liquorIds.add(item.id);
        this._liquors.push(item);
      }
    }
  }

  addPubs(data) {
    if (!Array.isArray(data)) return;
    if (!this._pubIds) this._pubIds = new Set(this._pubs.map(p => p.id));
    for (const item of data) {
      if (item && item.id && !this._pubIds.has(item.id)) {
        this._pubIds.add(item.id);
        this._pubs.push(item);
      }
    }
  }

}

export default new Store();