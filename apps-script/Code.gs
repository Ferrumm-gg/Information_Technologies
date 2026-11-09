/**
 * Приёмник заявок «Глина» — веб-приложение Google Apps Script.
 * Принимает заявку с формы сайта (POST, JSON) и дописывает строку в лист leads
 * таблицы «Glina — Leads». Ответ: {"ok": true} или {"ok": false, "error": "..."}.
 *
 * Установка (подробно — docs/setup.md, шаг 3):
 * 1. script.google.com → Новый проект «Glina — приёмник заявок» → вставить этот код.
 * 2. В SPREADSHEET_ID — ID таблицы «Glina — Leads» (из её адреса).
 * 3. Запустить setupSheet() один раз — создаст заголовки, списки и подсветку.
 * 4. Развернуть → Новое развёртывание → Веб-приложение:
 *    «Выполнять как: я», «Доступ: все». Полученный URL вставить в js/form.js (ENDPOINT).
 */

// ID таблицы «Glina — Leads» (проект Apps Script отдельный, не привязан к таблице)
const SPREADSHEET_ID = '16WRAn4umBiwx8ZZqlG9cZMUbC_WKkX65bWT9Z_J17l8';
const SHEET_NAME = 'leads';

const HEADERS = ['request_id', 'created_at', 'name', 'phone', 'email', 'lead_type', 'class_format', 'people',
  'slot', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'status'];
const LEAD_TYPES = ['class', 'gift'];
const FORMATS = ['wheel', 'date', 'handbuilding', 'course', 'corporate'];
const STATUSES = ['new', 'confirmed', 'paid', 'attended', 'cancelled'];
const MAX_LENGTH = 200;

/* ---------------- Приём заявки ---------------- */

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // две заявки одновременно не запишутся в одну строку

    const data = parseRequest_(e);
    const error = validate_(data);
    if (error) return json_({ ok: false, error: error });

    const sheet = getSheet_();
    if (isDuplicate_(sheet, data.request_id)) {
      return json_({ ok: false, error: 'duplicate_request_id' }); // повтор не создаёт вторую строку
    }

    sheet.appendRow([
      data.request_id,
      new Date(),                 // created_at ставит приёмник
      data.name,
      "'" + data.phone,           // апостроф: «+7…» остаётся текстом, а не числом
      data.email,
      data.lead_type,
      data.class_format,
      Number(data.people),
      data.slot,
      data.utm_source,
      data.utm_medium,
      data.utm_campaign,
      data.utm_content,
      'new'                       // status из браузера игнорируется
    ]);
    return json_({ ok: true, request_id: data.request_id });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

// Проверка, что приёмник работает: открыть URL веб-приложения в браузере
function doGet() {
  return json_({ ok: true, service: 'glina-leads' });
}

/* ---------------- Вспомогательные функции ---------------- */

// Тело запроса: JSON (основной вариант) или обычные поля формы
function parseRequest_(e) {
  let raw = {};
  if (e && e.postData && e.postData.contents) {
    try {
      raw = JSON.parse(e.postData.contents);
    } catch (err) {
      raw = e.parameter || {};
    }
  } else if (e && e.parameter) {
    raw = e.parameter;
  }

  const text = function (key) {
    return raw[key] === undefined || raw[key] === null ? '' : String(raw[key]).trim();
  };

  const data = {
    request_id: text('request_id'),
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    lead_type: text('lead_type'),
    class_format: text('class_format'),
    people: text('people'),
    slot: text('slot'),
    utm_source: text('utm_source') || 'direct',
    utm_medium: text('utm_medium') || 'none',
    utm_campaign: text('utm_campaign') || 'not_set',
    utm_content: text('utm_content') || 'not_set',
    consent: raw.consent === true || raw.consent === 'true' || raw.consent === 'on'
  };
  if (data.lead_type === 'gift') data.slot = ''; // для сертификата время пустое
  return data;
}

