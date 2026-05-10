import { clientData } from './clientData.js';

const state = {
  page: 'overview',
  selectedWork: 0,
  objectScope: 'all',
};

const pages = [
  ['overview', 'Обзор'],
  ['object', 'Объект'],
  ['expenses', 'Расходы'],
  ['works', 'Работы'],
  ['payments', 'Платежи'],
];

const palette = ['#7c5ce3', '#b16d88', '#5d6fd3', '#b06ba6', '#4c4f82', '#d8c8ff'];
const chartText = '#5f6b7a';
const chartGrid = 'rgba(148, 163, 184, 0.24)';
let charts = new Map();

function money(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function number(value, digits = 1) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(Number(value || 0));
}

function pct(part, total) {
  return total ? (Number(part || 0) / Number(total || 0)) * 100 : 0;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function short(text, limit = 46) {
  const value = String(text || '');
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function knownObjects() {
  return [
    {
      id: 'object-1',
      name: 'Объект 1',
      summary: clientData.objectSheet.summary,
      rows: clientData.objectSheet.rows,
    },
  ];
}

function selectedObjects() {
  const objects = knownObjects();
  if (state.objectScope === 'all') return objects;
  return objects.filter((object) => object.id === state.objectScope);
}

function activeScopeLabel() {
  if (state.objectScope === 'all') return 'Все объекты';
  return knownObjects().find((object) => object.id === state.objectScope)?.name || 'Объект';
}

function aggregateSummary(objects = selectedObjects()) {
  const keys = [
    'revenue',
    'contractorCost',
    'grossProfit',
    'advance',
    'tools',
    'customerExpenses',
    'tax',
    'housing',
    'laborers',
    'unplanned',
    'netProfit',
  ];

  return keys.reduce((result, key) => {
    result[key] = objects.reduce((total, object) => total + Number(object.summary?.[key] || 0), 0);
    return result;
  }, {});
}

function objectSummary() {
  return aggregateSummary();
}

function workRows() {
  return clientData.finance.calcRows;
}

function objectExpenses() {
  const s = objectSummary();
  return [
    ['Аванс исполнителю', s.advance],
    ['Расходники / инструмент', s.tools],
    ['Расходы на заказчика', s.customerExpenses],
    ['Налоги 11%', s.tax],
    ['Проживание', s.housing],
    ['Разнорабочие', s.laborers],
    ['Внеплановые расходы', s.unplanned],
  ].filter(([, value]) => Number(value || 0) !== 0);
}

function fixedItems() {
  return clientData.finance.fixedTotals.filter((row) => Number(row.amount || 0) !== 0);
}

function fixedGroups() {
  const rows = clientData.finance.fixedTotals;
  return [
    ['Заработная плата', rows.slice(0, 8).reduce((total, row) => total + Number(row.amount || 0), 0)],
    ['Общехозяйственные расходы', rows.slice(8).reduce((total, row) => total + Number(row.amount || 0), 0)],
  ];
}

function fixedTotal() {
  return fixedItems().reduce((total, row) => total + Number(row.amount || 0), 0);
}

function fixedMonthTotal() {
  return clientData.finance.fixedMonths.reduce((total, row) => total + Number(row.total || 0), 0);
}

function objectExpenseTotal() {
  return objectExpenses().reduce((total, [, value]) => total + Number(value || 0), 0);
}

function objectRows() {
  return selectedObjects()
    .flatMap((object) => object.rows.map((row) => ({ ...row, objectName: object.name, objectId: object.id })))
    .filter((row) => row.revenue || row.contractorCost || row.grossProfit || row.netProfit);
}

function reportMetrics() {
  const s = objectSummary();
  return [
    ['Выручка', s.revenue, 'Основная экономика'],
    ['Стоимость исполнителя', s.contractorCost, 'Основная экономика'],
    ['Валовая прибыль', s.grossProfit, 'Основная экономика'],
    ['Расходы по статьям', objectExpenseTotal(), 'Расходы'],
    ['Налоги', s.tax, 'Расходы'],
    ['Чистая прибыль', s.netProfit, 'Итог'],
    ['Маржа', pct(s.netProfit, s.revenue), 'Итог', 'percent'],
  ];
}

function renderApp() {
  destroyCharts();
  document.getElementById('appNav').innerHTML = pages.map(([id, label]) => `
    <button class="nav-button ${state.page === id ? 'active' : ''}" data-page="${id}">
      <span class="nav-icon">${iconFor(id)}</span>
      <span>${label}</span>
    </button>
  `).join('');

  document.getElementById('sectionLabel').textContent = 'BI Analytics';
  document.getElementById('pageTitle').textContent = pages.find(([id]) => id === state.page)?.[1] || 'Обзор';
  const primary = document.getElementById('primaryAction');
  primary.textContent = 'Показатели';
  primary.onclick = () => setPage('overview');

  const content = document.getElementById('content');
  content.innerHTML = {
    overview: renderOverview,
    object: renderObject,
    expenses: renderExpenses,
    works: renderWorks,
    payments: renderPayments,
  }[state.page]();

  bindEvents();
  renderCharts();
}

function renderOverview() {
  const s = objectSummary();
  const margin = pct(s.netProfit, s.revenue);
  return `
    <div class="screen dashboard-report">
      ${renderObjectScope()}
      <section class="kpi-row">
        ${kpiCard('Выручка', money(s.revenue), activeScopeLabel())}
        ${kpiCard('Валовая прибыль', money(s.grossProfit), `${number(pct(s.grossProfit, s.revenue))}% от выручки`)}
        ${kpiCard('Чистая прибыль', money(s.netProfit), `${number(margin)}% маржа`)}
        ${kpiCard('Работ в ведомости', number(objectRows().length, 0), 'строки выбранного среза')}
      </section>

      <section class="report-grid overview-grid">
        <article class="panel chart-panel span-6 row-2">
          <div class="panel-title">
            <h3>Финансовая структура</h3>
          </div>
          <canvas id="overviewResultChart"></canvas>
        </article>

        <article class="panel metric-table span-4 row-2">
          <div class="panel-title">
            <h3>Метрики из ведомости</h3>
          </div>
          ${metricTable(reportMetrics())}
        </article>

        <article class="panel ring-panel span-2 row-2">
          ${ringCard('Маржа', margin)}
        </article>
      </section>
    </div>
  `;
}

function renderObject() {
  const s = objectSummary();
  return `
    <div class="screen category-screen scoped-screen">
      ${renderObjectScope()}
      <section class="category-head">
        ${kpiCard('Выручка', money(s.revenue), activeScopeLabel())}
        ${kpiCard('Исполнитель', money(s.contractorCost), 'Стоимость работ')}
        ${kpiCard('Валовая прибыль', money(s.grossProfit), 'До объектных расходов')}
        ${kpiCard('Работ', number(objectRows().length, 0), 'строки ведомости')}
      </section>

      <section class="report-grid object-grid">
        ${state.objectScope === 'all' ? renderAllObjectsView() : renderSingleObjectView()}
      </section>
    </div>
  `;
}

function renderObjectScope() {
  return `
    <section class="scope-row" aria-label="Срез объектов">
      <span>Срез</span>
      <button class="${state.objectScope === 'all' ? 'active' : ''}" data-object-scope="all">
        Все объекты
      </button>
      ${knownObjects().map((object) => `
        <button class="${state.objectScope === object.id ? 'active' : ''}" data-object-scope="${object.id}">
          ${object.name}
        </button>
      `).join('')}
    </section>
  `;
}

function objectCards() {
  return knownObjects().map((object) => {
    const summary = aggregateSummary([object]);
    const rows = object.rows.filter((row) => row.revenue || row.contractorCost || row.grossProfit || row.netProfit);
    return { ...object, summary, rows };
  });
}

function renderAllObjectsView() {
  return `
    <article class="panel table-panel span-7 row-2">
      <div class="panel-title">
        <h3>Все известные объекты</h3>
      </div>
      <div class="clean-table">
        <table>
          <thead>
            <tr>
              <th>Объект</th>
              <th class="right">Работ</th>
              <th class="right">Выручка</th>
              <th class="right">Исполнитель</th>
              <th class="right">Чистая прибыль</th>
              <th class="right">Маржа</th>
            </tr>
          </thead>
          <tbody>
            ${objectCards().map((object) => `
              <tr>
                <td>
                  <button class="link-button" data-object-scope="${object.id}">${object.name}</button>
                </td>
                <td class="right">${number(object.rows.length, 0)}</td>
                <td class="right">${money(object.summary.revenue)}</td>
                <td class="right">${money(object.summary.contractorCost)}</td>
                <td class="right">${money(object.summary.netProfit)}</td>
                <td class="right">${number(pct(object.summary.netProfit, object.summary.revenue))}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel chart-panel span-5 row-2">
      <div class="panel-title">
        <h3>Сравнение объектов</h3>
      </div>
      <canvas id="objectsCompareChart"></canvas>
    </article>
  `;
}

function renderSingleObjectView() {
  return `
    <article class="panel chart-panel span-6 row-2">
      <div class="panel-title">
        <h3>Работы внутри объекта</h3>
      </div>
      <canvas id="objectRowsChart"></canvas>
    </article>

    <article class="panel metric-table span-6">
      <div class="panel-title">
        <h3>Показатели объекта</h3>
      </div>
      ${metricTable(reportMetrics().slice(0, 6))}
    </article>

    <article class="panel table-panel span-6">
      <div class="panel-title">
        <h3>Строки работ</h3>
      </div>
      <div class="clean-table">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Работа</th>
              <th class="right">Факт</th>
              <th class="right">Заказчик</th>
              <th class="right">Исполнитель</th>
              <th class="right">Прибыль</th>
            </tr>
          </thead>
          <tbody>
            ${objectRows().map((row) => `
              <tr>
                <td>${row.row}</td>
                <td>${row.workName || `Строка ${row.row}`}</td>
                <td class="right">${number(row.actualQty, 0)}</td>
                <td class="right">${money(row.revenue)}</td>
                <td class="right">${money(row.contractorCost)}</td>
                <td class="right">${money(row.grossProfit || row.netProfit)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderExpenses() {
  return `
    <div class="screen category-screen scoped-screen">
      ${renderObjectScope()}
      <section class="category-head">
        ${kpiCard('Расходы объекта', money(objectExpenseTotal()), activeScopeLabel())}
        ${kpiCard('Постоянные платежи', money(fixedTotal()), 'Расходы компании')}
        ${kpiCard('Статей объекта', number(objectExpenses().length, 0), 'Категории расходов')}
        ${kpiCard('Статей платежей', number(fixedItems().length, 0), 'Постоянные статьи')}
      </section>

      <section class="report-grid expense-grid">
        <article class="panel chart-panel span-5 row-2">
          <div class="panel-title">
            <h3>Объектные расходы</h3>
          </div>
          <canvas id="objectExpenseChart"></canvas>
        </article>

        <article class="panel chart-panel span-4">
          <div class="panel-title">
            <h3>Постоянные расходы</h3>
          </div>
          <canvas id="fixedGroupChart"></canvas>
        </article>

        <article class="panel progress-panel span-3">
          <div class="panel-title">
            <h3>Группы платежей</h3>
          </div>
          <div class="progress-stack">
            ${fixedGroups().map(([label, value], index) => progressRow(label, value, fixedTotal(), index)).join('')}
          </div>
        </article>

        <article class="panel progress-panel span-7">
          <div class="panel-title">
            <h3>Расшифровка объекта</h3>
          </div>
          <div class="progress-stack compact">
            ${objectExpenses().map(([label, value], index) => progressRow(label, value, objectSummary().revenue, index)).join('')}
          </div>
        </article>
      </section>
    </div>
  `;
}

function renderWorks() {
  const rows = workRows();
  const selected = rows[state.selectedWork] || rows[0];
  const costParts = [
    ['Пневмо транспорт', selected.pneumo],
    ['Зарплата мастер РОР', selected.masterSalary],
    ['Суточные', selected.daily],
    ['Проживание', selected.housing],
    ['Налог', selected.tax],
    ['Расходники', selected.tools],
    ['Разнорабочие', selected.laborers],
    ['Внеплановые', selected.unplanned],
  ].filter(([, value]) => Number(value || 0) !== 0);

  return `
    <div class="screen category-screen">
      <section class="work-tabs">
        ${rows.map((row, index) => `
          <button class="${state.selectedWork === index ? 'active' : ''}" data-work="${index}">
            ${short(row.name, 34)}
          </button>
        `).join('')}
      </section>

      <section class="category-head">
        ${kpiCard('Выручка', money(selected.revenue), 'Стоимость работ')}
        ${kpiCard('Исполнитель', money(selected.contractorCost), 'Прямые работы')}
        ${kpiCard('Чистая прибыль', money(selected.netProfit), 'После расходов')}
        ${kpiCard('Маржа', `${number(selected.marginPct)}%`, 'Итого %')}
      </section>

      <section class="report-grid works-grid">
        <article class="panel chart-panel span-7 row-2">
          <div class="panel-title">
            <h3>Экономика выбранной работы</h3>
          </div>
          <canvas id="workEconomyChart"></canvas>
        </article>

        <article class="panel chart-panel span-5">
          <div class="panel-title">
            <h3>Сравнение работ</h3>
          </div>
          <canvas id="workCompareChart"></canvas>
        </article>

        <article class="panel progress-panel span-5">
          <div class="panel-title">
            <h3>Состав расходов</h3>
          </div>
          <div class="progress-stack compact">
            ${costParts.map(([label, value], index) => progressRow(label, value, selected.revenue, index)).join('')}
          </div>
        </article>
      </section>
    </div>
  `;
}

function renderPayments() {
  return `
    <div class="screen category-screen">
      <section class="category-head">
        ${kpiCard('Постоянные платежи', money(fixedTotal()), 'Итого за год')}
        ${kpiCard('Зарплатная группа', money(fixedGroups()[0][1]), `${number(pct(fixedGroups()[0][1], fixedTotal()))}%`)}
        ${kpiCard('Общехозяйственные', money(fixedGroups()[1][1]), `${number(pct(fixedGroups()[1][1], fixedTotal()))}%`)}
        ${kpiCard('Статей', number(fixedItems().length, 0), 'В расшифровке')}
      </section>

      <section class="report-grid payments-grid">
        <article class="panel chart-panel span-7 row-2">
          <div class="panel-title">
            <h3>Динамика по месяцам</h3>
          </div>
          <canvas id="fixedMonthChart"></canvas>
        </article>

        <article class="panel chart-panel span-5">
          <div class="panel-title">
            <h3>Структура платежей</h3>
          </div>
          <canvas id="fixedPieChart"></canvas>
        </article>

        <article class="panel progress-panel span-5">
          <div class="panel-title">
            <h3>Расшифровка статей</h3>
          </div>
          <div class="progress-stack compact">
            ${fixedItems().map((row, index) => progressRow(row.category, row.amount, fixedTotal(), index)).join('')}
          </div>
        </article>
      </section>
    </div>
  `;
}

function kpiCard(label, value, note) {
  return `
    <article class="kpi-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `;
}

function metricTable(rows) {
  return `
    <div class="metrics-list">
      ${rows.map(([label, value, group, type]) => `
        <div>
          <span>${group}</span>
          <strong>${label}</strong>
          <b>${type === 'percent' ? `${number(value)}%` : money(value)}</b>
        </div>
      `).join('')}
    </div>
  `;
}

function progressRow(label, value, total, index = 0) {
  const width = Math.max(4, Math.min(100, pct(value, total)));
  return `
    <div class="progress-row">
      <div>
        <span>${label}</span>
        <strong>${money(value)}</strong>
      </div>
      <div class="progress-track">
        <i style="width:${width}%;background:${palette[index % palette.length]}"></i>
      </div>
    </div>
  `;
}

function ringCard(label, value) {
  const raw = Math.max(0, Math.min(100, Number(value || 0)));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (raw / 100) * circumference;
  return `
    <div class="ring-card">
      <div class="ring-visual">
        <svg class="ring-svg" viewBox="0 0 112 112" aria-hidden="true">
          <circle class="ring-track" cx="56" cy="56" r="${radius}"></circle>
          <circle class="ring-core" cx="56" cy="56" r="34"></circle>
          <circle class="ring-progress" cx="56" cy="56" r="${radius}" style="stroke-dasharray:${circumference};stroke-dashoffset:${offset}"></circle>
        </svg>
        <strong>${number(raw, 0)}%</strong>
      </div>
      <span>${label}</span>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => setPage(button.dataset.page));
  });
  document.querySelectorAll('[data-work]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedWork = Number(button.dataset.work || 0);
      renderApp();
    });
  });
  document.querySelectorAll('[data-object-scope]').forEach((button) => {
    button.addEventListener('click', () => {
      state.objectScope = button.dataset.objectScope || 'all';
      renderApp();
    });
  });
  document.getElementById('seedButton').onclick = renderApp;
}

function setPage(page) {
  state.page = page;
  renderApp();
}

function renderCharts() {
  const s = objectSummary();

  addIfPresent('overviewResultChart', {
    type: 'bar',
    data: {
      labels: ['Выручка', 'Исполнитель', 'Валовая', 'Расходы', 'Чистая'],
      datasets: [{
        data: [s.revenue, s.contractorCost, s.grossProfit, objectExpenseTotal(), s.netProfit],
        backgroundColor: palette.slice(0, 5),
        borderRadius: 9,
      }],
    },
    options: axisOptions(),
  });

  addIfPresent('objectExpenseChart', doughnutConfig(objectExpenses()));
  addIfPresent('fixedGroupChart', doughnutConfig(fixedGroups()));
  addIfPresent('fixedPieChart', doughnutConfig(fixedGroups()));

  addIfPresent('objectRowsChart', {
    type: 'line',
    data: {
      labels: objectRows().slice(0, 25).map((row) => row.row),
      datasets: [
        {
          label: 'Выручка',
          data: objectRows().slice(0, 25).map((row) => row.revenue),
          borderColor: palette[0],
          backgroundColor: 'rgba(124, 92, 227, 0.12)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Прибыль',
          data: objectRows().slice(0, 25).map((row) => row.grossProfit || row.netProfit),
          borderColor: palette[1],
          backgroundColor: 'rgba(177, 109, 136, 0.1)',
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: axisOptions(true),
  });

  addIfPresent('objectsCompareChart', {
    type: 'bar',
    data: {
      labels: objectCards().map((object) => object.name),
      datasets: [
        {
          label: 'Выручка',
          data: objectCards().map((object) => object.summary.revenue),
          backgroundColor: palette[0],
          borderRadius: 9,
        },
        {
          label: 'Чистая прибыль',
          data: objectCards().map((object) => object.summary.netProfit),
          backgroundColor: palette[1],
          borderRadius: 9,
        },
      ],
    },
    options: axisOptions(true),
  });

  const selected = workRows()[state.selectedWork] || workRows()[0];
  addIfPresent('workEconomyChart', {
    type: 'bar',
    data: {
      labels: ['Выручка', 'Исполнитель', 'Валовая', 'Итого'],
      datasets: [{
        data: [selected.revenue, selected.contractorCost, selected.grossProfit, selected.netProfit],
        backgroundColor: palette.slice(0, 4),
        borderRadius: 9,
      }],
    },
    options: axisOptions(),
  });

  addIfPresent('workCompareChart', {
    type: 'bar',
    data: {
      labels: workRows().map((row) => short(row.name, 18)),
      datasets: [
        { label: 'Выручка', data: workRows().map((row) => row.revenue), backgroundColor: palette[0], borderRadius: 8 },
        { label: 'Прибыль', data: workRows().map((row) => row.netProfit), backgroundColor: palette[1], borderRadius: 8 },
      ],
    },
    options: axisOptions(true),
  });

  addIfPresent('fixedMonthChart', {
    type: 'line',
    data: {
      labels: clientData.finance.fixedMonths.map((row) => row.month),
      datasets: [{
        data: clientData.finance.fixedMonths.map((row) => row.total),
        borderColor: palette[1],
        backgroundColor: 'rgba(177, 109, 136, 0.16)',
        pointBackgroundColor: palette[0],
        pointRadius: 3,
        fill: true,
        tension: 0.35,
      }],
    },
    options: axisOptions(),
  });
}

function doughnutConfig(rows) {
  return {
    type: 'doughnut',
    data: {
      labels: rows.map(([label]) => label),
      datasets: [{
        data: rows.map(([, value]) => value),
        backgroundColor: rows.map((_, index) => palette[index % palette.length]),
        borderColor: '#ffffff',
        borderWidth: 3,
      }],
    },
    options: {
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: chartText, usePointStyle: true, boxWidth: 8, font: { size: 10 } },
        },
      },
    },
  };
}

function axisOptions(showLegend = false) {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: showLegend, labels: { color: chartText, usePointStyle: true, boxWidth: 9 } },
    },
    scales: {
      y: {
        grid: { color: chartGrid },
        ticks: { color: chartText, callback: (value) => money(value).replace(',00', '') },
      },
      x: {
        grid: { display: false },
        ticks: { color: chartText, maxRotation: 0 },
      },
    },
  };
}

function addIfPresent(id, config) {
  const node = document.getElementById(id);
  if (!node || !window.Chart) return;
  charts.set(id, new Chart(node, config));
}

function destroyCharts() {
  charts.forEach((chart) => chart.destroy());
  charts.clear();
}

function iconFor(id) {
  return {
    overview: '◈',
    object: '▤',
    expenses: '◌',
    works: '▥',
    payments: '▣',
  }[id] || '•';
}

renderApp();
