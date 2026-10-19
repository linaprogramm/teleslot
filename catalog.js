/**
 * TeleSlot — Логика каталога каналов, фильтрации и интерактивного выбора форматов и слотов
 */

let activeCategory = 'all';
let channelSelections = {}; // channelId -> { slotId, duration, format, adObject }

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryTabs();
  renderChannels();
  initAnalyticsModal();
  initBloggerCollabModal();
});

// Рендер табов категорий
function renderCategoryTabs() {
  const tabsWrap = document.querySelector('.category-tabs-wrap');
  if (!tabsWrap) return;

  const categories = [
    { id: 'all', label: 'Все' },
    { id: 'deals', label: '🔥 Скидки' },
    { id: 'tg_only', label: '✈️ Telegram' },
    { id: 'max_only', label: '⚡ MAX' },
    { id: 'mini_bloggers', label: '🌱 От 840 ₽' },
    { id: 'news', label: 'Новости' },
    { id: 'beauty', label: 'Красота' },
    { id: 'business', label: 'Бизнес' }
  ];

  tabsWrap.innerHTML = categories.map(cat => `
    <button class="cat-tab ${cat.id === activeCategory ? 'active' : ''}" 
            data-category="${cat.id}">
      ${cat.label}
    </button>
  `).join('');

  tabsWrap.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsWrap.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderChannels();
    });
  });
}

function getFilteredChannels() {
  if (activeCategory === 'all') return CHANNELS_DATA;
  if (activeCategory === 'deals') return CHANNELS_DATA.filter(c => c.category === 'deals' || c.badge.includes('Скидка'));
  if (activeCategory === 'tg_only') return CHANNELS_DATA.filter(c => c.platform === 'telegram' || c.platform === 'cross');
  if (activeCategory === 'max_only') return CHANNELS_DATA.filter(c => c.platform === 'max' || c.platform === 'cross');
  if (activeCategory === 'mini_bloggers') return CHANNELS_DATA.filter(c => c.subscribers <= 15000);
  return CHANNELS_DATA.filter(c => c.category === activeCategory);
}