// Возвращает код ошибки или null, если заявка правильная
function validate_(d) {
  const fields = ['request_id', 'name', 'phone', 'email', 'lead_type', 'class_format', 'people', 'slot',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  for (let i = 0; i < fields.length; i++) {
    if (d[fields[i]].length > MAX_LENGTH) return fields[i] + '_too_long';
  }
  if (!d.request_id) return 'request_id_required';
  if (!/^REQ-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.request_id)) return 'request_id_format';
  if (!d.name) return 'name_required';
  if (d.name.length < 2 || d.name.length > 60) return 'name_length';
  if (!d.phone) return 'phone_required';
  if (!/^\+7\d{10}$/.test(d.phone)) return 'phone_format';
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return 'email_format';
  if (LEAD_TYPES.indexOf(d.lead_type) === -1) return 'lead_type_invalid';
  if (FORMATS.indexOf(d.class_format) === -1) return 'class_format_invalid';
  if (!/^\d{1,2}$/.test(d.people) || Number(d.people) < 1 || Number(d.people) > 12) return 'people_invalid';
  if (d.slot && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(d.slot)) return 'slot_format';
  if (!d.consent) return 'consent_required';
  return null;
}

function getSheet_() {
  const sheet = openSpreadsheet_().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Нет листа ' + SHEET_NAME + ': запустите setupSheet()');
  return sheet;
}

// Есть ли уже строка с таким request_id (ищем в столбце A целую ячейку)
function isDuplicate_(sheet, requestId) {
  const found = sheet.getRange('A:A').createTextFinder(requestId).matchEntireCell(true).findNext();
  return found !== null;
}

function openSpreadsheet_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- Настройка таблицы (запустить один раз вручную) ---------------- */

function setupSheet() {
  const ss = openSpreadsheet_();
  ss.setSpreadsheetTimeZone('Europe/Moscow');
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const rows = 1000;

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#F3E6DA');
  sheet.setFrozenRows(1);

  // Текстовый формат: «+79001234567» не превратится в число, «=...» — в формулу
  sheet.getRange(2, 1, rows, HEADERS.length).setNumberFormat('@');
  sheet.getRange(2, 2, rows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss'); // B created_at
  sheet.getRange(2, 8, rows, 1).setNumberFormat('0');                   // H people

  // Выпадающие списки: другое значение отклоняется
  const list = function (values) {
    return SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  };
  sheet.getRange(2, 6, rows, 1).setDataValidation(list(LEAD_TYPES));  // F lead_type
  sheet.getRange(2, 7, rows, 1).setDataValidation(list(FORMATS));     // G class_format
  sheet.getRange(2, 14, rows, 1).setDataValidation(list(STATUSES));   // N status
  sheet.getRange(2, 8, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireNumberBetween(1, 12).setAllowInvalid(false).build());     // H people 1–12

  // Условное форматирование
  const rules = [];
  // повторяющийся request_id — красным
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($A2<>"",COUNTIF($A:$A,$A2)>1)')
    .setBackground('#F4C7C3').setFontColor('#B3261E')
    .setRanges([sheet.getRange('A2:A' + (rows + 1))]).build());
  // пустая обязательная ячейка в заполненной строке — жёлтым (email и slot необязательны)
  ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N'].forEach(function (col) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(COUNTA($A2:$N2)>0,' + col + '2="")')
      .setBackground('#FFF2B3')
      .setRanges([sheet.getRange(col + '2:' + col + (rows + 1))]).build());
  });
  sheet.setConditionalFormatRules(rules);
  sheet.autoResizeColumns(1, HEADERS.length);
}

/* ---------------- Реестр UTM-ссылок (лист utm, раздел 5.3) ---------------- */

const UTM_SITE = 'https://tz-26-studiya-keramiki-glina.vercel.app';
const UTM_HEADERS = ['номер', 'канал', 'размещение', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
  'страница', 'полная ссылка', 'короткая ссылка', 'адрес публикации', 'дата публикации', 'комментарий'];
