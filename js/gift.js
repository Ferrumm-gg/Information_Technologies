/* gift.js — предпросмотр подарочного сертификата на gift.html: события gift_select и gift_preview */
(function () {
  'use strict';

  var form = document.getElementById('gift-form');
  if (!form) return;
  var analytics = window.glinaAnalytics;
  var nameInput = document.getElementById('g-name');
  var wishInput = document.getElementById('g-wish');
  var cta = document.getElementById('gift-cta');
  var timer = null;

  function current() {
    return form.querySelector('input[name="gift"]:checked');
  }

  function counter(input, box, max) {
    box.textContent = input.value.length + ' из ' + max + ' символов';
  }

  // Обновить макет сертификата; textContent — введённый текст не станет HTML-кодом
  function render() {
    var choice = current();
    var isFormat = choice.dataset.giftType === 'format';
    document.getElementById('cert-what').textContent = isFormat
      ? 'на мастер-класс ' + choice.dataset.label
      : 'номиналом ' + choice.dataset.label.replace('на ', '');
    document.getElementById('cert-name').textContent = nameInput.value.trim() || 'имя получателя';
    document.getElementById('cert-wish').textContent = wishInput.value.trim();
    counter(nameInput, document.getElementById('g-name-count'), 30);
    counter(wishInput, document.getElementById('g-wish-count'), 80);
    // Для сертификата на сумму формат выберет получатель — в заявке по умолчанию гончарный круг
    var format = isFormat ? choice.value.split(':')[1] : 'wheel';
    cta.href = 'contacts.html?lead_type=gift&class_format=' + format + '&gift=' + encodeURIComponent(choice.value);
  }

  // gift_preview — не на каждую букву, а через 0,8 с после окончания ввода
  function previewLater() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      analytics.track('gift_preview', { gift_type: current().dataset.giftType });
    }, 800);
  }

  form.addEventListener('change', function (event) {
    if (event.target.name !== 'gift') return;
    render();
    analytics.track('gift_select', {
      gift_type: event.target.dataset.giftType,
      gift_amount: Number(event.target.dataset.giftAmount)
    });
    previewLater();
  });
  nameInput.addEventListener('input', function () { render(); previewLater(); });
  wishInput.addEventListener('input', function () { render(); previewLater(); });

  render();
})();
