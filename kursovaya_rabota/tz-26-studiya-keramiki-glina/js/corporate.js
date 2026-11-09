/* corporate.js — кнопка «Рассчитать» на corporate.html: стоимость корпоратива, событие class_calc */
(function () {
  'use strict';

  var btn = document.getElementById('corp-calc-btn');
  if (!btn) return;
  var input = document.getElementById('corp-people');
  var prices = window.glinaPrices;

  function calculate() {
    var people = Math.max(1, Math.min(12, Math.round(Number(input.value) || 1)));
    input.value = people;
    var res = prices.calc('corporate', people); // меньше 6 гостей — считается как 6
    document.getElementById('corp-sum').textContent = prices.rub(res.total);
    document.getElementById('corp-formula').textContent = res.formula;
    document.getElementById('corp-cta').href = 'contacts.html?lead_type=class&class_format=corporate&people=' + people;
    window.glinaAnalytics.track('class_calc', { class_format: 'corporate', people: people, total_price: res.total });
  }

  btn.addEventListener('click', calculate);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); calculate(); }
  });
})();
