
function showPane(name, clickedLink) {
  event.preventDefault();
  document.querySelectorAll('.account-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById('pane-' + name).classList.add('active');
  clickedLink.classList.add('active');
}

let isEditing = false;
const editableFields = ['fname', 'lname', 'dob', 'phone', 'addr-type', 'address', 'country', 'city', 'email-field', 'password-field'];

function toggleEdit() {
  isEditing = !isEditing;
  const btn = document.getElementById('edit-btn');
  const saveBtnWrap = document.getElementById('save-btn-wrap');

  editableFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !isEditing;
  });

  if (isEditing) {
    btn.textContent = '✕ Cancel';
    btn.style.background = '#888';
    saveBtnWrap.style.display = 'block';
  } else {

    btn.innerHTML = '<img src="icons/pencil.svg" alt="Edit"> Edit';
    btn.style.background = '';
    saveBtnWrap.style.display = 'none';
  }
}

function saveInfo() {
  isEditing = true;
  toggleEdit();
  showToast('✓ Changes saved successfully!', '#27AE60');
}

function showToast(message, color) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: color || '#27AE60',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13.5px',
    fontWeight: '600',
    zIndex: '9999',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'opacity 0.4s',
  });
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  setTimeout(() => toast.remove(), 3000);
}

// Payment Modal Functions
function openPaymentModal() {
  document.getElementById('payment-modal-overlay').classList.add('active');
  document.getElementById('payment-modal').classList.add('active');
  // Reset modal to selection view
  document.getElementById('form-card').style.display = 'none';
  document.getElementById('form-ewallet').style.display = 'none';
  document.querySelector('.payment-type-options').style.display = '';
  document.querySelector('.payment-modal-sub').style.display = '';
}

function closePaymentModal(e) {
  if (e && e.target && e.target.id !== 'payment-modal-overlay' && e.type === 'click') return;
  document.getElementById('payment-modal-overlay').classList.remove('active');
  document.getElementById('payment-modal').classList.remove('active');
}

function selectPaymentType(type) {
  // Hide the selection cards
  document.querySelector('.payment-type-options').style.display = 'none';
  document.querySelector('.payment-modal-sub').style.display = 'none';

  // Show the appropriate form
  if (type === 'card') {
    document.getElementById('form-card').style.display = 'block';
    document.getElementById('form-ewallet').style.display = 'none';
  } else {
    document.getElementById('form-card').style.display = 'none';
    document.getElementById('form-ewallet').style.display = 'block';
  }
}

function savePaymentMethod(type) {
  let name = '';
  let detail = '';
  let icon = '';

  if (type === 'card') {
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.trim();
    if (!cardName || !cardNumber) {
      return alert('Please fill in all card details.');
    }
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    name = 'Card •••• ' + last4;
    detail = cardName;
    icon = '<img src="icons/card.svg" alt="" style="width: 40px;">';
    // Clear fields
    document.getElementById('card-name').value = '';
    document.getElementById('card-number').value = '';
    document.getElementById('card-expiry').value = '';
    document.getElementById('card-cvv').value = '';
  } else {
    const provider = document.getElementById('ewallet-provider').value;
    const eNumber = document.getElementById('ewallet-number').value.trim();
    const eName = document.getElementById('ewallet-name').value.trim();
    if (!eNumber || !eName) {
      return alert('Please fill in all e-wallet details.');
    }
    name = provider;
    detail = eName + ' · ' + eNumber;
    icon = '<img src="icons/Gcash.svg" alt="" style="width: 40px;">';
    // Clear fields
    document.getElementById('ewallet-number').value = '';
    document.getElementById('ewallet-name').value = '';
  }

  // Add new card to the saved methods list
  const savedMethods = document.getElementById('saved-methods');
  const addBtn = document.getElementById('add-payment-btn');

  const card = document.createElement('div');
  card.className = 'saved-method-card';
  card.setAttribute('data-method-type', type);
  card.innerHTML = `
    <div class="saved-method-icon">${icon}</div>
    <div class="saved-method-info">
      <div class="saved-method-name">${name}</div>
      <div class="saved-method-detail">${detail}</div>
    </div>
    <button class="remove-method-btn" onclick="removePaymentMethod(this)" title="Remove">✕</button>
  `;

  savedMethods.insertBefore(card, addBtn);

  // Save to localStorage
  const saved = JSON.parse(localStorage.getItem('savedPaymentMethods') || '[]');
  saved.push({ type, name, detail, icon });
  localStorage.setItem('savedPaymentMethods', JSON.stringify(saved));

  // Close modal and show toast
  closePaymentModal();
  showToast('✓ Payment method added successfully!', '#27AE60');
}

