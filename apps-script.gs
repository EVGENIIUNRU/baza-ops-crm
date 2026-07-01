const TZ = 'Asia/Vladivostok';

const TASK_SHEET = 'Задачи';
const TASK_LOG_SHEET = 'Отметки';
const TASK_STATUS_SHEET = 'Статус смены';
const SIM_LOG_SHEET = 'SimRacing';
const SIM_STATUS_SHEET = 'SimRacing статус';

const TASK_LOG_HEADERS = [
  'Время отметки',
  'Дата смены',
  'Смена',
  'Сотрудник',
  'ID задачи',
  'Зона',
  'Задача',
  'Статус',
  'Проблема',
  'Комментарий',
  'Источник',
];

const TASK_STATUS_HEADERS = [
  'Дата смены',
  'Смена',
  'ID задачи',
  'Зона',
  'Задача',
  'Статус',
  'Проблема',
  'Сотрудник',
  'Комментарий',
  'Обновлено',
  'Источник',
];

const SIM_LOG_HEADERS = [
  'Время события',
  'ID сессии',
  'Дата смены',
  'Смена',
  'Риг',
  'Гость',
  'Тариф',
  'Минуты',
  'Сумма',
  'Оплата',
  'Статус',
  'Старт',
  'Окончание план',
  'Окончание факт',
  'Сотрудник',
  'Заметка',
  'Источник',
];

const SIM_STATUS_HEADERS = [
  'ID сессии',
  'Дата смены',
  'Смена',
  'Риг',
  'Гость',
  'Тариф',
  'Минуты',
  'Сумма',
  'Оплата',
  'Статус',
  'Старт',
  'Окончание план',
  'Окончание факт',
  'Сотрудник',
  'Заметка',
  'Обновлено',
  'Источник',
];

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = String(params.action || 'state');
  let data;
  if (action === 'ping') {
    data = { ok: true, time: nowText_() };
  } else if (action === 'tasks') {
    data = { ok: true, tasks: readTable_(TASK_SHEET) };
  } else if (action === 'sim') {
    data = { ok: true, simStatus: readTable_(SIM_STATUS_SHEET), simLog: readTable_(SIM_LOG_SHEET) };
  } else {
    data = {
      ok: true,
      tasks: readTable_(TASK_SHEET),
      log: readTable_(TASK_LOG_SHEET),
      taskStatus: readTable_(TASK_STATUS_SHEET),
      simLog: readTable_(SIM_LOG_SHEET),
      simStatus: readTable_(SIM_STATUS_SHEET),
      time: nowText_(),
    };
  }
  return json_(data, params.callback);
}

function doPost(e) {
  const body = parseBody_(e);
  if (body.action === 'completion') {
    appendTaskCompletion_(body.entry || {});
    return json_({ ok: true, saved: 1, time: nowText_() });
  }
  if (body.action === 'bulkCompletion') {
    const entries = Array.isArray(body.entries) ? body.entries : [];
    entries.forEach((entry) => appendTaskCompletion_(entry));
    return json_({ ok: true, saved: entries.length, time: nowText_() });
  }
  if (body.action === 'simSession') {
    appendSimSession_(body.session || {});
    return json_({ ok: true, saved: 1, time: nowText_() });
  }
  if (body.action === 'bulkSimSessions') {
    const sessions = Array.isArray(body.sessions) ? body.sessions : [];
    sessions.forEach((session) => appendSimSession_(session));
    return json_({ ok: true, saved: sessions.length, time: nowText_() });
  }
  return json_({ ok: false, error: 'Unknown action' });
}

