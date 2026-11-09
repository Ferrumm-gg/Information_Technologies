# Инструкция по сервисам

Код сайта готов. Чтобы проект заработал полностью, Исполнитель выполняет шаги ниже в своих аккаунтах
(GitHub, Vercel, Google, Instagram, Яндекс). После каждого шага — коммит и push в `main`.

## 1. Публикация на Vercel (раздел 3.4) — сделано

Сайт: https://tz-26-studiya-keramiki-glina.vercel.app/ (проект Vercel `tz-26-studiya-keramiki-glina`, обновляется после каждого push в `main`).

1. vercel.com → Add New → Project → импортировать репозиторий `tz-26-studiya-keramiki-glina`.
2. Framework Preset: **Other**, Build Command пустой, Output Directory пустой → Deploy.
3. Адрес вида `https://<имя>.vercel.app` вписать в `README.md`. Если он отличается от
   `https://tz-26-studiya-keramiki-glina.vercel.app`, заменить адрес во всех `.html` (canonical, og:url, og:image)
   и в `docs/utm.csv`.

## 2. Google Analytics 4 (раздел 4)

1. analytics.google.com → Администратор → Создать ресурс «ГЛИНА — сайт», часовой пояс (GMT+03:00) Москва, валюта — российский рубль.
2. Веб-поток с адресом сайта на Vercel; в «Расширенной статистике» включить все пункты, включая взаимодействия с формами.
3. Скопировать идентификатор `G-…` и заменить заглушку `G-XXXXXXXXXX` во всех 11 HTML-файлах (Найти и заменить в VS Code).
4. Admin → Custom definitions → 7 параметров уровня события из [events.md](events.md).
5. Admin → Events → отметить ключевыми `generate_lead`, `contact_click`, `messenger_click` (появятся после первых событий, до 24 ч).
6. DebugView: открыть сайт с `?debug_mode=1`, вызвать каждое событие, снимки — в `screens/ga4/`.

## 3. Таблица заявок и Apps Script (раздел 6)

1. Создать Google Таблицу «Glina — Leads».
2. Расширения → Apps Script → вставить код из `apps-script/Code.gs` → сохранить.
3. Выполнить функцию `setupSheet()` — создадутся лист `leads`, заголовки, списки и подсветка.
4. Выполнить `testDoPost()` — первая строка запишется, вторая вернёт `duplicate_request_id` (испытание И-05).
5. Развернуть → Новое развёртывание → Веб-приложение: «Выполнять как: я», «Доступ: все».
6. URL вида `https://script.google.com/macros/s/…/exec` вставить в `js/form.js` (`ENDPOINT`), push.
7. Отправить тестовую заявку с сайта, проверить строку в таблице и `generate_lead` в Realtime.
8. Доступ на просмотр — e-mail Заказчика.

## 4. UTM, соцсети и QR (раздел 5)

1. В таблице создать лист `utm`, перенести `docs/utm.csv`; полную ссылку собирать формулой из столбцов меток.
2. Для ВКонтакте и Telegram сделать короткие ссылки в clck.ru, вписать в реестр.
3. Опубликовать ссылки в Instagram, ВКонтакте, Telegram и YouTube, вписать адрес и дату публикации.
4. Ники двух однокурсников-блогеров вписать вместо `blogger_one` и `blogger_two`.
5. Проверить каждую ссылку по разделу 5.5, снимки — в `screens/utm/`.

## 5. ManyChat (раздел 7)

1. Профессиональный аккаунт Instagram проекта подключить к ManyChat.
2. Автоматизация «IG · Wheel Nov 2026 · Cup Reel»: комментарий к Reel, слово `ГЛИНА`, три варианта ответа,
   сообщение в Direct с кнопкой «Открыть советы» → ссылка U-02.
3. Вторая ветка: слово `ПОДАРОК` → кнопка «Сертификат» → ссылка U-03.
4. Live, проверка со второго аккаунта, снимки — в `screens/instagram/`.

## 6. Отчёты и DataLens (раздел 8)

Через 24–48 часов после проверок: отчёты и исследования GA4 (снимки в `screens/reports/` и `screens/explore/`),
дашборд DataLens из трёх вкладок (`screens/datalens/`), записка [report.md](report.md).
