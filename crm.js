/**
 * TeleSlot — Логика CRM системы, модерации каналов блогеров и интеграции с Telegram-ботом
 */

const DEFAULT_CRM_ORDERS = [
  {
    id: "TS-849102",
    date: "17 октября",
    time: "19:40",
    username: "@alex_startup",
    channel: "ТехноПульс & AI",
    platform: "Telegram + MAX",
    slot: "23 октября в 18:00",
    tariff: "24 часа (📸 Фото+Текст)",
    adObject: "Канал или блог",
    price: 7200,
    status: "Оплачено (Escrow + erid)",
    erid: "2Vtzqw98KLA",
    postLink: "https://t.me/alex_startup/42"
  },
  {
    id: "TS-849089",
    date: "17 октября",
    time: "16:15",
    username: "@mari_beauty_shop",
    channel: "Ева про Бьюти & Уход",
    platform: "Telegram",
    slot: "23 октября в 15:00",
    tariff: "12 часов (📱 История)",
    adObject: "Интернет-магазин / Товар",
    price: 4485,
    status: "Ожидает публикации",
    erid: "2Vtzqw31MPO",
    postLink: "https://t.me/mari_beauty_shop/108"
  },
  {
    id: "TS-849055",
    date: "17 октября",
    time: "14:20",
    username: "@sofa_cozy_life",
    channel: "Софа и Уют (6.2k подп.)",
    platform: "Telegram + MAX",
    slot: "Заявка от начинающего блогера",
    tariff: "Желаемый слот: 1 400 ₽",
    adObject: "Подключение к бирже",
    price: 1400,
    status: "Канал на модерации",
    erid: "Проверка",
    postLink: "https://t.me/sofa_cozy_life"
  },
  {
    id: "TS-849012",
    date: "17 октября",
    time: "12:05",
    username: "@crypto_dan",
    channel: "Новости Трендов | Главное",
    platform: "MAX Платформа",
    slot: "23 октября в 17:00",
    tariff: "48 часов (🔗 Ссылка)",
    adObject: "Сервис / Приложение",
    price: 17575,
    status: "В эфире",
    erid: "2Vtzqw77TRX",
    postLink: "https://t.me/trends_today_tg/8492"
  },
  {
    id: "TS-848834",
    date: "16 октября",
    time: "20:30",
    username: "@coffee_hub_msk",
    channel: "Дневник Марка | Будни в Москве",
    platform: "Telegram",
    slot: "17 октября в 16:00",
    tariff: "24 часа (🔄 Репост)",
    adObject: "Офлайн-кофейня / Событие",
    price: 4410,
    status: "Успешно выложен",
    erid: "2Vtzqw12QAZ",
    postLink: "https://t.me/mark_lifestyle/2091"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initCrmDashboard();
});

function initCrmDashboard() {
  loadAndRenderCrmOrders();
  renderBotLogs();
  initAddLeadModal();
}

