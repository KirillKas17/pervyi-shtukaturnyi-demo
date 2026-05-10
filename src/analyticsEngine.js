export const ANALYTICS_MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const DEFAULT_RISK_LIMITS = {
  projectMargin: 15,
  workGrossMargin: 20,
  fixedCostShare: 30,
  overrunPercent: 5,
  dueSoonDays: 7,
};

function toNumber(value) {
  return Number(value || 0);
}

function sum(rows, selector) {
  return rows.reduce((total, row) => total + toNumber(selector(row)), 0);
}

function byId(rows, id) {
  return rows.find((item) => item.id === id);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthIndex(monthName) {
  return ANALYTICS_MONTHS.indexOf(monthName);
}

function getRuMonthName(date) {
  return ANALYTICS_MONTHS[date.getMonth()];
}

function getQuarter(date) {
  return String(Math.floor(date.getMonth() / 3) + 1);
}

function fixedCostMonthToDate(month) {
  const [monthName, year] = String(month || '').split(' ');
  const monthIndex = Math.max(getMonthIndex(monthName), 0);
  return new Date(Number(year || new Date().getFullYear()), monthIndex, 1);
}

function fixedCostDate(row) {
  return parseDate(row?.date) || fixedCostMonthToDate(row?.month);
}

function normalizePeriod(period = {}) {
  const type = ['all', 'year', 'quarter', 'month'].includes(period.type) ? period.type : 'all';
  return {
    type,
    year: String(period.year || new Date().getFullYear()),
    quarter: String(period.quarter || '1'),
    month: period.month || getRuMonthName(new Date()),
  };
}

function isDateInPeriod(value, period = {}) {
  const normalized = normalizePeriod(period);
  if (normalized.type === 'all') return true;

  const date = Object.prototype.toString.call(value) === '[object Date]' ? value : parseDate(value);
  if (!date) return false;
  if (String(date.getFullYear()) !== normalized.year) return false;
  if (normalized.type === 'year') return true;
  if (normalized.type === 'quarter') return getQuarter(date) === normalized.quarter;
  if (normalized.type === 'month') return getRuMonthName(date) === normalized.month;
  return true;
}

function previousPeriod(period = {}) {
  const normalized = normalizePeriod(period);
  const year = Number(normalized.year || new Date().getFullYear());

  if (normalized.type === 'year') {
    return { ...normalized, year: String(year - 1) };
  }

  if (normalized.type === 'quarter') {
    const quarter = Number(normalized.quarter || 1);
    if (quarter > 1) return { ...normalized, quarter: String(quarter - 1) };
    return { ...normalized, year: String(year - 1), quarter: '4' };
  }

  if (normalized.type === 'month') {
    const index = getMonthIndex(normalized.month);
    if (index > 0) return { ...normalized, month: ANALYTICS_MONTHS[index - 1] };
    return { ...normalized, year: String(year - 1), month: 'Декабрь' };
  }

  return null;
}

function percent(part, total) {
  return total ? (part / total) * 100 : 0;
}

function delta(current, previous) {
  const value = current - previous;
  return {
    value,
    percent: previous ? (value / Math.abs(previous)) * 100 : null,
  };
}

function fixedCostItemsCount(row) {
  return Array.isArray(row?.items) && row.items.length ? row.items.length : 1;
}

function fixedCostItemsTotal(row) {
  if (!Array.isArray(row?.items) || !row.items.length) return toNumber(row?.amount);
  return sum(row.items, (item) => item.amount);
}

function getWorkDate(work, project) {
  return work?.date || project?.startDate || project?.dueDate || null;
}

function getExpenseDate(expense, project) {
  return expense?.date || project?.startDate || project?.dueDate || null;
}

function getPaymentDate(payment) {
  return parseDate(payment?.date);
}

function getPaymentDirection(type) {
  return type === 'customer_income' || type === 'other_income' ? 'inflow' : 'outflow';
}

export function createAnalyticsEngine(rawState = {}) {
  const projects = Array.isArray(rawState.projects) ? rawState.projects : [];
  const priceItems = Array.isArray(rawState.priceItems) ? rawState.priceItems : [];
  const workItems = Array.isArray(rawState.workItems) ? rawState.workItems : [];
  const expenses = Array.isArray(rawState.expenses) ? rawState.expenses : [];
  const fixedCosts = Array.isArray(rawState.fixedCosts) ? rawState.fixedCosts : [];
  const payments = Array.isArray(rawState.payments) ? rawState.payments : [];
  const settings = { ...DEFAULT_RISK_LIMITS, ...(rawState.analyticsSettings || {}) };

  function getWorkMath(work) {
    const price = byId(priceItems, work?.priceItemId);
    const plannedQty = toNumber(work?.plannedQty);
    const actualQty = toNumber(work?.actualQty);
    const plannedRevenue = plannedQty * toNumber(price?.clientPrice);
    const plannedContractorCost = plannedQty * toNumber(price?.contractorPrice);
    const clientRevenue = actualQty * toNumber(price?.clientPrice);
    const contractorCost = actualQty * toNumber(price?.contractorPrice);
    const grossProfit = clientRevenue - contractorCost;
    const plannedGrossProfit = plannedRevenue - plannedContractorCost;
    const planDeltaQty = actualQty - plannedQty;
    const planDeltaPercent = plannedQty ? (planDeltaQty / plannedQty) * 100 : 0;

    return {
      price,
      actualQty,
      plannedQty,
      plannedRevenue,
      plannedContractorCost,
      plannedGrossProfit,
      clientRevenue,
      contractorCost,
      grossProfit,
      grossMargin: percent(grossProfit, clientRevenue),
      planRevenueDelta: clientRevenue - plannedRevenue,
      planCostDelta: contractorCost - plannedContractorCost,
      planProfitDelta: grossProfit - plannedGrossProfit,
      planDeltaQty,
      planDeltaPercent,
      completionPercent: plannedQty ? percent(actualQty, plannedQty) : 0,
    };
  }

  function getWorkRows(period = {}, projectId = null) {
    const normalized = normalizePeriod(period);
    return workItems
      .filter((work) => !projectId || work.projectId === projectId)
      .map((work) => {
        const project = byId(projects, work.projectId);
        return {
          work,
          project,
          date: getWorkDate(work, project),
          math: getWorkMath(work),
        };
      })
      .filter((row) => isDateInPeriod(row.date, normalized));
  }

  function getExpenseRows(period = {}, projectId = null) {
    const normalized = normalizePeriod(period);
    return expenses
      .filter((expense) => !projectId || expense.projectId === projectId)
      .map((expense) => {
        const project = byId(projects, expense.projectId);
        return {
          expense,
          project,
          date: getExpenseDate(expense, project),
        };
      })
      .filter((row) => isDateInPeriod(row.date, normalized));
  }

  function getFixedCosts(period = {}) {
    const normalized = normalizePeriod(period);
    return fixedCosts.filter((row) => isDateInPeriod(fixedCostDate(row), normalized));
  }

  function getPaymentRows(period = {}, projectId = null) {
    const normalized = normalizePeriod(period);
    return payments
      .filter((payment) => !projectId || payment.projectId === projectId)
      .map((payment) => {
        const project = byId(projects, payment.projectId);
        const direction = getPaymentDirection(payment.type);
        return {
          payment,
          project,
          direction,
          date: getPaymentDate(payment),
          signedAmount: direction === 'inflow' ? toNumber(payment.amount) : -toNumber(payment.amount),
        };
      })
      .filter((row) => isDateInPeriod(row.date, normalized));
  }

  function getProjectDirectMath(projectId, period = {}) {
    const workRows = getWorkRows(period, projectId);
    const expenseRows = getExpenseRows(period, projectId);
    const revenue = sum(workRows, (row) => row.math.clientRevenue);
    const plannedRevenue = sum(workRows, (row) => row.math.plannedRevenue);
    const contractorCost = sum(workRows, (row) => row.math.contractorCost);
    const plannedContractorCost = sum(workRows, (row) => row.math.plannedContractorCost);
    const directExpenses = sum(expenseRows, (row) => row.expense.amount);
    const grossProfit = revenue - contractorCost;
    const plannedGrossProfit = plannedRevenue - plannedContractorCost;
    const netProfit = grossProfit - directExpenses;
    const plannedQty = sum(workRows, (row) => row.math.plannedQty);
    const actualQty = sum(workRows, (row) => row.math.actualQty);

    return {
      revenue,
      plannedRevenue,
      revenueDelta: revenue - plannedRevenue,
      contractorCost,
      plannedContractorCost,
      contractorCostDelta: contractorCost - plannedContractorCost,
      directExpenses,
      grossProfit,
      plannedGrossProfit,
      grossProfitDelta: grossProfit - plannedGrossProfit,
      grossMargin: percent(grossProfit, revenue),
      netProfit,
      margin: percent(netProfit, revenue),
      plannedQty,
      actualQty,
      workCount: workRows.length,
      expenseCount: expenseRows.length,
    };
  }

  function getProjectRows(period = {}) {
    const directRows = projects.map((project) => ({
      project,
      math: getProjectDirectMath(project.id, period),
    }));

    const revenue = sum(directRows, (row) => row.math.revenue);
    const fixedCostTotal = sum(getFixedCosts(period), (row) => row.amount);

    return directRows.map((row) => {
      const fixedAllocation = revenue && row.math.revenue > 0
        ? fixedCostTotal * (row.math.revenue / revenue)
        : 0;
      const netProfitAfterFixed = row.math.netProfit - fixedAllocation;
      return {
        ...row,
        math: {
          ...row.math,
          fixedAllocation,
          netProfitAfterFixed,
          marginAfterFixed: percent(netProfitAfterFixed, row.math.revenue),
          revenueShare: percent(row.math.revenue, revenue),
        },
      };
    });
  }

  function getCompanyMath(period = {}) {
    const projectRows = getProjectRows(period);
    const revenue = sum(projectRows, (row) => row.math.revenue);
    const contractorCost = sum(projectRows, (row) => row.math.contractorCost);
    const directExpenses = sum(projectRows, (row) => row.math.directExpenses);
    const fixedCostTotal = sum(getFixedCosts(period), (row) => row.amount);
    const grossProfit = revenue - contractorCost;
    const netProfitBeforeFixed = grossProfit - directExpenses;
    const netProfit = netProfitBeforeFixed - fixedCostTotal;

    return {
      projects: projectRows,
      revenue,
      contractorCost,
      directExpenses,
      directCosts: contractorCost + directExpenses,
      fixedCosts: fixedCostTotal,
      totalCosts: contractorCost + directExpenses + fixedCostTotal,
      plannedRevenue: sum(projectRows, (row) => row.math.plannedRevenue),
      revenueDelta: revenue - sum(projectRows, (row) => row.math.plannedRevenue),
      unallocatedFixedCosts: fixedCostTotal - sum(projectRows, (row) => row.math.fixedAllocation),
      grossProfit,
      grossMargin: percent(grossProfit, revenue),
      netProfitBeforeFixed,
      directMargin: percent(netProfitBeforeFixed, revenue),
      netProfit,
      margin: percent(netProfit, revenue),
      fixedCostShare: percent(fixedCostTotal, revenue),
    };
  }

  function getCashFlow(period = {}) {
    const rows = getPaymentRows(period);
    const inflow = sum(rows.filter((row) => row.direction === 'inflow'), (row) => row.payment.amount);
    const outflow = sum(rows.filter((row) => row.direction === 'outflow'), (row) => row.payment.amount);
    const customerIncome = sum(rows.filter((row) => row.payment.type === 'customer_income'), (row) => row.payment.amount);
    const contractorPayments = sum(rows.filter((row) => row.payment.type === 'contractor_payment'), (row) => row.payment.amount);
    const objectExpensePayments = sum(rows.filter((row) => row.payment.type === 'object_expense_payment'), (row) => row.payment.amount);
    const fixedCostPayments = sum(rows.filter((row) => row.payment.type === 'fixed_cost_payment'), (row) => row.payment.amount);

    return {
      rows,
      inflow,
      outflow,
      netCashFlow: inflow - outflow,
      customerIncome,
      contractorPayments,
      objectExpensePayments,
      fixedCostPayments,
      otherIncome: sum(rows.filter((row) => row.payment.type === 'other_income'), (row) => row.payment.amount),
      otherOutflow: sum(rows.filter((row) => row.payment.type === 'other_outflow'), (row) => row.payment.amount),
    };
  }

  function getProjectCashRows(period = {}) {
    const mathRows = getProjectRows(period);
    return mathRows.map(({ project, math }) => {
      const rows = getPaymentRows(period, project.id);
      const received = sum(rows.filter((row) => row.payment.type === 'customer_income'), (row) => row.payment.amount);
      const paidContractors = sum(rows.filter((row) => row.payment.type === 'contractor_payment'), (row) => row.payment.amount);
      const paidObjectExpenses = sum(rows.filter((row) => row.payment.type === 'object_expense_payment'), (row) => row.payment.amount);
      const cashOut = paidContractors + paidObjectExpenses;
      return {
        project,
        math,
        received,
        paidContractors,
        paidObjectExpenses,
        cashOut,
        cashBalance: received - cashOut,
        receivable: Math.max(math.revenue - received, 0),
        contractorDebt: Math.max(math.contractorCost - paidContractors, 0),
        objectExpenseDebt: Math.max(math.directExpenses - paidObjectExpenses, 0),
      };
    }).sort((left, right) => right.receivable - left.receivable || left.cashBalance - right.cashBalance);
  }

  function getExpenseBuckets(period = {}) {
    const buckets = new Map();
    const add = (key, payload) => {
      const current = buckets.get(key) || {
        category: key,
        type: payload.type,
        amount: 0,
        count: 0,
      };
      current.amount += toNumber(payload.amount);
      current.count += payload.count || 1;
      buckets.set(key, current);
    };

    getExpenseRows(period).forEach(({ expense }) => {
      add(`Объектные: ${expense.category || 'Без категории'}`, {
        type: 'object',
        amount: expense.amount,
        count: 1,
      });
    });

    getFixedCosts(period).forEach((row) => {
      add(`Постоянные: ${row.category || 'Без категории'}`, {
        type: 'fixed',
        amount: row.amount,
        count: fixedCostItemsCount(row),
      });
    });

    const rows = [...buckets.values()].sort((left, right) => right.amount - left.amount);
    const total = sum(rows, (row) => row.amount);
    return rows.map((row) => ({ ...row, share: percent(row.amount, total) }));
  }

  function getWorkCategoryRows(period = {}) {
    const buckets = new Map();
    getWorkRows(period).forEach((row) => {
      const key = row.math.price?.category || 'Без категории';
      const current = buckets.get(key) || {
        category: key,
        revenue: 0,
        contractorCost: 0,
        grossProfit: 0,
        plannedQty: 0,
        actualQty: 0,
        count: 0,
      };
      current.revenue += row.math.clientRevenue;
      current.contractorCost += row.math.contractorCost;
      current.grossProfit += row.math.grossProfit;
      current.plannedQty += row.math.plannedQty;
      current.actualQty += row.math.actualQty;
      current.count += 1;
      buckets.set(key, current);
    });

    return [...buckets.values()]
      .map((row) => ({
        ...row,
        grossMargin: percent(row.grossProfit, row.revenue),
        planDeltaPercent: row.plannedQty ? percent(row.actualQty - row.plannedQty, row.plannedQty) : 0,
      }))
      .sort((left, right) => right.grossProfit - left.grossProfit);
  }

  function getContractorRows(period = {}) {
    const buckets = new Map();
    getWorkRows(period).forEach((row) => {
      const key = row.work.contractor || 'Исполнитель не указан';
      const current = buckets.get(key) || {
        contractor: key,
        revenue: 0,
        contractorCost: 0,
        grossProfit: 0,
        plannedQty: 0,
        actualQty: 0,
        planRevenueDelta: 0,
        workCount: 0,
        projectIds: new Set(),
        lowMarginCount: 0,
        overrunCount: 0,
      };
      current.revenue += row.math.clientRevenue;
      current.contractorCost += row.math.contractorCost;
      current.grossProfit += row.math.grossProfit;
      current.plannedQty += row.math.plannedQty;
      current.actualQty += row.math.actualQty;
      current.planRevenueDelta += row.math.planRevenueDelta;
      current.workCount += 1;
      if (row.project?.id) current.projectIds.add(row.project.id);
      if (row.math.clientRevenue > 0 && row.math.grossMargin < settings.workGrossMargin) current.lowMarginCount += 1;
      if (row.math.planDeltaPercent > settings.overrunPercent) current.overrunCount += 1;
      buckets.set(key, current);
    });

    return [...buckets.values()]
      .map((row) => ({
        ...row,
        projectCount: row.projectIds.size,
        projectIds: undefined,
        grossMargin: percent(row.grossProfit, row.revenue),
        planDeltaPercent: row.plannedQty ? percent(row.actualQty - row.plannedQty, row.plannedQty) : 0,
      }))
      .sort((left, right) => right.grossProfit - left.grossProfit);
  }

  function getManagerRows(period = {}) {
    const buckets = new Map();
    getProjectRows(period).forEach(({ project, math }) => {
      const key = project.manager || 'Руководитель не указан';
      const current = buckets.get(key) || {
        manager: key,
        revenue: 0,
        directProfit: 0,
        fixedAllocation: 0,
        netProfitAfterFixed: 0,
        projectCount: 0,
        activeCount: 0,
        riskCount: 0,
      };
      current.revenue += math.revenue;
      current.directProfit += math.netProfit;
      current.fixedAllocation += math.fixedAllocation;
      current.netProfitAfterFixed += math.netProfitAfterFixed;
      current.projectCount += 1;
      if (project.status === 'active') current.activeCount += 1;
      if (project.status === 'risk' || math.marginAfterFixed < settings.projectMargin || math.netProfitAfterFixed < 0) {
        current.riskCount += 1;
      }
      buckets.set(key, current);
    });

    return [...buckets.values()]
      .map((row) => ({ ...row, marginAfterFixed: percent(row.netProfitAfterFixed, row.revenue) }))
      .sort((left, right) => right.netProfitAfterFixed - left.netProfitAfterFixed);
  }

  function getPriceRows(period = {}) {
    const usage = new Map();
    getWorkRows(period).forEach((row) => {
      const key = row.work.priceItemId;
      const current = usage.get(key) || {
        revenue: 0,
        contractorCost: 0,
        grossProfit: 0,
        actualQty: 0,
        plannedQty: 0,
        workCount: 0,
      };
      current.revenue += row.math.clientRevenue;
      current.contractorCost += row.math.contractorCost;
      current.grossProfit += row.math.grossProfit;
      current.actualQty += row.math.actualQty;
      current.plannedQty += row.math.plannedQty;
      current.workCount += 1;
      usage.set(key, current);
    });

    return priceItems
      .map((price) => {
        const clientPrice = toNumber(price.clientPrice);
        const contractorPrice = toNumber(price.contractorPrice);
        const row = usage.get(price.id) || {};
        const unitProfit = clientPrice - contractorPrice;
        return {
          price,
          clientPrice,
          contractorPrice,
          unitProfit,
          unitMargin: percent(unitProfit, clientPrice),
          revenue: toNumber(row.revenue),
          contractorCost: toNumber(row.contractorCost),
          grossProfit: toNumber(row.grossProfit),
          actualQty: toNumber(row.actualQty),
          plannedQty: toNumber(row.plannedQty),
          workCount: toNumber(row.workCount),
          grossMargin: percent(toNumber(row.grossProfit), toNumber(row.revenue)),
        };
      })
      .sort((left, right) => right.grossProfit - left.grossProfit || left.unitMargin - right.unitMargin);
  }

  function getTimelineRows(period = {}) {
    const today = new Date();
    return getProjectRows(period)
      .map(({ project, math }) => {
        const start = parseDate(project.startDate);
        const due = parseDate(project.dueDate);
        const durationDays = start && due ? Math.max(Math.ceil((due - start) / 86400000), 0) : null;
        const daysLeft = due ? Math.ceil((due - today) / 86400000) : null;
        const overdue = Boolean(due && daysLeft < 0 && project.status !== 'closed');
        const dueSoon = Boolean(due && daysLeft >= 0 && daysLeft <= settings.dueSoonDays && project.status !== 'closed');
        return {
          project,
          math,
          durationDays,
          daysLeft,
          overdue,
          dueSoon,
          status: overdue ? 'Просрочен' : dueSoon ? 'Скоро сдача' : project.status === 'closed' ? 'Закрыт' : 'В графике',
        };
      })
      .sort((left, right) => {
        if (left.overdue !== right.overdue) return left.overdue ? -1 : 1;
        return (left.daysLeft ?? 9999) - (right.daysLeft ?? 9999);
      });
  }

  function getFixedCostItemRows(period = {}) {
    const buckets = new Map();
    getFixedCosts(period).forEach((cost) => {
      const rows = Array.isArray(cost.items) && cost.items.length
        ? cost.items
        : [{ name: cost.category || 'Статья расхода', role: 'Без расшифровки', amount: cost.amount }];
      rows.forEach((item) => {
        const key = `${item.name || 'Без названия'}:${item.role || cost.category || 'Без роли'}`;
        const current = buckets.get(key) || {
          name: item.name || 'Без названия',
          role: item.role || cost.category || 'Без роли',
          amount: 0,
          count: 0,
          categories: new Set(),
        };
        current.amount += toNumber(item.amount);
        current.count += 1;
        current.categories.add(cost.category || 'Без категории');
        buckets.set(key, current);
      });
    });

    return [...buckets.values()]
      .map((row) => ({ ...row, categories: [...row.categories].join(', ') }))
      .sort((left, right) => right.amount - left.amount);
  }

  function getDataQualityIssues(period = {}) {
    const issues = [];
    const add = (level, entity, target, reason, action) => {
      issues.push({ level, entity, target, reason, action });
    };

    projects.forEach((project) => {
      if (!project.dueDate) add('Средний', 'Объект', project.name, 'Не указана плановая дата сдачи', 'Заполнить dueDate для анализа сроков.');
      if (!project.startDate) add('Высокий', 'Объект', project.name, 'Не указана дата старта', 'Заполнить startDate для периодной аналитики.');
      if (!project.manager) add('Средний', 'Объект', project.name, 'Не указан руководитель объекта', 'Назначить ответственного.');
    });

    workItems.forEach((work) => {
      const project = byId(projects, work.projectId);
      const price = byId(priceItems, work.priceItemId);
      const target = price?.name || work.id || 'Работа';
      if (!work.date) add('Средний', 'Работа', target, 'Нет даты учета работы', 'Указать дату, иначе периодная аналитика использует дату старта объекта.');
      if (!price) add('Высокий', 'Работа', target, 'Услуга из прайса не найдена', 'Выбрать существующую услугу или восстановить прайс.');
      if (price && toNumber(price.clientPrice) <= 0) add('Высокий', 'Прайс', price.name, 'Цена заказчика равна нулю', 'Заполнить цену заказчика.');
      if (price && toNumber(price.contractorPrice) > toNumber(price.clientPrice)) add('Высокий', 'Прайс', price.name, 'Цена исполнителя выше цены заказчика', 'Проверить прайс и договоренности.');
      if (!work.contractor) add('Средний', 'Работа', `${project?.name || 'Объект'} / ${target}`, 'Не указан исполнитель', 'Заполнить исполнителя для аналитики подрядчиков.');
    });

    priceItems.forEach((price) => {
      if (toNumber(price.clientPrice) <= 0) add('Высокий', 'Прайс', price.name, 'Нулевая цена заказчика', 'Заполнить цену заказчика.');
      if (toNumber(price.clientPrice) > 0 && percent(toNumber(price.clientPrice) - toNumber(price.contractorPrice), toNumber(price.clientPrice)) < settings.workGrossMargin) {
        add('Средний', 'Прайс', price.name, `Маржа услуги ниже ${settings.workGrossMargin}%`, 'Пересмотреть цену заказчика или ставку исполнителя.');
      }
    });

    getFixedCosts(period).forEach((cost) => {
      const diff = Math.abs(toNumber(cost.amount) - fixedCostItemsTotal(cost));
      if (diff > 1) {
        add('Средний', 'Постоянный платеж', `${cost.month} / ${cost.category}`, 'Сумма не совпадает с расшифровкой', 'Сверить строки расшифровки с итогом.');
      }
      if (!Array.isArray(cost.items) || !cost.items.length) {
        add('Низкий', 'Постоянный платеж', `${cost.month} / ${cost.category}`, 'Нет расшифровки платежа', 'Добавить строки, чтобы понимать состав расхода.');
      }
    });

    payments.forEach((payment) => {
      const requiresProject = ['customer_income', 'contractor_payment', 'object_expense_payment'].includes(payment.type);
      if (!payment.date) add('Высокий', 'Платеж', payment.description || payment.counterparty || 'Платеж', 'Не указана дата платежа', 'Заполнить дату, иначе cash-flow по периодам будет неверным.');
      if (toNumber(payment.amount) <= 0) add('Высокий', 'Платеж', payment.description || payment.counterparty || 'Платеж', 'Сумма платежа равна нулю', 'Заполнить фактическую сумму.');
      if (requiresProject && !byId(projects, payment.projectId)) add('Средний', 'Платеж', payment.description || payment.counterparty || 'Платеж', 'Платеж не привязан к объекту', 'Выбрать объект, чтобы видеть дебиторку и долги.');
    });

    return issues;
  }

  function getRisks(period = {}) {
    const company = getCompanyMath(period);
    const risks = [];

    if (company.revenue > 0 && company.fixedCostShare > settings.fixedCostShare) {
      risks.push({
        level: 'Высокий',
        score: 95,
        type: 'Постоянные расходы',
        target: 'Компания',
        reason: `Постоянные платежи выше ${settings.fixedCostShare}% выручки`,
        value: company.fixedCostShare,
        format: 'percent',
        action: 'Проверить зарплаты, рекламу и офисные расходы за период.',
      });
    }

    company.projects.forEach(({ project, math }) => {
      if (math.netProfitAfterFixed < 0) {
        risks.push({
          level: 'Высокий',
          score: 90,
          type: 'Убыток объекта',
          target: project.name,
          reason: 'После доли постоянных расходов объект убыточен',
          value: math.netProfitAfterFixed,
          format: 'money',
          action: 'Проверить смету, допработы, выплаты исполнителям и объектные расходы.',
        });
      } else if (math.revenue > 0 && math.marginAfterFixed < settings.projectMargin) {
        risks.push({
          level: 'Средний',
          score: 70,
          type: 'Низкая маржа объекта',
          target: project.name,
          reason: `Маржа после постоянных ниже ${settings.projectMargin}%`,
          value: math.marginAfterFixed,
          format: 'percent',
          action: 'Сравнить цены заказчика и исполнителей, добрать оплачиваемые допработы.',
        });
      }
    });

    getTimelineRows(period).forEach(({ project, overdue, dueSoon, daysLeft }) => {
      if (overdue) {
        risks.push({
          level: 'Высокий',
          score: 85,
          type: 'Просрочка объекта',
          target: project.name,
          reason: `Срок сдачи просрочен на ${Math.abs(daysLeft)} дн.`,
          value: Math.abs(daysLeft),
          format: 'number',
          action: 'Проверить график работ, причины задержки и коммуникацию с заказчиком.',
        });
      } else if (dueSoon) {
        risks.push({
          level: 'Средний',
          score: 50,
          type: 'Скоро сдача',
          target: project.name,
          reason: `До плановой сдачи ${daysLeft} дн.`,
          value: daysLeft,
          format: 'number',
          action: 'Сверить готовность работ и закрывающие расходы.',
        });
      }
    });

    getWorkRows(period).forEach(({ work, project, math }) => {
      if (math.plannedQty > 0 && math.planDeltaPercent > settings.overrunPercent) {
        risks.push({
          level: 'Средний',
          score: 60,
          type: 'Перерасход объёма',
          target: project?.name || 'Объект удалён',
          reason: math.price?.name || 'Работа',
          value: math.planDeltaPercent,
          format: 'percent',
          action: 'Зафиксировать причину отклонения и выставить допработы заказчику.',
        });
      }

      if (math.clientRevenue > 0 && math.grossMargin < settings.workGrossMargin) {
        risks.push({
          level: 'Средний',
          score: 55,
          type: 'Низкая маржа работы',
          target: project?.name || 'Объект удалён',
          reason: math.price?.name || 'Работа',
          value: math.grossMargin,
          format: 'percent',
          action: 'Проверить ставку исполнителя и цену в прайсе.',
        });
      }
    });

    getDataQualityIssues(period)
      .filter((issue) => issue.level === 'Высокий')
      .forEach((issue) => {
        risks.push({
          level: 'Высокий',
          score: 80,
          type: 'Качество данных',
          target: issue.target,
          reason: issue.reason,
          value: 1,
          format: 'number',
          action: issue.action,
        });
      });

    getProjectCashRows(period).forEach((row) => {
      if (row.receivable > 0 && row.math.revenue > 0) {
        risks.push({
          level: row.receivable > row.math.revenue * 0.5 ? 'Высокий' : 'Средний',
          score: row.receivable > row.math.revenue * 0.5 ? 82 : 58,
          type: 'Дебиторка',
          target: row.project.name,
          reason: 'Начисленная выручка выше фактических поступлений',
          value: row.receivable,
          format: 'money',
          action: 'Проверить акт, счет и дату оплаты от заказчика.',
        });
      }
    });

    return risks.sort((left, right) => right.score - left.score);
  }

  function getYears() {
    const dates = [
      ...projects.flatMap((project) => [project.startDate, project.dueDate]),
      ...workItems.map((work) => getWorkDate(work, byId(projects, work.projectId))),
      ...expenses.map((expense) => getExpenseDate(expense, byId(projects, expense.projectId))),
      ...fixedCosts.map((row) => fixedCostDate(row)),
      ...payments.map((payment) => getPaymentDate(payment)),
    ];

    const years = [...new Set(dates.map(parseDate).filter(Boolean).map((date) => String(date.getFullYear())))]
      .sort((left, right) => Number(right) - Number(left));
    return years.length ? years : [String(new Date().getFullYear())];
  }

  function getPeriodComparison(period = {}) {
    const normalized = normalizePeriod(period);
    const previous = previousPeriod(normalized);
    if (!previous) return null;

    const currentMath = getCompanyMath(normalized);
    const previousMath = getCompanyMath(previous);
    return {
      current: currentMath,
      previous: previousMath,
      previousPeriod: previous,
      deltas: {
        revenue: delta(currentMath.revenue, previousMath.revenue),
        contractorCost: delta(currentMath.contractorCost, previousMath.contractorCost),
        directExpenses: delta(currentMath.directExpenses, previousMath.directExpenses),
        directCosts: delta(currentMath.directCosts, previousMath.directCosts),
        fixedCosts: delta(currentMath.fixedCosts, previousMath.fixedCosts),
        netProfitBeforeFixed: delta(currentMath.netProfitBeforeFixed, previousMath.netProfitBeforeFixed),
        netProfit: delta(currentMath.netProfit, previousMath.netProfit),
        margin: { value: currentMath.margin - previousMath.margin, percent: null },
      },
    };
  }

  return {
    getYears,
    getWorkMath,
    getWorkRows,
    getExpenseRows,
    getFixedCosts,
    getPaymentRows,
    getProjectRows,
    getCompanyMath,
    getCashFlow,
    getProjectCashRows,
    getExpenseBuckets,
    getWorkCategoryRows,
    getContractorRows,
    getManagerRows,
    getPriceRows,
    getTimelineRows,
    getFixedCostItemRows,
    getDataQualityIssues,
    getRisks,
    getPeriodComparison,
    getSettings: () => ({ ...settings }),
  };
}

