const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TZ = "Asia/Vladivostok";
const STORAGE_KEY = "baza-ops-crm-v1";

const tariffs = [
  { id: "SIM-30", label: "30 минут", minutes: 30, price: 150 },
  { id: "SIM-60", label: "60 минут", minutes: 60, price: 300 },
];

const seedTasks = [
  {
    id: "CLN-001",
    active: true,
    zone: "Зал ПК",
    title: "Влажная уборка столов",
    description: "Протереть столы, убрать пыль, крошки и липкие следы.",
    shift: "Обе",
    frequency: "Каждый день",
    intervalDays: 1,
    dueTime: "11:00",
    priority: "Высокий",
    standard: "Столы чистые, без пыли, пятен и мусора.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-002",
    active: true,
    zone: "Зал ПК",
    title: "Мониторы без разводов",
    description: "Протереть экраны специальной микрофиброй.",
    shift: "Обе",
    frequency: "Каждый день",
    intervalDays: 1,
    dueTime: "12:00",
    priority: "Высокий",
    standard: "Мониторы чистые, без отпечатков и разводов.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-003",
    active: true,
    zone: "Санузел",
    title: "Санузел и расходники",
    description: "Проверить чистоту, запах, мыло, бумагу и полотенца.",
    shift: "Обе",
    frequency: "Каждая смена",
    intervalDays: 1,
    dueTime: "Начало и конец",
    priority: "Критичный",
    standard: "Санузел чистый, расходники есть с запасом.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-004",
    active: true,
    zone: "Вход",
    title: "Стекла на входе",
    description: "Убрать следы рук на стеклах и ручках.",
    shift: "Дневная",
    frequency: "Каждый день",
    intervalDays: 1,
    dueTime: "13:00",
    priority: "Средний",
    standard: "Стекла чистые, ручки не липкие.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-005",
    active: true,
    zone: "Холодильники",
    title: "Фасады холодильников",
    description: "Протереть стекла, ручки и видимые полки.",
    shift: "Дневная",
    frequency: "Каждый день",
    intervalDays: 1,
    dueTime: "14:00",
    priority: "Средний",
    standard: "Фасады чистые, товар хорошо виден.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-006",
    active: true,
    zone: "Логово",
    title: "Пылесос ковра",
    description: "Пропылесосить ковер в логове и убрать крошки.",
    shift: "Ночная",
    frequency: "Через день",
    intervalDays: 2,
    dueTime: "03:00",
    priority: "Средний",
    standard: "На ковре нет мусора и заметной пыли.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-007",
    active: true,
    zone: "Зона питания",
    title: "Пылесос зоны питания",
    description: "Убрать крошки под столами и около посадочных мест.",
    shift: "Ночная",
    frequency: "Через день",
    intervalDays: 2,
    dueTime: "03:30",
    priority: "Средний",
    standard: "Зона питания без крошек и мусора.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-008",
    active: true,
    zone: "ПК",
    title: "Пылесос сеток ПК",
    description: "Аккуратно пропылесосить внешние сетки корпусов без разборки.",
    shift: "Ночная",
    frequency: "Каждые 2 дня",
    intervalDays: 2,
    dueTime: "04:00",
    priority: "Высокий",
    standard: "Сетки не забиты пылью, поток воздуха не перекрыт.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-009",
    active: true,
    zone: "Периферия",
    title: "Быстрая чистка периферии",
    description: "Протереть мышки, наушники и видимые загрязнения после гостя.",
    shift: "Обе",
    frequency: "После каждого гостя",
    intervalDays: 0,
    dueTime: "После гостя",
    priority: "Средний",
    standard: "Периферия не липкая и без видимого мусора.",
    startDate: "2026-06-30",
  },
  {
    id: "CLN-010",
    active: true,
    zone: "Периферия",
    title: "Глубокая чистка клавиатур",
    description: "Продуть и протереть клавиатуры, убрать крошки между клавишами.",
    shift: "Ночная",
    frequency: "Раз в 3 недели",
    intervalDays: 21,
    dueTime: "05:00",
    priority: "Средний",
    standard: "Клавиатуры визуально чистые и без крошек между клавишами.",
    startDate: "2026-06-30",
  },
];

const elements = {};
const state = {
  activeTab: "overview",
  shiftDate: "",
  shift: "Дневная",
  employee: "",
  scriptUrl: "",
  lastSyncAt: "",
  tasks: seedTasks,
  completions: {},
  selectedTaskId: null,
  zone: "all",
  problemOnly: false,
  simSessions: [],
  activities: [],
};

