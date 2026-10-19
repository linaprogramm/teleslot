/**
 * TeleSlot — Общий JavaScript для всех страниц
 */

document.addEventListener('DOMContentLoaded', () => {
  // Мобильное меню
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = mobileToggle.querySelectorAll('span');
      if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // FAQ Аккордеон
  initFaqAccordion();

  // Инициализация виджета в Hero
  initHeroWidget();

  // Форма обратной связи
  initContactForm();
});

// FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(i => {
          i.classList.remove('active');
          const ans = i.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('active');
          const ans = item.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
        }
      });
    }
  });
}

// Hero Interactive Demo Widget с живым перерасчетом цены по формату и сроку
function initHeroWidget() {
  const heroCard = document.querySelector('.hero-widget-card');
  if (!heroCard) return;

  const durationChips = heroCard.querySelectorAll('.duration-chip');
  const formatChips = heroCard.querySelectorAll('.format-chip-btn');
  const slotRadios = heroCard.querySelectorAll('.slot-radio');
  const priceDisplay = heroCard.querySelector('.widget-price-val');
  const checkoutBtn = heroCard.querySelector('#heroCheckoutBtn');

  const basePrices = {
    '12h': 4800,
    '24h': 7200,
    '48h': 10500,
    'week': 15800
  };

  const formatMultipliers = {
    'photo': { mod: 1.0, label: 'Пост с фото' },
    'repost': { mod: 0.75, label: 'Репост из канала' },
    'story': { mod: 0.60, label: 'История (Stories)' },
    'link': { mod: 0.85, label: 'Нативная ссылка' }
  };

  let currentDuration = '24h';
  let currentFormat = 'photo';
  let currentSlot = 's2';

  // Выбор формата (Пост, Репост, История, Ссылка)
  formatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      formatChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFormat = chip.dataset.format || 'photo';
      updateHeroPrice();
    });
  });

  // Выбор срока (12ч, 24ч, 48ч, Неделя)
  durationChips.forEach(chip => {
    chip.addEventListener('click', () => {
      durationChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentDuration = chip.dataset.duration || '24h';
      updateHeroPrice();
    });
  });

  // Выбор слота
  slotRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      currentSlot = radio.value;
      updateHeroPrice();
    });
  });

  function updateHeroPrice() {
    if (!priceDisplay) return;
    const base = basePrices[currentDuration] || 7200;
    const fmt = formatMultipliers[currentFormat] || { mod: 1.0 };
    const calculated = Math.round(base * fmt.mod);

    // Анимация обновления цены
    priceDisplay.style.transform = 'scale(1.15)';
    priceDisplay.style.color = '#C05572';
    priceDisplay.style.transition = 'transform 0.15s ease, color 0.15s ease';

    setTimeout(() => {
      priceDisplay.textContent = calculated.toLocaleString('ru-RU') + ' ₽';
      priceDisplay.style.transform = 'scale(1)';
      priceDisplay.style.color = 'var(--text-primary)';
    }, 120);

    if (checkoutBtn) {
      checkoutBtn.href = `checkout.html?channel=tech-future&slot=${encodeURIComponent(currentSlot)}&dur=${encodeURIComponent(currentDuration)}&fmt=${encodeURIComponent(currentFormat)}`;
    }
  }

  // Первоначальный вызов
  updateHeroPrice();
}

// Contact Form Handler
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]')?.value || 'Гость';
    const tg = form.querySelector('[name="telegram"]')?.value || '@username';

    if (typeof addCrmLead === 'function') {
      addCrmLead({
        name,
        telegram: tg,
        channel: 'Запрос на рекламу',
        platform: 'Telegram + MAX',
        tariff: 'Индивидуальный',
        slot: 'Срочный подбор',
        price: 5000,
        status: 'Ожидает ответа'
      });
    }

    showToast(`Заявка принята! Бот свяжется с ${tg} в течение 5 минут.`, 'success');
    form.reset();
  });
}

// Toast Notification
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '🔔';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
