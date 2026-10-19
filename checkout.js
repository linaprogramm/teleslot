/**
 * TeleSlot — Логика оформления заказа, выбора слота, формата, маркировки и оплаты
 */

let currentOrder = null;
let currentChannelData = null;
let selectedPaymentMethod = 'sbp';

document.addEventListener('DOMContentLoaded', () => {
  loadOrderDetails();
  initTelegramAutoDetect();
  initPaymentSelector();
  initCheckoutForm();
});

function loadOrderDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const channelId = urlParams.get('channel') || 'tech-future';
  const slotId = urlParams.get('slot') || 's2';
  const duration = urlParams.get('dur') || '24h';
  const formatParam = urlParams.get('fmt') || 'photo';
  const adObjectParam = urlParams.get('obj') || 'Канал или блог';
  const isAi = urlParams.get('ai');
  const aiPrice = urlParams.get('price');

  if (isAi) {
    const pkg = (typeof AI_PACKAGES !== 'undefined' && AI_PACKAGES.find(p => p.id === isAi)) || {
      name: 'ИИ-Пакет «Активный Рост»',
      price: parseInt(aiPrice) || 18900
    };
    currentOrder = {
      channelId: isAi,
      channelName: pkg.name,
      handle: '@TeleSlot_AI_Engine',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      platform: 'Telegram + MAX',
      slotDate: 'Ближайшие 24 часа',
      slotTime: 'По рекомендации ИИ',
      duration: '24h',
      durationLabel: '24 часа (ИИ-подбор)',
      format: 'photo',
      formatLabel: '📝 Пост (ИИ-оптимизирован)',
      adObject: 'Пакетный запуск с ИИ-отчётом',
      price: parseInt(aiPrice) || pkg.price
    };
    renderOrderSummary();
    return;
  }

  let ch = typeof CHANNELS_DATA !== 'undefined' ? CHANNELS_DATA.find(c => c.id === channelId) : null;
  if (!ch && typeof CHANNELS_DATA !== 'undefined') ch = CHANNELS_DATA[0];

  if (!ch) {
    ch = {
      id: 'tech-future',
      name: 'ТехноПульс & AI',
      handle: '@techno_pulse',
      platformLabel: 'TG + MAX',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      prices: { '12h': 4800, '24h': 7200, '48h': 10500, 'week': 15800 },
      slots: [{ id: 's2', date: '23 октября', time: '18:00' }]
    };
  }

  currentChannelData = ch;
  const slot = (ch.slots && ch.slots.find(s => s.id === slotId)) || (ch.slots && ch.slots[0]) || { date: '23 октября', time: '18:00' };
  const durationLabels = {
    '12h': '12 часов',
    '24h': '24 часа (Хит)',
    '48h': '48 часов',
    'week': 'На неделю'
  };

  const formatObj = (typeof POST_FORMATS !== 'undefined' && POST_FORMATS.find(f => f.id === formatParam)) || { id: 'photo', label: '📝 Пост', priceMod: 1.0 };
  const basePrice = (ch.prices && ch.prices[duration]) || 7200;
  const finalPrice = Math.round(basePrice * formatObj.priceMod);

  currentOrder = {
    channelId: ch.id,
    channelName: ch.name,
    handle: ch.handle,
    avatar: ch.avatar,
    platform: ch.platformLabel || 'TG + MAX',
    slotDate: slot.date,
    slotTime: slot.time,
    duration: duration,
    durationLabel: durationLabels[duration] || '24 часа',
    format: formatObj.id,
    formatLabel: formatObj.label,
    adObject: adObjectParam,
    price: finalPrice
  };

  renderOrderSummary();
}