let audioContext = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindElements();
  Object.assign(state, loadStoredState());
  const shiftInfo = getCurrentShiftInfo();
  state.shiftDate ||= shiftInfo.date;
  state.shift ||= shiftInfo.shift;
  state.selectedTaskId ||= getVisibleTasks()[0]?.id || null;

  elements.shiftDate.value = state.shiftDate;
  elements.employeeName.value = state.employee || "";
  elements.scriptUrl.value = state.scriptUrl || "";
  elements.problemOnly.checked = state.problemOnly;

  bindEvents();
  renderAll();

  window.setInterval(tickTimers, 1000);
  window.setInterval(() => {
    if (state.scriptUrl) syncNow({ silent: true });
  }, 45000);
}

function bindElements() {
  for (const id of [
    "sidebarShift",
    "sidebarDate",
    "syncHealth",
    "lastSyncLabel",
    "shiftDate",
    "dayShift",
    "nightShift",
    "employeeName",
    "tasksKpi",
    "tasksProgressKpi",
    "problemsKpi",
    "simRevenueKpi",
    "simMinutesKpi",
    "activeSessionsKpi",
    "nextFinishKpi",
    "activityFeed",
    "nextAction",
    "zoneFilter",
    "problemOnly",
    "taskList",
    "taskTitle",
    "taskZone",
    "taskDue",
    "taskStandard",
    "taskNote",
    "markDone",
    "markProblem",
    "markSkip",
    "simRig",
    "simGuest",
    "simPayment",
    "simNote",
    "activeSessions",
    "testSound",
    "exportReport",
    "reportTable",
    "auditPanel",
    "scriptUrl",
    "saveSync",
    "syncNow",
    "syncStatus",
    "toast",
  ]) {
    elements[id] = document.getElementById(id);
  }
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      saveStoredState();
      renderAll();
    });
  });

  elements.shiftDate.addEventListener("change", () => {
    state.shiftDate = elements.shiftDate.value;
    saveStoredState();
    renderAll();
  });

  elements.dayShift.addEventListener("click", () => setShift("Дневная"));
  elements.nightShift.addEventListener("click", () => setShift("Ночная"));

  elements.employeeName.addEventListener("input", () => {
    state.employee = elements.employeeName.value.trim();
    saveStoredState();
  });

  elements.zoneFilter.addEventListener("change", () => {
    state.zone = elements.zoneFilter.value;
    saveStoredState();
    renderTasks();
  });

  elements.problemOnly.addEventListener("change", () => {
    state.problemOnly = elements.problemOnly.checked;
    saveStoredState();
    renderTasks();
  });

  elements.taskList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;
    if (button.dataset.action === "select") {
      state.selectedTaskId = id;
      saveStoredState();
      renderTasks();
      renderTaskDetail();
    }
    if (button.dataset.action === "toggle") {
      const status = getCompletion(id)?.status === "Готово" ? "Не выполнено" : "Готово";
      markTask(id, status);
    }
  });

  elements.markDone.addEventListener("click", () => markSelectedTask("Готово"));
  elements.markProblem.addEventListener("click", () => markSelectedTask("Проблема"));
  elements.markSkip.addEventListener("click", () => markSelectedTask("Не требуется"));

  document.querySelectorAll(".tariff-card").forEach((button) => {
    button.addEventListener("click", () => {
      startSimSession(Number(button.dataset.minutes), Number(button.dataset.price));
    });
  });

  elements.activeSessions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-session-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.sessionAction === "finish") finishSimSession(id);
    if (button.dataset.sessionAction === "extend") extendSimSession(id, 30, 150);
  });

  elements.testSound.addEventListener("click", () => playAlertSound());
  elements.exportReport.addEventListener("click", exportReportCsv);

  elements.saveSync.addEventListener("click", () => {
    state.scriptUrl = normalizeScriptUrl(elements.scriptUrl.value);
    elements.scriptUrl.value = state.scriptUrl;
    saveStoredState();
    setSyncStatus(state.scriptUrl ? "URL сохранен." : "Синхронизация не подключена.", state.scriptUrl ? "ok" : "");
    renderSyncState();
  });

  elements.syncNow.addEventListener("click", () => syncNow());
}

function setShift(shift) {
  state.shift = shift;
  saveStoredState();
  renderAll();
}

function renderAll() {
  renderTabs();
  renderShift();
  renderKpis();
  renderZoneFilter();
  renderTasks();
  renderTaskDetail();
  renderSessions();
  renderOverview();
  renderReports();
  renderSyncState();
}

function renderTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === state.activeTab);
  });
}

