/* analytics.js — все вызовы gtag('event', ...) сайта «Глина».
   Кнопки и ссылки описываются атрибутами data-event и data-* в HTML,
   а этот файл находит их и отправляет событие в Google Analytics 4.
   Другие скрипты (калькулятор, расписание, сертификат, форма) вызывают window.glinaAnalytics.track(). */
(function () {
  'use strict';

  // Режим отладки выключен. Для снимков DebugView откройте сайт с ?debug_mode=1 —
  // до закрытия вкладки к каждому событию добавится debug_mode: true
  var debug = false;
  try {
    if (/[?&]debug_mode=1\b/.test(window.location.search)) sessionStorage.setItem('glina_debug', '1');
    debug = sessionStorage.getItem('glina_debug') === '1';
  } catch (e) { debug = false; }

  // Параметры, которые разрешено брать из data-атрибутов (имя в snake_case)
  var ALLOWED_PARAMS = [
    'button_name', 'page_section', 'contact_type', 'messenger', 'network',
    'promo_code', 'class_format', 'photo_index', 'video_title'
  ];

  // Отправить событие в GA4. callback вызывается после отправки (или через 1,2 с)
  function track(eventName, params, callback) {
    var data = {};
    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];
      if (value === undefined || value === null || value === '') return;
      if (typeof value === 'number') data[key] = value;   // числа — как есть
      else data[key] = String(value).slice(0, 100);      // значение не длиннее 100 символов
    });
    if (debug) data.debug_mode = true;

    if (typeof callback === 'function') {
      var called = false;
      var finish = function () {
        if (!called) { called = true; callback(); }
      };
      data.event_callback = finish;
      setTimeout(finish, 1200); // если GA заблокирован, всё равно продолжаем
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, data);
    } else if (data.event_callback) {
      data.event_callback();
    }
  }

  // data-button-name="hero_gift" → { button_name: "hero_gift" }; photo_index — число
  function paramsFromElement(el) {
    var params = {};
    Object.keys(el.dataset).forEach(function (key) {
      var snake = key.replace(/[A-Z]/g, function (letter) { return '_' + letter.toLowerCase(); });
      if (ALLOWED_PARAMS.indexOf(snake) !== -1) params[snake] = el.dataset[key];
    });
    if (params.photo_index) params.photo_index = Number(params.photo_index);
    return params;
  }

  // Один обработчик кликов на весь документ: работает и для кнопок, созданных скриптом
  document.addEventListener('click', function (event) {
    var el = event.target.closest('[data-event]');
    if (!el || el.disabled) return;
    track(el.dataset.event, paramsFromElement(el));
  });

  // Доступ для других скриптов: calc.js, schedule.js, gift.js, gallery.js, corporate.js, form.js
  window.glinaAnalytics = { track: track };
})();
