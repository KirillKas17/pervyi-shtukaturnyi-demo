import { clientData } from './clientData.js';

const state = {
  page: 'dashboard',
  selectedWork: 0,
};

let charts = new Map();

const pages = [
  ['dashboard', 'Дашборд'],
  ['object', 'Ведомость'],
  ['finance', 'Финансы'],
  ['reports', 'Отчеты'],
];

const sourceNote = `Источник: ${clientData.sourceFiles.join(' + ')}`;

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

function expenseRows() {
  const s = clientData.objectSheet.summary;
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

function renderApp() {
  destroyCharts();
  document.getElementById('appNav').innerHTML = pages.map(([id, label]) => `
    <button class="nav-button ${state.page === id ? 'active' : ''}" data-page="${id}">
      <span class="nav-icon">${iconFor(id)}</span>
      <span>${label}</span>
    </button>
  `).join('');

  document.getElementById('sectionLabel').textContent = 'BI Analytics';
  document.getElementById('pageTitle').textContent = pages.find(([id]) => id === state.page)?.[1] || 'Дашборд';
  const primary = document.getElementById('primaryAction');
  primary.textContent = 'Excel данные';
  primary.style.display = 'inline-flex';
  primary.onclick = () => setPage('reports');

  const content = document.getElementById('content');
  content.innerHTML = {
    dashboard: renderDashboard,
    object: renderObjectSheet,
    finance: renderFinance,
    reports: renderReports,
  }[state.page]();

  bindEvents();
  renderCharts();
}

function renderDashboard() {
  const s = clientData.objectSheet.summary;
  const calcRows = clientData.finance.calcRows;
  const calcRevenue = sum(calcRows, 'revenue');
  const calcNet = sum(calcRows, 'netProfit');
  const fixedTotal = clientData.finance.fixedMonths.reduce((total, row) => total + Number(row.total || 0), 0);
  return `
    <div class="dashboard-grid">
      <section class="hero-panel">
        <p class="eyebrow">Пример дашборда по файлам клиента</p>
        <h2>Финансовая картина без лишних сущностей</h2>
        <p>На экране только показатели, которые удалось прочитать из приложенных Excel-шаблонов. Данные не дополнены вручную.</p>
        <div class="source-line">${sourceNote}</div>
      </section>
      ${metricCard('Выручка по ведомости', money(s.revenue), 'строка Итого в общей сводной')}
      ${metricCard('Чистая прибыль', money(s.netProfit), `${number(pct(s.netProfit, s.revenue))}% от выручки`, s.netProfit >= 0 ? 'good' : 'bad')}
      ${metricCard('Расходы объекта', money(s.grossProfit - s.netProfit), 'после прибыли до расходов')}
      ${metricCard('Расчет работ', money(calcRevenue), `${calcRows.length} позиции в файле расчета`)}
    </div>

    <div class="chart-layout">
      <section class="panel chart-panel wide">
        <div class="panel-title">
          <div>
            <h3>Структура результата по объекту</h3>
            <p>Выручка, исполнитель, расходы и чистая прибыль из общей сводной ведомости.</p>
          </div>
        </div>
        <canvas id="resultChart"></canvas>
      </section>

      <section class="panel chart-panel">
        <div class="panel-title">
          <div>
            <h3>Расходы объекта</h3>
            <p>Доли статей из блока “Расходы”.</p>
          </div>
        </div>
        <canvas id="expenseChart"></canvas>
      </section>

      <section class="panel chart-panel">
        <div class="panel-title">
          <div>
            <h3>Постоянные платежи</h3>
            <p>Итог по месяцам из финансового учета.</p>
          </div>
        </div>
        <canvas id="fixedChart"></canvas>
      </section>
    </div>
  `;
}

function renderObjectSheet() {
  const rows = clientData.objectSheet.rows;
  const visible = rows.filter((row) => row.revenue || row.contractorCost || row.netProfit || row.executor);
  const s = clientData.objectSheet.summary;
  return `
    <div class="simple-header">
      <div>
        <p class="eyebrow">Общая сводная ведомость</p>
        <h2>${clientData.objectSheet.name}</h2>
        <p>${visible.length} строк с данными из листа “${clientData.objectSheet.sheet}”.</p>
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
        <p>Показываем только то, что есть в Excel: без названий объектов и без добавленных контрагентов.</p>
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
    <div class="simple-header">
      <div>
        <p class="eyebrow">Расчет стоимости работ</p>
        <h2>${clientData.finance.name}</h2>
        <p>Здесь два расчета из файла: штукатурные работы и полусухая стяжка.</p>
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
          <p>Цена заказчика, исполнитель и итоговая прибыль.</p>
        </div>
        <canvas id="workChart"></canvas>
      </section>

      <section class="panel table-panel">
        <div class="panel-title">
          <h3>Статьи расходов</h3>
          <p>Расшифровка по выбранной работе.</p>
        </div>
        <div class="bar-list">
          ${costParts.map(([label, value]) => progressRow(label, value, selected.revenue)).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderReports() {
  const fixedTotals = clientData.finance.fixedTotals.filter((row) => Number(row.amount || 0) !== 0);
  return `
    <div class="simple-header">
      <div>
        <p class="eyebrow">Отчеты из Excel</p>
        <h2>Что сейчас можно показать заказчику</h2>
        <p>Это не учетная система и не выдуманные данные. Это визуализация приложенных шаблонов.</p>
      </div>
    </div>

    <div class="reports-grid">
      <section class="panel">
        <h3>Исходные файлы</h3>
        <ul class="report-list">
          ${clientData.sourceFiles.map((file) => `<li>${file}</li>`).join('')}
        </ul>
      </section>
      <section class="panel">
        <h3>Постоянные платежи: ИТОГО 2026</h3>
        <div class="bar-list">
          ${fixedTotals.map((row) => progressRow(row.category, row.amount, 13)).join('')}
        </div>
      </section>
      <section class="panel">
        <h3>Логика следующего шага</h3>
        <ul class="report-list">
          <li>Подключить реальные заполненные объектные ведомости.</li>
          <li>Добавить загрузку новых Excel-файлов, когда заказчик будет готов.</li>
          <li>Собрать PDF-отчет руководителю по тем же показателям.</li>
        </ul>
      </section>
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

function miniKpi(label, value) {
  return `<div class="mini-kpi"><span>${label}</span><strong>${value}</strong></div>`;
}

function progressRow(label, value, total) {
  const width = Math.max(3, Math.min(100, pct(value, total)));
  return `
    <div class="progress-row">
      <div><span>${label}</span><strong>${money(value)}</strong></div>
      <div class="progress"><i style="width:${width}%"></i></div>
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
  document.getElementById('seedButton').onclick = renderApp;
}

function setPage(page) {
  state.page = page;
  renderApp();
}

function renderCharts() {
  const s = clientData.objectSheet.summary;
  if (document.getElementById('resultChart')) {
    addChart('resultChart', {
      type: 'bar',
      data: {
        labels: ['Выручка', 'Исполнитель', 'Расходы', 'Чистая прибыль'],
        datasets: [{
          data: [s.revenue, s.contractorCost, s.grossProfit - s.netProfit, s.netProfit],
          backgroundColor: ['#6d5dfc', '#8bc5ff', '#ff8fb8', '#20b486'],
          borderRadius: 8,
        }],
      },
      options: chartOptions(),
    });
  }

  if (document.getElementById('expenseChart')) {
    addChart('expenseChart', {
      type: 'doughnut',
      data: {
        labels: expenseRows().map(([label]) => label),
        datasets: [{
          data: expenseRows().map(([, value]) => value),
          backgroundColor: ['#6d5dfc', '#8bc5ff', '#ff8fb8', '#ffc46b', '#20b486', '#9b8cff', '#d8dee9'],
          borderWidth: 0,
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
          borderColor: '#6d5dfc',
          backgroundColor: 'rgba(109, 93, 252, 0.14)',
          fill: true,
          tension: 0.35,
        }],
      },
      options: chartOptions(),
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
          backgroundColor: ['#6d5dfc', '#8bc5ff', '#ffc46b', '#20b486'],
          borderRadius: 8,
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

function chartOptions() {
  return {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { callback: (value) => money(value).replace(',00', '') }, grid: { color: '#eef0f6' } },
      x: { grid: { display: false }, ticks: { maxRotation: 0 } },
    },
  };
}

function donutOptions() {
  return {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } } },
    cutout: '62%',
  };
}

function iconFor(id) {
  const icons = {
    dashboard: '⌁',
    object: '▤',
    finance: '◌',
    reports: '▣',
  };
  return icons[id] || '•';
}

renderApp();