function renderShift() {
  elements.shiftDate.value = state.shiftDate;
  elements.dayShift.classList.toggle("active", state.shift === "Дневная");
  elements.nightShift.classList.toggle("active", state.shift === "Ночная");
  elements.sidebarShift.textContent = state.shift;
  elements.sidebarDate.textContent = state.shiftDate;
}

function renderKpis() {
  const tasks = getVisibleTasks();
  const completed = tasks.filter((task) => isCompleted(task.id)).length;
  const problems = tasks.filter((task) => getCompletion(task.id)?.status === "Проблема").length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const sessions = getShiftSimSessions();
  const revenue = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
  const minutes = sessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0);
  const activeSessions = state.simSessions.filter((session) => session.status === "Активно" || session.status === "Время вышло");
  const next = activeSessions
    .filter((session) => session.status === "Активно")
    .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))[0];

  elements.tasksKpi.textContent = `${completed}/${tasks.length}`;
  elements.tasksProgressKpi.textContent = `${percent}%`;
  elements.problemsKpi.textContent = String(problems);
  elements.simRevenueKpi.textContent = formatMoney(revenue);
  elements.simMinutesKpi.textContent = `${minutes} мин`;
  elements.activeSessionsKpi.textContent = String(activeSessions.length);
  elements.nextFinishKpi.textContent = next ? `до ${formatTime(next.endsAt)}` : "нет";
}

function renderZoneFilter() {
  const zones = ["all", ...new Set(getVisibleTasks().map((task) => task.zone).filter(Boolean))];
  if (!zones.includes(state.zone)) state.zone = "all";
  elements.zoneFilter.innerHTML = zones
    .map((zone) => `<option value="${escapeAttr(zone)}">${zone === "all" ? "Все зоны" : escapeHtml(zone)}</option>`)
    .join("");
  elements.zoneFilter.value = state.zone;
}

