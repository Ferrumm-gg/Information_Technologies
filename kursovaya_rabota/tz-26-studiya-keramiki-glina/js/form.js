/* form.js — форма заявки на contacts.html: запись на мастер-класс или заказ сертификата.
   Проверка полей, UTM-метки, отправка в Apps Script (fetch), события generate_lead и form_error */
(function () {
  'use strict';

  // Адрес веб-приложения Apps Script (Развернуть → Веб-приложение → URL). Пусто — приёмник ещё не подключён
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycby1pHpLc3CZZSEYhjfRm38qCSL_a9eK5YZVPwWYhcsOm5f8Qy2g1DigxKxrtIbLxzrF/exec';

  var form = document.getElementById('lead-form');
  if (!form) return;
  var els = form.elements; // поля формы по атрибуту name

  var LEAD_TYPES = ['class', 'gift'];
  var FORMATS = ['wheel', 'date', 'handbuilding', 'course', 'corporate'];
  var submitBtn = document.getElementById('f-submit');
  var statusBox = document.getElementById('form-status');
  var slotBox = document.getElementById('field-slot');
  var sumBox = document.getElementById('lead-sum');
  var analytics = window.glinaAnalytics;
  var prices = window.glinaPrices;
  var params = new URLSearchParams(window.location.search);
  var giftChoice = params.get('gift') || ''; // format:wheel или amount:3000 со страницы сертификата

  function storage(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }

  /* ---------- Номер заявки: REQ- + UUID ---------- */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  els.request_id.value = 'REQ-' + uuid();

  /* ---------- UTM-метки: из адреса страницы или из sessionStorage ---------- */
  function readUtm() {
    var saved = {};
    try { saved = JSON.parse(storage('glina_utm')) || {}; } catch (e) { saved = {}; }
    function pick(key) { return (params.get(key) || saved[key] || '').slice(0, 200); }
    return {
      utm_source: pick('utm_source') || 'direct',
      utm_medium: pick('utm_medium') || 'none',
      utm_campaign: pick('utm_campaign') || 'not_set',
      utm_content: pick('utm_content') || 'not_set'
    };
  }
  var utm = readUtm();
  Object.keys(utm).forEach(function (key) { els[key].value = utm[key]; });

  /* ---------- Параметры из расписания, калькулятора и сертификата ---------- */
  // contacts.html?lead_type=class&class_format=wheel&people=2&slot=2026-11-12T15:00
  function prefill(field, value) {
    var option = value && els[field].querySelector('option[value="' + value + '"]');
    if (option) els[field].value = value;
  }
  prefill('lead_type', params.get('lead_type'));
  prefill('class_format', params.get('class_format'));
  prefill('people', params.get('people'));
  var slot = params.get('slot') || '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(slot)) els.slot.value = slot.replace('T', ' ');

  // Ценность заявки: сертификат на сумму — его номинал, иначе — расчёт по формату и числу гостей
  function leadValue() {
    if (els.lead_type.value === 'gift' && giftChoice.indexOf('amount:') === 0) return Number(giftChoice.split(':')[1]) || 0;
    var res = prices.calc(els.class_format.value, els.people.value);
    return res ? res.total : 0;
  }

  // Для сертификата поле slot скрыто и очищается
  function syncForm() {
    var isGift = els.lead_type.value === 'gift';
    slotBox.hidden = isGift;
    if (isGift) els.slot.value = '';
    sumBox.textContent = (isGift ? 'Сертификат: ' : 'Стоимость: ') + prices.rub(leadValue());
  }
  ['lead_type', 'class_format', 'people'].forEach(function (f) { els[f].addEventListener('change', syncForm); });
  syncForm();

  /* ---------- Проверка полей ---------- */
  // +7 (900) 123-45-67, 8 900 123 45 67, 9001234567 → +79001234567
  function normalizePhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) return '+7' + digits.slice(1);
    if (digits.length === 10) return '+7' + digits;
    return value.trim();
  }

  function validate() {
    var errors = [];
    var name = els.name.value.trim();
    var phone = normalizePhone(els.phone.value);
    var email = els.email.value.trim();
    var people = Number(els.people.value);

    if (LEAD_TYPES.indexOf(els.lead_type.value) === -1) errors.push({ field: 'lead_type', type: 'required', text: 'Выберите запись или сертификат' });

    if (!name) errors.push({ field: 'name', type: 'required', text: 'Введите имя' });
    else if (name.length < 2 || name.length > 60) errors.push({ field: 'name', type: 'length', text: 'Имя — от 2 до 60 символов' });

    if (!els.phone.value.trim()) errors.push({ field: 'phone', type: 'required', text: 'Введите номер телефона' });
    else if (!/^\+7\d{10}$/.test(phone)) errors.push({ field: 'phone', type: 'format', text: 'Номер в формате +7 и 10 цифр, например +7 900 123-45-67' });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push({ field: 'email', type: 'format', text: 'Проверьте e-mail: пример — name@mail.ru' });

    if (FORMATS.indexOf(els.class_format.value) === -1) errors.push({ field: 'class_format', type: 'required', text: 'Выберите формат' });
    if (!(people >= 1 && people <= 12)) errors.push({ field: 'people', type: 'format', text: 'Гостей — от 1 до 12' });
    if (!els.consent.checked) errors.push({ field: 'consent', type: 'consent', text: 'Без согласия на обработку данных мы не сможем принять заявку' });

    return errors;
  }

  function showError(field, text) {
    var box = document.getElementById('err-' + field);
    els[field].setAttribute('aria-invalid', 'true');
    box.textContent = text;
    box.hidden = false;
  }

  function clearError(field) {
    els[field].removeAttribute('aria-invalid');
    document.getElementById('err-' + field).hidden = true;
  }

  ['lead_type', 'name', 'phone', 'email', 'class_format', 'people', 'consent'].forEach(function (field) {
    var eventName = els[field].tagName === 'SELECT' || els[field].type === 'checkbox' ? 'change' : 'input';
    els[field].addEventListener(eventName, function () { clearError(field); });
  });

  function setSending(isSending) {
    submitBtn.disabled = isSending; // во время отправки кнопка неактивна
    submitBtn.textContent = isSending ? 'Отправляем…' : 'Отправить заявку';
  }

  function serverFail(message) {
    statusBox.textContent = message;
    statusBox.hidden = false;
    analytics.track('form_error', { field_name: 'form', error_type: 'server' });
    setSending(false);
  }

  /* ---------- Отправка ---------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // без перезагрузки страницы
    statusBox.hidden = true;

    var errors = validate();
    if (errors.length) {
      errors.forEach(function (err) {
        showError(err.field, err.text);
        analytics.track('form_error', { field_name: err.field, error_type: err.type });
      });
      els[errors[0].field].focus();
      return;
    }

    var data = {
      request_id: els.request_id.value,
      name: els.name.value.trim(),
      phone: normalizePhone(els.phone.value),
      email: els.email.value.trim(),
      lead_type: els.lead_type.value,
      class_format: els.class_format.value,
      people: Number(els.people.value),
      slot: els.lead_type.value === 'gift' ? '' : els.slot.value,
      utm_source: els.utm_source.value,
      utm_medium: els.utm_medium.value,
      utm_campaign: els.utm_campaign.value,
      utm_content: els.utm_content.value,
      consent: true
    };

    if (!ENDPOINT) {
      serverFail('Приём заявок ещё не подключён. Позвоните нам: +7 (900) 626-26-62.');
      return;
    }

    setSending(true);
    // text/plain — «простой» запрос, Apps Script принимает его без CORS-ошибки
    fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(data) })
      .then(function (response) { return response.json(); })
      .then(function (answer) {
        if (answer.ok === true) {
          try { sessionStorage.setItem('glina_request_id', data.request_id); } catch (e) { /* не страшно */ }
          // generate_lead — только после ответа приёмника ok: true
          analytics.track('generate_lead', {
            lead_type: data.lead_type,
            lead_format: data.class_format,
            value: leadValue(),
            currency: 'RUB'
          }, function () {
            window.location.href = 'thanks.html';
          });
        } else {
          serverFail('Заявка не отправлена (' + (answer.error || 'ошибка') + '). Проверьте поля или позвоните: +7 (900) 626-26-62.');
        }
      })
      .catch(function () {
        serverFail('Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз или позвоните: +7 (900) 626-26-62.');
      });
  });
})();
