const Search = {
  init() {
    const input = document.getElementById('search-input');
    if (!input) return;

    const handleSearch = Utils.debounce((value) => {
      if (value.trim()) {
        Router.navigate('search?q=' + encodeURIComponent(value.trim()));
      }
    }, 400);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearch(e.target.value);
      }
    });

    const btn = document.getElementById('search-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        handleSearch(input.value);
      });
    }
  }
};