function renderTasks() {
  const tasks = getFilteredTasks();
  if (!tasks.length) {
    elements.taskList.innerHTML = `<div class="empty-state">Нет задач для выбранных фильтров.</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks.map((task) => {
    const completion = getCompletion(task.id);
    const status = completion?.status || "Не выполнено";
    const selected = task.id === state.selectedTaskId ? "selected" : "";
    const statusClass = status === "Проблема" ? "problem" : isCompleted(task.id) ? "done" : "";
    return `
      <article class="task-row ${selected}">
        <button class="task-toggle ${statusClass}" type="button" data-action="toggle" data-id="${escapeAttr(task.id)}">${statusClass ? "✓" : ""}</button>
        <div>
          <button class="task-title" type="button" data-action="select" data-id="${escapeAttr(task.id)}">${escapeHtml(task.title)}</button>
          <div class="task-description">${escapeHtml(task.description || task.standard || "")}</div>
        </div>
        <div class="meta">${escapeHtml(task.zone)}<br />${escapeHtml(task.dueTime || "Без срока")}</div>
        <span class="pill ${statusClass}">${escapeHtml(status)}</span>
      </article>
    `;
  }).join("");
}

function renderTaskDetail() {
  const task = state.tasks.find((item) => item.id === state.selectedTaskId);
  if (!task) {
    elements.taskTitle.textContent = "Выберите задачу";
    elements.taskZone.textContent = "-";
    elements.taskDue.textContent = "-";
    elements.taskStandard.textContent = "-";
    elements.taskNote.value = "";
    return;
  }
  const completion = getCompletion(task.id);
  elements.taskTitle.textContent = task.title;
  elements.taskZone.textContent = task.zone || "-";
  elements.taskDue.textContent = task.dueTime || "-";
  elements.taskStandard.textContent = task.standard || "-";
  elements.taskNote.value = completion?.note || "";
}

function renderSessions() {
  const sessions = state.simSessions
    .filter((session) => session.status === "Активно" || session.status === "Время вышло")
    .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));

  if (!sessions.length) {
    elements.activeSessions.innerHTML = `<div class="empty-state">Активных заездов нет.</div>`;
    return;
  }

  elements.activeSessions.innerHTML = sessions.map((session) => {
    const remaining = getRemainingMs(session);
    const expired = remaining <= 0 || session.status === "Время вышло";
    return `
      <article class="session-row ${expired ? "expired" : ""}">
        <div>
          <div class="session-title">
            <span>${escapeHtml(session.rig)}</span>
            <span class="pill ${expired ? "problem" : "done"}">${escapeHtml(session.status)}</span>
          </div>
          <div class="session-sub">${escapeHtml(session.tariffLabel)} · ${formatMoney(session.price)} · ${escapeHtml(session.payment)} · ${escapeHtml(session.guest || "гость")}</div>
          <div class="session-sub">Старт ${formatTime(session.startedAt)} · финиш ${formatTime(session.endsAt)}</div>
        </div>
        <div class="timer ${expired ? "expired" : ""}">${expired ? "00:00" : formatDuration(remaining)}</div>
        <div class="button-row">
          <button class="small-button" type="button" data-session-action="extend" data-id="${escapeAttr(session.id)}">+30</button>
          <button class="small-button" type="button" data-session-action="finish" data-id="${escapeAttr(session.id)}">Закрыть</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderOverview() {
  const events = [
    ...state.activities.slice(-8).reverse(),
    ...state.simSessions
      .filter((session) => session.status === "Время вышло")
      .map((session) => ({
        type: "alert",
        title: `Время вышло: ${session.rig}`,
        text: `${session.tariffLabel}, ${session.guest || "гость"}`,
        time: new Date().toISOString(),
      })),
  ].slice(0, 10);

  elements.activityFeed.innerHTML = events.length
    ? events.map((event) => `
        <article class="feed-row">
          <strong>${escapeHtml(event.title)}</strong>
          <small>${escapeHtml(event.text || "")}</small>
          <small>${formatDateTime(event.time)}</small>
        </article>
      `).join("")
    : `<div class="empty-state">Событий пока нет.</div>`;

  const overdueTask = getVisibleTasks()
    .filter((task) => !isCompleted(task.id) && isTaskOverdue(task))
    .sort((a, b) => parseDueDate(a) - parseDueDate(b))[0];
  const expiredSession = state.simSessions.find((session) => session.status === "Время вышло");
  if (expiredSession) {
    elements.nextAction.innerHTML = `<div class="audit-item"><strong>${escapeHtml(expiredSession.rig)}</strong><span>Закрыть завершенный SimRacing-заезд.</span></div>`;
  } else if (overdueTask) {
    elements.nextAction.innerHTML = `<div class="audit-item"><strong>${escapeHtml(overdueTask.title)}</strong><span>${escapeHtml(overdueTask.zone)} · ${escapeHtml(overdueTask.dueTime)}</span></div>`;
  } else {
    elements.nextAction.innerHTML = `<div class="audit-item"><strong>Критичных действий нет</strong><span>Смена выглядит под контролем.</span></div>`;
  }
}

function renderReports() {
  const tasks = getVisibleTasks();
  const sessions = getShiftSimSessions();
  const completed = tasks.filter((task) => isCompleted(task.id)).length;
  const problems = tasks.filter((task) => getCompletion(task.id)?.status === "Проблема").length;
  const revenue = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
  const minutes = sessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0);

  const rows = [
    ["Показатель", "Значение", "Смена", "Дата"],
    ["Задачи выполнены", `${completed}/${tasks.length}`, state.shift, state.shiftDate],
    ["Проблемы", problems, state.shift, state.shiftDate],
    ["SimRacing выручка", formatMoney(revenue), state.shift, state.shiftDate],
    ["SimRacing минуты", `${minutes} мин`, state.shift, state.shiftDate],
    ["SimRacing продаж", sessions.length, state.shift, state.shiftDate],
  ];
  elements.reportTable.innerHTML = rows.map((row, index) => `
    <div class="report-row ${index === 0 ? "header" : ""}">
      ${row.map((cell) => `<span>${escapeHtml(cell)}</span>`).join("")}
    </div>
  `).join("");

  const unsyncedSales = state.simSessions.filter((session) => !session.syncedAt).length;
  const expired = state.simSessions.filter((session) => session.status === "Время вышло").length;
  const missingEmployee = sessions.filter((session) => !session.employee).length;
  const audit = [
    { title: "Непереданные продажи", text: `${unsyncedSales} локально ожидают синхронизации`, warn: unsyncedSales > 0 },
    { title: "Незакрытые таймеры", text: `${expired} заездов требуют закрытия`, warn: expired > 0 },
    { title: "Без администратора", text: `${missingEmployee} продаж без имени сотрудника`, warn: missingEmployee > 0 },
  ];
  elements.auditPanel.innerHTML = audit.map((item) => `
    <article class="audit-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span class="pill ${item.warn ? "warning" : "done"}">${escapeHtml(item.text)}</span>
    </article>
  `).join("");
}

function renderSyncState() {
  elements.syncHealth.textContent = state.scriptUrl ? "Sheets" : "Локально";
  elements.lastSyncLabel.textContent = state.lastSyncAt ? `синхр. ${formatDateTime(state.lastSyncAt)}` : "URL не подключен";
}

function markSelectedTask(status) {
  if (!state.selectedTaskId) return;
  markTask(state.selectedTaskId, status);
}

function markTask(taskId, status) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const entry = {
    shiftDate: state.shiftDate,
    shift: state.shift,
    taskId,
    taskTitle: task.title,
    zone: task.zone,
    status,
    problem: status === "Проблема" ? "Да" : "Нет",
    note: taskId === state.selectedTaskId ? elements.taskNote.value.trim() : getCompletion(taskId)?.note || "",
    employee: state.employee,
    timestamp: new Date().toISOString(),
    source: "baza-ops-crm",
  };
  state.completions[completionKey(taskId)] = entry;
  addActivity("task", `${task.title}: ${status}`, `${task.zone} · ${state.employee || "без имени"}`);
  saveStoredState();
  renderAll();
  postPayload({ action: "completion", entry }, () => {
    entry.syncedAt = new Date().toISOString();
    saveStoredState();
    renderSyncState();
  });
}

