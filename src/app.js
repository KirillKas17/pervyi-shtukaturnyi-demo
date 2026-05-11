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

const visualTriples = [
  ['#ffae43', '#ff5a45', '#b91934'],
  ['#ff9b43', '#f05a42', '#c92539'],
  ['#ffc04e', '#ff8845', '#d0383a'],
  ['#e6c94b', '#ba9c3f', '#60743d'],
  ['#efc653', '#c6a64b', '#657a40'],
];

const extendedTriples = [
  ['#d8924a', '#8a5b38', '#4f3428'],
  ['#c96063', '#87394b', '#4a2634'],
  ['#7db8a2', '#4f7f72', '#2d4f4b'],
  ['#9a7ba8', '#66517c', '#3d334f'],
  ['#c8a46a', '#8d6746', '#5a4432'],
  ['#9fae68', '#687a4b', '#3f5338'],
  ['#a55b78', '#6e3a55', '#432838'],
  ['#6f8fa8', '#4b6076', '#2d3d4f'],
];

const segmentTriples = [
  visualTriples[0],
  extendedTriples[2],
  visualTriples[2],
  extendedTriples[3],
  visualTriples[3],
  extendedTriples[1],
  visualTriples[4],
  extendedTriples[7],
  extendedTriples[0],
  extendedTriples[5],
  extendedTriples[6],
  extendedTriples[4],
];

const gradientPairs = [...visualTriples, ...extendedTriples].map(([from, , to]) => ({ from, to }));
const palette = gradientPairs.map((pair) => pair.from);
const chartText = 'rgba(255, 255, 255, 0.58)';
const chartGrid = 'rgba(255, 255, 255, 0.105)';
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

function gradientPair(index = 0) {
  return gradientPairs[index % gradientPairs.length];
}

function gradientCss(index = 0) {
  const pair = gradientPair(index);
  return `linear-gradient(90deg, ${pair.from}, ${pair.to})`;
}

function hexToRgba(hex, alpha) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function chartGradient(context, index = 0, vertical = false) {
  const chart = context.chart || context;
  const pair = gradientPair(index);
  const area = chart.chartArea;
  if (!chart.ctx || !area) return pair.from;

  const gradient = vertical
    ? chart.ctx.createLinearGradient(0, area.bottom, 0, area.top)
    : chart.ctx.createLinearGradient(area.left, 0, area.right, 0);
  gradient.addColorStop(0, pair.from);
  gradient.addColorStop(1, pair.to);
  return gradient;
}

function indexedGradient(vertical = false) {
  return (context) => chartGradient(context, context.dataIndex || 0, vertical);
}

function gradientBackground(index = 0, vertical = false) {
  return (context) => chartGradient(context, index, vertical);
}

function areaGradient(index = 0) {
  return (context) => {
    const chart = context.chart || context;
    const pair = gradientPair(index);
    const area = chart.chartArea;
    if (!chart.ctx || !area) return hexToRgba(pair.from, 0.16);

    const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    gradient.addColorStop(0, hexToRgba(pair.to, 0.26));
    gradient.addColorStop(1, hexToRgba(pair.from, 0.04));
    return gradient;
  };
}

