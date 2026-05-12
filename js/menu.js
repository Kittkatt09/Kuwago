function switchTab(name, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  const targetPane = document.getElementById('pane-' + name);
  if (targetPane) targetPane.classList.add('active');

  if (name === 'favorites') {
    renderFavorites();
  }

  const filterContainer = document.getElementById('filter-container');
  const drinksFilter = document.getElementById('category-filter-drinks');
  const foodFilter = document.getElementById('category-filter-food');

  filterCategory('all', true);
  if (drinksFilter) drinksFilter.value = 'all';
  if (foodFilter) foodFilter.value = 'all';

  if (filterContainer) {
    if (name === 'drinks') {
      filterContainer.style.display = '';
      if (drinksFilter) drinksFilter.style.display = '';
      if (foodFilter) foodFilter.style.display = 'none';
    } else if (name === 'food') {
      filterContainer.style.display = '';
      if (drinksFilter) drinksFilter.style.display = 'none';
      if (foodFilter) foodFilter.style.display = '';
    } else {
      filterContainer.style.display = 'none';
    }
  }
}

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (navbar && window.scrollY > 40) {
    navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
  } else if (navbar) {
    navbar.style.boxShadow = '';
  }
}, { passive: true });

const dealCards = document.querySelectorAll('.deal-card, .menu-category');
dealCards.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

dealCards.forEach(el => observer.observe(el));

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function getItemCleanName(nameEl) {
  if (!nameEl) return "";
  const temp = nameEl.cloneNode(true);
  const star = temp.querySelector('.menu-star');
  if (star) star.remove();
  const badge = temp.querySelector('.popular-badge, .new-badge, .special-badge');
  if (badge) badge.remove();
  return temp.textContent.trim();
}

function initMenuButtons() {
  document.querySelectorAll('.menu-item').forEach(item => {
    const nameEl = item.querySelector('.item-name');
    if (!nameEl) return;

    let itemName = getItemCleanName(nameEl);

    if (!nameEl.querySelector('.menu-star')) {
      const star = document.createElement('img');
      star.src = favorites.includes(itemName) ? 'icons/Star-Rating-Filled.svg' : 'icons/Empty-Star.svg';
      star.className = 'menu-star';
      star.alt = 'Star';
      if (favorites.includes(itemName)) {
        star.style.filter = 'drop-shadow(0 0 5px rgba(200, 134, 10, 0.4))';
      }

      star.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(itemName);
      };
      nameEl.prepend(star);
    }

    const itemData = {
      name: itemName,
      prices: []
    };

    if (!item.querySelector('.item-right')) {
      const priceGroup = item.querySelector('.item-price-group');
      if (priceGroup) {
        const prices = priceGroup.querySelectorAll('.item-price');
        const sizes = ['Owlet', 'Owl'];
        const rightDiv = document.createElement('div');
        rightDiv.className = 'item-right';

        prices.forEach((pEl, idx) => {
          const price = parseInt(pEl.textContent.trim().replace('₱', '').replace(',', ''), 10);
          const sizeName = sizes[idx] || 'Regular';
          itemData.prices.push({ size: sizeName, price: price });
          
          const col = document.createElement('div');
          col.className = 'item-price-col';
          const label = document.createElement('span');
          label.className = 'size-label';
          label.textContent = sizeName;

          const btn = document.createElement('button');
          btn.className = 'add-cart-btn';
          btn.innerHTML = '+';
          btn.onclick = (e) => {
            e.stopPropagation();
            addToCart(`${itemName} (${sizeName})`, price);
          };

          col.appendChild(label);
          col.appendChild(pEl);
          col.appendChild(btn);
          rightDiv.appendChild(col);
        });
        item.appendChild(rightDiv);
      } else {
        const priceEl = item.querySelector('.item-price');
        if (priceEl) {
          const price = parseInt(priceEl.textContent.trim().replace('₱', '').replace(',', ''), 10);
          itemData.prices.push({ size: 'Regular', price: price });
          
          const btn = document.createElement('button');
          btn.className = 'add-cart-btn';
          btn.innerHTML = '+';
          btn.onclick = (e) => {
            e.stopPropagation();
            addToCart(itemName, price);
          };

          const rightDiv = document.createElement('div');
          rightDiv.className = 'item-right';
          rightDiv.appendChild(priceEl);
          rightDiv.appendChild(btn);
          item.appendChild(rightDiv);
        }
      }
    }

    item.onclick = () => {
      openProductModal(itemData);
    };
  });

  document.querySelectorAll('.deal-card').forEach(card => {
    if (card.querySelector('.deal-add-btn')) return;
    const nameEl = card.querySelector('.deal-name');
    const priceEl = card.querySelector('.deal-price');
    if (!nameEl || !priceEl) return;

    const name = nameEl.textContent.trim();
    const price = parseInt(priceEl.textContent.trim().replace('₱', '').replace(',', ''), 10);

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary deal-add-btn';
    btn.innerHTML = 'Add to Cart';
    btn.onclick = (e) => {
      e.stopPropagation();
      addToCart(name, price);
    };
    card.appendChild(btn);
  });
}