function appendTaskCompletion_(entry) {
  const timestamp = formatTimestamp_(entry.timestamp);
  const logSheet = getOrCreateSheet_(TASK_LOG_SHEET, TASK_LOG_HEADERS);
  logSheet.appendRow([
    timestamp,
    entry.shiftDate || '',
    entry.shift || '',
    entry.employee || '',
    entry.taskId || '',
    entry.zone || '',
    entry.taskTitle || '',
    entry.status || 'Готово',
    entry.problem || (entry.status === 'Проблема' ? 'Да' : 'Нет'),
    entry.note || '',
    entry.source || 'baza-ops-crm',
  ]);

  const statusRow = [
    entry.shiftDate || '',
    entry.shift || '',
    entry.taskId || '',
    entry.zone || '',
    entry.taskTitle || '',
    entry.status || 'Готово',
    entry.problem || (entry.status === 'Проблема' ? 'Да' : 'Нет'),
    entry.employee || '',
    entry.note || '',
    timestamp,
    entry.source || 'baza-ops-crm',
  ];
  upsertByKey_(TASK_STATUS_SHEET, TASK_STATUS_HEADERS, [entry.shiftDate, entry.shift, entry.taskId].join('|'), [1, 2, 3], statusRow);
}

function appendSimSession_(session) {
  const updatedAt = nowText_();
  const startedAt = formatTimestamp_(session.startedAt);
  const endsAt = formatTimestamp_(session.endsAt);
  const finishedAt = session.finishedAt ? formatTimestamp_(session.finishedAt) : '';
  const logRow = [
    updatedAt,
    session.id || '',
    session.shiftDate || '',
    session.shift || '',
    session.rig || '',
    session.guest || '',
    session.tariffLabel || '',
    session.minutes || '',
    session.price || '',
    session.payment || '',
    session.status || '',
    startedAt,
    endsAt,
    finishedAt,
    session.employee || '',
    session.note || '',
    session.source || 'baza-ops-crm',
  ];

  getOrCreateSheet_(SIM_LOG_SHEET, SIM_LOG_HEADERS).appendRow(logRow);

  const statusRow = [
    session.id || '',
    session.shiftDate || '',
    session.shift || '',
    session.rig || '',
    session.guest || '',
    session.tariffLabel || '',
    session.minutes || '',
    session.price || '',
    session.payment || '',
    session.status || '',
    startedAt,
    endsAt,
    finishedAt,
    session.employee || '',
    session.note || '',
    updatedAt,
    session.source || 'baza-ops-crm',
  ];
  upsertByKey_(SIM_STATUS_SHEET, SIM_STATUS_HEADERS, session.id || '', [1], statusRow);
}

function upsertByKey_(sheetName, headers, key, keyColumns, row) {
  if (!key) return;
  const sheet = getOrCreateSheet_(sheetName, headers);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
    for (let index = 0; index < values.length; index += 1) {
      const rowKey = keyColumns.map((col) => values[index][col - 1]).join('|');
      if (rowKey === key) {
        sheet.getRange(index + 2, 1, 1, headers.length).setValues([row]);
        return;
      }
    }
  }
  sheet.appendRow(row);
}

function readTable_(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return [];
  const headerIndex = values.findIndex((row) => row.some((cell) => String(cell).trim() !== ''));
  if (headerIndex === -1) return [];
  const headers = values[headerIndex].map((cell) => String(cell).trim());
  return values
    .slice(headerIndex + 1)
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) record[header] = row[index] || '';
      });
      return record;
    });
}

function getOrCreateSheet_(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function formatTimestamp_(value) {
  const date = value ? new Date(value) : new Date();
  return Utilities.formatDate(Number.isNaN(date.getTime()) ? new Date() : date, TZ, 'dd.MM.yyyy HH:mm:ss');
}

function nowText_() {
  return formatTimestamp_(new Date().toISOString());
}

function json_(data, callback) {
  const payload = JSON.stringify(data);
  const callbackName = String(callback || '').trim();
  if (callbackName) {
    const validCallback = /^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callbackName);
    const body = validCallback ? `${callbackName}(${payload});` : '/* invalid callback */';
    return ContentService
      .createTextOutput(body)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}