// номер, канал, размещение, source, medium, campaign, content, страница, комментарий
const UTM_ROWS = [
  ["U-01", "Instagram", "ссылка в шапке профиля", "instagram", "social", "gift_certificates_2026", "bio", "index.html", ""],
  ["U-02", "Instagram", "автоответ под Reel (ManyChat)", "instagram", "social", "wheel_nov_2026", "reel_cup_01", "first-wheel.html", ""],
  ["U-03", "Instagram", "автоответ, ветка «ПОДАРОК»", "instagram", "social", "gift_certificates_2026", "reel_cup_01_gift", "gift.html", ""],
  ["U-04", "Instagram", "ссылка-стикер «Свободные места»", "instagram", "social", "wheel_nov_2026", "stories_01", "schedule.html", "content: первая сторис со стикером — stories_01 по правилу 5.1.4"],
  ["U-05", "ВКонтакте", "пост в сообществе", "vk", "social", "gift_certificates_2026", "post_01", "gift.html", ""],
  ["U-06", "ВКонтакте", "товар «Сертификат» в разделе «Товары»", "vk", "social", "gift_certificates_2026", "market_gift", "gift.html", "campaign: товар продаёт сертификаты к Новому году — та же кампания, что U-05"],
  ["U-07", "Telegram", "пост в канале", "telegram", "social", "wheel_nov_2026", "post_01", "schedule.html", ""],
  ["U-08", "Telegram", "пост в канале афиши города", "telegram", "referral", "gift_certificates_2026", "city_poster_01", "index.html", "content: первое размещение в чужом канале афиши"],
  ["U-09", "YouTube", "описание видео «Первая чашка на круге»", "youtube", "social", "wheel_nov_2026", "video_cup_01", "classes.html", "content: первое видео о мастер-классе"],
  ["U-10", "Блогер 1", "ссылка у партнёра", "blogger_one", "affiliate", "gift_certificates_2026", "stories_01", "gift.html", "source: ник однокурсника-блогера латиницей (заменить на настоящий); content — формат: сторис"],
  ["U-11", "Блогер 2", "ссылка у партнёра", "blogger_two", "affiliate", "wheel_nov_2026", "post_01", "schedule.html", "source: ник однокурсника (заменить на настоящий); content — формат: пост"],
  ["U-12", "Коробки", "QR-код на коробке с готовым изделием", "box_qr", "qr", "repeat_visit_2027", "pottery_box", "classes.html", "QR: docs/qr-u-12.png, афиша: docs/afisha.pdf"]
];

// Короткие ссылки clck.ru для ВКонтакте и Telegram (5.3); переход сохраняет все метки
const UTM_SHORT = {
  'U-05': 'https://clck.ru/3WvMG3',
  'U-06': 'https://clck.ru/3WvMG5',
  'U-07': 'https://clck.ru/3WvMG8',
  'U-08': 'https://clck.ru/3WvMGE'
};

// Адрес и дата публикации по строкам реестра
const UTM_PUB = {
  'U-07': ['https://t.me/glina_ceramics_studio/2', '09.11.2026']
};

/* Запустить один раз: создаёт лист utm. Полная ссылка (столбец I) — формула из столбцов меток,
   адрес сайта — в ячейке O1. Адрес и дата публикации заполняются вручную. */
function setupUtmSheet() {
  const ss = openSpreadsheet_();
  const sheet = ss.getSheetByName('utm') || ss.insertSheet('utm');
  sheet.clear();
  sheet.getRange(1, 1, 1, UTM_HEADERS.length).setValues([UTM_HEADERS]).setFontWeight('bold').setBackground('#F3E6DA');
  sheet.getRange('N1').setValue('адрес сайта');
  sheet.getRange('O1').setValue(UTM_SITE);
  sheet.setFrozenRows(1);

  const values = UTM_ROWS.map(function (r) { const pub = UTM_PUB[r[0]] || ['', ''];
    return r.slice(0, 8).concat(['', UTM_SHORT[r[0]] || '', pub[0], pub[1], r[8]]); });
  sheet.getRange(2, 1, values.length, UTM_HEADERS.length).setNumberFormat('@').setValues(values);

  // Оператор & вместо СЦЕПИТЬ: формула не зависит от разделителя аргументов (, или ;) в настройках таблицы
  const formulas = values.map(function (r, i) {
    const n = i + 2;
    return ['=$O$1&"/"&H' + n + '&"?utm_source="&D' + n + '&"&utm_medium="&E' + n +
      '&"&utm_campaign="&F' + n + '&"&utm_content="&G' + n];
  });
  sheet.getRange(2, 9, formulas.length, 1).setNumberFormat('General').setFormulas(formulas);
  sheet.autoResizeColumns(1, 8);
}

/* Ручная проверка приёмника из редактора: Выполнить → testDoPost.
   Первая отправка запишет строку, вторая с тем же request_id вернёт ошибку (испытание И-05). */
function testDoPost() {
  const body = {
    request_id: 'REQ-00000000-0000-4000-8000-000000000026', name: 'Тест редактора', phone: '+79001234567',
    email: '', lead_type: 'class', class_format: 'wheel', people: 2, slot: '2026-11-20 15:00',
    utm_source: 'test', utm_medium: 'none', utm_campaign: 'not_set', utm_content: 'not_set', consent: true
  };
  const e = { postData: { contents: JSON.stringify(body) }, parameter: {} };
  console.log(doPost(e).getContent());
  console.log(doPost(e).getContent()); // ожидается duplicate_request_id
}
