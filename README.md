# BAZA Ops CRM

Приложение и web-панель для админ-ПК и MacBook: контроль уборки, задач смены и SimRacing-продаж с синхронизацией через Google Sheets + Apps Script.

## Что внутри

- `index.html`, `styles.css`, `app.js` - рабочий интерфейс CRM.
- `electron/main.cjs` - оболочка Electron для desktop-приложения.
- `.github/workflows/windows-app.yml` - сборка `.exe` в GitHub Actions.
- `.github/workflows/macos-app.yml` - сборка `.dmg` и `.zip` для MacBook.
- `.github/workflows/pages.yml` - публикация web-версии на GitHub Pages.
- `apps-script.gs` - код, который нужно вставить в Google Apps Script.
- `templates/BAZA_Ops_CRM_template.xlsx` - шаблон таблицы для Google Drive.

## Как открыть web-версию на MacBook

После push в GitHub workflow `Publish web app` опубликует сайт на GitHub Pages.

Ожидаемый адрес для репозитория `EVGENIIUNRU/baza-ops-crm`:

```text
https://evgeniiunru.github.io/baza-ops-crm/
```

В web-версии откройте вкладку `Таблица`, вставьте Apps Script Web app URL и нажмите `Сохранить URL`. Если на админ-ПК и MacBook указан один и тот же Apps Script URL, оба устройства будут видеть одну таблицу и один журнал.

## Как получить приложение для MacBook

1. Загрузите репозиторий на GitHub.
2. Откройте вкладку `Actions`.
3. Выберите workflow `Build macOS desktop app`.
4. Нажмите `Run workflow`, либо сделайте push в `main`.
5. После завершения скачайте artifact `BAZA-Ops-CRM-macOS`.
6. Внутри будут:
   - `.dmg` - установочный образ для macOS.
   - `.zip` - архив с `.app`.

Сборка unsigned, потому что для подписи и notarization нужен Apple Developer аккаунт. На своем Mac при первом запуске может понадобиться открыть приложение через `System Settings -> Privacy & Security -> Open Anyway`.

## Как получить exe через GitHub

1. Загрузите репозиторий на GitHub.
2. Откройте вкладку `Actions`.
3. Выберите workflow `Build Windows desktop app`.
4. Нажмите `Run workflow`, либо просто сделайте push в `main`.
5. После завершения скачайте artifact `BAZA-Ops-CRM-Windows`.
6. Внутри будут:
   - `BAZA Ops CRM-Setup-1.0.0-x64.exe` - установщик.
   - `BAZA Ops CRM-Portable-1.0.0-x64.exe` - portable-версия без установки.

## Как настроить Google Sheets

1. Загрузите `templates/BAZA_Ops_CRM_template.xlsx` в Google Drive.
2. Откройте файл как Google Таблицу.
3. Проверьте, что есть листы:
   - `Задачи`
   - `Отметки`
   - `Статус смены`
   - `SimRacing`
   - `SimRacing статус`
   - `Тарифы`
   - `Инструкция`
4. В листе `Задачи` можно менять регламент: зоны, периодичность, смену, время и стандарт выполнения.
5. Остальные листы приложение будет заполнять само.

## Что вставить в Apps Script

1. В Google Таблице откройте `Расширения -> Apps Script`.
2. Удалите стандартный код.
3. Вставьте весь код из файла `apps-script.gs`.
4. Нажмите `Deploy -> New deployment`.
5. Тип deployment: `Web app`.
6. `Execute as`: `Me`.
7. `Who has access`: `Anyone with the link`.
8. Скопируйте `Web app URL`.
9. В приложении откройте вкладку `Таблица`, вставьте URL и нажмите `Сохранить URL`, затем `Синхронизировать`.

## Часовой пояс

Проект настроен на `Asia/Vladivostok`. Дневная смена: 10:00-22:00, ночная: 22:00-10:00. Apps Script тоже пишет время во Владивостокском часовом поясе.

## Локальный запуск для проверки

```bash
npm install
npm start
```

## Локальная сборка

```bash
npm run build:mac
npm run build:win
```

Windows `.exe` удобнее брать из GitHub Actions на `windows-latest`. macOS `.dmg` можно собрать локально на Mac или через workflow `Build macOS desktop app`.