function paddedLineOptions(values, showLegend = true) {
  const options = axisOptions(showLegend);
  const numeric = values.map((value) => Number(value || 0));
  const min = Math.min(...numeric, 0);
  const max = Math.max(...numeric, 1);
  const pad = Math.max((max - min) * 0.18, max * 0.08, 1);
  options.scales.y.suggestedMin = Math.max(0, min - pad);
  options.scales.y.suggestedMax = max + pad;
  return options;
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

function overviewRows() {
  return knownObjects()
    .flatMap((object) => object.rows.map((row) => ({ ...row, objectName: object.name, objectId: object.id })))
    .filter((row) => row.revenue || row.contractorCost || row.grossProfit || row.netProfit);
}

function reportMetrics(summary = objectSummary(), expenseTotal = objectExpenseTotal()) {
  const s = summary;
  return [
    ['Выручка', s.revenue, 'Основная экономика'],
    ['Стоимость исполнителя', s.contractorCost, 'Основная экономика'],
    ['Валовая прибыль', s.grossProfit, 'Основная экономика'],
    ['Расходы по статьям', expenseTotal, 'Расходы'],
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
  const s = aggregateSummary(knownObjects());
  const margin = pct(s.netProfit, s.revenue);
  const expenseTotal = s.advance + s.tools + s.customerExpenses + s.tax + s.housing + s.laborers + s.unplanned;
  return `
    <div class="screen dashboard-report overview-screen">
      <section class="scope-row period-row" aria-label="Период отчёта">
        <span>Период</span>
        <button class="active">Всё время</button>
        <button>Год</button>
        <button>Месяц</button>
      </section>

      <section class="kpi-row overview-kpis">
        ${kpiCard('Выручка', money(s.revenue), 'Все объекты')}
        ${kpiCard('Валовая прибыль', money(s.grossProfit), `${number(pct(s.grossProfit, s.revenue))}% от выручки`)}
        ${kpiCard('Чистая прибыль', money(s.netProfit), `${number(margin)}% маржа`)}
        ${kpiCard('Работ в ведомости', number(overviewRows().length, 0), 'строки выбранного среза')}
        ${kpiCard('Маржа', `${number(margin)}%`, 'чистая прибыль / выручка')}
      </section>

      <section class="report-grid overview-grid">
        <article class="panel chart-panel overview-main">
          <div class="panel-title">
            <h3>Выручка и чистая прибыль</h3>
          </div>
          <canvas id="overviewProfitChart"></canvas>
        </article>

        <article class="panel ref-bar-panel overview-side-top">
          <div class="panel-title">
            <h3>Финансовая структура</h3>
          </div>
          ${financeStructureCard([
            ['Выручка', s.revenue],
            ['Исполнитель', s.contractorCost],
            ['Валовая', s.grossProfit],
            ['Расходы', expenseTotal],
            ['Чистая', s.netProfit],
          ], s.netProfit, 'Чистая прибыль')}
        </article>

        <article class="panel metric-table overview-side-bottom">
          <div class="panel-title">
            <h3>Метрики из ведомости</h3>
          </div>
          ${metricTable(reportMetrics(s, expenseTotal))}
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
        ${renderObjectAnalysisView()}
      </section>
    </div>
  `;
}

function renderObjectScope() {
  const objectOptions = knownObjects().map((object) => `
    <option value="${object.id}" ${state.objectScope === object.id ? 'selected' : ''}>${object.name}</option>
  `).join('');

  return `
    <section class="scope-row" aria-label="Срез объектов">
      <span>Срез</span>
      <button class="${state.objectScope === 'all' ? 'active' : ''}" data-object-scope="all">
        Все объекты
      </button>
      <label class="object-select">
        <select data-object-select>
          <option value="">Выбрать объект</option>
          ${objectOptions}
        </select>
      </label>
    </section>
  `;
}

function renderObjectAnalysisView() {
  return `
    <article class="panel chart-panel span-6 row-2">
      <div class="panel-title">
        <h3>Работы внутри среза</h3>
      </div>
      <canvas id="objectRowsChart"></canvas>
    </article>

    <article class="panel ref-bar-panel span-6">
      <div class="panel-title">
        <h3>Финансовая структура</h3>
      </div>
      ${financeStructureCard([
        ['Выручка', objectSummary().revenue],
        ['Исполнитель', objectSummary().contractorCost],
        ['Валовая', objectSummary().grossProfit],
        ['Расходы', objectExpenseTotal()],
        ['Чистая', objectSummary().netProfit],
      ], objectSummary().netProfit, 'Чистая прибыль')}
    </article>

    <article class="panel chart-panel span-6">
      <div class="panel-title">
        <h3>Расходы по статьям</h3>
      </div>
      ${peachDonutChart(objectExpenses(), objectExpenseTotal(), 'Итого')}
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
        <article class="panel donut-panel span-5 row-2">
          <div class="panel-title">
            <h3>Объектные расходы</h3>
          </div>
          ${peachDonutChart(objectExpenses(), objectExpenseTotal(), 'Итого')}
        </article>

        <article class="panel donut-panel span-4">
          <div class="panel-title">
            <h3>Постоянные расходы</h3>
          </div>
          ${peachDonutChart(fixedGroups(), fixedTotal(), 'Итого')}
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
          ${bubbleChart(objectExpenses(), objectExpenseTotal(), 'Сумма', 'Доля', 'expense-bubbles')}
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
        <article class="panel ref-bar-panel span-7">
          <div class="panel-title">
            <h3>Экономика выбранной работы</h3>
          </div>
          ${financeStructureCard([
            ['Выручка', selected.revenue],
            ['Исполнитель', selected.contractorCost],
            ['Валовая', selected.grossProfit],
            ['Расходы', selected.revenue - selected.netProfit],
            ['Чистая', selected.netProfit],
          ], selected.netProfit, 'Чистая прибыль')}
        </article>

        <article class="panel placeholder-panel span-7">
          <div class="panel-title">
            <h3>Следующий блок</h3>
          </div>
          <div class="placeholder-copy">Здесь позже добавим дополнительную аналитику по выбранной работе.</div>
        </article>

        <article class="panel progress-panel span-5">
          <div class="panel-title">
            <h3>Сравнение работ</h3>
          </div>
          ${bubbleChart(rows.map((row) => [row.name, row.revenue]), sum(rows, 'revenue'), 'Выручка', 'Объём', 'work-bubbles')}
        </article>

        <article class="panel donut-panel span-5">
          <div class="panel-title">
            <h3>Состав расходов</h3>
          </div>
          ${peachDonutChart(costParts, selected.revenue, 'От выручки')}
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

        <article class="panel donut-panel span-5">
          <div class="panel-title">
            <h3>Структура платежей</h3>
          </div>
          ${peachDonutChart(fixedGroups(), fixedTotal(), 'Итого')}
        </article>

        <article class="panel progress-panel span-5">
          <div class="panel-title">
            <h3>Расшифровка статей</h3>
          </div>
          ${bubbleChart(fixedItems().map((row) => [row.category, row.amount]), fixedTotal(), 'Сумма', 'Доля', 'payment-bubbles')}
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
        <i style="width:${width}%;background:${gradientCss(index)}"></i>
      </div>
    </div>
  `;
}

function financeStructureCard(rows, mainValue, mainLabel) {
  const max = Math.max(...rows.map(([, value]) => Number(value || 0)), 1);
  return `
    <div class="ref-chart">
      <div class="ref-bars">
        ${rows.map(([label, value], index) => {
          const height = Math.max(10, Math.min(96, (Number(value || 0) / max) * 92));
          const colors = visualTriples[index % visualTriples.length];
          return `
            <div class="ref-bar-item">
              <div class="ref-bar-track">
                <div class="ref-bar" style="height:${height}%;--top:${colors[0]};--middle:${colors[1]};--bottom:${colors[2]};"></div>
              </div>
              <div class="ref-bar-label">${short(label, 9)}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="ref-side-info">
        ${rows.slice(0, 2).map(([label, value]) => `
          <div class="ref-metric-small">
            <strong>${money(value)}</strong>
            ${label}
          </div>
        `).join('')}
        <div class="ref-main-number">
          <div class="value">${money(mainValue)}</div>
          <div class="caption">${mainLabel}</div>
        </div>
      </div>
    </div>
  `;
}

function peachDonutChart(rows, total, centerLabel = 'Итого') {
  const colors = segmentTriples.map(([top]) => top);
  const safeRows = rows
    .filter(([, value]) => Number(value || 0) > 0)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 8);
  const sumValue = safeRows.reduce((acc, [, value]) => acc + Number(value || 0), 0);
  const base = sumValue || 1;
  let angle = -40;
  const sectors = safeRows.length
    ? safeRows.map(([, value], index) => {
      const start = angle;
      const end = angle + (Number(value || 0) / base) * 360;
      angle = end;
      return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    }).join(', ')
    : '#2a3038 0deg 360deg';
  const centerValue = total ? Math.round(pct(sumValue, total)) : 100;

  return `
    <div class="peach-donut-card">
      <div class="peach-chart-wrap">
        <div class="peach-donut" style="background:conic-gradient(from -40deg, ${sectors});">
          <div class="donut-shadow"></div>
          <div class="peach-center">
            <div class="peach-value">${centerValue}%</div>
            <div class="peach-label">${centerLabel}</div>
          </div>
        </div>
      </div>
      <div class="peach-legend">
        ${safeRows.map(([label, value], index) => `
          <div class="peach-legend-item" title="${label}: ${money(value)}">
            <span class="peach-dot" style="background:${colors[index % colors.length]}"></span>
            <span>${short(label, 16)} ${number(pct(value, sumValue), 0)}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bubbleChart(rows, total, yLabel = 'Сумма', xLabel = 'Доля', className = '') {
  const safeRows = rows
    .filter(([, value]) => Number(value || 0) > 0)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 8);
  const max = Math.max(...safeRows.map(([, value]) => Number(value || 0)), 1);
  const colors = ['fire', 'teal', 'amber', 'violet', 'olive', 'rose', 'moss', 'steel'];
  const positions = [
    [72, 34],
    [55, 48],
    [38, 58],
    [81, 62],
    [27, 76],
    [18, 38],
    [62, 76],
    [44, 28],
  ];

  return `
    <div class="bubble-map ${className}">
      <div class="zone one"></div>
      <div class="zone two"></div>
      <div class="soft-axis-x"></div>
      <div class="soft-axis-y"></div>
      <div class="axis-caption y">${yLabel}</div>
      <div class="axis-caption x">${xLabel}</div>
      ${safeRows.map(([label, value], index) => {
        const size = Number(value || 0) / max;
        const sizeClass = size > 0.72 ? 'big' : size > 0.42 ? 'medium' : size > 0.22 ? 'small' : 'tiny';
        const [left, top] = positions[index % positions.length];
        return `
          <div class="bubble ${colors[index % colors.length]} ${sizeClass}" style="left:${left}%;top:${top}%;" title="${label}: ${money(value)}">
            <span>${short(label, 14)}<small>${money(value)}</small></span>
          </div>
        `;
      }).join('')}
      <div class="bubble-summary">
        <span>Итого</span>
        <strong>${money(total)}</strong>
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
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffae43"></stop>
              <stop offset="100%" stop-color="#b91934"></stop>
            </linearGradient>
          </defs>
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
  document.querySelectorAll('[data-object-select]').forEach((select) => {
    select.addEventListener('change', () => {
      if (!select.value) return;
      state.objectScope = select.value;
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
  const s = state.page === 'overview' ? aggregateSummary(knownObjects()) : objectSummary();

  addIfPresent('overviewProfitChart', {
    type: 'line',
    data: {
      labels: overviewRows().slice(0, 25).map((row) => short(row.workName || `Строка ${row.row}`, 12)),
      datasets: [
        {
          label: 'Выручка',
          data: overviewRows().slice(0, 25).map((row) => row.revenue),
          borderColor: gradientBackground(0),
          backgroundColor: areaGradient(0),
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Чистая прибыль',
          data: overviewRows().slice(0, 25).map((row) => row.grossProfit || row.netProfit),
          borderColor: gradientBackground(3),
          backgroundColor: areaGradient(3),
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: axisOptions(true),
  });

  addIfPresent('objectRowsChart', {
    type: 'line',
    data: {
      labels: objectRows().slice(0, 25).map((row) => short(row.workName || `Строка ${row.row}`, 14)),
      datasets: [
        {
          label: 'Выручка',
          data: objectRows().slice(0, 25).map((row) => row.revenue),
          borderColor: gradientBackground(0),
          backgroundColor: areaGradient(0),
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Прибыль',
          data: objectRows().slice(0, 25).map((row) => row.grossProfit || row.netProfit),
          borderColor: gradientBackground(1),
          backgroundColor: areaGradient(1),
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: paddedLineOptions([
      ...objectRows().slice(0, 25).map((row) => row.revenue),
      ...objectRows().slice(0, 25).map((row) => row.grossProfit || row.netProfit),
    ], true),
  });

  addIfPresent('fixedMonthChart', {
    type: 'line',
    data: {
      labels: clientData.finance.fixedMonths.map((row) => row.month),
      datasets: [{
        data: clientData.finance.fixedMonths.map((row) => row.total),
        borderColor: gradientBackground(1),
        backgroundColor: areaGradient(1),
        pointBackgroundColor: '#ffae43',
        pointRadius: 3,
        fill: true,
        tension: 0.35,
      }],
    },
    options: axisOptions(),
  });
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