function getStoredCrmOrders() {
  try {
    const raw = localStorage.getItem('teleslot_crm_orders');
    if (!raw) {
      localStorage.setItem('teleslot_crm_orders', JSON.stringify(DEFAULT_CRM_ORDERS));
      return DEFAULT_CRM_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CRM_ORDERS;
  } catch (e) {
    return DEFAULT_CRM_ORDERS;
  }
}

function loadAndRenderCrmOrders() {
  const orders = getStoredCrmOrders();
  const tbody = document.querySelector('#crmTableBody');
  if (!tbody) return;

  // Расчет KPI
  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const activeCount = orders.filter(o => o.status !== 'Успешно выложен').length;
  const avgCheck = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const kpiRev = document.querySelector('#kpiTotalRevenue');
  const kpiCount = document.querySelector('#kpiTotalCount');
  const kpiActive = document.querySelector('#kpiActiveSlots');
  const kpiAvg = document.querySelector('#kpiAvgCheck');

  if (kpiRev) kpiRev.textContent = totalRevenue.toLocaleString('ru-RU') + ' ₽';
  if (kpiCount) kpiCount.textContent = orders.length;
  if (kpiActive) kpiActive.textContent = activeCount;
  if (kpiAvg) kpiAvg.textContent = avgCheck.toLocaleString('ru-RU') + ' ₽';

  tbody.innerHTML = orders.map((order) => {
    let statusClass = 'status-paid';
    if (order.status.includes('Ожидает')) statusClass = 'status-pending';
    if (order.status.includes('В эфире')) statusClass = 'status-live';
    if (order.status.includes('выложен')) statusClass = 'status-done';
    if (order.status.includes('модерации')) statusClass = 'status-live';

    return `
      <tr>
        <td>
          <b style="color: var(--text-primary); font-family: monospace;">#${order.id}</b>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${order.date} ${order.time || ''}</div>
          ${order.erid && order.erid !== 'Проверка' ? `<div style="font-size: 0.68rem; color: #1A8452; font-family: monospace;">erid: ${order.erid}</div>` : ''}
        </td>
        <td>
          <span style="font-weight: 700; color: #2AABEE;">${order.username}</span>
        </td>
        <td>
          <div style="font-weight: 600;">${order.channel}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${order.platform || 'Telegram'}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-rose); font-size: 0.85rem;">${order.slot}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${order.tariff}</div>
          ${order.adObject ? `<div style="font-size: 0.7rem; color: #575D6E;">Объект: ${order.adObject}</div>` : ''}
        </td>
        <td>
          <b style="font-size: 0.95rem;">${(order.price || 0).toLocaleString('ru-RU')} ₽</b>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${order.status}</span>
        </td>
        <td>
          <select onchange="updateOrderStatus('${order.id}', this.value)" 
                  style="padding: 4px 8px; font-size: 0.78rem; border-radius: 6px; border: 1px solid var(--border-soft); background: #fff;">
            <option value="Оплачено (Escrow + erid)" ${order.status.includes('Оплачено') ? 'selected' : ''}>Оплачено (Escrow + erid)</option>
            <option value="Ожидает публикации" ${order.status.includes('Ожидает') ? 'selected' : ''}>Ожидает публикации</option>
            <option value="В эфире" ${order.status.includes('В эфире') ? 'selected' : ''}>В эфире</option>
            <option value="Успешно выложен" ${order.status.includes('выложен') ? 'selected' : ''}>Успешно выложен</option>
            <option value="Канал на модерации" ${order.status.includes('модерации') ? 'selected' : ''}>Канал на модерации</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function updateOrderStatus(orderId, newStatus) {
  let orders = getStoredCrmOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    localStorage.setItem('teleslot_crm_orders', JSON.stringify(orders));
    loadAndRenderCrmOrders();
    showToast(`Статус заказа #${orderId} изменён на "${newStatus}"`, 'info');

    addBotLogEvent(`Статус заказа #${orderId} (${order.username}): изменён на "${newStatus}". Уведомление отправлено в Telegram/MAX.`);
  }
}

function addCrmLead(leadData) {
  const newOrder = {
    id: "TS-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('ru-RU'),
    time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    username: leadData.telegram || '@lead',
    channel: leadData.channel || 'Подбор каналов',
    platform: leadData.platform || 'Telegram + MAX',
    slot: leadData.slot || 'Срочно',
    tariff: leadData.tariff || 'Индивидуальный',
    adObject: leadData.adObject || 'Рекламный проект',
    price: leadData.price || 5000,
    status: leadData.status || 'Ожидает ответа',
    erid: leadData.status?.includes('модерации') ? 'На модерации' : '2Vtzqw' + Math.random().toString(36).substring(2, 8).toUpperCase()
  };

  let orders = getStoredCrmOrders();
  orders.unshift(newOrder);
  localStorage.setItem('teleslot_crm_orders', JSON.stringify(orders));
  loadAndRenderCrmOrders();
  addBotLogEvent(`Новая заявка в CRM: ${leadData.telegram} (${leadData.name || leadData.channel})`);
}

function renderBotLogs() {
  const container = document.querySelector('#botLogsContainer');
  if (!container) return;

  const logs = [
    { time: "22:42:15", msg: "✅ Бот @TeleSlot_bot зарегистрировал токен erid: 2Vtzqw98KLA в ЕРИР для канала «ТехноПульс & AI»." },
    { time: "21:10:42", msg: "🤖 ИИ-движок сформировал Smart-отчёт по подбору каналов для @client_pro и отправил в Telegram-бот на согласование." },
    { time: "20:09:42", msg: "⚡ Бот проверил выход поста на платформе MAX и в Telegram. Пост опубликован с автоматической юридической пометкой." },
    { time: "19:40:11", msg: "💳 Оплата заказа #TS-849102 подтверждена через СБП. Слот 23 октября 18:00 зарезервирован." },
    { time: "18:22:04", msg: "📩 Новая заявка от блогера @sofa_cozy_life (Telegram + MAX) поступила на модерацию." }
  ];

  container.innerHTML = logs.map(l => `
    <div class="bot-log-item">
      <span class="bot-log-time">[${l.time}]</span>
      <span class="bot-log-action">${l.msg}</span>
    </div>
  `).join('');
}

function addBotLogEvent(message) {
  const container = document.querySelector('#botLogsContainer');
  if (!container) return;

  const now = new Date().toLocaleTimeString('ru-RU');
  const div = document.createElement('div');
  div.className = 'bot-log-item';
  div.innerHTML = `
    <span class="bot-log-time">[${now}]</span>
    <span class="bot-log-action">⚡ ${message}</span>
  `;
  container.insertBefore(div, container.firstChild);
}

function initAddLeadModal() {
  const resetBtn = document.querySelector('#resetCrmBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Сбросить базу данных CRM к исходным демо-данным?')) {
        localStorage.setItem('teleslot_crm_orders', JSON.stringify(DEFAULT_CRM_ORDERS));
        loadAndRenderCrmOrders();
        showToast('Данные CRM успешно сброшены к демо-состоянию', 'info');
      }
    });
  }

  const exportBtn = document.querySelector('#exportCrmBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const orders = getStoredCrmOrders();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `teleslot_crm_export_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Экспорт базы CRM выполнен успешно', 'success');
    });
  }
}
