# События GA4 — сайт «Глина»

Все вызовы `gtag('event', …)` находятся в [`js/analytics.js`](../js/analytics.js) (функция `track`).
Кнопки и ссылки размечены атрибутами `data-event` и `data-*`; общий обработчик кликов
`js/analytics.js:64` находит такие элементы и отправляет событие. События, которые зависят
от расчёта (калькулятор, расписание, сертификат, форма), скрипты страниц отправляют через
`window.glinaAnalytics.track()`.

Имена событий и параметров — snake_case, значения обрезаются до 100 символов
(`js/analytics.js`, функция `track`). Имя, телефон и e-mail в GA4 не передаются.

| № | Событие | Тип | Где отправляется (файл:строка) | Параметры и пример значений |
|---|---|---|---|---|
| 1 | `page_view` | авто | тег Google в `<head>` каждой страницы | `page_location`, `page_title` |
| 2 | `scroll` | авто | расширенная статистика GA4 | `percent_scrolled = 90` |
| 3 | `click` | авто | расширенная статистика GA4 (внешние ссылки) | `link_url = https://t.me/glina_admin`, `outbound = true` |
| 4 | `file_download` | авто | `corporate.html:105` — ссылка на PDF | `file_name = /files/corporate-glina.pdf`, `file_extension = pdf` |
| 5 | `form_start` | авто | форма `contacts.html:77` | `form_id = lead-form` |
| 6 | `form_submit` | авто | форма `contacts.html:77` | `form_id = lead-form` |
| 7 | `generate_lead` ★ | рекоменд. | `js/form.js:188` — только после ответа приёмника `ok: true` | `lead_type = class`, `lead_format = wheel`, `value = 5800`, `currency = RUB` |
| 8 | `cta_click` | своё | `js/analytics.js:64`, разметка: `index.html:78` и кнопки на всех страницах | `button_name = hero_gift`, `page_section = hero` |
| 9 | `class_view` | своё | `js/analytics.js:64`, разметка: `index.html:94`, `classes.html` | `class_format = wheel` |
| 10 | `class_calc` | своё | `js/calc.js:31`, `js/corporate.js:17` | `class_format = corporate`, `people = 5`, `total_price = 14400` |
| 11 | `slot_select` | своё | `js/schedule.js:87` | `slot_date = 2026-11-11`, `slot_time = 19:00`, `seats_left = 1` |
| 12 | `gift_select` | своё | `js/gift.js:48` | `gift_type = amount`, `gift_amount = 3000` |
| 13 | `gift_preview` | своё | `js/gift.js:41` (через 0,8 с после ввода) | `gift_type = format` |
| 14 | `promo_copy` | своё | `js/analytics.js:64`, разметка: `first-wheel.html:127` | `promo_code = CLAY10` |
| 15 | `contact_click` ★ | своё | `js/analytics.js:64`, разметка: шапка `index.html:61`, подвал, `contacts.html` | `contact_type = phone`, `page_section = header` |
| 16 | `messenger_click` ★ | своё | `js/analytics.js:64`, разметка: `contacts.html:160` | `messenger = telegram` |
| 17 | `social_click` | своё | `js/analytics.js:64`, разметка: подвал `index.html:218`, `thanks.html` | `network = instagram`, `page_section = footer` |
| 18 | `form_error` | своё | `js/form.js:140` (сервер), `js/form.js:153` (поле) | `field_name = phone`, `error_type = format` |
| 19 | `gallery_view` | по выбору | `js/analytics.js:64`, разметка: `gallery.html:77`, `index.html` | `photo_index = 1` |
| 20 | `video_play` | по выбору | `js/gallery.js:33` | `video_title = Первая чашка на круге: 2 часа за 30 секунд` |

★ — ключевые события (Key events): `generate_lead`, `contact_click`, `messenger_click`.

## Пользовательские параметры (Admin → Custom definitions, Event scope)

Созданы 09.11.2026 в ресурсе «ГЛИНА — сайт», снимок — [`screens/ga4/custom-dimensions.jpg`](../screens/ga4/custom-dimensions.jpg).

| Параметр | События |
|---|---|
| `button_name` | `cta_click` |
| `page_section` | `cta_click`, `social_click` |
| `class_format` | `class_view`, `class_calc` |
| `seats_left` | `slot_select` |
| `gift_type` | `gift_select`, `gift_preview` |
| `lead_type` | `generate_lead` |
| `messenger` | `messenger_click` |

## Проверка в DebugView

Откройте сайт с `?debug_mode=1` в адресе: до закрытия вкладки к каждому событию добавляется
`debug_mode: true`, и события видны в Admin → DebugView. В коде отладка по умолчанию выключена.
Снимки каждого события сохраняются в `screens/ga4/<имя события>.png`.

**Статус:** события проверены локально подменой `gtag` (параметры приходят правильные).
Ресурс GA4 «ГЛИНА — сайт» (`G-BGHCC4TERY`) создан, тег стоит на всех 11 страницах. 09.11.2026 первый визит с телефона дошёл до Realtime: `page_view`, `first_visit`, `session_start` — снимок [`screens/ga4/realtime-first-visit.jpg`](../screens/ga4/realtime-first-visit.jpg). 

**Ограничение.** Сервер Google-тега (googletagmanager.com) из домашней сети и с мобильного интернета исполнителя не открывается (ошибка SSL), VPN нет. Поэтому в ресурс приходят только визиты через другие сети: 09.11.2026 в Realtime были `page_view`, `first_visit`, `session_start`, `scroll` (снимок `screens/ga4/realtime-first-visit.jpg`). Заявки при этом доходят до таблицы: 09.11.2026 с компьютера и с телефона по LTE пришли строки «миша» и «Паа» — но событий `generate_lead` в GA4 от них нет. Свои события проверены в коде подменой `gtag` (параметры совпадают с таблицей выше); снимки DebugView, ключевые события и отчёты требуют доступа к Google-тегу.
