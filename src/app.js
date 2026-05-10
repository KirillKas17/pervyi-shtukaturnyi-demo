import { clientData } from './clientData.js';

const state = {
  page: 'dashboard',
  selectedWork: 0,
  selectedObject: 'all',
  objectMode: 'list',
};

let charts = new Map();

const chartPalette = ['#b16d88', '#b06ba6', '#9572cd', '#6e6dc9', '#5b569d', '#474173'];
const chartGrid = 'rgba(148, 163, 184, 0.25)';
const chartText = '#5f6b7a';

const pages = [
  ['dashboard', 'Дашборд'],
  ['analytics', 'Аналитика'],
  ['object', 'Объекты'],
  ['finance', 'Финансы'],
  ['reports', 'Отчеты'],
];

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

function short(text, limit = 74) {
  const value = String(text || '');
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function pct(part, total) {
  return total ? (Number(part || 0) / Number(total || 0)) * 100 : 0;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function objects() {
  return [{
    id: 'object-1',
    name: 'Объект 1',
    status: 'В работе',
    summary: clientData.objectSheet.summary,
    rows: clientData.objectSheet.rows,
  }];
}

function selectedObjects() {
  if (state.selectedObject === 'all') return objects();
  return objects().filter((object) => object.id === state.selectedObject);
}

function activeObject() {
  return objects().find((object) => object.id === state.selectedObject) || objects()[0];
}

function aggregateSummary(scopeObjects = selectedObjects()) {
  const keys = ['revenue', 'contractorCost', 'grossProfit', 'advance', 'tools', 'customerExpenses', 'tax', 'housing', 'laborers', 'unplanned', 'netProfit'];
  return scopeObjects.reduce((result, object) => {
    keys.forEach((key) => {
      result[key] = Number(result[key] || 0) + Number(object.summary[key] || 0);
    });
    return result;
  }, {});
}

function visibleObjectRows(object = activeObject()) {
  return object.rows.filter((row) => row.revenue || row.contractorCost || row.netProfit || row.executor);
}

function expenseRows(summary = aggregateSummary()) {
  const s = summary;
  return [
    ['Аванс Исполнитель', s.advance],
    ['Расходники инструмент', s.tools],
    ['Расходы на Заказчика', s.customerExpenses],
    ['Налоги 11 %', s.tax],
    ['Проживание', s.housing],
    ['Разнорабочие', s.laborers],
    ['Внеплановые расходы', s.unplanned],
  ].filter(([, value]) => Number(value || 0) !== 0);
}

function fixedGroupRows() {
  const totals = clientData.finance.fixedTotals;
  return [
    ['Заработная плата', totals.slice(0, 8).reduce((t, r) => t + Number(r.amount || 0), 0)],
    ['Общехозяйственные расходы', totals.slice(8).reduce((t, r) => t + Number(r.amount || 0), 0)],
  ];
}

function fixedTotal() {
  return clientData.finance.fixedMonths.reduce((total, row) => total + Number(row.total || 0), 0);
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
  document.getElementById('pageTitle').textContent = state.page === 'object' && state.objectMode === 'detail'
    ? 'Детализация объекта'
    : pages.find(([id]) => id === state.page)?.[1] || 'Дашборд';
  const primary = document.getElementById('primaryAction');
  primary.textContent = 'Excel данные';
  primary.style.display = 'inline-flex';
  primary.onclick = () => setPage('reports');

  const content = document.getElementById('content');
  content.innerHTML = {
    dashboard: renderDashboard,
    analytics: renderAnalytics,
    object: renderObjectSheet,
    finance: renderFinance,
    reports: renderReports,
  }[state.page]();

  bindEvents();
  renderCharts();
}

function renderDashboard() {
  const s = aggregateSummary();
  const calcRows = clientData.finance.calcRows;
  const calcRevenue = sum(calcRows, 'revenue');
  const margin = pct(s.netProfit, s.revenue);
  return `
    <div class="dashboard-screen">
      ${scopeTabs()}
      <div class="dashboard-grid dashboard-slot dashboard-slot--kpi">
        ${metricCard('Выручка', money(s.revenue), 'по ведомости')}
        ${metricCard('Чистая прибыль', money(s.netProfit), `${number(pct(s.netProfit, s.revenue))}% маржа`, s.netProfit >= 0 ? 'good' : 'bad')}
        ${metricCard('Расходы объекта', money(s.grossProfit - s.netProfit), 'статьи расходов')}
        ${metricCard('Расчет работ', money(calcRevenue), `${calcRows.length} позиции`)}
        ${metricCard('Постоянные платежи', money(fixedTotal()), 'итого за год')}
      </div>

      <div class="dashboard-visuals dashboard-slot dashboard-slot--charts">
        <section class="panel chart-panel visual-main">
          <div class="panel-title">
            <h3>Структура результата</h3>
          </div>
          <canvas id="resultChart"></canvas>
        </section>

        <section class="panel ring-panel visual-ring">
          ${ringCard('Маржа', margin, 100)}
        </section>

        <section class="panel chart-panel visual-fixed">
          <div class="panel-title">
            <h3>Платежи по месяцам</h3>
          </div>
          <canvas id="fixedChart"></canvas>
        </section>
      </div>
    </div>
  `;
}

function renderAnalytics() {
  return `
    <div class="screen analytics-screen">
      ${scopeTabs()}
      <div class="analytics-grid">
        <section class="panel chart-panel analytics-expense">
          <div class="panel-title">
            <h3>Расходы объекта</h3>
          </div>
          <canvas id="expenseAnalyticsChart"></canvas>
        </section>

        <section class="panel chart-panel analytics-work">
          <div class="panel-title">
            <h3>Расчет работ</h3>
          </div>
          <canvas id="workMixChart"></canvas>
        </section>

        <section class="panel chart-panel analytics-fixed">
          <div class="panel-title">
            <h3>Структура постоянных расходов</h3>
          </div>
          <canvas id="fixedGroupAnalyticsChart"></canvas>
        </section>

        <section class="panel progress-panel analytics-bars">
          <div class="panel-title">
            <h3>Постоянные расходы</h3>
          </div>
          <div class="bar-list">
            ${fixedGroupRows().map(([label, value]) => progressRow(label, value, fixedTotal(), 'level-mid')).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderObjectSheet() {
  if (state.objectMode === 'detail') return renderObjectDetail();
  return renderObjectList();
}

function renderObjectList() {
  return `
    <div class="screen objects-screen">
      <div class="simple-header">
        <div>
          <p class="eyebrow">Объекты ремонта</p>
          <h2>Реестр объектов</h2>
        </div>
        <div class="mini-kpis">
          ${miniKpi('Всего объектов', number(objects().length, 0))}
          ${miniKpi('Выручка', money(aggregateSummary(objects()).revenue))}
          ${miniKpi('Чистая прибыль', money(aggregateSummary(objects()).netProfit))}
        </div>
      </div>

      <section class="object-list">
        ${objects().map((object) => objectCard(object)).join('')}
      </section>
    </div>
  `;
}

function renderObjectDetail() {
  const object = activeObject();
  const visible = visibleObjectRows(object);
  const s = object.summary;
  return `
    <div class="screen object-screen">
      <div class="simple-header">
        <div>
          <button class="back-button" data-back-objects>← Назад к объектам</button>
          <p class="eyebrow">Общая сводная ведомость</p>
          <h2>${object.name}</h2>
        </div>
        <div class="mini-kpis">
          ${miniKpi('Стоимость ИП Курочкин', money(s.revenue))}
          ${miniKpi('Исполнитель', money(s.contractorCost))}
          ${miniKpi('Чистая прибыль', money(s.netProfit))}
        </div>
      </div>

      <section class="panel table-panel">
        <div class="panel-title">
          <h3>Строки ведомости</h3>
        </div>
        <div class="clean-table">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Исполнитель</th>
                <th>Работа</th>
                <th class="right">Факт</th>
                <th class="right">Цена заказчика</th>
                <th class="right">Цена исполнителя</th>
                <th class="right">Прибыль</th>
              </tr>
            </thead>
            <tbody>
              ${visible.map((row) => `
                <tr>
                  <td>${row.row}</td>
                  <td>${row.executor || '—'}</td>
                  <td>${row.workName || '—'}</td>
                  <td class="right">${number(row.actualQty, 0)} ${row.unit || ''}</td>
                  <td class="right">${money(row.clientPrice)}</td>
                  <td class="right">${money(row.contractorPrice)}</td>
                  <td class="right ${row.netProfit < 0 ? 'bad' : 'good'}">${money(row.netProfit || row.grossProfit)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function objectCard(object) {
  const s = object.summary;
  return `
    <article class="object-card">
      <div>
        <p class="eyebrow">${object.status}</p>
        <h3>${object.name}</h3>
      </div>
      <div class="object-card__metrics">
        ${miniKpi('Выручка', money(s.revenue))}
        ${miniKpi('Расходы', money(s.grossProfit - s.netProfit))}
        ${miniKpi('Прибыль', money(s.netProfit))}
        ${miniKpi('Маржа', `${number(pct(s.netProfit, s.revenue))}%`)}
      </div>
      <button class="primary-button object-open" data-object-open="${object.id}">Открыть</button>
    </article>
  `;
}

function renderFinance() {
  const calcRows = clientData.finance.calcRows;
  const selected = calcRows[state.selectedWork] || calcRows[0];
  const costParts = [
    ['Пневмо транспорт', selected.pneumo],
    ['Заработная плата Мастер РОР', selected.masterSalary],
    ['Суточные', selected.daily],
    ['Проживание', selected.housing],
    ['Налог 11%', selected.tax],
    ['Расходники инструмент', selected.tools],
    ['Разнорабочие', selected.laborers],
    ['Внеплановые расходы', selected.unplanned],
  ].filter(([, value]) => Number(value || 0) !== 0);

  return `
    <div class="screen finance-screen">
      <div class="simple-header">
        <div>
          <p class="eyebrow">Расчет стоимости работ</p>
          <h2>Финансовая модель работ</h2>
        </div>
        <div class="segmented">
          ${calcRows.map((row, index) => `
            <button class="${index === state.selectedWork ? 'active' : ''}" data-work="${index}">${index + 1}</button>
          `).join('')}
        </div>
      </div>

      <div class="finance-layout">
        <section class="panel work-card">
          <p class="eyebrow">Выбранная работа</p>
          <h3>${selected.name}</h3>
          <div class="work-kpis">
            ${miniKpi('Объем', number(selected.volume, 0))}
            ${miniKpi('Выручка', money(selected.revenue))}
            ${miniKpi('Исполнитель', money(selected.contractorCost))}
            ${miniKpi('Итого', money(selected.netProfit))}
            ${miniKpi('Итого %', `${number(selected.marginPct)}%`)}
          </div>
        </section>

        <section class="panel chart-panel">
          <div class="panel-title">
            <h3>Экономика работы</h3>
          </div>
          <canvas id="workChart"></canvas>
        </section>

        <section class="panel table-panel">
          <div class="panel-title">
            <h3>Статьи расходов</h3>
          </div>
          <div class="bar-list">
            ${costParts.map(([label, value]) => progressRow(label, value, selected.revenue)).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderReports() {
  const fixedTotals = clientData.finance.fixedTotals.filter((row) => Number(row.amount || 0) !== 0);
  const groups = fixedGroupRows();
  return `
    <div class="screen reports-screen">
      <div class="simple-header">
        <div>
          <p class="eyebrow">Постоянные платежи</p>
          <h2>Расходы компании за 2026</h2>
        </div>
      </div>

      <div class="reports-grid">
        <section class="panel fixed-summary">
          <div>
            <p class="eyebrow">Постоянные платежи: 2026</p>
            <strong>${money(fixedTotal())}</strong>
            <span>${fixedTotals.length} строк расходов</span>
          </div>
          ${ringCard('ЗП', groups[0]?.[1] || 0, fixedTotal())}
        </section>

        <section class="panel chart-panel fixed-category-panel">
          <div class="panel-title">
            <h3>Структура постоянных расходов</h3>
          </div>
          <canvas id="fixedCategoryChart"></canvas>
        </section>

        <section class="panel chart-panel fixed-month-panel">
          <div class="panel-title">
            <h3>Помесячная динамика</h3>
          </div>
          <canvas id="fixedMonthReportChart"></canvas>
        </section>

        <section class="panel fixed-list-panel">
          <div class="panel-title">
            <h3>Расшифровка</h3>
          </div>
          <div class="fixed-list">
            ${fixedTotals.map((row, index) => progressRow(row.category, row.amount, fixedTotal(), `level-${index % 3 === 0 ? 'high' : index % 3 === 1 ? 'mid' : 'low'}`)).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function metricCard(label, value, note, tone = '') {
  return `
    <article class="metric-card ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `;
}

function scopeTabs() {
  const current = state.selectedObject;
  return `
    <div class="scope-tabs">
      <button class="${current === 'all' ? 'active' : ''}" data-scope="all">Все объекты</button>
      ${objects().map((object) => `
        <button class="${current === object.id ? 'active' : ''}" data-scope="${object.id}">${object.name}</button>
      `).join('')}
    </div>
  `;
}

function miniKpi(label, value) {
  return `<div class="mini-kpi"><span>${label}</span><strong>${value}</strong></div>`;
}

function progressRow(label, value, total, level = 'level-high') {
  const width = Math.max(3, Math.min(100, pct(value, total)));
  return `
    <div class="progress-row">
      <div><span>${label}</span><strong>${money(value)}</strong></div>
      <div class="progress progress-track ${level}"><i class="progress-bar variant-glow" style="width:${width}%"></i></div>
    </div>
  `;
}

function ringCard(label, value, total) {
  const raw = Math.max(0, Math.min(100, pct(value, total)));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (raw / 100) * circumference;
  return `
    <div class="ring-card bare">
      <div class="ring-visual">
        <svg class="ring-svg" viewBox="0 0 112 112" aria-hidden="true">
          <circle class="ring-track" cx="56" cy="56" r="${radius}"></circle>
          <circle class="ring-core" cx="56" cy="56" r="34"></circle>
          <circle class="ring-progress" cx="56" cy="56" r="${radius}" style="stroke-dasharray:${circumference};stroke-dashoffset:${offset}"></circle>
        </svg>
        <strong class="ring-value">${number(raw, 0)}%</strong>
      </div>
      <span class="ring-name">${label}</span>
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
  document.querySelectorAll('[data-scope]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedObject = button.dataset.scope;
      renderApp();
    });
  });
  document.querySelectorAll('[data-object-open]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedObject = button.dataset.objectOpen;
      state.objectMode = 'detail';
      renderApp();
    });
  });
  document.querySelectorAll('[data-back-objects]').forEach((button) => {
    button.addEventListener('click', () => {
      state.objectMode = 'list';
      renderApp();
    });
  });
  document.getElementById('seedButton').onclick = renderApp;
}

function setPage(page) {
  state.page = page;
  if (page === 'object') state.objectMode = 'list';
  renderApp();
}

function renderCharts() {
  const s = aggregateSummary();
  if (document.getElementById('resultChart')) {
    addChart('resultChart', {
      type: 'bar',
      data: {
        labels: ['Выручка', 'Исполнитель', 'Расходы', 'Чистая прибыль'],
        datasets: [{
          data: [s.revenue, s.contractorCost, s.grossProfit - s.netProfit, s.netProfit],
          backgroundColor: chartPalette.slice(0, 4),
          borderRadius: 8,
        }],
      },
      options: chartOptions(),
    });
  }

  if (document.getElementById('expenseAnalyticsChart')) {
    addChart('expenseAnalyticsChart', {
      type: 'doughnut',
      data: {
        labels: expenseRows().map(([label]) => label),
        datasets: [{
          data: expenseRows().map(([, value]) => value),
          backgroundColor: chartPalette,
          borderColor: '#ffffff',
          borderWidth: 3,
        }],
      },
      options: donutOptions(),
    });
  }

  if (document.getElementById('fixedChart')) {
    addChart('fixedChart', {
      type: 'line',
      data: {
        labels: clientData.finance.fixedMonths.map((row) => row.month),
        datasets: [{
          data: clientData.finance.fixedMonths.map((row) => row.total),
          borderColor: '#9572cd',
          backgroundColor: 'rgba(149, 114, 205, 0.14)',
          fill: true,
          tension: 0.35,
        }],
      },
      options: chartOptions(),
    });
  }

  if (document.getElementById('workMixChart')) {
    addChart('workMixChart', {
      type: 'bar',
      data: {
        labels: clientData.finance.calcRows.map((row) => short(row.name, 18)),
        datasets: [
          {
            label: 'Выручка',
            data: clientData.finance.calcRows.map((row) => row.revenue),
            backgroundColor: '#9572cd',
            borderRadius: 8,
          },
          {
            label: 'Прибыль',
            data: clientData.finance.calcRows.map((row) => row.netProfit),
            backgroundColor: '#b16d88',
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(true),
    });
  }

  if (document.getElementById('workChart')) {
    const row = clientData.finance.calcRows[state.selectedWork] || clientData.finance.calcRows[0];
    addChart('workChart', {
      type: 'bar',
      data: {
        labels: ['Стоимость', 'Исполнитель', 'Валовая', 'Итого'],
        datasets: [{
          data: [row.revenue, row.contractorCost, row.grossProfit, row.netProfit],
          backgroundColor: chartPalette.slice(0, 4),
          borderRadius: 8,
        }],
      },
      options: chartOptions(),
    });
  }

  if (document.getElementById('fixedCategoryChart')) {
    addChart('fixedCategoryChart', {
      type: 'doughnut',
      data: {
        labels: fixedGroupRows().map(([label]) => label),
        datasets: [{
          data: fixedGroupRows().map(([, value]) => value),
          backgroundColor: ['#9572cd', '#b16d88'],
          borderColor: '#ffffff',
          borderWidth: 3,
        }],
      },
      options: donutOptions(),
    });
  }

  if (document.getElementById('fixedGroupAnalyticsChart')) {
    addChart('fixedGroupAnalyticsChart', {
      type: 'doughnut',
      data: {
        labels: fixedGroupRows().map(([label]) => label),
        datasets: [{
          data: fixedGroupRows().map(([, value]) => value),
          backgroundColor: ['#9572cd', '#b16d88'],
          borderColor: '#ffffff',
          borderWidth: 3,
        }],
      },
      options: donutOptions(),
    });
  }

  if (document.getElementById('fixedMonthReportChart')) {
    addChart('fixedMonthReportChart', {
      type: 'line',
      data: {
        labels: clientData.finance.fixedMonths.map((row) => row.month),
        datasets: [{
          label: 'Платежи',
          data: clientData.finance.fixedMonths.map((row) => row.total),
          borderColor: '#b16d88',
          backgroundColor: 'rgba(177, 109, 136, 0.16)',
          fill: true,
          pointBackgroundColor: '#9572cd',
          pointRadius: 3,
          tension: 0.35,
        }],
      },
      options: chartOptions(),
    });
  }
}

function addChart(id, config) {
  const node = document.getElementById(id);
  if (!node || !window.Chart) return;
  charts.set(id, new Chart(node, config));
}

function destroyCharts() {
  charts.forEach((chart) => chart.destroy());
  charts.clear();
}

function chartOptions(showLegend = false) {
  return {
    maintainAspectRatio: false,
    plugins: { legend: { display: showLegend, labels: { color: chartText, boxWidth: 10, usePointStyle: true } } },
    scales: {
      y: { ticks: { callback: (value) => money(value).replace(',00', ''), color: chartText }, grid: { color: chartGrid } },
      x: { grid: { display: false }, ticks: { maxRotation: 0, color: chartText } },
    },
  };
}

function donutOptions() {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 8, usePointStyle: true, color: chartText, font: { size: 10 } },
      },
    },
    cutout: '62%',
  };
}

function iconFor(id) {
  const icons = {
    dashboard: '⌁',
    object: '▤',
    finance: '◌',
    reports: '▣',
    analytics: '◍',
  };
  return icons[id] || '•';
}

renderApp();
