/* gallery.js — фото работ крупно (index.html, gallery.html) и запуск видео на главной.
   Событие gallery_view отправляет analytics.js по атрибуту data-event, video_play — этот файл. */
(function () {
  'use strict';

  /* ---------- Фото крупно ---------- */
  var box = document.getElementById('lightbox');
  if (box) {
    var img = document.getElementById('lightbox-img');
    var caption = document.getElementById('lightbox-caption');
    document.querySelectorAll('.photo-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var small = btn.querySelector('img');
        img.src = btn.dataset.full;
        img.alt = small.alt;
        caption.textContent = small.alt;
        if (typeof box.showModal === 'function') box.showModal();
        else window.open(btn.dataset.full, '_blank');
      });
    });
    document.getElementById('lightbox-close').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (event) { if (event.target === box) box.close(); });
  }

  /* ---------- Видео мастер-класса ---------- */
  var play = document.getElementById('video-play');
  if (play) {
    play.addEventListener('click', function () {
      var cover = document.getElementById('video-img');
      cover.src = cover.dataset.animated; // анимация «чашка растёт на круге»
      cover.alt = 'Видео: чашка из глины появляется на гончарном круге за 2 часа';
      play.hidden = true;
      window.glinaAnalytics.track('video_play', { video_title: play.dataset.videoTitle });
    });
  }
})();