function switchCheckoutFormat(formatId) {
  if (!currentOrder || !currentChannelData) return;
  const fmtObj = (typeof POST_FORMATS !== 'undefined' && POST_FORMATS.find(f => f.id === formatId)) || { id: 'photo', label: '📝 Пост', priceMod: 1.0 };
  const basePrice = currentChannelData.prices[currentOrder.duration] || currentChannelData.prices['24h'];
  
  currentOrder.format = fmtObj.id;
  currentOrder.formatLabel = fmtObj.label;
  currentOrder.price = Math.round(basePrice * fmtObj.priceMod);

  // Обновляем визуальное состояние кнопок формата в чекауте
  document.querySelectorAll('.checkout-format-btn').forEach(btn => {
    if (btn.dataset.format === formatId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderOrderSummary();
  showToast(`Формат изменён на "${fmtObj.label}". Цена: ${currentOrder.price.toLocaleString('ru-RU')} ₽`, 'info');
}

function renderOrderSummary() {
  if (!currentOrder) return;

  const summaryChannelEl = document.querySelector('#summaryChannelName');
  const summaryHandleEl = document.querySelector('#summaryChannelHandle');
  const summaryAvatarEl = document.querySelector('#summaryChannelAvatar');
  const summaryPlatformEl = document.querySelector('#summaryPlatformText');
  const summarySlotEl = document.querySelector('#summarySlotText');
  const summaryDurationEl = document.querySelector('#summaryDurationText');
  const summaryFormatEl = document.querySelector('#summaryFormatText');
  const summaryTotalEl = document.querySelector('#summaryTotalPrice');
  const payBtnAmountEl = document.querySelector('#payBtnAmount');

  if (summaryChannelEl) summaryChannelEl.textContent = currentOrder.channelName;
  if (summaryHandleEl) summaryHandleEl.textContent = currentOrder.handle;
  if (summaryAvatarEl) summaryAvatarEl.src = currentOrder.avatar;
  if (summaryPlatformEl) summaryPlatformEl.textContent = currentOrder.platform;
  if (summarySlotEl) summarySlotEl.textContent = `${currentOrder.slotDate} в ${currentOrder.slotTime}`;
  if (summaryDurationEl) summaryDurationEl.textContent = currentOrder.durationLabel;
  if (summaryFormatEl) summaryFormatEl.textContent = currentOrder.formatLabel || 'Пост';
  
  if (summaryTotalEl) {
    summaryTotalEl.textContent = `${currentOrder.price.toLocaleString('ru-RU')} ₽`;
    summaryTotalEl.style.transform = 'scale(1.1)';
    setTimeout(() => { summaryTotalEl.style.transform = 'scale(1)'; }, 150);
  }
  if (payBtnAmountEl) payBtnAmountEl.textContent = `${currentOrder.price.toLocaleString('ru-RU')} ₽`;
}

// Telegram WebApp Auto-detect
function initTelegramAutoDetect() {
  const input = document.querySelector('#tgUsernameInput');
  const previewHandle = document.querySelector('#detectedTgHandle');
  const detectedAvatar = document.querySelector('#detectedTgAvatar');

  const savedUser = localStorage.getItem('teleslot_user') || '@founder_pro';
  if (input) input.value = savedUser;
  if (previewHandle) previewHandle.textContent = savedUser;
  if (detectedAvatar) detectedAvatar.textContent = savedUser.replace('@', '').charAt(0).toUpperCase();

  if (input) {
    input.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (val && !val.startsWith('@')) val = '@' + val;
      if (previewHandle) previewHandle.textContent = val || '@username';
      if (detectedAvatar) detectedAvatar.textContent = (val.replace('@', '').charAt(0) || 'U').toUpperCase();
      localStorage.setItem('teleslot_user', val);
    });
  }
}

// Способы оплаты
function initPaymentSelector() {
  const cards = document.querySelectorAll('.payment-method-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedPaymentMethod = card.dataset.method;
    });
  });
}