function startSimSession(minutes, price) {
  ensureAudio();
  const tariff = tariffs.find((item) => item.minutes === minutes && item.price === price) || { label: `${minutes} минут`, minutes, price };
  const now = new Date();
  const session = {
    id: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    shiftDate: state.shiftDate,
    shift: state.shift,
    rig: elements.simRig.value,
    guest: elements.simGuest.value.trim(),
    tariffId: tariff.id || `SIM-${minutes}`,
    tariffLabel: tariff.label,
    minutes,
    price,
    payment: elements.simPayment.value,
    note: elements.simNote.value.trim(),
    employee: state.employee,
    status: "Активно",
    startedAt: now.toISOString(),
    endsAt: new Date(now.getTime() + minutes * MS_PER_MINUTE).toISOString(),
    finishedAt: "",
    source: "baza-ops-crm",
  };
  state.simSessions.push(session);
  elements.simGuest.value = "";
  elements.simNote.value = "";
  addActivity("sim", `SimRacing ${session.tariffLabel}`, `${session.rig} · ${formatMoney(session.price)} · ${session.payment}`);
  saveStoredState();
  renderAll();
  showToast(`Запущен ${session.rig}: ${session.tariffLabel}`);
  postSimSession(session);
}

function finishSimSession(id) {
  const session = state.simSessions.find((item) => item.id === id);
  if (!session) return;
  session.status = "Закрыто";
  session.finishedAt = new Date().toISOString();
  addActivity("sim", `Закрыт ${session.rig}`, `${session.tariffLabel} · ${session.guest || "гость"}`);
  saveStoredState();
  renderAll();
  postSimSession(session);
}

function extendSimSession(id, extraMinutes, extraPrice) {
  const session = state.simSessions.find((item) => item.id === id);
  if (!session) return;
  const base = Math.max(Date.now(), new Date(session.endsAt).getTime());
  session.endsAt = new Date(base + extraMinutes * MS_PER_MINUTE).toISOString();
  session.minutes = Number(session.minutes || 0) + extraMinutes;
  session.price = Number(session.price || 0) + extraPrice;
  session.tariffLabel = `${session.minutes} минут`;
  session.status = "Активно";
  session.finishedAt = "";
  session.alertedAt = "";
  addActivity("sim", `Продление ${session.rig}`, `+${extraMinutes} мин · +${formatMoney(extraPrice)}`);
  saveStoredState();
  renderAll();
  postSimSession(session);
}

function tickTimers() {
  let changed = false;
  for (const session of state.simSessions) {
    if (session.status !== "Активно") continue;
    if (getRemainingMs(session) <= 0) {
      session.status = "Время вышло";
      session.alertedAt = new Date().toISOString();
      changed = true;
      addActivity("alert", `Время вышло: ${session.rig}`, `${session.tariffLabel} · ${session.guest || "гость"}`);
      playAlertSound();
      notify(`Время вышло: ${session.rig}`, `${session.tariffLabel}. Закройте или продлите заезд.`);
      postSimSession(session);
    }
  }
  renderSessions();
  renderKpis();
  renderOverview();
  if (changed) saveStoredState();
}

function postSimSession(session) {
  postPayload({ action: "simSession", session }, () => {
    session.syncedAt = new Date().toISOString();
    saveStoredState();
    renderReports();
    renderSyncState();
  });
}

