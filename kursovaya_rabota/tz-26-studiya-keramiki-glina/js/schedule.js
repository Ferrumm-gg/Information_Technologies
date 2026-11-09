/* schedule.js — расписание на 14 дней (schedule.html): свободные места, выбор слота, событие slot_select */
(function () {
  'use strict';

  var list = document.getElementById('days');
  if (!list) return;
  var analytics = window.glinaAnalytics;
  var prices = window.glinaPrices;

  var WEEKDAY_TIMES = ['12:00', '15:00', '19:00'];
  var WEEKEND_TIMES = ['11:00', '14:00', '17:00'];
  var SEATS_TOTAL = 10;

  // Свободные места: 14 дней × 3 слота. Число — сколько мест на круге ещё свободно (0 — мест нет).
  // В студии этот массив обновляет администратор.
  var FREE_SEATS = [
    [6, 3, 0], [8, 2, 5], [10, 7, 1], [4, 0, 9], [10, 6, 2], [3, 1, 0], [7, 4, 8],
    [9, 5, 2], [10, 10, 6], [0, 3, 7], [5, 8, 1], [10, 4, 2], [2, 0, 6], [8, 9, 10]
  ];

  var DAY_NAMES = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  var query = new URLSearchParams(window.location.search);
  var formatSelect = document.getElementById('s-format');
  if (query.get('class_format') && prices.FORMATS[query.get('class_format')]) formatSelect.value = query.get('class_format');

  var booking = document.getElementById('booking');
  var bookingText = document.getElementById('booking-text');
  var peopleBox = document.getElementById('b-people');
  var minus = document.getElementById('b-minus');
  var plus = document.getElementById('b-plus');
  var cta = document.getElementById('booking-cta');
  var selected = null; // { date: '2026-11-10', time: '12:00', seats: 6, label: '...' }
  var people = Math.max(1, Math.min(12, Number(query.get('people')) || 1));

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  // Нарисовать 14 дней начиная с сегодняшнего
  function render() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var html = '';
    for (var i = 0; i < 14; i++) {
      var day = new Date(today.getTime() + i * 86400000);
      var weekend = day.getDay() === 0 || day.getDay() === 6;
      var times = weekend ? WEEKEND_TIMES : WEEKDAY_TIMES;
      var title = day.getDate() + ' ' + MONTHS[day.getMonth()] + ', ' + DAY_NAMES[day.getDay()];
      html += '<li class="day' + (weekend ? ' is-weekend' : '') + '"><h3>' + title + '</h3><div class="slots">';
      for (var k = 0; k < times.length; k++) {
        var seats = FREE_SEATS[i][k];
        var text = seats === 0 ? 'мест нет' : 'свободно ' + seats + ' из ' + SEATS_TOTAL;
        html += '<button type="button" class="slot' + (seats > 0 && seats <= 2 ? ' is-low' : '') + '"' +
          ' data-date="' + isoDate(day) + '" data-time="' + times[k] + '" data-seats="' + seats + '"' +
          ' data-label="' + title + ', ' + times[k] + '" aria-pressed="false"' + (seats === 0 ? ' disabled' : '') + '>' +
          '<span>' + times[k] + '</span><small>' + text + '</small></button>';
      }
      html += '</div></li>';
    }
    list.innerHTML = html;
  }

  // Число гостей не больше свободных мест (и не больше 12)
  function updateBooking() {
    var max = selected ? Math.min(selected.seats, 12) : 12;
    if (people > max) people = max;
    peopleBox.textContent = people;
    minus.disabled = people <= 1;
    plus.disabled = people >= max;
    var res = prices.calc(formatSelect.value, people);
    bookingText.textContent = selected
      ? 'Выбрано: ' + selected.label + ' · ' + res.name + ' · ' + prices.rub(res.total)
      : 'Выберите время';
    cta.href = 'contacts.html?lead_type=class&class_format=' + formatSelect.value + '&people=' + people +
      (selected ? '&slot=' + selected.date + 'T' + selected.time : '');
  }

  list.addEventListener('click', function (event) {
    var btn = event.target.closest('.slot');
    if (!btn || btn.disabled) return;
    list.querySelectorAll('.slot[aria-pressed="true"]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    btn.setAttribute('aria-pressed', 'true');
    selected = { date: btn.dataset.date, time: btn.dataset.time, seats: Number(btn.dataset.seats), label: btn.dataset.label };
    booking.hidden = false;
    updateBooking();
    analytics.track('slot_select', { slot_date: selected.date, slot_time: selected.time, seats_left: selected.seats });
  });

  minus.addEventListener('click', function () { if (people > 1) { people -= 1; updateBooking(); } });
  plus.addEventListener('click', function () { people += 1; updateBooking(); });
  formatSelect.addEventListener('change', updateBooking);

  render();
  updateBooking();
})();
