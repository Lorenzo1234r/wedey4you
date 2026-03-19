let cart = JSON.parse(localStorage.getItem("cart")) || [];

function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    if (badge) {
        badge.innerText = cart.length;
        badge.style.display = cart.length > 0 ? "inline-block" : "none";
    }
}

async function addToCart(name, price) {
    cart.push({ name, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();

    const toast = document.createElement("div");
    toast.innerText = `✓ ${name} added to cart`;
    toast.className = "toast";
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2200);

    if (isUserLoggedIn()) {
        const token = localStorage.getItem("token");
        try {
            await fetch("http://localhost:3000/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ items: [{ name, price }] })
            });
        } catch (err) {
            console.error("Failed to sync item to database", err);
        }
    }
}

async function syncCartWithDatabase() {
    if (!isUserLoggedIn()) {
        updateCartBadge();
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:3000/cart", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const dbCart = await res.json();

        let localCart = JSON.parse(localStorage.getItem("cart")) || [];

        if (localCart.length > 0) {
            await fetch("http://localhost:3000/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ items: localCart })
            });

            const combinedRes = await fetch("http://localhost:3000/cart", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const combinedCart = await combinedRes.json();
            cart = combinedCart;
            localStorage.setItem("cart", JSON.stringify(cart));
        } else {
            cart = dbCart;
            localStorage.setItem("cart", JSON.stringify(cart));
        }

        updateCartBadge();

        if (window.location.pathname.includes('cart.html')) {
            renderCartItems();
        }

    } catch (err) {
        console.error("Failed to sync cart", err);
        updateCartBadge();
    }
}

function renderCartItems() {
    const cartDiv = document.getElementById('cart-items');
    if (!cartDiv) return;

    if (cart.length === 0) {
        cartDiv.innerHTML = `
            <div style="text-align:center; padding:70px 30px; color:var(--text-muted);">
                <div style="font-size:3.5rem; margin-bottom:20px;">🛒</div>
                <p style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Your cart is empty</p>
                <p style="font-size:0.9rem; font-weight:300;">Add some products from the store to get started.</p>
            </div>
        `;
        return;
    }

    let total = 0;
    let itemsHtml = '';

    cart.forEach((item, index) => {
        total += item.price;
        itemsHtml += `
            <div class="cart-item-row">
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-meta">Item #${index + 1}</div>
                </div>
                <span class="cart-item-price">GHS ${item.price.toLocaleString()}</span>
            </div>
        `;
    });

    cartDiv.innerHTML = `
        ${itemsHtml}
        <div class="cart-total-row">
            <div>
                <div class="cart-total-label">Order Total</div>
                <div style="font-size:0.82rem; color:var(--text-dim); margin-top:2px;">${cart.length} item${cart.length > 1 ? 's' : ''}</div>
            </div>
            <div class="cart-total-amount">GHS ${total.toLocaleString()}</div>
        </div>
    `;

    // Checkout summary panel (used on checkout page)
    const summaryDiv = document.getElementById('checkout-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            ${cart.map(item => `
                <div class="summary-item">
                    <span class="summary-item-name">${item.name}</span>
                    <span class="summary-item-price">GHS ${item.price.toLocaleString()}</span>
                </div>
            `).join('')}
            <div class="summary-total-row">
                <span class="summary-total-label">Total</span>
                <span class="summary-total-amount">GHS ${total.toLocaleString()}</span>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    syncCartWithDatabase();
});