async function syncNow(options = {}) {
  state.scriptUrl = normalizeScriptUrl(elements.scriptUrl.value);
  elements.scriptUrl.value = state.scriptUrl;
  saveStoredState();
  if (!state.scriptUrl) {
    if (!options.silent) setSyncStatus("Вставьте Apps Script URL.", "error");
    return;
  }
  try {
    if (!options.silent) setSyncStatus("Синхронизирую таблицу...", "");
    const data = await fetchState();
    if (data && data.ok === false) throw new Error(data.error || "Apps Script вернул ошибку");
    if (Array.isArray(data.tasks) && data.tasks.length) {
      state.tasks = data.tasks.map(rowToTask).filter((task) => task.id && task.title);
    }
    if (Array.isArray(data.log)) mergeRemoteCompletions(data.log);
    if (Array.isArray(data.simStatus)) mergeRemoteSimSessions(data.simStatus);
    await uploadPending();
    state.lastSyncAt = new Date().toISOString();
    saveStoredState();
    renderAll();
    if (!options.silent) setSyncStatus("Синхронизация завершена.", "ok");
  } catch (error) {
    console.error(error);
    if (!options.silent) setSyncStatus(`${error.message}. Проверьте Web app URL и доступ Anyone with the link.`, "error");
  }
}

async function fetchState() {
  const url = withQuery(state.scriptUrl, { action: "state", t: Date.now() });
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Sheets ответил ${response.status}`);
    return await response.json();
  } catch (error) {
    if (!isAppsScriptUrl(state.scriptUrl)) throw error;
    return requestJsonp(url);
  }
}

function requestJsonp(url) {
  return new Promise((resolve, reject) => {
    const callback = `bazaOpsJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Apps Script не ответил"));
    }, 15000);
    window[callback] = (data) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Не удалось прочитать Apps Script. Проверьте, что URL заканчивается на /exec, а доступ Web app стоит Anyone with the link"));
    };
    script.src = withQuery(url, { callback });
    document.head.append(script);
    function cleanup() {
      window.clearTimeout(timer);
      script.remove();
      delete window[callback];
    }
  });
}

async function uploadPending() {
  const completions = Object.values(state.completions).filter((entry) => !entry.syncedAt && entry.source !== "google-sheets");
  const simSessions = state.simSessions.filter((session) => !session.syncedAt);
  if (completions.length) await postPayload({ action: "bulkCompletion", entries: completions }, () => {
    const now = new Date().toISOString();
    completions.forEach((entry) => {
      entry.syncedAt = now;
    });
  });
  if (simSessions.length) await postPayload({ action: "bulkSimSessions", sessions: simSessions }, () => {
    const now = new Date().toISOString();
    simSessions.forEach((session) => {
      session.syncedAt = now;
    });
  });
}