// Сабмит формы оплаты
function initCheckoutForm() {
  const form = document.querySelector('#checkoutForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.querySelector('#tgUsernameInput')?.value.trim() || '@user';
    const postLink = document.querySelector('#adPostLink')?.value.trim() || '';
    const comments = document.querySelector('#adComments')?.value.trim() || '';
    const complianceCheck = document.querySelector('#complianceAgreement')?.checked;

    if (!complianceCheck) {
      showToast('Подтвердите, что реклама не относится к запрещенным тематикам', 'error');
      return;
    }

    if (!postLink && !comments) {
      showToast('Укажите ссылку на пост или текст объявления', 'error');
      return;
    }

    startPaymentModal({
      ...currentOrder,
      username,
      postLink,
      comments,
      paymentMethod: selectedPaymentMethod
    });
  });
}

function startPaymentModal(orderData) {
  const modal = document.querySelector('#paymentModal');
  if (!modal) return;

  const contentBox = modal.querySelector('#paymentModalContent');
  modal.classList.add('open');

  contentBox.innerHTML = `
    <div style="text-align: center; padding: 20px 0;">
      <div style="width: 50px; height: 50px; margin: 0 auto 16px; border: 3px solid var(--border-rose); border-top-color: var(--accent-rose); border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 6px;">Проведение платежа и авто-маркировка erid...</h3>
      <p style="color: var(--text-secondary); font-size: 0.88rem;">Регистрация в ОРД и резервирование слота</p>
      <div style="margin-top: 14px; font-size: 1.4rem; font-weight: 850;">${orderData.price.toLocaleString('ru-RU')} ₽</div>
    </div>
    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
  `;

  setTimeout(() => {
    const orderId = 'TS-' + Math.floor(100000 + Math.random() * 900000);
    const mockErid = '2Vtzqw' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const createdOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('ru-RU'),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      username: orderData.username,
      channel: orderData.channelName,
      platform: orderData.platform,
      slot: `${orderData.slotDate} в ${orderData.slotTime}`,
      tariff: `${orderData.durationLabel} (${orderData.formatLabel})`,
      adObject: orderData.adObject || 'Реклама',
      price: orderData.price,
      status: 'Оплачено (Escrow + erid)',
      erid: mockErid,
      postLink: orderData.postLink
    };

    saveOrderToCrm(createdOrder);

    contentBox.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="width: 54px; height: 54px; background: #E8F8F0; color: #1A8452; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; margin: 0 auto 14px;">
          ✓
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 850; margin-bottom: 6px;">
          Слот успешно забронирован!
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 16px;">
          Заказ <b>#${orderId}</b> зафиксирован. Деньги под защитой Escrow.
        </p>

        <div style="background: #EBF8F2; border: 1px solid #B7EBCE; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 0.8rem; text-align: left; color: #1A8452;">
          <b>✓ Маркировка рекламы выполнена:</b><br>
          Токен erid: <code style="background: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${mockErid}</code>. Данные в ЕРИР.
        </div>

        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 14px; text-align: left; margin-bottom: 16px; font-size: 0.84rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Канал:</span>
            <b>${orderData.channelName} (${orderData.platform})</b>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Слот:</span>
            <b style="color: var(--text-rose);">${orderData.slotDate} в ${orderData.slotTime}</b>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Вид рекламы:</span>
            <b>${orderData.formatLabel}</b>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Сумма:</span>
            <b>${orderData.price.toLocaleString('ru-RU')} ₽</b>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <a href="crm.html" class="btn btn-primary btn-block">
            Открыть CRM дашборд
          </a>
          <a href="catalog.html" class="btn btn-outline btn-block">
            К каталогу
          </a>
        </div>
      </div>
    `;

    showToast('Слот забронирован! erid готов, заказ передан в CRM', 'success');
  }, 1400);
}

function saveOrderToCrm(order) {
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('teleslot_crm_orders')) || [];
  } catch (e) {
    orders = [];
  }
  orders.unshift(order);
  localStorage.setItem('teleslot_crm_orders', JSON.stringify(orders));
}