// Рендер карточек блогеров
function renderChannels() {
  const container = document.querySelector('#channelsContainer');
  if (!container) return;

  const filtered = getFilteredChannels();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: #fff; border-radius: 18px; border: 1px solid var(--border-light);">
        <p style="color: var(--text-secondary); margin-bottom: 10px;">В этой категории пока нет каналов</p>
        <button class="btn btn-outline btn-sm" onclick="setCategory('all')">Показать все</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(ch => {
    if (!channelSelections[ch.id]) {
      const freeSlot = ch.slots.find(s => s.status === 'free') || ch.slots[0];
      channelSelections[ch.id] = {
        slotId: freeSlot.id,
        duration: '24h',
        format: 'photo',
        adObject: 'Канал или блог'
      };
    }

    const sel = channelSelections[ch.id];
    const basePrice = ch.prices[sel.duration] || ch.prices['24h'];
    const fmtObj = POST_FORMATS.find(f => f.id === sel.format) || POST_FORMATS[0];
    const finalPrice = Math.round(basePrice * fmtObj.priceMod);

    return `
      <div class="channel-card" id="card-${ch.id}">
        <!-- Шапка автора -->
        <div class="card-top">
          <div class="card-avatar-wrap">
            <img src="${ch.avatar}" alt="${ch.name}" class="channel-avatar">
            ${ch.verified ? `<span class="channel-verified">✓</span>` : ''}
          </div>
          <div class="card-meta">
            <div class="card-title-row">
              <h4 class="channel-name">${ch.name}</h4>
              <span class="platform-badge platform-${ch.platform === 'cross' ? 'cross' : (ch.platform === 'max' ? 'max' : 'tg')}">
                ${ch.platformLabel}
              </span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; font-size: 0.78rem; color: var(--text-muted);">
              <span>${ch.handle}</span>
              <span>•</span>
              <span style="color: #1A8452; font-weight: 600;">✓ erid авто</span>
            </div>
          </div>
        </div>

        <!-- 3 ключевые метрики -->
        <div class="card-stats-row">
          <div>
            <div class="c-stat-val">${(ch.subscribers / 1000).toFixed(0)}k</div>
            <div class="c-stat-lbl">Аудитория</div>
          </div>
          <div>
            <div class="c-stat-val">${(ch.dailyViews / 1000).toFixed(1)}k</div>
            <div class="c-stat-lbl">Охват 24ч</div>
          </div>
          <div>
            <div class="c-stat-val">${ch.err}</div>
            <div class="c-stat-lbl">ERR активность</div>
          </div>
        </div>

        <!-- 1. Интерактивный выбор вида рекламы с разной ценой -->
        <div class="control-group">
          <div class="control-label">
            <span>Вид рекламы:</span>
            <span class="control-badge-active" id="formatLabel-${ch.id}">${fmtObj.label} (${fmtObj.tag})</span>
          </div>
          <div class="format-segmented-bar">
            ${POST_FORMATS.map(f => {
              const fPrice = Math.round((ch.prices[sel.duration] || ch.prices['24h']) * f.priceMod);
              return `
                <button class="format-btn ${f.id === sel.format ? 'active' : ''}" 
                        onclick="setCardFormat('${ch.id}', '${f.id}')"
                        title="${f.desc}">
                  <span class="f-name">${f.label}</span>
                  <span class="f-price">${fPrice.toLocaleString('ru-RU')} ₽</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. Срок нахождения в ленте -->
        <div class="control-group">
          <div class="control-label">
            <span>Срок:</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${sel.duration === 'week' ? 'Закреп 7 дней' : sel.duration}</span>
          </div>
          <div class="duration-segmented-bar">
            <button class="dur-pill ${sel.duration === '12h' ? 'active' : ''}" onclick="setCardDuration('${ch.id}', '12h')">12ч</button>
            <button class="dur-pill ${sel.duration === '24h' ? 'active' : ''}" onclick="setCardDuration('${ch.id}', '24h')">24ч</button>
            <button class="dur-pill ${sel.duration === '48h' ? 'active' : ''}" onclick="setCardDuration('${ch.id}', '48h')">48ч</button>
            <button class="dur-pill ${sel.duration === 'week' ? 'active' : ''}" onclick="setCardDuration('${ch.id}', 'week')">Неделя</button>
          </div>
        </div>

        <!-- 3. Слот времени (во сколько) -->
        <div class="control-group">
          <div class="control-label">
            <span>Свободный слот (во сколько):</span>
          </div>
          <div class="slots-chips-minimal">
            ${ch.slots.map(s => `
              <button class="slot-pill ${s.id === sel.slotId ? 'active' : ''}" 
                      onclick="setCardSlot('${ch.id}', '${s.id}', '${s.status}')">
                <span>${s.date}</span>
                <b>${s.time}</b>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Кнопка статистики и футер с итоговой ценой -->
        <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-light);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <button class="stats-mini-btn" onclick="openChannelAnalytics('${ch.id}')">
              📊 Статистика аудитории
            </button>
            <div style="text-align: right;">
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Итого за слот:</span>
              <span class="card-price-num" id="price-${ch.id}">${finalPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          <button class="btn btn-rose btn-block" onclick="proceedToCheckout('${ch.id}')">
            Забронировать слот →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setCategory(catId) {
  activeCategory = catId;
  renderCategoryTabs();
  renderChannels();
}

// Изменение формата рекламы с мгновенным перерасчетом цены
function setCardFormat(channelId, formatId) {
  if (!channelSelections[channelId]) {
    channelSelections[channelId] = { slotId: 's1', duration: '24h', format: formatId, adObject: 'Канал или блог' };
  } else {
    channelSelections[channelId].format = formatId;
  }
  updateCardUI(channelId);
}

// Изменение срока с мгновенным перерасчетом цены
function setCardDuration(channelId, duration) {
  if (!channelSelections[channelId]) {
    channelSelections[channelId] = { slotId: 's1', duration, format: 'photo', adObject: 'Канал или блог' };
  } else {
    channelSelections[channelId].duration = duration;
  }
  updateCardUI(channelId);
}

// Изменение слота времени
function setCardSlot(channelId, slotId, status) {
  if (status === 'booked') {
    showToast('Этот слот уже забронирован', 'error');
    return;
  }
  if (!channelSelections[channelId]) {
    channelSelections[channelId] = { slotId, duration: '24h', format: 'photo', adObject: 'Канал или блог' };
  } else {
    channelSelections[channelId].slotId = slotId;
  }
  updateCardUI(channelId);
}

// Быстрое и плавное обновление карточки без перезагрузки всего каталога
function updateCardUI(channelId) {
  const card = document.querySelector(`#card-${channelId}`);
  if (!card) {
    renderChannels();
    return;
  }

  const ch = CHANNELS_DATA.find(c => c.id === channelId);
  const sel = channelSelections[channelId];
  const basePrice = ch.prices[sel.duration] || ch.prices['24h'];
  const fmtObj = POST_FORMATS.find(f => f.id === sel.format) || POST_FORMATS[0];
  const finalPrice = Math.round(basePrice * fmtObj.priceMod);

  // Обновляем бейдж формата
  const lbl = card.querySelector(`#formatLabel-${channelId}`);
  if (lbl) lbl.textContent = `${fmtObj.label} (${fmtObj.tag})`;

  // Обновляем класс кнопок форматов
  card.querySelectorAll('.format-btn').forEach((btn, idx) => {
    const f = POST_FORMATS[idx];
    if (f) {
      if (f.id === sel.format) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      const pSpan = btn.querySelector('.f-price');
      if (pSpan) {
        const p = Math.round(basePrice * f.priceMod);
        pSpan.textContent = `${p.toLocaleString('ru-RU')} ₽`;
      }
    }
  });

  // Обновляем класс срока
  card.querySelectorAll('.dur-pill').forEach(btn => {
    if (btn.textContent.includes(sel.duration === 'week' ? 'Неделя' : sel.duration.replace('h', 'ч'))) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Обновляем класс слота
  card.querySelectorAll('.slot-pill').forEach((btn, idx) => {
    if (ch.slots[idx] && ch.slots[idx].id === sel.slotId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Обновляем цену с легким эффектом
  const priceEl = card.querySelector(`#price-${channelId}`);
  if (priceEl) {
    priceEl.style.transform = 'scale(1.1)';
    priceEl.style.color = '#C05572';
    setTimeout(() => {
      priceEl.textContent = `${finalPrice.toLocaleString('ru-RU')} ₽`;
      priceEl.style.transform = 'scale(1)';
      priceEl.style.color = 'var(--text-primary)';
    }, 100);
  }
}

// Оформление заказа
function proceedToCheckout(channelId) {
  const ch = CHANNELS_DATA.find(c => c.id === channelId);
  const sel = channelSelections[channelId] || { slotId: ch.slots[0].id, duration: '24h', format: 'photo', adObject: 'Канал или блог' };
  const slot = ch.slots.find(s => s.id === sel.slotId) || ch.slots[0];
  const fmtObj = POST_FORMATS.find(f => f.id === sel.format) || POST_FORMATS[0];
  const basePrice = ch.prices[sel.duration] || ch.prices['24h'];
  const finalPrice = Math.round(basePrice * fmtObj.priceMod);

  sessionStorage.setItem('selectedOrder', JSON.stringify({
    channelId: ch.id,
    channelName: ch.name,
    handle: ch.handle,
    avatar: ch.avatar,
    platform: ch.platformLabel,
    slotDate: slot.date,
    slotTime: slot.time,
    duration: sel.duration,
    format: fmtObj.label,
    adObject: sel.adObject,
    price: finalPrice
  }));

  window.location.href = `checkout.html?channel=${encodeURIComponent(ch.id)}&slot=${encodeURIComponent(slot.id)}&dur=${encodeURIComponent(sel.duration)}&fmt=${encodeURIComponent(sel.format)}`;
}

function bookAiPackage(pkgId) {
  const pkg = AI_PACKAGES.find(p => p.id === pkgId) || AI_PACKAGES[1];
  window.location.href = `checkout.html?ai=${pkg.id}&price=${pkg.price}`;
}

// Модалка для блогеров
function initBloggerCollabModal() {
  const overlay = document.querySelector('#bloggerCollabModal');
  if (!overlay) return;

  overlay.querySelector('.modal-close')?.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  const form = document.querySelector('#bloggerCollabForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const channelName = form.querySelector('[name="channelName"]')?.value || 'Блог';
      const tg = form.querySelector('[name="bloggerTg"]')?.value || '@creator';
      const subs = form.querySelector('[name="subsCount"]')?.value || '1000';
      const price = form.querySelector('[name="desiredPrice"]')?.value || '1200';

      if (typeof addCrmLead === 'function') {
        addCrmLead({
          name: 'Новый блогер',
          telegram: tg,
          channel: `${channelName} (${subs} подп.)`,
          tariff: `Желаемый прайс: ${price} ₽`,
          slot: 'На модерации',
          price: parseInt(price) || 1200,
          status: 'Канал на модерации'
        });
      }

      showToast(`Канал отправлен на модерацию. Бот свяжется с ${tg}!`, 'success');
      overlay.classList.remove('open');
      form.reset();
    });
  }
}

function openBloggerModal() {
  const overlay = document.querySelector('#bloggerCollabModal');
  if (overlay) overlay.classList.add('open');
}

function initAnalyticsModal() {
  const overlay = document.querySelector('#analyticsModalOverlay');
  if (!overlay) return;
  overlay.querySelector('.modal-close')?.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
}

function openChannelAnalytics(channelId) {
  const ch = CHANNELS_DATA.find(c => c.id === channelId);
  if (!ch) return;

  const overlay = document.querySelector('#analyticsModalOverlay');
  const body = overlay?.querySelector('#analyticsModalBody');
  if (!body) return;

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <img src="${ch.avatar}" style="width: 46px; height: 46px; border-radius: 12px; object-fit: cover;">
      <div>
        <h3 style="font-size: 1.15rem; font-weight: 800;">${ch.name}</h3>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${ch.handle} • ${ch.platformLabel}</div>
      </div>
    </div>

    <div class="analytics-chart-mock" style="padding: 14px; margin-bottom: 16px;">
      <div style="font-size: 0.82rem; font-weight: 700; margin-bottom: 10px; display: flex; justify-content: space-between;">
        <span>Суточный охват (24h)</span>
        <span style="color: #2AABEE;">✓ TGStat</span>
      </div>
      <div class="chart-bars-wrap" style="height: 90px;">
        <div class="chart-col"><div class="chart-bar" style="height: 40%;"></div><span class="chart-hour-lbl">08:00</span></div>
        <div class="chart-col"><div class="chart-bar" style="height: 75%;"></div><span class="chart-hour-lbl">12:00</span></div>
        <div class="chart-col"><div class="chart-bar" style="height: 95%;"></div><span class="chart-hour-lbl">16:00</span></div>
        <div class="chart-col"><div class="chart-bar" style="height: 85%;"></div><span class="chart-hour-lbl">20:00</span></div>
      </div>
    </div>

    <div class="demographics-grid" style="gap: 12px; margin-bottom: 20px;">
      <div class="demo-box" style="padding: 12px;">
        <div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px;">Пол аудитории:</div>
        <div class="gender-ratio-bar">
          <div class="ratio-female" style="width: ${ch.demographics.gender.female}%;"></div>
          <div class="ratio-male" style="width: ${ch.demographics.gender.male}%;"></div>
        </div>
        <div class="ratio-labels" style="font-size: 0.74rem;">
          <span>Жен: ${ch.demographics.gender.female}%</span>
          <span>Муж: ${ch.demographics.gender.male}%</span>
        </div>
      </div>

      <div class="demo-box" style="padding: 12px;">
        <div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px;">География:</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">
          Россия: ${ch.demographics.geo[0].pct}% • Другие: ${100 - ch.demographics.geo[0].pct}%
        </div>
      </div>
    </div>

    <button class="btn btn-rose btn-block" onclick="document.querySelector('#analyticsModalOverlay').classList.remove('open'); proceedToCheckout('${ch.id}')">
      Выбрать слот и забронировать
    </button>
  `;

  overlay.classList.add('open');
}