function toggleFavorite(name) {
  const index = favorites.indexOf(name);
  const isAdding = index === -1;
  
  if (isAdding) {
    favorites.push(name);
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));

  const modalFavBtn = document.getElementById('modal-fav-btn');
  if (modalFavBtn && document.getElementById('product-modal').classList.contains('active')) {
    const modalTitle = document.getElementById('modal-product-name').textContent.trim();
    if (modalTitle === name) {
      updateModalFavUI(modalFavBtn, isAdding);
    }
  }

  document.querySelectorAll('.menu-item').forEach(item => {
    const nEl = item.querySelector('.item-name');
    if (!nEl) return;
    if (getItemCleanName(nEl) === name) {
      const star = item.querySelector('.menu-star');
      if (star) {
        star.src = isAdding ? 'icons/Star-Rating-Filled.svg' : 'icons/Empty-Star.svg';
        star.style.filter = isAdding ? 'drop-shadow(0 0 5px rgba(200, 134, 10, 0.4))' : 'none';
      }
    }
  });

  if (document.getElementById('pane-favorites').classList.contains('active')) {
    renderFavorites();
  }
}

function updateModalFavUI(btn, active) {
  if (!btn) return;
  const img = btn.querySelector('img');
  const span = btn.querySelector('span');
  if (active) {
    btn.classList.add('active');
    if (img) img.src = 'icons/Star-Rating-Filled.svg';
    if (span) span.textContent = 'Remove from Favorites';
  } else {
    btn.classList.remove('active');
    if (img) img.src = 'icons/Empty-Star.svg';
    if (span) span.textContent = 'Add to Favorites';
  }
}

function openProductModal(data) {
  const modal = document.getElementById('product-modal');
  const overlay = document.getElementById('product-overlay');
  if (!modal || !overlay) return;

  document.getElementById('modal-product-name').textContent = data.name;
  
  const favBtn = document.getElementById('modal-fav-btn');
  if (favBtn) {
    updateModalFavUI(favBtn, favorites.includes(data.name));
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(data.name);
    };
  }

  const sizeContainer = document.getElementById('modal-product-sizes');
  sizeContainer.innerHTML = '';
  data.prices.forEach(p => {
    const row = document.createElement('div');
    row.className = 'modal-size-row';
    row.innerHTML = `
      <div class="modal-size-label">${p.size}</div>
      <div class="modal-size-price">₱${p.price}</div>
      <button class="add-cart-btn" onclick="addToCart('${data.name}${p.size !== 'Regular' ? ' (' + p.size + ')' : ''}', ${p.price}); event.stopPropagation();">
        +
      </button>
    `;
    sizeContainer.appendChild(row);
  });

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  const overlay = document.getElementById('product-overlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = 'scale(1)', 150);
  }
}

