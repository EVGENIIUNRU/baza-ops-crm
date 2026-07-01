import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const templateDir = path.join(rootDir, "templates");
const outputDir = path.join(rootDir, "outputs", "baza_ops_crm_template");

const taskHeaders = [
  "ID",
  "Активна",
  "Зона",
  "Задача",
  "Описание",
  "Смена",
  "Периодичность",
  "Каждые N дней",
  "Срок/время",
  "Приоритет",
  "Стандарт выполнения",
  "Дата старта",
];

const taskRows = [
  ["CLN-001", "Да", "Зал ПК", "Влажная уборка столов", "Протереть столы, убрать пыль, крошки и липкие следы.", "Обе", "Каждый день", 1, "11:00", "Высокий", "Столы чистые, без пыли, пятен и мусора.", "2026-06-30"],
  ["CLN-002", "Да", "Зал ПК", "Мониторы без разводов", "Протереть экраны специальной микрофиброй.", "Обе", "Каждый день", 1, "12:00", "Высокий", "Мониторы чистые, без отпечатков и разводов.", "2026-06-30"],
  ["CLN-003", "Да", "Санузел", "Санузел и расходники", "Проверить чистоту, запах, мыло, бумагу и полотенца.", "Обе", "Каждая смена", 1, "Начало и конец", "Критичный", "Санузел чистый, расходники есть с запасом.", "2026-06-30"],
  ["CLN-004", "Да", "Вход", "Стекла на входе", "Убрать следы рук на стеклах и ручках.", "Дневная", "Каждый день", 1, "13:00", "Средний", "Стекла чистые, ручки не липкие.", "2026-06-30"],
  ["CLN-005", "Да", "Холодильники", "Фасады холодильников", "Протереть стекла, ручки и видимые полки.", "Дневная", "Каждый день", 1, "14:00", "Средний", "Фасады чистые, товар хорошо виден.", "2026-06-30"],
  ["CLN-006", "Да", "Логово", "Пылесос ковра", "Пропылесосить ковер в логове и убрать крошки.", "Ночная", "Через день", 2, "03:00", "Средний", "На ковре нет мусора и заметной пыли.", "2026-06-30"],
  ["CLN-007", "Да", "Зона питания", "Пылесос зоны питания", "Убрать крошки под столами и около посадочных мест.", "Ночная", "Через день", 2, "03:30", "Средний", "Зона питания без крошек и мусора.", "2026-06-30"],
  ["CLN-008", "Да", "ПК", "Пылесос сеток ПК", "Аккуратно пропылесосить внешние сетки корпусов без разборки.", "Ночная", "Каждые 2 дня", 2, "04:00", "Высокий", "Сетки не забиты пылью, поток воздуха не перекрыт.", "2026-06-30"],
  ["CLN-009", "Да", "Периферия", "Быстрая чистка периферии", "Протереть мышки, наушники и видимые загрязнения после гостя.", "Обе", "После каждого гостя", 0, "После гостя", "Средний", "Периферия не липкая и без видимого мусора.", "2026-06-30"],
  ["CLN-010", "Да", "Периферия", "Глубокая чистка клавиатур", "Продуть и протереть клавиатуры, убрать крошки между клавишами.", "Ночная", "Раз в 3 недели", 21, "05:00", "Средний", "Клавиатуры визуально чистые и без крошек между клавишами.", "2026-06-30"],
];

const taskLogHeaders = [
  "Время отметки",
  "Дата смены",
  "Смена",
  "Сотрудник",
  "ID задачи",
  "Зона",
  "Задача",
  "Статус",
  "Проблема",
  "Комментарий",
  "Источник",
];

const taskStatusHeaders = [
  "Дата смены",
  "Смена",
  "ID задачи",
  "Зона",
  "Задача",
  "Статус",
  "Проблема",
  "Сотрудник",
  "Комментарий",
  "Обновлено",
  "Источник",
];

const simLogHeaders = [
  "Время события",
  "ID сессии",
  "Дата смены",
  "Смена",
  "Риг",
  "Гость",
  "Тариф",
  "Минуты",
  "Сумма",
  "Оплата",
  "Статус",
  "Старт",
  "Окончание план",
  "Окончание факт",
  "Сотрудник",
  "Заметка",
  "Источник",
];

const simStatusHeaders = [
  "ID сессии",
  "Дата смены",
  "Смена",
  "Риг",
  "Гость",
  "Тариф",
  "Минуты",
  "Сумма",
  "Оплата",
  "Статус",
  "Старт",
  "Окончание план",
  "Окончание факт",
  "Сотрудник",
  "Заметка",
  "Обновлено",
  "Источник",
];

const tariffRows = [
  ["SIM-30", "30 минут", 30, 150, "Активен"],
  ["SIM-60", "60 минут", 60, 300, "Активен"],
];

const workbook = Workbook.create();

const taskSheet = workbook.worksheets.add("Задачи");
writeSheet(taskSheet, [taskHeaders, ...taskRows], {
  widths: [92, 76, 130, 220, 330, 110, 170, 120, 120, 120, 360, 120],
  dateCols: [12],
  dataRowHeightPx: 50,
});
taskSheet.dataValidations.add({ range: "B2:B250", rule: { type: "list", values: ["Да", "Нет"] } });
taskSheet.dataValidations.add({ range: "F2:F250", rule: { type: "list", values: ["Дневная", "Ночная", "Обе"] } });
taskSheet.dataValidations.add({
  range: "G2:G250",
  rule: { type: "list", values: ["Каждая смена", "Каждый день", "Через день", "Каждые 2 дня", "Каждые 3 дня", "Раз в 3 недели", "После каждого гостя"] },
});
taskSheet.dataValidations.add({ range: "J2:J250", rule: { type: "list", values: ["Критичный", "Высокий", "Средний", "Низкий"] } });

