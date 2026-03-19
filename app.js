const PRODUCT_ICONS = {
  default: '📦',
  laptop: '💻',
  phone: '📱',
  iphone: '📱',
  earbuds: '🎧',
  headphones: '🎧',
  tablet: '📱',
  watch: '⌚',
  camera: '📷',
  keyboard: '⌨️',
  mouse: '🖱️',
};

function getProductIcon(name) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(PRODUCT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return PRODUCT_ICONS.default;
}

fetch("http://localhost:3000/products")
.then(res => res.json())
.then(data => {
  const container = document.getElementById("products");
  if (!container) return;

  data.forEach((product, i) => {
    const div = document.createElement("div");
    div.className = "product-card fade-up";
    div.style.animationDelay = `${i * 0.08}s`;

    const icon = getProductIcon(product.name);
    const nameSafe = product.name.replace(/'/g, "\\'");

    div.innerHTML = `
      <div class="product-image-placeholder">${icon}</div>
      <div class="product-info">
        <div class="product-category">Campus Essential</div>
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description || 'Premium quality product for your daily needs.'}</div>
        <div class="product-footer">
          <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">
            + Add to Cart
          </button>
        </div>
      </div>
    `;

    // Safe event listener instead of inline onclick
    div.querySelector('.add-to-cart').addEventListener('click', () => {
      addToCart(product.name, product.price);
    });

    container.appendChild(div);
  });
})
.catch(err => {
  console.error("Error fetching products:", err);
  const container = document.getElementById("products");
  if (container) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size:3rem; margin-bottom:16px;">🔌</div>
        <p style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Backend not connected</p>
        <p style="font-size:0.9rem;">Start your backend server at <code style="color:var(--primary);">localhost:3000</code> to load products.</p>
      </div>
    `;
  }
});
