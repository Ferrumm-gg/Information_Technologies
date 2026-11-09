/* prices.js — цены форматов из раздела 2 ТЗ и расчёт стоимости. Используют calc.js, schedule.js, corporate.js, form.js */
(function () {
  'use strict';

  var FORMATS = {
    wheel: { name: 'Гончарный круг', price: 2900, per: 'person' },
    date: { name: 'Свидание на круге', price: 5200, per: 'pair' },
    handbuilding: { name: 'Лепка руками', price: 2400, per: 'person' },
    course: { name: 'Курс 8 занятий', price: 18000, per: 'person' },
    corporate: { name: 'Корпоратив', price: 2400, per: 'person', min: 6 }
  };
  var MAX_PEOPLE = 12;

  function rub(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  // Стоимость: «Свидание» — за каждую пару (2 человека), корпоратив — минимум 6 человек
  function calc(format, people) {
    var f = FORMATS[format];
    if (!f) return null;
    people = Math.max(1, Math.min(MAX_PEOPLE, Number(people) || 1));
    var units, formula;
    if (f.per === 'pair') {
      units = Math.ceil(people / 2);
      formula = units + ' ' + (units === 1 ? 'пара' : units < 5 ? 'пары' : 'пар') + ' × ' + rub(f.price);
    } else {
      units = f.min ? Math.max(people, f.min) : people;
      formula = units + ' × ' + rub(f.price) + (units > people ? ' (минимум ' + f.min + ' человек)' : '');
    }
    return { format: format, name: f.name, people: people, total: units * f.price, formula: formula };
  }

  window.glinaPrices = { FORMATS: FORMATS, MAX_PEOPLE: MAX_PEOPLE, calc: calc, rub: rub };
})();