const taskLogSheet = workbook.worksheets.add("Отметки");
writeSheet(taskLogSheet, [taskLogHeaders], {
  widths: [170, 120, 110, 150, 110, 130, 240, 130, 100, 260, 140],
});

const taskStatusSheet = workbook.worksheets.add("Статус смены");
writeSheet(taskStatusSheet, [taskStatusHeaders], {
  widths: [120, 110, 110, 130, 240, 130, 100, 150, 260, 170, 140],
});

const simLogSheet = workbook.worksheets.add("SimRacing");
writeSheet(simLogSheet, [simLogHeaders], {
  widths: [170, 190, 120, 110, 110, 160, 130, 90, 100, 110, 130, 170, 170, 170, 150, 240, 140],
});

const simStatusSheet = workbook.worksheets.add("SimRacing статус");
writeSheet(simStatusSheet, [simStatusHeaders], {
  widths: [190, 120, 110, 110, 160, 130, 90, 100, 110, 130, 170, 170, 170, 150, 240, 170, 140],
});

const tariffsSheet = workbook.worksheets.add("Тарифы");
writeSheet(tariffsSheet, [["ID тарифа", "Название", "Минуты", "Цена", "Статус"], ...tariffRows], {
  widths: [120, 160, 100, 100, 120],
});
tariffsSheet.getRange("C2:D20").format.numberFormat = "#,##0";

const guideSheet = workbook.worksheets.add("Инструкция");
writeGuideSheet(guideSheet);

await verifyWorkbook(workbook);
await fs.mkdir(templateDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(templateDir, "BAZA_Ops_CRM_template.xlsx"));

async function verifyWorkbook(book) {
  const overview = await book.inspect({
    kind: "sheet,table",
    tableMaxRows: 6,
    tableMaxCols: 8,
    maxChars: 5000,
  });
  console.log(overview.ndjson);

  const errors = await book.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 100 },
    summary: "formula error scan",
  });
  console.log(errors.ndjson);

  for (const sheetName of ["Задачи", "Отметки", "Статус смены", "SimRacing", "SimRacing статус", "Тарифы", "Инструкция"]) {
    const preview = await book.render({
      sheetName,
      autoCrop: "all",
      scale: 1,
      format: "png",
    });
    await fs.writeFile(path.join(outputDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
  }
}

function writeSheet(sheet, rows, options = {}) {
  const width = Math.max(...rows.map((row) => row.length));
  const range = sheet.getRangeByIndexes(0, 0, rows.length, width);
  range.values = rows.map((row) => [...row, ...Array(width - row.length).fill("")]);
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);

  const header = sheet.getRangeByIndexes(0, 0, 1, width);
  header.format = {
    fill: "#161616",
    font: { bold: true, color: "#FFFFFF" },
    borders: { preset: "outside", style: "thin", color: "#161616" },
    wrapText: true,
  };

  if (rows.length > 1) {
    const body = sheet.getRangeByIndexes(1, 0, Math.max(rows.length - 1, 1), width);
    body.format = {
      borders: { preset: "inside", style: "thin", color: "#E5E1D8" },
      wrapText: true,
    };
  }

  options.widths?.forEach((colWidth, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = colWidth;
  });
  options.dateCols?.forEach((col) => {
    sheet.getRangeByIndexes(1, col - 1, Math.max(rows.length - 1, 1), 1).format.numberFormat = "yyyy-mm-dd";
  });
  sheet.getRangeByIndexes(0, 0, 1, width).format.rowHeightPx = 30;
  if (rows.length > 1) {
    sheet.getRangeByIndexes(1, 0, rows.length - 1, width).format.rowHeightPx = options.dataRowHeightPx || 28;
  }
}

function writeGuideSheet(sheet) {
  sheet.showGridLines = false;
  sheet.getRange("A1:G1").merge();
  sheet.getRange("A1").values = [["BAZA Ops CRM: настройка таблицы"]];
  sheet.getRange("A1").format = {
    fill: "#161616",
    font: { bold: true, color: "#FFFFFF", size: 18 },
  };
  sheet.getRange("A1:G1").format.rowHeightPx = 42;

  const rows = [
    ["1", "Загрузите этот файл в Google Drive и откройте как Google Таблицу."],
    ["2", "Откройте Расширения -> Apps Script."],
    ["3", "Удалите стандартный код и вставьте весь файл apps-script.gs из репозитория."],
    ["4", "Нажмите Deploy -> New deployment -> Web app."],
    ["5", "Execute as: Me. Who has access: Anyone with the link."],
    ["6", "Скопируйте Web app URL и вставьте его во вкладке Таблица в приложении."],
    ["7", "Если меняете задачи, редактируйте только лист Задачи. Остальные листы заполняет приложение."],
  ];
  sheet.getRange("A3:B9").values = rows;
  sheet.getRange("A3:A9").format = {
    fill: "#F1EEE6",
    font: { bold: true, color: "#161616" },
  };
  sheet.getRange("B3:B9").format = {
    borders: { preset: "inside", style: "thin", color: "#E5E1D8" },
    wrapText: true,
  };
  sheet.getRange("A3:A9").format.columnWidthPx = 48;
  sheet.getRange("B3:B9").format.columnWidthPx = 640;
  sheet.getRange("A3:B9").format.rowHeightPx = 34;

  sheet.getRange("A11:G11").merge();
  sheet.getRange("A11").values = [["Важно: часовой пояс уже выставлен Asia/Vladivostok в приложении и в Apps Script."]];
  sheet.getRange("A11").format = {
    fill: "#DFF3E8",
    font: { bold: true, color: "#0F7A55" },
    wrapText: true,
  };
  sheet.getRange("A11:G11").format.rowHeightPx = 32;
}