function updateCartUI() {
  const container = document.getElementById('cart-items');
  const badge = document.getElementById('cart-badge');
  const totalDisplay = document.getElementById('cart-total-price');
  if (!container || !badge || !totalDisplay) return;

  container.innerHTML = '';
  let totalQty = 0;
  let totalPrice = 0;

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty-msg">Your cart is empty.</div>';
  } else {
    cart.forEach((item, index) => {
      totalQty += item.qty;
      totalPrice += item.price * item.qty;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₱${item.price}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
        </div>
      `;
      container.appendChild(div);
    });
  }
  badge.textContent = totalQty;
  totalDisplay.textContent = '₱' + totalPrice;
  localStorage.setItem('cart', JSON.stringify(cart));
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartUI();
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}

function checkout() {
  if (cart.length === 0) return alert("Your cart is empty!");
  
  // Close sidebar if open
  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar && sidebar.classList.contains('active')) {
    toggleCart();
  }

  const itemsContainer = document.getElementById('checkout-order-items');
  const totalEl = document.getElementById('checkout-total');
  const pointsEl = document.getElementById('checkout-points');
  if (!itemsContainer || !totalEl) return;

  itemsContainer.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'checkout-order-item';
    row.innerHTML = `<div class="checkout-item-left"><span class="checkout-item-qty">${item.qty}×</span><span>${item.name}</span></div><span>₱${item.price * item.qty}</span>`;
    itemsContainer.appendChild(row);
  });
  
  totalEl.textContent = '₱' + total;
  if (pointsEl) pointsEl.textContent = Math.floor(total / 10);
  
  document.getElementById('checkout-overlay').classList.add('active');
  document.getElementById('checkout-modal').classList.add('active');
}

function closeCheckout(e) {
  if (e && e.target && e.target.id !== 'checkout-overlay' && e.type === 'click' && !e.target.classList.contains('close-checkout-btn') && !e.target.classList.contains('checkout-back-btn')) return;
  
  document.getElementById('checkout-overlay').classList.remove('active');
  document.getElementById('checkout-modal').classList.remove('active');
}

function placeOrder() {
  const nameInput = document.getElementById('customer-name');
  const paymentOptions = document.getElementsByName('payment');
  const errorEl = document.getElementById('checkout-error');
  
  let selectedPayment = null;
  if (paymentOptions) {
    for (let i = 0; i < paymentOptions.length; i++) {
      if (paymentOptions[i].checked) {
        selectedPayment = paymentOptions[i].value;
        break;
      }
    }
  }

  if (nameInput && !nameInput.value.trim()) {
    if (errorEl) {
      errorEl.textContent = 'Please enter your name.';
      errorEl.style.display = 'block';
    } else {
      alert('Please enter your name.');
    }
    return;
  }

  if (!selectedPayment) {
    if (errorEl) {
      errorEl.textContent = 'Please select a payment method.';
      errorEl.style.display = 'block';
    } else {
      alert('Please select a payment method.');
    }
    return;
  }

  if (errorEl) errorEl.style.display = 'none';

  const total = parseInt(document.getElementById('checkout-total').textContent.replace('₱', ''), 10);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const orderId = Math.floor(100000 + Math.random() * 900000);
  
  const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const itemNames = cart.map(i => i.name).join(', ');
  
  orders.unshift({
    id: orderId.toString(),
    items: itemNames.length > 30 ? itemNames.substring(0, 27) + '...' : itemNames,
    date: dateStr,
    status: 'Completed',
    total: total,
    iconType: 'Coffee',
    rawItems: [...cart]
  });
  localStorage.setItem('orderHistory', JSON.stringify(orders));

  let points = parseInt(localStorage.getItem('userPoints')) || 0;
  points += Math.floor(total / 10);
  localStorage.setItem('userPoints', points);

  localStorage.setItem('cart', '[]');
  cart = [];
  updateCartUI();

  // Clear checkout form
  if (nameInput) nameInput.value = '';
  const roomInput = document.getElementById('room-delivery');
  if (roomInput) roomInput.value = '';
  if (paymentOptions) {
    for (let i = 0; i < paymentOptions.length; i++) {
      paymentOptions[i].checked = false;
    }
  }

  document.getElementById('checkout-overlay').classList.remove('active');
  document.getElementById('checkout-modal').classList.remove('active');
  document.getElementById('success-overlay').classList.add('active');
  document.getElementById('success-modal').classList.add('active');
}

function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('active');
  document.getElementById('success-modal').classList.remove('active');
}

function showSavedMethods(type) {
  const saved = JSON.parse(localStorage.getItem('savedPaymentMethods') || '[]');
  const containerId = type === 'card' ? 'card-sub-options' : 'ewallet-sub-options';
  const otherContainerId = type === 'card' ? 'ewallet-sub-options' : 'card-sub-options';
  
  const container = document.getElementById(containerId);
  const otherContainer = document.getElementById(otherContainerId);
  
  if (otherContainer) {
    otherContainer.innerHTML = '';
    otherContainer.style.display = 'none';
  }

  if (!container) return;
  container.innerHTML = '';
  
  const filtered = saved.filter(m => m.type === type);
  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding: 10px; font-size: 12px; color: var(--text-light);">No saved ${type}s found. Please add one in your account.</div>`;
  } else {
    filtered.forEach(m => {
      const div = document.createElement('div');
      div.className = 'saved-payment-item';
      div.innerHTML = `
        <input type="radio" name="saved-payment" id="saved-${m.name}">
        <label for="saved-${m.name}">
          <span>${m.name}</span>
          <small>${m.detail}</small>
        </label>
      `;
      container.appendChild(div);
    });
  }
  container.style.display = 'block';
}

function hideSavedMethods() {
  const c1 = document.getElementById('card-sub-options');
  const c2 = document.getElementById('ewallet-sub-options');
  if (c1) { c1.innerHTML = ''; c1.style.display = 'none'; }
  if (c2) { c2.innerHTML = ''; c2.style.display = 'none'; }
}

function filterCategory(category, skipTabSwitch = false) {
  const headers = document.querySelectorAll('.category-header');
  const menuCategories = document.querySelectorAll('.menu-category');

  if (category === 'all') {
    headers.forEach(h => { h.style.display = ''; if (h.nextElementSibling) h.nextElementSibling.style.display = ''; });
    menuCategories.forEach(mc => mc.style.display = '');
    return;
  }

  let targetText = "";
  if (category === 'coffee-based') targetText = 'Coffee Based (Hot or Iced)';
  if (category === 'non-coffee') targetText = 'Non-Coffee';
  if (category === 'iced-coffee') targetText = 'Iced Coffee Series';
  if (category === 'frappuccino') targetText = 'Frappuccino';
  if (category === 'matcha') targetText = 'Matcha Series';
  if (category === 'milktea') targetText = 'Milktea Series';
  if (category === 'fruit-tea') targetText = 'Fruit Tea Series';
  if (category === 'cream-cheese') targetText = 'Cream Cheese Series';
  if (category === 'yakult') targetText = 'Yakult Series';
  if (category === 'beverage') targetText = 'Beverage';
  if (category === 'add-ons') targetText = 'Add-ons';
  if (category === 'rice-meals') targetText = 'Rice Meals';
  if (category === 'snacks') targetText = 'Snacks';
  if (category === 'waff-owls') targetText = 'Waff-owls';

  headers.forEach(header => {
    const h3 = header.querySelector('h3');
    const isMatch = h3 && h3.textContent.trim() === targetText;
    header.style.display = isMatch ? '' : 'none';
    const nextList = header.nextElementSibling;
    if (nextList) nextList.style.display = isMatch ? '' : 'none';
  });

  menuCategories.forEach(mc => {
    const headersInMc = mc.querySelectorAll('.category-header');
    if (headersInMc.length > 0) {
      let hasVisible = false;
      headersInMc.forEach(h => { if (h.style.display !== 'none') hasVisible = true; });
      mc.style.display = hasVisible ? '' : 'none';
    }
  });
}

function renderFavorites() {
  const container = document.getElementById('favorites-container');
  const emptyMsg = document.getElementById('favorites-empty-msg');
  if (!container || !emptyMsg) return;

  container.innerHTML = '';
  if (favorites.length === 0) {
    container.style.display = 'none';
    emptyMsg.style.display = 'block';
    return;
  }

  container.style.display = 'grid';
  emptyMsg.style.display = 'none';

  const allItems = Array.from(document.querySelectorAll('.tab-pane:not(#pane-favorites) .menu-item'));
  const addedNames = new Set();

  favorites.forEach(favName => {
    const originalItem = allItems.find(item => {
      const nameEl = item.querySelector('.item-name');
      return getItemCleanName(nameEl) === favName;
    });

    if (originalItem && !addedNames.has(favName)) {
      addedNames.add(favName);
      const clone = originalItem.cloneNode(true);
      
      const itemData = { name: favName, prices: [] };
      const right = clone.querySelector('.item-right');
      if (right) {
        right.querySelectorAll('.item-price-col').forEach((col, idx) => {
          const price = parseInt(col.querySelector('.item-price').textContent.replace('₱', '').replace(',', ''), 10);
          const size = col.querySelector('.size-label').textContent;
          itemData.prices.push({ size, price });
          const btn = col.querySelector('.add-cart-btn');
          btn.onclick = (e) => { e.stopPropagation(); addToCart(`${favName} (${size})`, price); };
        });
      } else {
        const pEl = clone.querySelector('.item-price');
        if (pEl) {
          const price = parseInt(pEl.textContent.replace('₱', '').replace(',', ''), 10);
          itemData.prices.push({ size: 'Regular', price });
          const btn = clone.querySelector('.add-cart-btn');
          if (btn) btn.onclick = (e) => { e.stopPropagation(); addToCart(favName, price); };
        }
      }

      clone.onclick = () => openProductModal(itemData);

      const star = clone.querySelector('.menu-star');
      if (star) {
        star.onclick = (e) => { e.stopPropagation(); toggleFavorite(favName); };
      }

      container.appendChild(clone);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenuButtons();
  updateCartUI();

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const tabBtn = document.getElementById('tab-' + hash);
    if (tabBtn) {
      switchTab(hash, tabBtn);
    }
  }
});