function removePaymentMethod(btn) {
  const card = btn.closest('.saved-method-card');
  if (!card) return;

  // Remove from localStorage
  const methodType = card.getAttribute('data-method-type');
  const methodName = card.querySelector('.saved-method-name')?.textContent || '';
  const saved = JSON.parse(localStorage.getItem('savedPaymentMethods') || '[]');
  const updated = saved.filter(m => !(m.type === methodType && m.name === methodName));
  localStorage.setItem('savedPaymentMethods', JSON.stringify(updated));

  card.style.transition = 'opacity 0.3s, transform 0.3s';
  card.style.opacity = '0';
  card.style.transform = 'translateX(20px)';
  setTimeout(() => {
    card.remove();
    showToast('Payment method removed.', '#C0392B');
  }, 300);
}

function loadSavedMethods() {
  const savedMethods = document.getElementById('saved-methods');
  const addBtn = document.getElementById('add-payment-btn');
  if (!savedMethods || !addBtn) return;

  const saved = JSON.parse(localStorage.getItem('savedPaymentMethods') || '[]');
  saved.forEach(method => {
    const card = document.createElement('div');
    card.className = 'saved-method-card';
    card.setAttribute('data-method-type', method.type);
    card.innerHTML = `
      <div class="saved-method-icon">${method.icon}</div>
      <div class="saved-method-info">
        <div class="saved-method-name">${method.name}</div>
        <div class="saved-method-detail">${method.detail}</div>
      </div>
      <button class="remove-method-btn" onclick="removePaymentMethod(this)" title="Remove">✕</button>
    `;
    savedMethods.insertBefore(card, addBtn);
  });
}

// POINTS MANAGEMENT
let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;

function updatePointsUI() {
  const sidebarVal = document.getElementById('sidebar-points-val');
  const balanceVal = document.getElementById('points-balance');
  const progressText = document.getElementById('points-progress-text');
  const fillBar = document.getElementById('points-fill-bar');

  if (sidebarVal) sidebarVal.textContent = userPoints;
  if (balanceVal) balanceVal.textContent = userPoints;
  if (progressText) progressText.textContent = `${userPoints} / 1,000`;

  if (fillBar) {
    const percentage = Math.min((userPoints / 1000) * 100, 100);
    fillBar.style.width = percentage + '%';
  }

  localStorage.setItem('userPoints', userPoints);
}

function redeemReward(rewardName, cost) {
  if (userPoints >= cost) {
    userPoints -= cost;
    updatePointsUI();
    showToast(`✓ Successfully redeemed: ${rewardName}!`, '#D4A017');
  } else {
    showToast(`⚠ Not enough points for ${rewardName}.`, '#C0392B');
  }
}

function loadOrderHistory() {
  const orderList = document.querySelector('.order-list');
  if (!orderList) return;

  const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  
  if (orders.length === 0) {
    orderList.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-light); font-size: 14px;">No orders yet. Start your journey with a brew!</div>';
    return;
  }

  // Clear existing static items
  orderList.innerHTML = '';

  orders.forEach(order => {
    const li = document.createElement('li');
    li.className = 'order-item';
    
    // Choose icon based on iconType
    const iconFile = order.iconType === 'Meal' ? 'Meal.svg' : 'Coffee-bean.svg';

    li.innerHTML = `
      <div class="order-icon"><img src="icons/${iconFile}" alt="${order.iconType}" style="width: 28px;"></div>
      <div class="order-info">
        <div class="order-name">${order.items}</div>
        <div class="order-date">${order.date} · Order #${order.id}</div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
        <span class="order-status status-complete">${order.status}</span>
        <div class="order-price" style="margin:0;">₱${order.total}</div>
        <button class="reorder-btn" onclick="reorder('${order.id}')">Order Again</button>
      </div>
    `;
    orderList.appendChild(li);
  });
}

function reorder(orderId) {
  const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const order = orders.find(o => o.id === orderId);
  
  if (!order || !order.rawItems) {
    alert("Sorry, this order cannot be re-ordered at this time.");
    return;
  }

  // Set the cart to the order's items
  localStorage.setItem('cart', JSON.stringify(order.rawItems));
  
  // Show a nice feedback before redirecting
  showToast("✓ Items added to cart! Redirecting...", "#27AE60");
  
  setTimeout(() => {
    window.location.href = 'menu.html';
  }, 800);
}

// Update UI on load
document.addEventListener('DOMContentLoaded', () => {
  loadSavedMethods();
  updatePointsUI();
  loadOrderHistory();
});
