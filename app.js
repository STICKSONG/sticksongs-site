const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('search');
const filters = document.getElementById('filters');
const empty = document.getElementById('empty');
const resultCount = document.getElementById('result-count');
let products = [];
let selectedCategory = 'All';

function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function productCard(product) {
  const hasLink = typeof product.amazonUrl === 'string' && /^https:\/\/(www\.)?amazon\./i.test(product.amazonUrl);
  const image = product.image || '';
  const price = product.price ? `<span class="product-price">${safeText(product.price)}</span>` : '<span class="product-price"></span>';
  const button = hasLink
    ? `<a class="amazon-btn" href="${safeText(product.amazonUrl)}" target="_blank" rel="sponsored nofollow noopener">VIEW ON AMAZON ↗</a>`
    : '<span class="amazon-btn disabled" title="Add your Amazon Affiliate URL in products.json">ADD AMAZON LINK</span>';
  return `<article class="product-card">
    <div class="product-image">${image ? `<img src="${safeText(image)}" alt="${safeText(product.name)}" loading="lazy" onerror="this.style.display='none'">` : ''}<span class="product-tag">${safeText(product.tag || product.category || 'Find')}</span></div>
    <div class="product-body"><div class="product-category">${safeText(product.category || 'Everyday')}</div><h3>${safeText(product.name || 'Untitled product')}</h3><p>${safeText(product.description || '')}</p><div class="product-bottom">${price}${button}</div></div>
  </article>`;
}
function render() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = products.filter(p => {
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const searchable = `${p.name || ''} ${p.description || ''} ${p.category || ''} ${p.tag || ''}`.toLowerCase();
    return categoryMatch && searchable.includes(query);
  });
  grid.innerHTML = visible.length ? visible.map(productCard).join('') : '';
  empty.classList.toggle('hidden', visible.length !== 0);
  resultCount.textContent = `${visible.length} ${visible.length === 1 ? 'find' : 'finds'}`;
}
filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;
  selectedCategory = button.dataset.category;
  filters.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  render();
});
searchInput.addEventListener('input', render);
document.getElementById('year').textContent = new Date().getFullYear();
fetch('./products.json').then(response => {
  if (!response.ok) throw new Error('Could not load products.json');
  return response.json();
}).then(data => {
  products = Array.isArray(data) ? data : [];
  render();
}).catch(() => {
  grid.innerHTML = '<p class="loading">Products could not load. Make sure products.json is uploaded next to index.html.</p>';
});
