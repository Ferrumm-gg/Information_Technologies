# «Глина» — сайт студии керамики и гончарного круга

Курсовая работа по дисциплине **ОП.03 «Информационные технологии»**, ТЗ-26/2026.

**Исполнитель:** Артёменко Михаил Александрович
**Группа:** 9/2-РПО-25/3

## Ссылки

| Что | Ссылка |
|---|---|
| Сайт на Vercel | [tz-26-studiya-keramiki-glina.vercel.app](https://tz-26-studiya-keramiki-glina.vercel.app/) |
| Репозиторий | [Ferrumm-gg/tz-26-studiya-keramiki-glina](https://github.com/Ferrumm-gg/tz-26-studiya-keramiki-glina) |
| Таблица заявок «Glina — Leads» | ещё не создана |
| Дашборд DataLens | ещё не создан |
| Instagram и Reel с автоответами | ещё не созданы |
| ВКонтакте, Telegram, YouTube | ещё не созданы |
| Бланк сдачи | [kursovaya.md](kursovaya.md) |

Ресурс GA4: ещё не создан — в HTML стоит заглушка `G-XXXXXXXXXX`.
Доступ Viewer к ресурсу GA4 выдан: ___ (e-mail Заказчика)

## Что сделано

| Часть | Результат | Статус |
|---|---|---|
| Сайт | 10 страниц и 404, HTML/CSS/JS без сборки, адаптив 375/768/1280, OG-теги, значок | опубликован на Vercel, обновляется после push в `main` |
| Расписание | 14 дней, свободные места массивом в JS, неактивные слоты, ограничение по местам | готово, проверено |
| Калькулятор | 5 форматов, «Свидание» за пару, корпоратив минимум 6 человек | готово, проверено (И-13) |
| Сертификат | формат или сумма, имя и пожелание на макете, номер GL-2026-XXXX | готово, проверено |
| События GA4 | 20 событий в `js/analytics.js` — [docs/events.md](docs/events.md) | в коде готово; в GA4 не проверено |
| Заявки | форма и приёмник `apps-script/Code.gs` | код готов; приёмник не развёрнут |
| UTM | реестр 12 ссылок [docs/utm.csv](docs/utm.csv), QR [docs/qr-u-12.png](docs/qr-u-12.png), афиша [docs/afisha.pdf](docs/afisha.pdf) | подготовлено; публикаций нет |
| Instagram, ManyChat | тексты — [docs/posts.md](docs/posts.md) | не настроено |
| Отчёты, DataLens | шаблон записки — [docs/report.md](docs/report.md) | нет данных |

## Документы

| Документ | Ссылка |
|---|---|
| Описание работы | [docs/opisanie.md](docs/opisanie.md) |
| Журнал запросов к нейросети | [docs/prompts.md](docs/prompts.md) |
| Таблица событий GA4 | [docs/events.md](docs/events.md) |
| Реестр UTM-ссылок | [docs/utm.csv](docs/utm.csv) |
| Источники изображений | [docs/images.md](docs/images.md) |
| Сценарии приёмки | [docs/acceptance.md](docs/acceptance.md) |
| Инструкция по сервисам | [docs/setup.md](docs/setup.md) |
| Тексты публикаций | [docs/posts.md](docs/posts.md) |
| Аналитическая записка | [docs/report.md](docs/report.md) |

## Структура

```
index.html  classes.html  schedule.html  gift.html  gallery.html  corporate.html
first-wheel.html  contacts.html  thanks.html  privacy.html  404.html
css/style.css
js/analytics.js   все события GA4
js/main.js        меню, UTM-метки, промокод, номер заявки
js/prices.js      цены и расчёт стоимости
js/calc.js  js/schedule.js  js/gift.js  js/gallery.js  js/corporate.js  js/form.js
img/  files/corporate-glina.pdf
apps-script/Code.gs
docs/
screens/ga4/  utm/  instagram/  reports/  explore/  datalens/  lighthouse/
```

## Технологии

HTML, CSS, JavaScript · Google Analytics 4 · Google Apps Script и Google Таблицы · ManyChat ·
Yandex DataLens · GitHub и Vercel.

Не получилось: пока не подключены сервисы в аккаунтах — GA4, таблица и Apps Script, соцсети, ManyChat, DataLens; отчётов и снимков ещё нет.
Нейросеть использовалась для: структуры и вёрстки страниц, JavaScript (расписание, калькулятор, сертификат, форма, события), приёмника Apps Script, иллюстраций, PDF и документации — см. [docs/prompts.md](docs/prompts.md).
