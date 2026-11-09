/* calc.js — калькулятор на classes.html: формат и число гостей → стоимость, событие class_calc */
(function () {
  'use strict';

  var form = document.getElementById('calc');
  if (!form) return;
  var prices = window.glinaPrices;
  var analytics = window.glinaAnalytics;
  var peopleBox = document.getElementById('people');
  var minus = document.getElementById('people-minus');
  var plus = document.getElementById('people-plus');
  var note = document.getElementById('people-note');
  var people = 1;

  function format() {
    return form.querySelector('input[name="class_format"]:checked').value;
  }

  // Пересчитать и показать сумму; send = true — отправить class_calc
  function update(send) {
    var res = prices.calc(format(), people);
    peopleBox.textContent = people;
    minus.disabled = people <= 1;
    plus.disabled = people >= prices.MAX_PEOPLE;
    note.textContent = res.format === 'corporate' ? 'Корпоратив: от 6 до 12 человек, меньше 6 — как за 6.'
      : res.format === 'date' ? '«Свидание на круге» — цена за пару (двое за одним кругом).' : 'От 1 до 12 человек.';
    document.getElementById('calc-sum').textContent = prices.rub(res.total);
    document.getElementById('calc-formula').textContent = res.formula;
    document.getElementById('calc-cta').href = 'schedule.html?class_format=' + res.format + '&people=' + people;
    if (send) {
      analytics.track('class_calc', { class_format: res.format, people: people, total_price: res.total });
    }
  }

  minus.addEventListener('click', function () { if (people > 1) { people -= 1; update(true); } });
  plus.addEventListener('click', function () { if (people < prices.MAX_PEOPLE) { people += 1; update(true); } });
  form.addEventListener('change', function () { update(true); });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    update(true);
  });

  // Карточка формата выбирает его в калькуляторе
  document.querySelectorAll('.class-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = form.querySelector('input[value="' + btn.dataset.classFormat + '"]');
      if (input) { input.checked = true; update(false); }
    });
  });

  update(false);
})();