async function postPayload(payload, onSuccess) {
  state.scriptUrl = normalizeScriptUrl(state.scriptUrl);
  if (!state.scriptUrl) {
    setSyncStatus("Запись сохранена локально. Подключите таблицу для синхронизации.", "error");
    return;
  }
  try {
    try {
      const response = await fetch(state.scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Sheets ответил ${response.status}`);
    } catch (error) {
      if (!isAppsScriptUrl(state.scriptUrl)) throw error;
      await fetch(state.scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
    }
    onSuccess?.();
    setSyncStatus("Запись отправлена в таблицу.", "ok");
  } catch (error) {
    console.error(error);
    setSyncStatus("Локально сохранено, отправка в таблицу не прошла.", "error");
  }
}

function mergeRemoteCompletions(rows) {
  rows.forEach((row) => {
    const taskId = clean(row["ID задачи"] || row.taskId);
    const shiftDate = normalizeDate(row["Дата смены"] || row.shiftDate);
    const shift = normalizeShift(row["Смена"] || row.shift);
    if (!taskId || !shiftDate || !shift) return;
    const key = `${shiftDate}|${shift}|${taskId}`;
    const entry = {
      shiftDate,
      shift,
      taskId,
      taskTitle: clean(row["Задача"] || row.taskTitle),
      zone: clean(row["Зона"] || row.zone),
      status: clean(row["Статус"] || row.status) || "Готово",
      problem: clean(row["Проблема"] || row.problem) || "Нет",
      note: clean(row["Комментарий"] || row.note),
      employee: clean(row["Сотрудник"] || row.employee),
      timestamp: clean(row["Время отметки"] || row.timestamp) || new Date().toISOString(),
      source: "google-sheets",
      syncedAt: new Date().toISOString(),
    };
    const current = state.completions[key];
    if (!current || parseTimestamp(entry.timestamp) >= parseTimestamp(current.timestamp)) state.completions[key] = entry;
  });
}

function mergeRemoteSimSessions(rows) {
  rows.forEach((row) => {
    const id = clean(row["ID сессии"] || row.id);
    if (!id) return;
    const session = {
      id,
      shiftDate: normalizeDate(row["Дата смены"] || row.shiftDate),
      shift: normalizeShift(row["Смена"] || row.shift),
      rig: clean(row["Риг"] || row.rig),
      guest: clean(row["Гость"] || row.guest),
      tariffLabel: clean(row["Тариф"] || row.tariffLabel),
      minutes: Number(clean(row["Минуты"] || row.minutes)) || 0,
      price: Number(clean(row["Сумма"] || row.price)) || 0,
      payment: clean(row["Оплата"] || row.payment),
      status: clean(row["Статус"] || row.status) || "Активно",
      startedAt: parseRemoteDate(row["Старт"] || row.startedAt),
      endsAt: parseRemoteDate(row["Окончание план"] || row.endsAt),
      finishedAt: parseRemoteDate(row["Окончание факт"] || row.finishedAt),
      employee: clean(row["Сотрудник"] || row.employee),
      note: clean(row["Заметка"] || row.note),
      source: "google-sheets",
      syncedAt: new Date().toISOString(),
    };
    const index = state.simSessions.findIndex((item) => item.id === id);
    if (index === -1) state.simSessions.push(session);
    else if (parseTimestamp(session.finishedAt || session.startedAt) >= parseTimestamp(state.simSessions[index].finishedAt || state.simSessions[index].startedAt)) {
      state.simSessions[index] = { ...state.simSessions[index], ...session };
    }
  });
}

function getVisibleTasks() {
  return state.tasks
    .filter((task) => task.active !== false)
    .filter((task) => shiftMatches(task))
    .filter((task) => frequencyDue(task))
    .sort((a, b) => sortByDue(a, b));
}

function getFilteredTasks() {
  return getVisibleTasks()
    .filter((task) => state.zone === "all" || task.zone === state.zone)
    .filter((task) => !state.problemOnly || getCompletion(task.id)?.status === "Проблема");
}

function shiftMatches(task) {
  const shift = normalizeShift(task.shift);
  return shift === "Обе" || shift === state.shift || normalizeText(task.frequency) === "после каждого гостя";
}

function frequencyDue(task) {
  const frequency = normalizeText(task.frequency);
  if (["каждая смена", "каждый день", "после каждого гостя"].includes(frequency)) return true;
  const start = parseDateOnly(task.startDate) || parseDateOnly(state.shiftDate);
  const current = parseDateOnly(state.shiftDate);
  if (!start || !current) return true;
  const days = Math.floor((current - start) / MS_PER_DAY);
  if (days < 0) return false;
  const interval = Number(task.intervalDays);
  if (frequency === "через день" || frequency === "каждые 2 дня") return days % 2 === 0;
  if (frequency === "каждые 3 дня") return days % 3 === 0;
  if (frequency === "раз в 3 недели") return days % 21 === 0;
  if (Number.isFinite(interval) && interval > 1) return days % interval === 0;
  return true;
}

function sortByDue(a, b) {
  const dateA = parseDueDate(a);
  const dateB = parseDueDate(b);
  if (dateA && dateB) return dateA - dateB;
  if (dateA) return -1;
  if (dateB) return 1;
  return `${a.zone}${a.title}`.localeCompare(`${b.zone}${b.title}`, "ru");
}

function isTaskOverdue(task) {
  const due = parseDueDate(task);
  return Boolean(due && Date.now() > due.getTime());
}

function parseDueDate(task) {
  const match = String(task.dueTime || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const baseDate = state.shift === "Ночная" && hour < 10 ? addDays(state.shiftDate, 1) : state.shiftDate;
  return new Date(`${baseDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+10:00`);
}

function getCompletion(taskId) {
  return state.completions[completionKey(taskId)];
}

function completionKey(taskId) {
  return `${state.shiftDate}|${state.shift}|${taskId}`;
}

function isCompleted(taskId) {
  const status = getCompletion(taskId)?.status;
  return status === "Готово" || status === "Проблема" || status === "Не требуется";
}

function getShiftSimSessions() {
  return state.simSessions.filter((session) => session.shiftDate === state.shiftDate && session.shift === state.shift);
}

function getRemainingMs(session) {
  return new Date(session.endsAt).getTime() - Date.now();
}

function rowToTask(row) {
  return {
    id: clean(row.ID || row.id),
    active: !["нет", "false", "0"].includes(normalizeText(row["Активна"] ?? row.active ?? "да")),
    zone: clean(row["Зона"] || row.zone),
    title: clean(row["Задача"] || row.title),
    description: clean(row["Описание"] || row.description),
    shift: normalizeShift(row["Смена"] || row.shift),
    frequency: clean(row["Периодичность"] || row.frequency) || "Каждая смена",
    intervalDays: Number(clean(row["Каждые N дней"] || row.intervalDays)) || 1,
    dueTime: clean(row["Срок/время"] || row.dueTime),
    priority: clean(row["Приоритет"] || row.priority),
    standard: clean(row["Стандарт выполнения"] || row.standard),
    startDate: normalizeDate(row["Дата старта"] || row.startDate) || state.shiftDate,
  };
}

function exportReportCsv() {
  const sessions = getShiftSimSessions();
  const rows = [
    ["Дата смены", "Смена", "Тип", "ID", "Название", "Статус", "Сумма", "Минуты", "Сотрудник", "Комментарий"],
    ...getVisibleTasks().map((task) => {
      const completion = getCompletion(task.id);
      return [state.shiftDate, state.shift, "Задача", task.id, task.title, completion?.status || "Не выполнено", "", "", completion?.employee || state.employee, completion?.note || ""];
    }),
    ...sessions.map((session) => [state.shiftDate, state.shift, "SimRacing", session.id, session.rig, session.status, session.price, session.minutes, session.employee, session.note || session.guest || ""]),
  ];
  downloadCsv(`baza_ops_report_${state.shiftDate}_${state.shift}.csv`, rows);
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",;\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function addActivity(type, title, text) {
  state.activities.push({ type, title, text, time: new Date().toISOString() });
  state.activities = state.activities.slice(-40);
}

function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
}

function playAlertSound() {
  ensureAudio();
  const now = audioContext.currentTime;
  const notes = [740, 940, 740, 540];
  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.16);
    gain.gain.setValueAtTime(0.0001, now + index * 0.16);
    gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.16 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.16 + 0.12);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + index * 0.16);
    oscillator.stop(now + index * 0.16 + 0.13);
  });
}

async function notify(title, body) {
  showToast(`${title}. ${body}`);
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") await Notification.requestPermission();
  if (Notification.permission === "granted") new Notification(title, { body });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 5200);
}

function setSyncStatus(message, kind) {
  elements.syncStatus.textContent = message;
  elements.syncStatus.className = `sync-status ${kind || ""}`.trim();
}

function getCurrentShiftInfo() {
  const parts = getZonedParts(new Date());
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const hour = Number(parts.hour);
  if (hour >= 10 && hour < 22) return { shift: "Дневная", date: today };
  if (hour < 10) return { shift: "Ночная", date: addDays(today, -1) };
  return { shift: "Ночная", date: today };
}

function getZonedParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: map.year, month: map.month, day: map.day, hour: map.hour };
}

function normalizeShift(value) {
  const text = normalizeText(value);
  if (text.includes("ноч")) return "Ночная";
  if (text.includes("днев") || text === "день") return "Дневная";
  return "Обе";
}

function normalizeDate(value) {
  const text = clean(value);
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  if (/^\d{2}\.\d{2}\.\d{4}/.test(text)) {
    const [day, month, year] = text.slice(0, 10).split(".");
    return `${year}-${month}-${day}`;
  }
  return text;
}

function parseDateOnly(value) {
  const normalized = normalizeDate(value);
  return normalized ? new Date(`${normalized}T00:00:00Z`) : null;
}

function addDays(dateStr, days) {
  const date = parseDateOnly(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseTimestamp(value) {
  const text = clean(value);
  if (!text) return 0;
  const direct = Date.parse(text);
  if (!Number.isNaN(direct)) return direct;
  const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return 0;
  const [, day, month, year, hour = "0", minute = "0", second = "0"] = match;
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}+10:00`).getTime();
}

function parseRemoteDate(value) {
  const time = parseTimestamp(value);
  return time ? new Date(time).toISOString() : "";
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ru-RU", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
}

function withQuery(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function normalizeScriptUrl(value) {
  const text = clean(value);
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.hostname === "script.google.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const deploymentId = parts[0] === "macros" && parts[1] === "s" ? parts[2] : "";
      const endpoint = parts[3] || "";
      if (deploymentId && (!endpoint || endpoint === "dev")) {
        url.pathname = `/macros/s/${deploymentId}/exec`;
      }
    }
    return url.toString();
  } catch {
    return text;
  }
}

function isAppsScriptUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === "script.google.com" || hostname.endsWith(".googleusercontent.com");
  } catch {
    return false;
  }
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function clean(value) {
  return String(value ?? "").replace(/\uFEFF/g, "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function loadStoredState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...parsed,
      tasks: Array.isArray(parsed.tasks) && parsed.tasks.length ? parsed.tasks : seedTasks,
      completions: parsed.completions || {},
      simSessions: Array.isArray(parsed.simSessions) ? parsed.simSessions : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    };
  } catch {
    return {};
  }
}

function saveStoredState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
