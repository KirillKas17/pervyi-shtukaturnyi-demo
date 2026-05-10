import { ANALYTICS_MONTHS, createAnalyticsEngine } from './analyticsEngine.js';

const STORAGE_KEY = 'repairops-v1-state';

const initialState = {
  activePage: 'objects',
  projectReturnPage: 'objects',
  selectedProjectId: 'p-1',
  activeDetailTab: 'overview',
  paymentsView: 'ledger',
  projectPeriodType: 'all',
  projectPeriodYear: '2026',
  projectPeriodQuarter: '1',
  projectPeriodMonth: 'Май',
  analyticsPeriodType: 'all',
  analyticsPeriodYear: '2026',
  analyticsPeriodQuarter: '1',
  analyticsPeriodMonth: 'Май',
  selectedFixedCostMonth: 'Май 2026',
  selectedFixedCostId: 'f-1',
  fixedCostPeriodType: 'month',
  fixedCostPeriodValue: 'Май 2026',
  fixedCostYear: '2026',
  fixedCostMonth: 'Май',
  analyticsSettings: {
    projectMargin: 15,
    workGrossMargin: 20,
    fixedCostShare: 30,
    overrunPercent: 5,
    dueSoonDays: 7,
  },
  objectFilters: {
    search: '',
    sortBy: 'revenue',
    sortDir: 'desc',
  },
  tableSearches: {},
  projects: [
    {
      id: 'p-1',
      name: 'Капитальный ремонт квартиры на Державина',
      client: 'ИП Смирнов',
      address: 'Новосибирск, ул. Державина, 92',
      manager: 'Марков Е.М.',
      startDate: '2026-05-01',
      dueDate: '2026-06-18',
      status: 'active',
      note: 'План-факт ведется по штукатурке, стяжке и расходам на проживание.',
    },
    {
      id: 'p-2',
      name: 'Коммерческое помещение на Красном проспекте',
      client: 'ООО Альфа-Ритейл',
      address: 'Красный проспект, 44',
      manager: 'Топор А.А.',
      startDate: '2026-04-12',
      dueDate: '2026-05-28',
      status: 'risk',
      note: 'Слабая маржа из-за внеплановой доставки и перерасхода материалов.',
    },
    {
      id: 'p-3',
      name: 'Дом под чистовую отделку',
      client: 'Курочкин В.В.',
      address: 'Бердск, коттеджный поселок Северный',
      manager: 'Марков Е.М.',
      startDate: '2026-03-16',
      dueDate: '2026-05-05',
      status: 'closed',
      note: 'Закрыт, финальный расчет принят.',
    },
  ],
  priceItems: [
    {
      id: 'i-1',
      name: 'Комплекс штукатурных работ до 3 м, слой до 20 мм',
      unit: 'м2',
      clientPrice: 400,
      contractorPrice: 280,
      category: 'Штукатурка',
    },
    {
      id: 'i-2',
      name: 'Устройство полусухой стяжки пола до 80 мм',
      unit: 'м2',
      clientPrice: 500,
      contractorPrice: 270,
      category: 'Стяжка',
    },
    {
      id: 'i-3',
      name: 'Монтаж перегородок из ГКЛ',
      unit: 'м2',
      clientPrice: 760,
      contractorPrice: 510,
      category: 'ГКЛ',
    },
    {
      id: 'i-4',
      name: 'Шпатлевка стен под окраску',
      unit: 'м2',
      clientPrice: 310,
      contractorPrice: 210,
      category: 'Малярные работы',
    },
  ],
  workItems: [
    { id: 'w-1', projectId: 'p-1', priceItemId: 'i-1', contractor: 'Штукатуры - Федя', plannedQty: 620, actualQty: 570, status: 'В работе' },
    { id: 'w-2', projectId: 'p-1', priceItemId: 'i-2', contractor: 'Бригада РОР', plannedQty: 210, actualQty: 210, status: 'Готово' },
    { id: 'w-3', projectId: 'p-1', priceItemId: 'i-4', contractor: 'Малярная бригада', plannedQty: 430, actualQty: 120, status: 'В работе' },
    { id: 'w-4', projectId: 'p-2', priceItemId: 'i-1', contractor: 'Штукатуры - Федя', plannedQty: 880, actualQty: 920, status: 'Риск' },
    { id: 'w-5', projectId: 'p-2', priceItemId: 'i-3', contractor: 'ГКЛ-Сервис', plannedQty: 140, actualQty: 155, status: 'Готово' },
    { id: 'w-6', projectId: 'p-3', priceItemId: 'i-2', contractor: 'Бригада РОР', plannedQty: 360, actualQty: 360, status: 'Готово' },
    { id: 'w-7', projectId: 'p-3', priceItemId: 'i-4', contractor: 'Малярная бригада', plannedQty: 520, actualQty: 520, status: 'Готово' },
  ],
  expenses: [
    { id: 'e-1', projectId: 'p-1', date: '2026-05-03', category: 'Расходники инструмент', description: 'Маяки, пленка, расходка', amount: 31500 },
    { id: 'e-2', projectId: 'p-1', date: '2026-05-06', category: 'Проживание', description: 'Проживание бригады', amount: 42000 },
    { id: 'e-3', projectId: 'p-2', date: '2026-04-22', category: 'Внеплановые расходы', description: 'Доставка и аренда оборудования', amount: 76000 },
    { id: 'e-4', projectId: 'p-2', date: '2026-04-24', category: 'Разнорабочие', description: 'Разгрузка и уборка', amount: 38000 },
    { id: 'e-5', projectId: 'p-3', date: '2026-04-01', category: 'Налоги', description: '11% по объекту', amount: 65000 },
  ],
  payments: [
    { id: 'pay-1', date: '2026-05-07', type: 'customer_income', projectId: 'p-1', counterparty: 'ИП Смирнов', category: 'Оплата заказчика', amount: 260000, description: 'Аванс по объекту' },
    { id: 'pay-2', date: '2026-05-10', type: 'contractor_payment', projectId: 'p-1', counterparty: 'Бригада РОР', category: 'Выплата исполнителю', amount: 56000, description: 'Стяжка, промежуточный расчет' },
    { id: 'pay-3', date: '2026-05-06', type: 'object_expense_payment', projectId: 'p-1', counterparty: 'Арендодатель жилья', category: 'Проживание', amount: 42000, description: 'Проживание бригады' },
    { id: 'pay-4', date: '2026-04-25', type: 'customer_income', projectId: 'p-2', counterparty: 'ООО Альфа-Ритейл', category: 'Оплата заказчика', amount: 420000, description: 'Оплата этапа' },
    { id: 'pay-5', date: '2026-04-26', type: 'contractor_payment', projectId: 'p-2', counterparty: 'Штукатуры - Федя', category: 'Выплата исполнителю', amount: 180000, description: 'Промежуточная выплата' },
    { id: 'pay-6', date: '2026-05-05', type: 'fixed_cost_payment', projectId: '', counterparty: 'Сотрудники', category: 'Заработная плата', amount: 430000, description: 'Постоянные выплаты за май' },
    { id: 'pay-7', date: '2026-04-08', type: 'customer_income', projectId: 'p-3', counterparty: 'Курочкин В.В.', category: 'Финальный расчет', amount: 520000, description: 'Закрытие объекта' },
    { id: 'pay-8', date: '2026-04-09', type: 'contractor_payment', projectId: 'p-3', counterparty: 'Бригада РОР', category: 'Выплата исполнителю', amount: 97000, description: 'Финальная выплата' },
  ],
  fixedCosts: [
    {
      id: 'f-1',
      month: 'Май 2026',
      category: 'Заработная плата',
      amount: 430000,
      items: [
        { name: 'Курочкин В.В.', role: 'Руководитель', amount: 150000 },
        { name: 'Лукина Н.', role: 'Помощник руководителя', amount: 85000 },
        { name: 'Марков Е.М.', role: 'Руководитель объектов', amount: 105000 },
        { name: 'Топор А.А.', role: 'Мастер РОР', amount: 90000 },
      ],
    },
    {
      id: 'f-2',
      month: 'Май 2026',
      category: 'Аренда офиса',
      amount: 65000,
      items: [
        { name: 'Офис', role: 'Аренда помещения', amount: 52000 },
        { name: 'Интернет', role: 'Связь', amount: 5000 },
        { name: 'Офисные затраты', role: 'Расходные материалы', amount: 8000 },
      ],
    },
    {
      id: 'f-3',
      month: 'Май 2026',
      category: 'Рекламные площадки',
      amount: 47000,
      items: [
        { name: 'Авито', role: 'Лиды по ремонтам', amount: 30000 },
        { name: 'Яндекс Бизнес', role: 'Карточка и продвижение', amount: 17000 },
      ],
    },
    {
      id: 'f-4',
      month: 'Май 2026',
      category: 'Топливные карты',
      amount: 36000,
      items: [
        { name: 'Марков Е.М.', role: 'Объекты', amount: 21000 },
        { name: 'Топор А.А.', role: 'Мастер РОР', amount: 15000 },
      ],
    },
    {
      id: 'f-5',
      month: 'Апрель 2026',
      category: 'Заработная плата',
      amount: 405000,
      items: [
        { name: 'Курочкин В.В.', role: 'Руководитель', amount: 150000 },
        { name: 'Лукина Н.', role: 'Помощник руководителя', amount: 80000 },
        { name: 'Марков Е.М.', role: 'Руководитель объектов', amount: 95000 },
        { name: 'Топор А.А.', role: 'Мастер РОР', amount: 80000 },
      ],
    },
    {
      id: 'f-6',
      month: 'Апрель 2026',
      category: 'Аренда офиса',
      amount: 63000,
      items: [
        { name: 'Офис', role: 'Аренда помещения', amount: 52000 },
        { name: 'Интернет', role: 'Связь', amount: 5000 },
        { name: 'Офисные затраты', role: 'Расходные материалы', amount: 6000 },
      ],
    },
    {
      id: 'f-7',
      month: 'Апрель 2026',
      category: 'Рекламные площадки',
      amount: 39000,
      items: [
        { name: 'Авито', role: 'Лиды по ремонтам', amount: 25000 },
        { name: 'Яндекс Бизнес', role: 'Карточка и продвижение', amount: 14000 },
      ],
    },
    {
      id: 'f-8',
      month: 'Март 2026',
      category: 'Заработная плата',
      amount: 382000,
      items: [
        { name: 'Курочкин В.В.', role: 'Руководитель', amount: 145000 },
        { name: 'Лукина Н.', role: 'Помощник руководителя', amount: 77000 },
        { name: 'Марков Е.М.', role: 'Руководитель объектов', amount: 90000 },
        { name: 'Топор А.А.', role: 'Мастер РОР', amount: 70000 },
      ],
    },
    {
      id: 'f-9',
      month: 'Март 2026',
      category: 'Топливные карты',
      amount: 31000,
      items: [
        { name: 'Марков Е.М.', role: 'Объекты', amount: 18000 },
        { name: 'Топор А.А.', role: 'Мастер РОР', amount: 13000 },
      ],
    },
  ],
};

const DEMO_DATA_VERSION = 'presentation-2026-05-10';

function mergeById(collection, rows) {
  const existing = new Set(collection.map((item) => item.id));
  rows.forEach((row) => {
    if (!existing.has(row.id)) collection.push(row);
  });
}

function applyPresentationDemoData(target) {
  mergeById(target.projects, [
    {
      id: 'p-4',
      name: 'Фасад и МОП ЖК Северный квартал',
      client: 'ООО СЗ СеверСтрой',
      address: 'Новосибирск, ул. Ипподромская, 21',
      manager: 'Марков Е.М.',
      startDate: '2026-02-10',
      dueDate: '2026-04-20',
      status: 'closed',
      note: 'Крупный объект с хорошей маржей: штукатурка МОП, шпаклевка и частичная окраска.',
    },
    {
      id: 'p-5',
      name: 'Капремонт школы N 18',
      client: 'МКУ Управление капитального строительства',
      address: 'Новосибирск, ул. Учительская, 7',
      manager: 'Топор А.А.',
      startDate: '2026-05-12',
      dueDate: '2026-08-25',
      status: 'active',
      note: 'Длинный объект с этапными оплатами. Важно контролировать кассовый разрыв и авансы исполнителям.',
    },
    {
      id: 'p-6',
      name: 'Офисный центр на Фрунзе',
      client: 'ООО Бизнес Парк',
      address: 'Новосибирск, ул. Фрунзе, 88',
      manager: 'Лукина Н.',
      startDate: '2026-04-01',
      dueDate: '2026-05-20',
      status: 'risk',
      note: 'Есть перерасход по ГКЛ и допрасходы на доставку. Нужна проверка сметы и актов.',
    },
    {
      id: 'p-7',
      name: 'Подъезды дома на Немировича-Данченко',
      client: 'ТСЖ Немировича 144',
      address: 'Новосибирск, ул. Немировича-Данченко, 144',
      manager: 'Марков Е.М.',
      startDate: '2026-03-05',
      dueDate: '2026-04-30',
      status: 'closed',
      note: 'Средний объект, закрыт с умеренной маржей. Хорош для сравнения с типовыми ремонтами.',
    },
    {
      id: 'p-8',
      name: 'Складской блок на Толмачевском шоссе',
      client: 'ООО Логистик Сибирь',
      address: 'Толмачевское шоссе, 18',
      manager: 'Топор А.А.',
      startDate: '2026-06-01',
      dueDate: '2026-07-15',
      status: 'active',
      note: 'Новый объект: пока мало оплат, но уже видны плановые объемы и будущая маржинальность.',
    },
  ]);

  mergeById(target.priceItems, [
    { id: 'i-5', name: 'Грунтование стен и потолков', unit: 'м2', clientPrice: 85, contractorPrice: 45, category: 'Подготовка' },
    { id: 'i-6', name: 'Окраска стен в два слоя', unit: 'м2', clientPrice: 260, contractorPrice: 155, category: 'Малярные работы' },
    { id: 'i-7', name: 'Демонтаж старой отделки', unit: 'м2', clientPrice: 180, contractorPrice: 115, category: 'Демонтаж' },
    { id: 'i-8', name: 'Устройство наливного пола', unit: 'м2', clientPrice: 620, contractorPrice: 390, category: 'Полы' },
    { id: 'i-9', name: 'Монтаж армирующей сетки', unit: 'м2', clientPrice: 150, contractorPrice: 95, category: 'Штукатурка' },
    { id: 'i-10', name: 'Вывоз строительного мусора', unit: 'рейс', clientPrice: 8200, contractorPrice: 6100, category: 'Логистика' },
  ]);

  mergeById(target.workItems, [
    { id: 'w-8', projectId: 'p-4', priceItemId: 'i-1', contractor: 'Штукатуры - Федя', plannedQty: 1480, actualQty: 1495, status: 'Готово', date: '2026-02-18' },
    { id: 'w-9', projectId: 'p-4', priceItemId: 'i-4', contractor: 'Малярная бригада', plannedQty: 1220, actualQty: 1210, status: 'Готово', date: '2026-03-05' },
    { id: 'w-10', projectId: 'p-4', priceItemId: 'i-6', contractor: 'Малярная бригада', plannedQty: 960, actualQty: 950, status: 'Готово', date: '2026-04-02' },
    { id: 'w-11', projectId: 'p-5', priceItemId: 'i-7', contractor: 'Демонтаж-Сервис', plannedQty: 1800, actualQty: 740, status: 'В работе', date: '2026-05-18' },
    { id: 'w-12', projectId: 'p-5', priceItemId: 'i-1', contractor: 'Штукатуры - Федя', plannedQty: 2400, actualQty: 520, status: 'В работе', date: '2026-05-25' },
    { id: 'w-13', projectId: 'p-5', priceItemId: 'i-2', contractor: 'Бригада РОР', plannedQty: 1180, actualQty: 0, status: 'План', date: '2026-06-03' },
    { id: 'w-14', projectId: 'p-6', priceItemId: 'i-3', contractor: 'ГКЛ-Сервис', plannedQty: 520, actualQty: 690, status: 'Риск', date: '2026-04-15' },
    { id: 'w-15', projectId: 'p-6', priceItemId: 'i-5', contractor: 'Малярная бригада', plannedQty: 1550, actualQty: 1520, status: 'Готово', date: '2026-04-26' },
    { id: 'w-16', projectId: 'p-6', priceItemId: 'i-6', contractor: 'Малярная бригада', plannedQty: 1550, actualQty: 1110, status: 'В работе', date: '2026-05-08' },
    { id: 'w-17', projectId: 'p-7', priceItemId: 'i-7', contractor: 'Демонтаж-Сервис', plannedQty: 680, actualQty: 690, status: 'Готово', date: '2026-03-09' },
    { id: 'w-18', projectId: 'p-7', priceItemId: 'i-1', contractor: 'Штукатуры - Федя', plannedQty: 920, actualQty: 890, status: 'Готово', date: '2026-03-22' },
    { id: 'w-19', projectId: 'p-7', priceItemId: 'i-6', contractor: 'Малярная бригада', plannedQty: 880, actualQty: 860, status: 'Готово', date: '2026-04-12' },
    { id: 'w-20', projectId: 'p-8', priceItemId: 'i-8', contractor: 'Бригада РОР', plannedQty: 1320, actualQty: 220, status: 'В работе', date: '2026-06-05' },
    { id: 'w-21', projectId: 'p-8', priceItemId: 'i-9', contractor: 'Штукатуры - Федя', plannedQty: 2100, actualQty: 360, status: 'В работе', date: '2026-06-07' },
    { id: 'w-22', projectId: 'p-1', priceItemId: 'i-5', contractor: 'Малярная бригада', plannedQty: 430, actualQty: 180, status: 'В работе', date: '2026-05-12' },
    { id: 'w-23', projectId: 'p-2', priceItemId: 'i-10', contractor: 'Логистика 54', plannedQty: 6, actualQty: 9, status: 'Риск', date: '2026-04-23' },
  ]);

  mergeById(target.expenses, [
    { id: 'e-6', projectId: 'p-4', date: '2026-02-20', category: 'Расходники инструмент', description: 'Профили, маяки, пленка, миксеры', amount: 86500 },
    { id: 'e-7', projectId: 'p-4', date: '2026-03-18', category: 'Проживание', description: 'Проживание бригады на 21 день', amount: 73500 },
    { id: 'e-8', projectId: 'p-4', date: '2026-04-05', category: 'Налоги', description: 'Налоговая нагрузка по закрытию объекта', amount: 118000 },
    { id: 'e-9', projectId: 'p-5', date: '2026-05-15', category: 'Расходники инструмент', description: 'Защитная пленка, грунт, расходники', amount: 92500 },
    { id: 'e-10', projectId: 'p-5', date: '2026-05-22', category: 'Разнорабочие', description: 'Демонтаж и вынос мусора', amount: 64000 },
    { id: 'e-11', projectId: 'p-5', date: '2026-06-04', category: 'Проживание', description: 'Аванс проживания бригады', amount: 88000 },
    { id: 'e-12', projectId: 'p-6', date: '2026-04-16', category: 'Внеплановые расходы', description: 'Допоставка ГКЛ и подъем материала', amount: 126000 },
    { id: 'e-13', projectId: 'p-6', date: '2026-04-28', category: 'Расходы на заказчика', description: 'Срочная уборка перед промежуточной приемкой', amount: 34000 },
    { id: 'e-14', projectId: 'p-6', date: '2026-05-09', category: 'Разнорабочие', description: 'Ночная смена на подготовке помещений', amount: 57000 },
    { id: 'e-15', projectId: 'p-7', date: '2026-03-12', category: 'Расходники инструмент', description: 'Расходники по подъездам', amount: 46500 },
    { id: 'e-16', projectId: 'p-7', date: '2026-04-18', category: 'Налоги', description: 'Налог по финальному расчету', amount: 52000 },
    { id: 'e-17', projectId: 'p-8', date: '2026-06-03', category: 'Расходники инструмент', description: 'Стартовый закуп по складу', amount: 78000 },
    { id: 'e-18', projectId: 'p-8', date: '2026-06-08', category: 'Внеплановые расходы', description: 'Аренда затирочной машины', amount: 42000 },
  ]);

  mergeById(target.payments, [
    { id: 'pay-9', date: '2026-02-14', type: 'customer_income', projectId: 'p-4', counterparty: 'ООО СЗ СеверСтрой', category: 'Аванс заказчика', amount: 520000, description: 'Стартовый аванс по фасаду и МОП' },
    { id: 'pay-10', date: '2026-03-21', type: 'customer_income', projectId: 'p-4', counterparty: 'ООО СЗ СеверСтрой', category: 'Оплата этапа', amount: 610000, description: 'Акт по штукатурке МОП' },
    { id: 'pay-11', date: '2026-04-22', type: 'customer_income', projectId: 'p-4', counterparty: 'ООО СЗ СеверСтрой', category: 'Финальный расчет', amount: 470000, description: 'Закрытие объекта' },
    { id: 'pay-12', date: '2026-03-02', type: 'contractor_payment', projectId: 'p-4', counterparty: 'Штукатуры - Федя', category: 'Выплата исполнителю', amount: 418000, description: 'Штукатурка МОП' },
    { id: 'pay-13', date: '2026-04-10', type: 'contractor_payment', projectId: 'p-4', counterparty: 'Малярная бригада', category: 'Выплата исполнителю', amount: 365000, description: 'Шпаклевка и окраска' },
    { id: 'pay-14', date: '2026-05-17', type: 'customer_income', projectId: 'p-5', counterparty: 'МКУ Управление капитального строительства', category: 'Аванс заказчика', amount: 750000, description: 'Аванс на демонтаж и подготовку' },
    { id: 'pay-15', date: '2026-05-24', type: 'contractor_payment', projectId: 'p-5', counterparty: 'Демонтаж-Сервис', category: 'Выплата исполнителю', amount: 140000, description: 'Демонтаж, первый этап' },
    { id: 'pay-16', date: '2026-06-05', type: 'contractor_payment', projectId: 'p-5', counterparty: 'Штукатуры - Федя', category: 'Выплата исполнителю', amount: 185000, description: 'Аванс штукатурам' },
    { id: 'pay-17', date: '2026-04-08', type: 'customer_income', projectId: 'p-6', counterparty: 'ООО Бизнес Парк', category: 'Аванс заказчика', amount: 420000, description: 'Аванс по офисному центру' },
    { id: 'pay-18', date: '2026-05-15', type: 'customer_income', projectId: 'p-6', counterparty: 'ООО Бизнес Парк', category: 'Оплата этапа', amount: 260000, description: 'Частичная оплата после замечаний' },
    { id: 'pay-19', date: '2026-04-25', type: 'contractor_payment', projectId: 'p-6', counterparty: 'ГКЛ-Сервис', category: 'Выплата исполнителю', amount: 275000, description: 'ГКЛ, перерасход объема' },
    { id: 'pay-20', date: '2026-05-12', type: 'contractor_payment', projectId: 'p-6', counterparty: 'Малярная бригада', category: 'Выплата исполнителю', amount: 150000, description: 'Окраска, промежуточный расчет' },
    { id: 'pay-21', date: '2026-03-11', type: 'customer_income', projectId: 'p-7', counterparty: 'ТСЖ Немировича 144', category: 'Аванс заказчика', amount: 310000, description: 'Старт работ по подъездам' },
    { id: 'pay-22', date: '2026-04-30', type: 'customer_income', projectId: 'p-7', counterparty: 'ТСЖ Немировича 144', category: 'Финальный расчет', amount: 295000, description: 'Финальный акт' },
    { id: 'pay-23', date: '2026-04-20', type: 'contractor_payment', projectId: 'p-7', counterparty: 'Штукатуры - Федя', category: 'Выплата исполнителю', amount: 250000, description: 'Закрытие работ по подъездам' },
    { id: 'pay-24', date: '2026-06-04', type: 'customer_income', projectId: 'p-8', counterparty: 'ООО Логистик Сибирь', category: 'Аванс заказчика', amount: 390000, description: 'Стартовый аванс по складу' },
    { id: 'pay-25', date: '2026-06-09', type: 'contractor_payment', projectId: 'p-8', counterparty: 'Бригада РОР', category: 'Выплата исполнителю', amount: 98000, description: 'Аванс по наливному полу' },
    { id: 'pay-26', date: '2026-06-05', type: 'fixed_cost_payment', projectId: '', counterparty: 'Сотрудники', category: 'Заработная плата', amount: 455000, description: 'Постоянные выплаты за июнь' },
    { id: 'pay-27', date: '2026-03-05', type: 'fixed_cost_payment', projectId: '', counterparty: 'Авито', category: 'Рекламные площадки', amount: 28000, description: 'Лиды за март' },
  ]);

  mergeById(target.fixedCosts, [
    {
      id: 'f-10',
      month: 'Июнь 2026',
      category: 'Заработная плата',
      amount: 455000,
      items: [
        { name: 'Курочкин В.В.', role: 'Руководитель', amount: 155000 },
        { name: 'Лукина Н.', role: 'Помощник руководителя', amount: 90000 },
        { name: 'Марков Е.М.', role: 'Руководитель объектов', amount: 110000 },
        { name: 'Топор А.А.', role: 'Мастер РОР', amount: 100000 },
      ],
    },
    {
      id: 'f-11',
      month: 'Июнь 2026',
      category: 'Рекламные площадки',
      amount: 56000,
      items: [
        { name: 'Авито', role: 'Лиды по капитальному ремонту', amount: 36000 },
        { name: 'Яндекс Бизнес', role: 'Продвижение карточки', amount: 20000 },
      ],
    },
    {
      id: 'f-12',
      month: 'Июнь 2026',
      category: 'Топливные карты',
      amount: 41000,
      items: [
        { name: 'Марков Е.М.', role: 'Объезды объектов', amount: 23000 },
        { name: 'Топор А.А.', role: 'Снабжение объектов', amount: 18000 },
      ],
    },
    {
      id: 'f-13',
      month: 'Февраль 2026',
      category: 'Заработная плата',
      amount: 360000,
      items: [
        { name: 'Курочкин В.В.', role: 'Руководитель', amount: 140000 },
        { name: 'Лукина Н.', role: 'Помощник руководителя', amount: 70000 },
        { name: 'Марков Е.М.', role: 'Руководитель объектов', amount: 85000 },
        { name: 'Топор А.А.', role: 'Мастер РОР', amount: 65000 },
      ],
    },
    {
      id: 'f-14',
      month: 'Февраль 2026',
      category: 'Аренда офиса',
      amount: 60000,
      items: [
        { name: 'Офис', role: 'Аренда помещения', amount: 52000 },
        { name: 'Интернет', role: 'Связь', amount: 5000 },
        { name: 'Офисные затраты', role: 'Расходные материалы', amount: 3000 },
      ],
    },
    {
      id: 'f-15',
      month: 'Февраль 2026',
      category: 'Рекламные площадки',
      amount: 32000,
      items: [
        { name: 'Авито', role: 'Лиды по ремонтам', amount: 22000 },
        { name: 'Яндекс Бизнес', role: 'Карточка компании', amount: 10000 },
      ],
    },
  ]);

  target.demoDataVersion = DEMO_DATA_VERSION;
}

applyPresentationDemoData(initialState);

let state = loadState();
let chartInstances = new Map();

const navGroups = [
  {
    title: 'Операции',
    items: [
      { id: 'objects', label: 'Объекты ремонта', icon: iconBuilding() },
      { id: 'pricebook', label: 'Прайс услуг', icon: iconList() },
      { id: 'expenses', label: 'Расходы', icon: iconReceipt() },
      { id: 'fixedCosts', label: 'Постоянные платежи', icon: iconCalendar() },
      { id: 'payments', label: 'Деньги', icon: iconReceipt() },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      { id: 'analyticsSummary', label: 'Сводка', icon: iconChart() },
      { id: 'analyticsFinance', label: 'Финансы', icon: iconChart() },
      { id: 'analyticsCashflow', label: 'Движение денег', icon: iconReceipt() },
      { id: 'analyticsObjects', label: 'Объекты', icon: iconBuilding() },
      { id: 'analyticsWorks', label: 'Работы', icon: iconTrend() },
      { id: 'analyticsContractors', label: 'Исполнители', icon: iconList() },
      { id: 'analyticsManagers', label: 'Руководители', icon: iconBuilding() },
      { id: 'analyticsPrice', label: 'Прайс', icon: iconReceipt() },
      { id: 'analyticsExpenses', label: 'Расходы', icon: iconReceipt() },
      { id: 'analyticsTimeline', label: 'Сроки', icon: iconCalendar() },
      { id: 'analyticsRisks', label: 'Риски', icon: iconList() },
    ],
  },
];

const pageMeta = {
  objects: ['Операционная ветка', 'Объекты ремонта', 'Новый объект'],
  pricebook: ['Операционная ветка', 'Прайс услуг', 'Новая услуга'],
  expenses: ['Операционная ветка', 'Расходы по объектам', 'Новый расход'],
  fixedCosts: ['Операционная ветка', 'Постоянные платежи', 'Новый платеж'],
  payments: ['Операционная ветка', 'Деньги и оплаты', 'Новый платеж'],
  analyticsSummary: ['Аналитическая ветка', 'Общая аналитика', ''],
  analyticsFinance: ['Аналитическая ветка', 'Финансы', ''],
  analyticsCashflow: ['Аналитическая ветка', 'Движение денег', ''],
  analyticsObjects: ['Аналитическая ветка', 'Объекты', ''],
  analyticsWorks: ['Аналитическая ветка', 'Работы', ''],
  analyticsContractors: ['Аналитическая ветка', 'Исполнители', ''],
  analyticsManagers: ['Аналитическая ветка', 'Руководители', ''],
  analyticsPrice: ['Аналитическая ветка', 'Прайс', ''],
  analyticsExpenses: ['Аналитическая ветка', 'Расходы', ''],
  analyticsTimeline: ['Аналитическая ветка', 'Сроки', ''],
  analyticsRisks: ['Аналитическая ветка', 'Риски', ''],
  projectDetail: ['Операционная ветка', 'Детализация объекта', ''],
  projectCreate: ['Операционная ветка', 'Новый объект', ''],
  fixedCostDetail: ['Операционная ветка', 'Расшифровка платежа', ''],
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return saved && Array.isArray(saved.projects) ? normalizeAppState(saved) : structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}

function normalizeAppState(saved) {
  const next = { ...structuredClone(initialState), ...saved };
  if (next.demoDataVersion !== DEMO_DATA_VERSION) applyPresentationDemoData(next);
  next.objectFilters = { ...initialState.objectFilters, ...(saved.objectFilters || {}) };
  next.tableSearches = { ...initialState.tableSearches, ...(saved.tableSearches || {}) };
  next.analyticsSettings = { ...initialState.analyticsSettings, ...(saved.analyticsSettings || {}) };
  next.fixedCosts = Array.isArray(saved.fixedCosts) ? saved.fixedCosts : structuredClone(initialState.fixedCosts);
  next.payments = Array.isArray(saved.payments) ? saved.payments : structuredClone(initialState.payments);

  const hasDetailedHistory =
    next.fixedCosts.some((item) => Array.isArray(item.items) && item.items.length) &&
    new Set(next.fixedCosts.map((item) => item.month)).size > 1;

  if (!hasDetailedHistory) {
    const existingKeys = new Set(next.fixedCosts.map((item) => `${item.month}:${item.category}`));
    structuredClone(initialState.fixedCosts).forEach((item) => {
      const key = `${item.month}:${item.category}`;
      const existing = next.fixedCosts.find((row) => `${row.month}:${row.category}` === key);
      if (existing && (!Array.isArray(existing.items) || !existing.items.length)) {
        existing.items = item.items;
      } else if (!existingKeys.has(key)) {
        next.fixedCosts.push(item);
      }
    });
  }

  next.selectedFixedCostMonth ||= getFixedCostMonthsFromRows(next.fixedCosts)[0] || '';
  next.selectedFixedCostId ||= next.fixedCosts.find((item) => item.month === next.selectedFixedCostMonth)?.id || null;
  const selectedParts = getMonthParts(next.selectedFixedCostMonth);
  next.fixedCostYear ||= selectedParts.year || getFixedCostMonthsFromRows(next.fixedCosts)[0]?.split(' ')[1] || String(new Date().getFullYear());
  next.fixedCostMonth ||= selectedParts.monthName || getFixedCostMonthsFromRows(next.fixedCosts)[0]?.split(' ')[0] || 'Январь';
  return next;
}

function getFixedCostMonthsFromRows(rows) {
  return [...new Set((rows || []).map((item) => item.month))]
    .filter(Boolean)
    .sort((a, b) => monthSortValue(b) - monthSortValue(a));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  state = structuredClone(initialState);
  saveState();
  render();
}

function money(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function number(value) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(Number(value || 0));
}

function byId(collection, id) {
  return collection.find((item) => item.id === id);
}

function projectWork(projectId) {
  return state.workItems.filter((item) => item.projectId === projectId);
}

function projectExpenses(projectId) {
  return state.expenses.filter((item) => item.projectId === projectId);
}

function projectPayments(projectId) {
  return state.payments.filter((item) => item.projectId === projectId);
}

function analyticsEngine() {
  return createAnalyticsEngine(state);
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRuMonthName(date) {
  return [
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
  ][date.getMonth()];
}

function getQuarter(date) {
  return String(Math.floor(date.getMonth() / 3) + 1);
}

function getMonthIndex(monthName) {
  return {
    Январь: 0,
    Февраль: 1,
    Март: 2,
    Апрель: 3,
    Май: 4,
    Июнь: 5,
    Июль: 6,
    Август: 7,
    Сентябрь: 8,
    Октябрь: 9,
    Ноябрь: 10,
    Декабрь: 11,
  }[monthName] ?? 0;
}

function fixedCostMonthToDate(month) {
  const [monthName, year] = String(month || '').split(' ');
  return new Date(Number(year || new Date().getFullYear()), getMonthIndex(monthName), 1);
}

function getProjectPeriodYears(projectId) {
  const project = byId(state.projects, projectId);
  const values = [
    project?.startDate,
    project?.dueDate,
    ...projectExpenses(projectId).map((item) => item.date),
    ...projectWork(projectId).map((item) => item.date || project?.startDate),
    ...projectPayments(projectId).map((item) => item.date),
  ];
  return [...new Set(values.map(parseDate).filter(Boolean).map((date) => String(date.getFullYear())))]
    .sort((a, b) => Number(b) - Number(a));
}

function getAnalyticsYears() {
  return analyticsEngine().getYears();
}

function ensureAnalyticsPeriod() {
  const years = getAnalyticsYears();
  if (!years.includes(String(state.analyticsPeriodYear))) {
    state.analyticsPeriodYear = years[0] || String(new Date().getFullYear());
  }
  return {
    type: ['all', 'year', 'quarter', 'month'].includes(state.analyticsPeriodType) ? state.analyticsPeriodType : 'all',
    year: String(state.analyticsPeriodYear),
    quarter: String(state.analyticsPeriodQuarter || '1'),
    month: state.analyticsPeriodMonth || 'Май',
    years,
  };
}

function getAnalyticsPeriodLabel(period = ensureAnalyticsPeriod()) {
  if (period.type === 'all') return 'Всё время';
  if (period.type === 'year') return `${period.year} год`;
  if (period.type === 'quarter') return `${period.quarter} квартал ${period.year}`;
  return `${period.month} ${period.year}`;
}

function getDashboardPeriod() {
  const today = new Date();
  return {
    type: 'month',
    year: String(today.getFullYear()),
    quarter: getQuarter(today),
    month: getRuMonthName(today),
  };
}

function formatDeltaMoney(delta) {
  const value = Number(delta?.value || 0);
  const sign = value > 0 ? '+' : '';
  return `${sign}${money(value)}`;
}

function formatDeltaPercentPoints(delta) {
  const value = Number(delta?.value || 0);
  const sign = value > 0 ? '+' : '';
  return `${sign}${number(value)} п.п.`;
}

function renderDelta(value, mode = 'money', goodWhenPositive = true) {
  if (!value) return '<span class="delta-badge neutral">нет базы</span>';
  const numeric = Number(value.value || 0);
  const isGood = goodWhenPositive ? numeric >= 0 : numeric <= 0;
  const label = mode === 'points' ? formatDeltaPercentPoints(value) : formatDeltaMoney(value);
  return `<span class="delta-badge ${numeric === 0 ? 'neutral' : isGood ? 'good' : 'bad'}">${label}</span>`;
}

function formatRiskValue(risk) {
  if (risk.format === 'percent') return `${number(risk.value)}%`;
  if (risk.format === 'money') return money(risk.value);
  return number(risk.value);
}

const paymentTypeLabels = {
  customer_income: 'Поступление от заказчика',
  contractor_payment: 'Выплата исполнителю',
  object_expense_payment: 'Объектный расход',
  fixed_cost_payment: 'Постоянный платеж',
  other_income: 'Прочий приход',
  other_outflow: 'Прочий расход',
};

function paymentTypeLabel(type) {
  return paymentTypeLabels[type] || 'Платеж';
}

function projectStatusLabel(status) {
  return {
    active: 'В работе',
    risk: 'Риск',
    closed: 'Закрыт',
  }[status] || status || 'Не указан';
}

function isPaymentInflow(type) {
  return type === 'customer_income' || type === 'other_income';
}

function isDateInAnalyticsPeriod(value, period = ensureAnalyticsPeriod()) {
  return isDateInProjectPeriod(value, period);
}

function getFixedCostsForAnalyticsPeriod(period = ensureAnalyticsPeriod()) {
  return analyticsEngine().getFixedCosts(period);
}

function getAnalyticsProjectRows(period = ensureAnalyticsPeriod()) {
  return analyticsEngine().getProjectRows(period);
}

function getAnalyticsCompanyMath(period = ensureAnalyticsPeriod()) {
  return analyticsEngine().getCompanyMath(period);
}

function getAnalyticsCashFlow(period = ensureAnalyticsPeriod()) {
  return analyticsEngine().getCashFlow(period);
}

function ensureProjectPeriod(projectId) {
  const years = getProjectPeriodYears(projectId);
  if (!years.includes(String(state.projectPeriodYear))) {
    state.projectPeriodYear = years[0] || String(new Date().getFullYear());
  }
  return {
    type: ['all', 'year', 'quarter', 'month'].includes(state.projectPeriodType) ? state.projectPeriodType : 'all',
    year: String(state.projectPeriodYear),
    quarter: String(state.projectPeriodQuarter || '1'),
    month: state.projectPeriodMonth || 'Май',
    years,
  };
}

function isDateInProjectPeriod(value, period) {
  if (period.type === 'all') return true;
  const date = Object.prototype.toString.call(value) === '[object Date]' ? value : parseDate(value);
  if (!date) return false;
  if (String(date.getFullYear()) !== period.year) return false;
  if (period.type === 'year') return true;
  if (period.type === 'quarter') return getQuarter(date) === period.quarter;
  if (period.type === 'month') return getRuMonthName(date) === period.month;
  return true;
}

function projectWorkForPeriod(projectId, period) {
  const project = byId(state.projects, projectId);
  return projectWork(projectId).filter((item) => isDateInProjectPeriod(item.date || project?.startDate, period));
}

function projectExpensesForPeriod(projectId, period) {
  return projectExpenses(projectId).filter((item) => isDateInProjectPeriod(item.date, period));
}

function projectPaymentsForPeriod(projectId, period) {
  return projectPayments(projectId).filter((item) => isDateInProjectPeriod(item.date, period));
}

function workMath(workItem) {
  return analyticsEngine().getWorkMath(workItem);
}

function projectMath(projectId) {
  return projectMathFromRows(projectWork(projectId), projectExpenses(projectId));
}

function projectMathForPeriod(projectId, period) {
  return projectMathFromRows(projectWorkForPeriod(projectId, period), projectExpensesForPeriod(projectId, period));
}

function projectMathFromRows(workRows, expenseRows) {
  const work = workRows.map(workMath);
  const revenue = work.reduce((sum, item) => sum + item.clientRevenue, 0);
  const contractorCost = work.reduce((sum, item) => sum + item.contractorCost, 0);
  const directExpenses = expenseRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const grossProfit = revenue - contractorCost;
  const netProfit = grossProfit - directExpenses;
  const margin = revenue ? (netProfit / revenue) * 100 : 0;
  const plannedQty = work.reduce((sum, item) => sum + item.plannedQty, 0);
  const actualQty = work.reduce((sum, item) => sum + item.actualQty, 0);
  return { revenue, contractorCost, directExpenses, grossProfit, netProfit, margin, plannedQty, actualQty };
}

function companyMath(period = { type: 'all' }) {
  return analyticsEngine().getCompanyMath(period);
}

function monthSortValue(month) {
  const months = {
    Январь: 1,
    Февраль: 2,
    Март: 3,
    Апрель: 4,
    Май: 5,
    Июнь: 6,
    Июль: 7,
    Август: 8,
    Сентябрь: 9,
    Октябрь: 10,
    Ноябрь: 11,
    Декабрь: 12,
  };
  const [name, year] = String(month || '').split(' ');
  return Number(year || 0) * 100 + Number(months[name] || 0);
}

function getFixedCostMonths() {
  return [...new Set(state.fixedCosts.map((item) => item.month))]
    .filter(Boolean)
    .sort((a, b) => monthSortValue(b) - monthSortValue(a));
}

function getSelectedFixedCostMonth() {
  const months = getFixedCostMonths();
  if (!months.includes(state.selectedFixedCostMonth)) {
    state.selectedFixedCostMonth = months[0] || '';
  }
  return state.selectedFixedCostMonth;
}

function getFixedCostsForMonth(month) {
  return state.fixedCosts.filter((item) => item.month === month);
}

function getFixedCostItems(cost) {
  if (Array.isArray(cost?.items) && cost.items.length) {
    return cost.items;
  }
  return [{ name: cost?.category || 'Статья расхода', role: 'Без расшифровки', amount: Number(cost?.amount || 0) }];
}

function getFixedCostTotal(rows) {
  return rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function getSelectedFixedCost(rows) {
  if (!rows.length) return null;
  const selected = rows.find((item) => item.id === state.selectedFixedCostId);
  if (selected) return selected;
  state.selectedFixedCostId = rows[0].id;
  return rows[0];
}

function getFixedCostHistory() {
  return getFixedCostMonths()
    .slice()
    .sort((a, b) => monthSortValue(a) - monthSortValue(b))
    .map((month) => {
      const rows = getFixedCostsForMonth(month);
      return { month, total: getFixedCostTotal(rows), rows };
    });
}

function getFixedCostYears() {
  return [...new Set(state.fixedCosts.map((item) => String(item.month || '').split(' ')[1]).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a));
}

function getMonthParts(month) {
  const [monthName, year] = String(month || '').split(' ');
  return { monthName, year };
}

function getAvailableMonthNamesForYear(year) {
  return [...new Set(
    state.fixedCosts
      .map((item) => getMonthParts(item.month))
      .filter((item) => item.year === String(year))
      .map((item) => item.monthName)
  )].sort((a, b) => monthSortValue(`${a} 2000`) - monthSortValue(`${b} 2000`));
}

function getFixedCostPeriodType() {
  return state.fixedCostPeriodType === 'year' ? 'year' : 'month';
}

function getFixedCostSelectedYear() {
  const years = getFixedCostYears();
  if (!years.includes(String(state.fixedCostYear))) {
    state.fixedCostYear = years[0] || String(new Date().getFullYear());
  }
  return String(state.fixedCostYear);
}

function getFixedCostSelectedMonth() {
  const year = getFixedCostSelectedYear();
  const months = getAvailableMonthNamesForYear(year);
  if (!months.includes(state.fixedCostMonth)) {
    state.fixedCostMonth = months[0] || 'Январь';
  }
  return state.fixedCostMonth;
}

function getFixedCostsForPeriod() {
  const type = getFixedCostPeriodType();
  const year = getFixedCostSelectedYear();
  if (type === 'year') {
    return state.fixedCosts.filter((item) => getMonthParts(item.month).year === year);
  }
  const month = getFixedCostSelectedMonth();
  return state.fixedCosts.filter((item) => {
    const parts = getMonthParts(item.month);
    return parts.year === year && parts.monthName === month;
  });
}

function getFixedCostPeriodLabel() {
  const year = getFixedCostSelectedYear();
  return getFixedCostPeriodType() === 'year' ? `${year} год` : `${getFixedCostSelectedMonth()} ${year}`;
}

function setPage(page) {
  state.activePage = page;
  saveState();
  render();
}

function renderNav() {
  const target = document.getElementById('appNav');
  target.innerHTML = navGroups
    .map((group) => `
      <div class="nav-group">
        <p class="nav-group-title">${group.title}</p>
        ${group.items.map((item) => `
          <button class="nav-button ${getActiveNavPage() === item.id ? 'active' : ''}" data-page="${item.id}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </button>
        `).join('')}
      </div>
    `)
    .join('');

  target.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => setPage(button.dataset.page));
  });
}

function getActiveNavPage() {
  if (['projectDetail', 'projectCreate'].includes(state.activePage)) return 'objects';
  if (state.activePage === 'fixedCostDetail') return 'fixedCosts';
  return state.activePage;
}

function renderHeader() {
  const [section, title, action] = pageMeta[state.activePage] || pageMeta.objects;
  document.getElementById('sectionLabel').textContent = section;
  document.getElementById('pageTitle').textContent = title;
  const button = document.getElementById('primaryAction');
  button.textContent = action || 'Действие недоступно';
  button.style.display = action ? 'inline-flex' : 'none';
  button.onclick = () => {
    if (state.activePage === 'objects') setPage('projectCreate');
    if (state.activePage === 'pricebook') openPriceForm();
    if (state.activePage === 'expenses') openExpenseForm();
    if (state.activePage === 'fixedCosts') openFixedCostForm();
    if (state.activePage === 'payments') openPaymentForm();
  };
}

function render() {
  destroyCharts();
  renderNav();
  renderHeader();
  const content = document.getElementById('content');
  const pages = {
    objects: renderObjects,
    pricebook: renderPricebook,
    expenses: renderExpenses,
    fixedCosts: renderFixedCostsV2,
    payments: renderPayments,
    fixedCostDetail: renderFixedCostDetailPage,
    analyticsSummary: renderAnalyticsSummary,
    analyticsFinance: renderAnalyticsFinance,
    analyticsCashflow: renderAnalyticsCashflow,
    analyticsObjects: renderAnalyticsObjects,
    analyticsWorks: renderAnalyticsWorks,
    analyticsContractors: renderAnalyticsContractors,
    analyticsManagers: renderAnalyticsManagers,
    analyticsPrice: renderAnalyticsPrice,
    analyticsExpenses: renderAnalyticsExpenses,
    analyticsTimeline: renderAnalyticsTimeline,
    analyticsRisks: renderAnalyticsRisks,
    overview: renderAnalyticsSummary,
    profitability: renderAnalyticsWorks,
    projectDetail: renderProjectDetailPage,
    projectCreate: renderProjectCreatePage,
  };
  content.innerHTML = pages[state.activePage]?.() || renderObjects();
  bindPageEvents();
  renderCharts();
}

function getMetricHelp(label) {
  const dictionary = {
    'Выручка': 'Начисленная сумма по фактическим объемам работ и ценам заказчика.',
    'Прямые расходы': 'Стоимость исполнителей и объектные расходы без постоянных платежей компании.',
    'Постоянные платежи': 'Ежемесячные расходы компании: зарплаты, офис, реклама, топливо и другие общие платежи.',
    'Чистая прибыль': 'Выручка минус исполнители, объектные расходы и постоянные платежи.',
    'Потратили всего': 'Все расходы за период: прямые объектные расходы плюс постоянные платежи.',
    'Деньги факт': 'Фактический cash-flow по внесенным вручную платежам.',
    'Поступления': 'Фактически полученные деньги за выбранный период.',
    'Выплаты': 'Фактически оплаченные исходящие платежи за выбранный период.',
    'Чистый поток': 'Поступления минус выплаты. Показывает движение денег, а не начисленную прибыль.',
    'Дебиторка': 'Сколько заказчики должны по начисленной выручке с учетом уже внесенных оплат.',
    'Выручка объекта': 'Начисленная выручка конкретного объекта по фактическим объемам работ.',
    'Расходы объекта': 'Исполнители плюс объектные расходы по выбранному объекту.',
    'Прибыль объекта': 'Прибыль объекта до распределения постоянных платежей.',
    'Получено от заказчика': 'Фактически внесенные поступления денег от заказчика по объекту.',
    'Выплачено по объекту': 'Фактические выплаты исполнителям и объектные платежи по объекту.',
    'Кассовый баланс': 'Получено от заказчика минус выплаты по объекту.',
    'Объекты': 'Количество объектов в базе или за выбранный период.',
    'В риске': 'Объекты с убытком, низкой маржей или статусом риска.',
    'Лучшая прибыль': 'Объект с максимальной прибылью после управленческого распределения расходов.',
    'Маржа компании': 'Чистая прибыль компании в процентах от выручки.',
    'Работ': 'Количество строк работ за выбранный период.',
    'Валовая прибыль': 'Выручка по работам минус стоимость исполнителей.',
    'Низкая маржа': 'Работы или объекты ниже заданного порога маржинальности.',
    'Перерасход объёма': 'Фактический объем выше планового больше заданного порога.',
    'Исполнителей': 'Количество исполнителей, участвовавших в работах за период.',
    'Начислено': 'Начисленная стоимость работ исполнителей.',
    'Лучший вклад': 'Наибольший положительный вклад в прибыль.',
    'С рисками': 'Количество исполнителей, работ или объектов с управленческими рисками.',
    'Руководителей': 'Количество ответственных руководителей объектов.',
    'Объектов в риске': 'Сколько объектов требуют внимания у руководителей.',
    'Услуг в прайсе': 'Количество позиций в прайсе услуг.',
    'Проблемных цен': 'Позиции с нулевой, низкой или отрицательной маржей.',
    'Средняя маржа прайса': 'Средняя разница между ценой заказчика и ставкой исполнителя.',
    'Всего расходов': 'Сумма объектных и постоянных расходов за период.',
    'Объектные': 'Расходы, привязанные к конкретным объектам.',
    'Постоянные': 'Общие расходы компании за период.',
    'Крупнейшая категория': 'Самая большая статья расходов за выбранный период.',
    'Просрочено': 'Активные объекты, у которых плановая дата сдачи уже прошла.',
    'Скоро сдача': 'Активные объекты, которые нужно сдать в ближайшие дни.',
    'Средний срок': 'Средняя плановая длительность объектов с заполненными датами.',
    'Рисков': 'Количество управленческих сигналов, требующих внимания.',
    'Убыточные объекты': 'Объекты с отрицательным финансовым результатом.',
    'Перерасход': 'Работы, где фактический объем выше планового.',
    'Период': 'Выбранный период учета.',
    'Всего постоянных платежей': 'Сумма постоянных расходов за выбранный период.',
    'Крупнейшая статья': 'Самая большая статья постоянных платежей.',
    'Средняя статья': 'Среднее значение статьи расхода за выбранный период.',
    'Сумма статьи': 'Итоговая сумма выбранной статьи постоянных платежей.',
    'Расшифровка': 'Сумма строк, из которых состоит выбранная статья.',
    'Контроль': 'Проверка совпадения итога статьи с ее расшифровкой.',
  };
  return dictionary[label] || 'Показатель рассчитывается по данным выбранного периода.';
}

function renderHelp(text) {
  return `<span class="help-dot" title="${escapeHtml(text)}" aria-label="${escapeHtml(text)}">?</span>`;
}

function renderMetric(label, value, note = '', tone = '', help = '') {
  return `
    <article class="metric-card">
      <div class="metric-label">${label}${renderHelp(help || getMetricHelp(label))}</div>
      <p class="metric-value">${value}</p>
      ${note ? `<p class="metric-note ${tone}">${note}</p>` : ''}
    </article>
  `;
}

function renderSummary() {
  const period = getDashboardPeriod();
  const math = getAnalyticsCompanyMath(period);
  const periodLabel = getAnalyticsPeriodLabel(period);
  return `
    <div class="summary-grid">
      ${renderMetric('Выручка', money(math.revenue), `${state.projects.length} объекта, ${periodLabel}`)}
      ${renderMetric('Прямые расходы', money(math.contractorCost + math.directExpenses), 'исполнители + объектные расходы')}
      ${renderMetric('Постоянные платежи', money(math.fixedCosts), `за ${periodLabel}`)}
      ${renderMetric('Чистая прибыль', money(math.netProfit), `${number(math.margin)}% маржа`, math.netProfit >= 0 ? 'good' : 'bad')}
    </div>
  `;
}

function renderObjects() {
  const rows = getFilteredProjectRows();
  return `
    ${renderSummary()}
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Рабочие объекты</h2>
          <p>Список объектов ремонта с ключевыми цифрами: выручка, расходы, прибыль и маржа.</p>
        </div>
      </div>
      ${renderObjectListControls()}
      <div class="object-directory">
        ${rows.length ? rows.map(({ project }) => renderProjectRow(project)).join('') : '<div class="empty-state">Объекты не найдены. Измените поиск или сортировку.</div>'}
      </div>
    </section>
  `;
}

function getObjectFilters() {
  state.objectFilters ||= { search: '', sortBy: 'revenue', sortDir: 'desc' };
  return state.objectFilters;
}

function getProjectSortValue(project, math, sortBy) {
  const values = {
    revenue: math.revenue,
    expenses: math.contractorCost + math.directExpenses,
    profit: math.netProfit,
    margin: math.margin,
  };
  return Number(values[sortBy] || 0);
}

function getFilteredProjectRows() {
  const filters = getObjectFilters();
  const search = String(filters.search || '').trim().toLowerCase();
  const sortBy = filters.sortBy || 'revenue';
  const direction = filters.sortDir === 'asc' ? 1 : -1;

  return state.projects
    .map((project) => ({ project, math: projectMath(project.id) }))
    .filter(({ project }) => {
      if (!search) return true;
      return [project.name, project.client, project.manager, project.address, project.status]
        .join(' ')
        .toLowerCase()
        .includes(search);
    })
    .sort((left, right) => {
      const delta =
        getProjectSortValue(left.project, left.math, sortBy) -
        getProjectSortValue(right.project, right.math, sortBy);
      return delta === 0 ? left.project.name.localeCompare(right.project.name, 'ru') : delta * direction;
    });
}

function renderObjectListControls() {
  const filters = getObjectFilters();
  const sortItems = [
    ['revenue', 'Выручка'],
    ['expenses', 'Расходы'],
    ['profit', 'Прибыль'],
    ['margin', 'Маржа'],
  ];

  return `
    <div class="object-list-controls">
      <div class="object-search">
        <label for="objectSearch">Поиск объектов</label>
        <input id="objectSearch" type="search" value="${escapeHtml(filters.search || '')}" placeholder="Название, клиент, адрес, руководитель">
      </div>
      <div class="metric-sort-grid">
        ${sortItems.map(([id, label]) => `
          <button class="sort-tile ${filters.sortBy === id ? 'active' : ''}" data-sort-projects="${id}">
            <span>${label}</span>
            <strong>${filters.sortBy === id ? (filters.sortDir === 'asc' ? 'по возрастанию' : 'по убыванию') : 'сортировать'}</strong>
          </button>
        `).join('')}
      </div>
      <div></div>
    </div>
  `;
}

function getTableSearch(key) {
  state.tableSearches ||= {};
  return String(state.tableSearches[key] || '');
}

function renderTableSearch(key, placeholder = 'Поиск') {
  return `
    <div class="table-search">
      <label>Поиск</label>
      <input type="search" value="${escapeHtml(getTableSearch(key))}" placeholder="${escapeHtml(placeholder)}" data-table-search="${escapeHtml(key)}">
    </div>
  `;
}

function matchesSearch(values, key) {
  const query = getTableSearch(key).trim().toLowerCase();
  if (!query) return true;
  return values
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).toLowerCase())
    .join(' ')
    .includes(query);
}

function renderProjectRow(project) {
  const math = projectMath(project.id);
  const statusClass = project.status === 'active' ? 'active' : project.status === 'risk' ? 'risk' : 'closed';
  return `
    <article class="object-row">
      <div>
        <h3 class="object-row-title">${project.name}</h3>
        <span class="status ${statusClass}">${projectStatusLabel(project.status)}</span>
        <div class="object-row-meta">
          <span>${project.client}</span>
          <span>${project.manager}</span>
          <span>${project.startDate} → ${project.dueDate}</span>
          <span>${project.address}</span>
        </div>
      </div>
      <div class="object-row-numbers">
        <div class="object-row-number"><span>Выручка</span><strong>${money(math.revenue)}</strong></div>
        <div class="object-row-number"><span>Расходы</span><strong>${money(math.contractorCost + math.directExpenses)}</strong></div>
        <div class="object-row-number"><span>Прибыль</span><strong class="${math.netProfit >= 0 ? 'profit' : 'danger'}">${money(math.netProfit)}</strong></div>
        <div class="object-row-number"><span>Маржа</span><strong>${number(math.margin)}%</strong></div>
      </div>
      <div class="right">
        <button class="secondary-button" data-open-project="${project.id}">Открыть</button>
      </div>
    </article>
  `;
}

function renderAnalyticsPeriodControls(period = ensureAnalyticsPeriod()) {
  return `
    <div class="analytics-period-bar">
      <span>Период: ${getAnalyticsPeriodLabel(period)}</span>
      <div class="period-controls">
        <select id="analyticsPeriodType">
          <option value="all" ${period.type === 'all' ? 'selected' : ''}>Всё время</option>
          <option value="year" ${period.type === 'year' ? 'selected' : ''}>Год</option>
          <option value="quarter" ${period.type === 'quarter' ? 'selected' : ''}>Квартал</option>
          <option value="month" ${period.type === 'month' ? 'selected' : ''}>Месяц</option>
        </select>
        ${period.type !== 'all' ? `
          <select id="analyticsPeriodYear">
            ${period.years.map((year) => `<option value="${escapeHtml(year)}" ${year === period.year ? 'selected' : ''}>${escapeHtml(year)} год</option>`).join('')}
          </select>
        ` : ''}
        ${period.type === 'quarter' ? `
          <select id="analyticsPeriodQuarter">
            ${['1', '2', '3', '4'].map((quarter) => `<option value="${quarter}" ${quarter === period.quarter ? 'selected' : ''}>${quarter} квартал</option>`).join('')}
          </select>
        ` : ''}
        ${period.type === 'month' ? `
          <select id="analyticsPeriodMonth">
            ${ANALYTICS_MONTHS.map((month) => `<option value="${escapeHtml(month)}" ${month === period.month ? 'selected' : ''}>${escapeHtml(month)}</option>`).join('')}
          </select>
        ` : ''}
      </div>
    </div>
  `;
}

function renderSummaryLine(label, value, note = '', tone = '') {
  return `
    <div class="summary-line">
      <div>
        <strong>${label}</strong>
        ${note ? `<span>${note}</span>` : ''}
      </div>
      <b class="${tone}">${value}</b>
    </div>
  `;
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value || 0), min), max);
}

function getAnalyticsSettings() {
  state.analyticsSettings = { ...initialState.analyticsSettings, ...(state.analyticsSettings || {}) };
  return state.analyticsSettings;
}

function buildExecutiveInsights(math, projectRows, risks, expenseRows, settings, cash = null, projectCashRows = []) {
  const insights = [];
  const worstProject = projectRows.slice().sort((a, b) => a.math.netProfitAfterFixed - b.math.netProfitAfterFixed)[0];
  const topExpense = expenseRows[0];
  const receivable = projectCashRows.reduce((sum, row) => sum + row.receivable, 0);

  if (math.netProfit < 0) {
    insights.push({
      level: 'high',
      title: 'Компания в минусе за период',
      text: `Чистая прибыль ${money(math.netProfit)}, маржа ${number(math.margin)}%.`,
    });
  } else {
    insights.push({
      level: 'good',
      title: 'Компания прибыльна за период',
      text: `Чистая прибыль ${money(math.netProfit)}, маржа ${number(math.margin)}%.`,
    });
  }

  if (math.fixedCostShare > settings.fixedCostShare) {
    insights.push({
      level: 'high',
      title: 'Постоянные платежи давят прибыль',
      text: `${number(math.fixedCostShare)}% от выручки при норме ${number(settings.fixedCostShare)}%.`,
    });
  }

  if (worstProject && worstProject.math.netProfitAfterFixed < 0) {
    insights.push({
      level: 'high',
      title: 'Проверить убыточный объект',
      text: `${worstProject.project.name}: ${money(worstProject.math.netProfitAfterFixed)} после постоянных.`,
    });
  }

  if (topExpense) {
    insights.push({
      level: 'medium',
      title: 'Крупнейшая статья расходов',
      text: `${topExpense.category}: ${money(topExpense.amount)} (${number(topExpense.share)}%).`,
    });
  }

  if (cash && cash.netCashFlow < 0) {
    insights.push({
      level: 'high',
      title: 'Кассовый поток отрицательный',
      text: `По фактическим платежам ${money(cash.netCashFlow)} за период.`,
    });
  } else if (receivable > 0) {
    insights.push({
      level: 'medium',
      title: 'Есть деньги к получению',
      text: `Дебиторка по объектам ${money(receivable)}.`,
    });
  }

  if (risks.length) {
    insights.push({
      level: 'medium',
      title: 'Есть управленческие риски',
      text: `${risks.length} сигналов: убытки, сроки, маржа, дебиторка или платежи.`,
    });
  }

  return insights.slice(0, 3);
}

function renderExecutiveInsights(insights) {
  return `
    <div class="insight-list">
      ${insights.map((item) => `
        <div class="insight-item ${item.level}">
          <span></span>
          <div>
            <strong>${item.title}</strong>
            <p>${item.text}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderWaterfallStep(label, value, maxValue, tone = '') {
  const width = clamp(Math.abs(value) / Math.max(maxValue, 1) * 100, 4, 100);
  const displayValue = tone === 'danger' && value > 0 ? -value : value;
  return `
    <div class="waterfall-step">
      <div class="waterfall-row">
        <span>${label}</span>
        <strong class="${tone}">${money(displayValue)}</strong>
      </div>
      <div class="waterfall-track">
        <i class="${tone}" style="width:${width}%"></i>
      </div>
    </div>
  `;
}

function renderFinancialWaterfall(math) {
  const directProfit = math.revenue - math.contractorCost - math.directExpenses;
  const rows = [
    ['Выручка', math.revenue, 'profit'],
    ['Исполнители', math.contractorCost, 'danger'],
    ['Объектные', math.directExpenses, 'danger'],
    ['До постоянных', directProfit, directProfit >= 0 ? 'profit' : 'danger'],
    ['Постоянные', math.fixedCosts, 'danger'],
    ['Чистая прибыль', math.netProfit, math.netProfit >= 0 ? 'profit' : 'danger'],
  ];
  const maxValue = Math.max(...rows.map((row) => Math.abs(row[1])), 1);
  return `<div class="waterfall">${rows.map(([label, value, tone]) => renderWaterfallStep(label, value, maxValue, tone)).join('')}</div>`;
}

function renderExpenseBars(expenseRows) {
  const rows = expenseRows.slice(0, 2);
  return `
    <div class="bar-list">
      ${rows.map((row) => `
        <div class="bar-item">
          <div class="bar-row"><span>${row.category}</span><strong>${money(row.amount)}</strong></div>
          <div class="bar-track"><i style="width:${clamp(row.share, 2, 100)}%"></i></div>
        </div>
      `).join('') || '<p class="muted">Расходов за период нет.</p>'}
    </div>
  `;
}

function getObjectSignal(row, settings) {
  if (row.math.netProfitAfterFixed < 0) return ['red', 'Убыток'];
  if (row.math.marginAfterFixed < settings.projectMargin) return ['yellow', 'Низкая маржа'];
  if (row.project.status === 'risk') return ['yellow', 'Риск'];
  return ['green', 'Норма'];
}

function renderObjectTraffic(projectRows, settings) {
  const rows = projectRows
    .slice()
    .sort((a, b) => a.math.netProfitAfterFixed - b.math.netProfitAfterFixed)
    .slice(0, 2);
  return `
    <div class="traffic-list">
      ${rows.map((row) => {
        const [tone, label] = getObjectSignal(row, settings);
        return `
          <div class="traffic-item">
            <span class="traffic-dot ${tone}"></span>
            <div>
              <strong>${row.project.name}</strong>
              <small>${label} · ${money(row.math.netProfitAfterFixed)} · ${number(row.math.marginAfterFixed)}%</small>
            </div>
          </div>
        `;
      }).join('') || '<p class="muted">Объектов за период нет.</p>'}
    </div>
  `;
}

function renderMarginGauge(math, settings) {
  const current = clamp(math.margin, -50, 80);
  const normalized = clamp((current + 50) / 130 * 100, 0, 100);
  const target = clamp((settings.projectMargin + 50) / 130 * 100, 0, 100);
  return `
    <div class="margin-gauge">
      <div class="gauge-head">
        <span>Маржа</span>
        <strong class="${math.margin >= settings.projectMargin ? 'profit' : 'danger'}">${number(math.margin)}%</strong>
      </div>
      <div class="gauge-track">
        <i style="width:${normalized}%"></i>
        <b style="left:${target}%"></b>
      </div>
      <small>Норма: ${number(settings.projectMargin)}%</small>
    </div>
  `;
}

function renderAnalyticsSettings(settings) {
  const items = [
    ['projectMargin', 'Маржа объекта, %'],
    ['fixedCostShare', 'Постоянные, %'],
    ['workGrossMargin', 'Маржа работ, %'],
    ['dueSoonDays', 'Срок, дней'],
  ];
  return `
    <div class="settings-grid">
      ${items.map(([key, label]) => `
        <label>
          <span>${label}</span>
          <input type="number" min="0" step="1" value="${Number(settings[key] || 0)}" data-analytics-setting="${key}">
        </label>
      `).join('')}
    </div>
  `;
}

function renderAnalyticsSummary() {
  const period = ensureAnalyticsPeriod();
  const engine = analyticsEngine();
  const settings = getAnalyticsSettings();
  const math = getAnalyticsCompanyMath(period);
  const comparison = engine.getPeriodComparison(period);
  const projectRows = getAnalyticsProjectRows(period);
  const risks = engine.getRisks(period);
  const expenseRows = engine.getExpenseBuckets(period);
  const cash = engine.getCashFlow(period);
  const projectCashRows = engine.getProjectCashRows(period);
  const directCosts = math.contractorCost + math.directExpenses;
  const totalSpent = directCosts + math.fixedCosts;
  const insights = buildExecutiveInsights(math, projectRows, risks, expenseRows, settings, cash, projectCashRows);

  return `
    <div class="summary-grid executive-grid">
      ${renderMetric('Выручка', money(math.revenue), comparison ? renderDelta(comparison.deltas.revenue, 'money', true) : getAnalyticsPeriodLabel(period))}
      ${renderMetric('Потратили всего', money(totalSpent), `прямые + постоянные`)}
      ${renderMetric('Чистая прибыль', money(math.netProfit), `${number(math.margin)}% маржа`, math.netProfit >= 0 ? 'good' : 'bad')}
      ${renderMetric('Деньги факт', money(cash.netCashFlow), `пришло ${money(cash.inflow)}`, cash.netCashFlow >= 0 ? 'good' : 'bad')}
    </div>
    <section class="panel analytics-panel executive-panel">
      <div class="panel-header">
        <div>
          <h2>Общая аналитика</h2>
          <p>Короткий управленческий срез: сколько заработали, сколько потратили и что давит на прибыль.</p>
        </div>
      </div>
      ${renderAnalyticsPeriodControls(period)}
      <div class="decision-grid">
        <div class="executive-block insights-block">
          <h3>Главные выводы</h3>
          ${renderExecutiveInsights(insights)}
        </div>
        <div class="executive-block">
          <h3>Финансовая лестница</h3>
          ${renderFinancialWaterfall(math)}
          ${renderMarginGauge(math, settings)}
        </div>
        <div class="executive-block">
          <h3>Контроль</h3>
          <p class="block-explain">Быстрый контроль показывает самые тяжелые статьи расходов и объекты, которые первыми требуют проверки: убыток, низкая маржа или риск по статусу.</p>
          <div class="control-split">
            <div>
              <h4>Расходы</h4>
              ${renderExpenseBars(expenseRows)}
            </div>
            <div>
              <h4>Объекты</h4>
              ${renderObjectTraffic(projectRows, settings)}
            </div>
          </div>
          ${renderAnalyticsSettings(settings)}
        </div>
      </div>
    </section>
  `;
}

function renderAnalyticsFinance() {
  const period = ensureAnalyticsPeriod();
  const math = getAnalyticsCompanyMath(period);
  const comparison = analyticsEngine().getPeriodComparison(period);
  const rows = [
    ['Плановая выручка', math.plannedRevenue, null, true, 'По плановым объёмам и цене заказчика'],
    ['Выручка', math.revenue, comparison?.deltas.revenue, true, 'Начислено по фактическим объёмам работ'],
    ['Отклонение от плана', math.revenueDelta, null, true, 'Факт выручки минус план'],
    ['Исполнители', math.contractorCost, comparison?.deltas.contractorCost, false, 'Стоимость работ исполнителей'],
    ['Объектные расходы', math.directExpenses, comparison?.deltas.directExpenses, false, 'Расходы, привязанные к объектам'],
    ['Постоянные платежи', math.fixedCosts, comparison?.deltas.fixedCosts, false, 'Офис, зарплаты, реклама, топливо'],
    ['Прибыль до постоянных', math.netProfitBeforeFixed, comparison?.deltas.netProfitBeforeFixed, true, 'Выручка минус прямые расходы'],
    ['Чистая прибыль', math.netProfit, comparison?.deltas.netProfit, true, `${number(math.margin)}% маржа`],
    ['Маржа', math.margin, comparison?.deltas.margin, true, 'Чистая прибыль / выручка', 'points'],
  ];

  return `
    <div class="summary-grid">
      ${renderMetric('Выручка', money(math.revenue), getAnalyticsPeriodLabel(period))}
      ${renderMetric('Прямые расходы', money(math.contractorCost + math.directExpenses), 'исполнители + объектные')}
      ${renderMetric('Постоянные платежи', money(math.fixedCosts), `${number(math.fixedCostShare)}% от выручки`)}
      ${renderMetric('Чистая прибыль', money(math.netProfit), `${number(math.margin)}% маржа`, math.netProfit >= 0 ? 'good' : 'bad')}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header">
        <div>
          <h2>Финансовая сводка</h2>
          <p>Главный экран: P&L за период и отклонение от предыдущего такого же периода.</p>
        </div>
      </div>
      ${renderAnalyticsPeriodControls(period)}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Показатель</th><th>Комментарий</th><th class="right">Сумма</th><th class="right">К прошлому периоду</th></tr></thead>
          <tbody>
            ${rows.map(([label, value, deltaValue, goodWhenPositive, note, mode]) => `
              <tr>
                <td><strong>${label}</strong></td>
                <td>${note}</td>
                <td class="right ${label.includes('прибыль') || label.includes('Прибыль') ? (value >= 0 ? 'profit' : 'danger') : ''}">${mode === 'points' ? `${number(value)}%` : money(value)}</td>
                <td class="right">${comparison ? renderDelta(deltaValue, mode === 'points' ? 'points' : 'money', goodWhenPositive) : '<span class="muted">выберите год, квартал или месяц</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsCashflow() {
  const period = ensureAnalyticsPeriod();
  const cash = getAnalyticsCashFlow(period);
  const projectRows = analyticsEngine().getProjectCashRows(period);
  const visibleProjectRows = projectRows.filter((row) => matchesSearch([
    row.project.name,
    row.project.client,
    row.project.manager,
    row.math.revenue,
    row.received,
    row.receivable,
    row.cashBalance,
  ], 'analyticsCashflow'));
  const receivable = projectRows.reduce((sum, row) => sum + row.receivable, 0);
  const contractorDebt = projectRows.reduce((sum, row) => sum + row.contractorDebt, 0);
  const objectExpenseDebt = projectRows.reduce((sum, row) => sum + row.objectExpenseDebt, 0);

  return `
    <div class="summary-grid">
      ${renderMetric('Поступления', money(cash.inflow), 'факт по оплатам')}
      ${renderMetric('Выплаты', money(cash.outflow), 'исполнители + расходы + постоянные')}
      ${renderMetric('Чистый поток', money(cash.netCashFlow), `${cash.rows.length} платежей`, cash.netCashFlow >= 0 ? 'good' : 'bad')}
      ${renderMetric('Дебиторка', money(receivable), `долг исполнителям: ${money(contractorDebt + objectExpenseDebt)}`, receivable ? 'bad' : 'good')}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header">
        <div>
          <h2>Движение денежных средств</h2>
          <p>Фактические деньги отдельно от начисленной прибыли: что пришло, что ушло и где зависли долги.</p>
        </div>
      </div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsCashflow', 'Объект, клиент, руководитель, сумма')}
      <div class="table-wrap analytics-table">
        <table>
          <thead>
            <tr>
              <th>Объект</th>
              <th class="right">Начислено заказчику</th>
              <th class="right">Получено</th>
              <th class="right">Дебиторка</th>
              <th class="right">Выплаты по объекту</th>
              <th class="right">Долг исполнителям/расходам</th>
              <th class="right">Кассовый баланс</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${visibleProjectRows.map((row) => `
              <tr>
                <td><strong>${row.project.name}</strong></td>
                <td class="right">${money(row.math.revenue)}</td>
                <td class="right profit">${money(row.received)}</td>
                <td class="right ${row.receivable ? 'danger' : 'profit'}">${money(row.receivable)}</td>
                <td class="right">${money(row.cashOut)}</td>
                <td class="right ${row.contractorDebt + row.objectExpenseDebt ? 'danger' : ''}">${money(row.contractorDebt + row.objectExpenseDebt)}</td>
                <td class="right ${row.cashBalance >= 0 ? 'profit' : 'danger'}">${money(row.cashBalance)}</td>
                <td class="right"><button class="secondary-button compact-button" data-open-project="${row.project.id}">Открыть</button></td>
              </tr>
            `).join('') || '<tr><td colspan="8" class="muted">Нет объектов за выбранный период.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsObjects() {
  const period = ensureAnalyticsPeriod();
  const allRows = getAnalyticsProjectRows(period)
    .slice()
    .sort((a, b) => b.math.netProfitAfterFixed - a.math.netProfitAfterFixed);
  const rows = allRows.filter(({ project, math }) => matchesSearch([
    project.name,
    project.client,
    project.manager,
    projectStatusLabel(project.status),
    math.revenue,
    math.netProfitAfterFixed,
    math.marginAfterFixed,
  ], 'analyticsObjects'));
  const math = getAnalyticsCompanyMath(period);
  const active = state.projects.filter((project) => project.status === 'active').length;
  const risk = allRows.filter((item) => item.project.status === 'risk' || item.math.marginAfterFixed < 15 || item.math.netProfitAfterFixed < 0).length;
  const best = allRows[0];
  const worst = allRows.slice().sort((a, b) => a.math.netProfitAfterFixed - b.math.netProfitAfterFixed)[0];

  return `
    <div class="summary-grid">
      ${renderMetric('Объекты', String(state.projects.length), `${active} в работе`)}
      ${renderMetric('В риске', String(risk), 'после доли постоянных расходов')}
      ${renderMetric('Лучшая прибыль', money(best?.math.netProfitAfterFixed || 0), best?.project.name || '')}
      ${renderMetric('Маржа компании', `${number(math.margin)}%`, worst ? `худший: ${worst.project.name}` : getAnalyticsPeriodLabel(period))}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Аналитика объектов</h2><p>Рейтинг объектов с распределением постоянных расходов по доле выручки.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsObjects', 'Объект, клиент, руководитель, статус')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Объект</th><th>Статус</th><th class="right">Выручка</th><th class="right">Прямая прибыль</th><th class="right">Доля пост.</th><th class="right">Итог</th><th class="right">Маржа</th><th></th></tr></thead>
          <tbody>
            ${rows.map(({ project, math }) => `
              <tr>
                <td>${project.name}</td>
                <td>${projectStatusLabel(project.status)}</td>
                <td class="right">${money(math.revenue)}</td>
                <td class="right ${math.netProfit >= 0 ? 'profit' : 'danger'}">${money(math.netProfit)}</td>
                <td class="right">${money(math.fixedAllocation)}</td>
                <td class="right ${math.netProfitAfterFixed >= 0 ? 'profit' : 'danger'}">${money(math.netProfitAfterFixed)}</td>
                <td class="right">${number(math.marginAfterFixed)}%</td>
                <td class="right"><button class="secondary-button compact-button" data-open-project="${project.id}">Открыть</button></td>
              </tr>
            `).join('') || '<tr><td colspan="8" class="muted">Ничего не найдено.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function getAnalyticsWorkRows(period = ensureAnalyticsPeriod()) {
  return analyticsEngine().getWorkRows(period)
    .sort((a, b) => b.math.grossProfit - a.math.grossProfit);
}

function renderAnalyticsWorks() {
  const period = ensureAnalyticsPeriod();
  const rows = getAnalyticsWorkRows(period);
  const categoryRows = analyticsEngine().getWorkCategoryRows(period)
    .filter((row) => matchesSearch([row.category, row.count, row.revenue, row.contractorCost, row.grossProfit, row.grossMargin], 'analyticsWorks'));
  const lowMargin = rows.filter((item) => item.math.clientRevenue && item.math.grossMargin < 20).length;
  const overrun = rows.filter((item) => item.math.planDeltaPercent > 5).length;
  const revenue = rows.reduce((sum, item) => sum + item.math.clientRevenue, 0);
  const grossProfit = rows.reduce((sum, item) => sum + item.math.grossProfit, 0);

  return `
    <div class="summary-grid">
      ${renderMetric('Работ', String(rows.length), getAnalyticsPeriodLabel(period))}
      ${renderMetric('Валовая прибыль', money(grossProfit), `${number(revenue ? grossProfit * 100 / revenue : 0)}% валовая маржа`)}
      ${renderMetric('Низкая маржа', String(lowMargin), 'ниже 20%')}
      ${renderMetric('Перерасход объёма', String(overrun), 'факт выше плана больше 5%')}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Аналитика работ</h2><p>Маржинальность видов работ: где компания зарабатывает на объёмах.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsWorks', 'Категория работ, сумма, маржа')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Категория работ</th><th class="right">Позиций</th><th class="right">План/факт</th><th class="right">Выручка</th><th class="right">Исполнители</th><th class="right">Валовая прибыль</th><th class="right">Маржа</th></tr></thead>
          <tbody>
            ${categoryRows.map((row) => `
              <tr>
                <td><strong>${row.category}</strong></td>
                <td class="right">${row.count}</td>
                <td class="right">${number(row.plannedQty)} / ${number(row.actualQty)}</td>
                <td class="right">${money(row.revenue)}</td>
                <td class="right">${money(row.contractorCost)}</td>
                <td class="right ${row.grossProfit >= 0 ? 'profit' : 'danger'}">${money(row.grossProfit)}</td>
                <td class="right ${row.grossMargin < 20 ? 'danger' : ''}">${number(row.grossMargin)}%</td>
              </tr>
            `).join('') || '<tr><td colspan="7" class="muted">Нет работ за выбранный период.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsContractors() {
  const period = ensureAnalyticsPeriod();
  const allRows = analyticsEngine().getContractorRows(period);
  const rows = allRows.filter((row) => matchesSearch([
    row.contractor,
    row.projectCount,
    row.workCount,
    row.revenue,
    row.contractorCost,
    row.grossProfit,
    row.grossMargin,
  ], 'analyticsContractors'));
  const totalCost = allRows.reduce((sum, row) => sum + row.contractorCost, 0);
  const top = allRows[0];
  const risky = allRows.filter((row) => row.lowMarginCount || row.overrunCount).length;

  return `
    <div class="summary-grid">
      ${renderMetric('Исполнителей', String(rows.length), getAnalyticsPeriodLabel(period))}
      ${renderMetric('Начислено', money(totalCost), 'стоимость работ исполнителей')}
      ${renderMetric('Лучший вклад', money(top?.grossProfit || 0), top?.contractor || 'Нет данных')}
      ${renderMetric('С рисками', String(risky), 'низкая маржа или перерасход')}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Исполнители</h2><p>Кто сколько сделал, сколько начислено и где проседает маржа.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsContractors', 'Исполнитель, сумма, маржа, риск')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Исполнитель</th><th class="right">Объектов</th><th class="right">Работ</th><th class="right">План/факт</th><th class="right">Выручка</th><th class="right">Начислено</th><th class="right">Валовая прибыль</th><th class="right">Маржа</th><th class="right">Риски</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td><strong>${row.contractor}</strong></td>
                <td class="right">${row.projectCount}</td>
                <td class="right">${row.workCount}</td>
                <td class="right">${number(row.plannedQty)} / ${number(row.actualQty)}</td>
                <td class="right">${money(row.revenue)}</td>
                <td class="right">${money(row.contractorCost)}</td>
                <td class="right ${row.grossProfit >= 0 ? 'profit' : 'danger'}">${money(row.grossProfit)}</td>
                <td class="right ${row.grossMargin < 20 ? 'danger' : ''}">${number(row.grossMargin)}%</td>
                <td class="right">${row.lowMarginCount + row.overrunCount}</td>
              </tr>
            `).join('') || '<tr><td colspan="9" class="muted">Нет работ за выбранный период.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsManagers() {
  const period = ensureAnalyticsPeriod();
  const allRows = analyticsEngine().getManagerRows(period);
  const rows = allRows.filter((row) => matchesSearch([
    row.manager,
    row.projectCount,
    row.activeCount,
    row.riskCount,
    row.revenue,
    row.netProfitAfterFixed,
    row.marginAfterFixed,
  ], 'analyticsManagers'));
  const top = allRows[0];
  const riskCount = allRows.reduce((sum, row) => sum + row.riskCount, 0);

  return `
    <div class="summary-grid">
      ${renderMetric('Руководителей', String(rows.length), getAnalyticsPeriodLabel(period))}
      ${renderMetric('Объектов в риске', String(riskCount), 'по руководителям')}
      ${renderMetric('Лучший результат', money(top?.netProfitAfterFixed || 0), top?.manager || 'Нет данных')}
      ${renderMetric('Выручка', money(rows.reduce((sum, row) => sum + row.revenue, 0)), 'по объектам')}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Руководители объектов</h2><p>Финансовый результат и рискованность объектов по ответственным.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsManagers', 'Руководитель, сумма, маржа, риск')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Руководитель</th><th class="right">Объектов</th><th class="right">Активных</th><th class="right">Рисковых</th><th class="right">Выручка</th><th class="right">Прямая прибыль</th><th class="right">Доля пост.</th><th class="right">Итог</th><th class="right">Маржа</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td><strong>${row.manager}</strong></td>
                <td class="right">${row.projectCount}</td>
                <td class="right">${row.activeCount}</td>
                <td class="right ${row.riskCount ? 'danger' : ''}">${row.riskCount}</td>
                <td class="right">${money(row.revenue)}</td>
                <td class="right ${row.directProfit >= 0 ? 'profit' : 'danger'}">${money(row.directProfit)}</td>
                <td class="right">${money(row.fixedAllocation)}</td>
                <td class="right ${row.netProfitAfterFixed >= 0 ? 'profit' : 'danger'}">${money(row.netProfitAfterFixed)}</td>
                <td class="right">${number(row.marginAfterFixed)}%</td>
              </tr>
            `).join('') || '<tr><td colspan="9" class="muted">Нет объектов за выбранный период.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsPrice() {
  const period = ensureAnalyticsPeriod();
  const allRows = analyticsEngine().getPriceRows(period);
  const rows = allRows.filter((row) => matchesSearch([
    row.price.name,
    row.price.category,
    row.price.unit,
    row.clientPrice,
    row.contractorPrice,
    row.unitMargin,
  ], 'analyticsPrice'));
  const used = allRows.filter((row) => row.workCount > 0).length;
  const dangerous = allRows.filter((row) => row.clientPrice <= 0 || row.contractorPrice > row.clientPrice || row.unitMargin < 20).length;
  const top = allRows.filter((row) => row.workCount > 0)[0];

  return `
    <div class="summary-grid">
      ${renderMetric('Услуг в прайсе', String(rows.length), `${used} использовались`)}
      ${renderMetric('Проблемных цен', String(dangerous), 'низкая или отрицательная маржа')}
      ${renderMetric('Лучший вклад', money(top?.grossProfit || 0), top?.price?.category || 'Нет данных')}
      ${renderMetric('Средняя маржа прайса', `${number(allRows.reduce((sum, row) => sum + row.unitMargin, 0) / (allRows.length || 1))}%`, getAnalyticsPeriodLabel(period))}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Прайс и юнит-экономика</h2><p>Проверка цен заказчика и ставок исполнителей.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsPrice', 'Услуга, категория, единица, цена')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Услуга</th><th>Категория</th><th class="right">Цена заказчика</th><th class="right">Исполнитель</th><th class="right">Маржа цены</th><th class="right">Работ</th><th class="right">Факт</th><th class="right">Вклад</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td><strong>${row.price.name}</strong></td>
                <td>${row.price.category || 'Без категории'}</td>
                <td class="right">${money(row.clientPrice)}</td>
                <td class="right">${money(row.contractorPrice)}</td>
                <td class="right ${row.unitMargin < 20 ? 'danger' : ''}">${number(row.unitMargin)}%</td>
                <td class="right">${row.workCount}</td>
                <td class="right">${number(row.actualQty)} ${row.price.unit || ''}</td>
                <td class="right ${row.grossProfit >= 0 ? 'profit' : 'danger'}">${money(row.grossProfit)}</td>
              </tr>
            `).join('') || '<tr><td colspan="8" class="muted">Прайс пуст.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsExpenses() {
  const period = ensureAnalyticsPeriod();
  const engine = analyticsEngine();
  const objectExpenses = engine.getExpenseRows(period);
  const fixedCosts = getFixedCostsForAnalyticsPeriod(period);
  const allRows = engine.getExpenseBuckets(period);
  const rows = allRows.filter((row) => matchesSearch([row.category, row.amount, row.share, row.count], 'analyticsExpenses'));
  const fixedItems = engine.getFixedCostItemRows(period);
  const total = allRows.reduce((sum, item) => sum + item.amount, 0);
  const objectExpenseTotal = objectExpenses.reduce((sum, row) => sum + Number(row.expense.amount || 0), 0);
  const fixedCostTotal = fixedCosts.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return `
    <div class="summary-grid">
      ${renderMetric('Всего расходов', money(total), getAnalyticsPeriodLabel(period))}
      ${renderMetric('Объектные', money(objectExpenseTotal), `${objectExpenses.length} записей`)}
      ${renderMetric('Постоянные', money(fixedCostTotal), `${fixedCosts.length} статей`)}
      ${renderMetric('Крупнейшая категория', allRows[0]?.category || 'Нет данных', allRows[0] ? money(allRows[0].amount) : '')}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Аналитика расходов</h2><p>Куда уходят деньги по выбранному периоду.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsExpenses', 'Категория, сумма, доля, расшифровка')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Категория</th><th class="right">Сумма</th><th class="right">Доля</th><th class="right">Записей</th><th>Крупнейшая расшифровка</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${row.category}</td>
                <td class="right">${money(row.amount)}</td>
                <td class="right">${number(row.share)}%</td>
                <td class="right">${row.count}</td>
                <td>${fixedItems.find((item) => row.category.includes(item.categories.split(', ')[0]))?.name || '—'}</td>
              </tr>
            `).join('') || '<tr><td colspan="5" class="muted">Нет расходов за выбранный период.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsTimeline() {
  const period = ensureAnalyticsPeriod();
  const allRows = analyticsEngine().getTimelineRows(period);
  const rows = allRows.filter((row) => matchesSearch([
    row.project.name,
    row.project.manager,
    row.status,
    row.project.startDate,
    row.project.dueDate,
    row.daysLeft,
    row.durationDays,
    row.math.netProfitAfterFixed,
  ], 'analyticsTimeline'));
  const overdue = allRows.filter((row) => row.overdue).length;
  const dueSoon = allRows.filter((row) => row.dueSoon).length;
  const avgDuration = allRows.reduce((sum, row) => sum + Number(row.durationDays || 0), 0) / (allRows.filter((row) => row.durationDays !== null).length || 1);

  return `
    <div class="summary-grid">
      ${renderMetric('Объектов', String(rows.length), getAnalyticsPeriodLabel(period))}
      ${renderMetric('Просрочено', String(overdue), 'активные объекты после dueDate', overdue ? 'bad' : 'good')}
      ${renderMetric('Скоро сдача', String(dueSoon), '7 дней до срока')}
      ${renderMetric('Средний срок', `${number(avgDuration)} дн.`, 'по объектам с датами')}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Сроки объектов</h2><p>Контроль дедлайнов, длительности и финансового результата рядом со сроком.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsTimeline', 'Объект, руководитель, статус, дата')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Объект</th><th>Руководитель</th><th>Статус сроков</th><th class="right">Старт</th><th class="right">Сдача</th><th class="right">Осталось</th><th class="right">Длительность</th><th class="right">Прибыль</th><th></th></tr></thead>
          <tbody>
            ${rows.map(({ project, math, status, daysLeft, durationDays, overdue }) => `
              <tr>
                <td><strong>${project.name}</strong></td>
                <td>${project.manager || 'Не указан'}</td>
                <td><span class="severity ${overdue ? 'high' : status === 'Скоро сдача' ? 'medium' : ''}">${status}</span></td>
                <td class="right">${project.startDate || '—'}</td>
                <td class="right">${project.dueDate || '—'}</td>
                <td class="right ${overdue ? 'danger' : ''}">${daysLeft === null ? '—' : `${number(daysLeft)} дн.`}</td>
                <td class="right">${durationDays === null ? '—' : `${number(durationDays)} дн.`}</td>
                <td class="right ${math.netProfitAfterFixed >= 0 ? 'profit' : 'danger'}">${money(math.netProfitAfterFixed)}</td>
                <td class="right"><button class="secondary-button compact-button" data-open-project="${project.id}">Открыть</button></td>
              </tr>
            `).join('') || '<tr><td colspan="9" class="muted">Нет объектов за выбранный период.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalyticsRisks() {
  const period = ensureAnalyticsPeriod();
  const allRisks = analyticsEngine().getRisks(period);
  const risks = allRisks.filter((risk) => matchesSearch([
    risk.level,
    risk.type,
    risk.target,
    risk.reason,
    risk.action,
    risk.value,
  ], 'analyticsRisks'));

  return `
    <div class="summary-grid">
      ${renderMetric('Рисков', String(allRisks.length), getAnalyticsPeriodLabel(period), allRisks.length ? 'bad' : 'good')}
      ${renderMetric('Убыточные объекты', String(allRisks.filter((r) => r.type === 'Убыток объекта').length))}
      ${renderMetric('Низкая маржа', String(allRisks.filter((r) => r.type.includes('маржа')).length))}
      ${renderMetric('Перерасход', String(allRisks.filter((r) => r.type === 'Перерасход объёма').length))}
    </div>
    <section class="panel analytics-panel">
      <div class="panel-header"><div><h2>Риски</h2><p>Список мест, где нужно управленческое внимание.</p></div></div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch('analyticsRisks', 'Риск, объект, причина, действие')}
      <div class="table-wrap analytics-table">
        <table>
          <thead><tr><th>Уровень</th><th>Риск</th><th>Объект</th><th>Причина</th><th>Действие</th><th class="right">Значение</th></tr></thead>
          <tbody>
            ${risks.length ? risks.map((risk) => `
              <tr>
                <td><span class="severity ${risk.level === 'Высокий' ? 'high' : 'medium'}">${risk.level}</span></td>
                <td><strong>${risk.type}</strong></td>
                <td>${risk.target}</td>
                <td>${risk.reason}</td>
                <td>${risk.action}</td>
                <td class="right danger">${formatRiskValue(risk)}</td>
              </tr>
            `).join('') : '<tr><td colspan="6" class="muted">Критичных рисков за период не найдено.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderProjectCreatePage() {
  const rows = Array.from({ length: 12 }, (_, index) => index + 1);

  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Создание объекта по общей сводной ведомости</h2>
          <p>Структура повторяет шаблон: основная информация по работам и блок расходов по каждой строке.</p>
        </div>
        <div class="topbar-actions">
          <button class="secondary-button" data-back-objects>К списку</button>
          <button class="primary-button" data-save-object-sheet>Сохранить объект</button>
        </div>
      </div>

      <div class="object-meta-form">
        <div class="field">
          <label>Название объекта</label>
          <input id="sheetProjectName" value="Новый объект ремонта">
        </div>
        <div class="field">
          <label>Клиент</label>
          <input id="sheetProjectClient" value="">
        </div>
        <div class="field">
          <label>Адрес</label>
          <input id="sheetProjectAddress" value="">
        </div>
        <div class="field">
          <label>Руководитель объекта</label>
          <input id="sheetProjectManager" value="">
        </div>
      </div>

      <div class="sheet-wrap">
        <table class="object-sheet">
          <thead>
            <tr>
              <th colspan="12" class="sheet-group">ОСНОВНАЯ ИНФОРМАЦИЯ</th>
              <th colspan="10" class="sheet-group">РАСХОДЫ</th>
            </tr>
            <tr>
              <th>№ п.п</th>
              <th>Исполнитель</th>
              <th>Наименование работ</th>
              <th>Ед. изм</th>
              <th>Проектный объем</th>
              <th>Фактический объем</th>
              <th>Статус</th>
              <th>Цена за ед. ИП Курочкин</th>
              <th>Цена за ед. Исполнитель</th>
              <th>Стоимость ИП Курочкин</th>
              <th>Стоимость Исполнитель</th>
              <th>Прибыль ИП Курочкин</th>
              <th>Аванс Исполнитель</th>
              <th>Сумма аванса</th>
              <th>Расходники инструмент</th>
              <th>Расходы на Заказчика</th>
              <th>Налоги 11 %</th>
              <th>Проживание</th>
              <th>Разнорабочие</th>
              <th>Внеплановые расходы, аренда, доставка</th>
              <th>Чистая Прибыль</th>
              <th>Примечание</th>
            </tr>
            <tr class="sheet-index-row">
              ${[1,2,3,4,5,6,7,8,9,10,11,12,14,15,17,18,19,20,22,23,25,26].map((item) => `<th>${item}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => renderObjectSheetRow(row)).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="9">Итого:</td>
              <td data-sheet-total="client">0 ₽</td>
              <td data-sheet-total="contractor">0 ₽</td>
              <td data-sheet-total="gross">0 ₽</td>
              <td></td>
              <td data-sheet-total="advance">0 ₽</td>
              <td data-sheet-total="tools">0 ₽</td>
              <td data-sheet-total="customer">0 ₽</td>
              <td data-sheet-total="tax">0 ₽</td>
              <td data-sheet-total="housing">0 ₽</td>
              <td data-sheet-total="laborers">0 ₽</td>
              <td data-sheet-total="unplanned">0 ₽</td>
              <td data-sheet-total="net">0 ₽</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  `;
}

function renderObjectSheetRow(index) {
  return `
    <tr data-sheet-row>
      <td><input data-field="number" value="${index}" inputmode="numeric"></td>
      <td><input data-field="contractor"></td>
      <td><textarea data-field="workName"></textarea></td>
      <td><input data-field="unit" value="м2"></td>
      <td><input data-field="plannedQty" type="number" value="0"></td>
      <td><input data-field="actualQty" type="number" value="0"></td>
      <td><input data-field="status"></td>
      <td><input data-field="clientPrice" type="number" value="0"></td>
      <td><input data-field="contractorPrice" type="number" value="0"></td>
      <td class="sheet-calculated" data-calc="clientTotal">0 ₽</td>
      <td class="sheet-calculated" data-calc="contractorTotal">0 ₽</td>
      <td class="sheet-calculated" data-calc="grossProfit">0 ₽</td>
      <td><input data-field="advanceContractor"></td>
      <td><input data-field="advanceAmount" type="number" value="0"></td>
      <td><input data-field="tools" type="number" value="0"></td>
      <td><input data-field="customerExpenses" type="number" value="0"></td>
      <td class="sheet-calculated" data-calc="tax">0 ₽</td>
      <td><input data-field="housing" type="number" value="0"></td>
      <td><input data-field="laborers" type="number" value="0"></td>
      <td><input data-field="unplanned" type="number" value="0"></td>
      <td class="sheet-calculated" data-calc="netProfit">0 ₽</td>
      <td><textarea data-field="note"></textarea></td>
    </tr>
  `;
}

function renderProjectDetailPage() {
  const project = byId(state.projects, state.selectedProjectId) || state.projects[0];
  if (!project) return '<div class="empty-state">Создайте первый объект ремонта.</div>';
  state.selectedProjectId = project.id;
  const period = ensureProjectPeriod(project.id);
  const math = projectMathForPeriod(project.id, period);
  const cashRow = analyticsEngine().getProjectCashRows(period).find((row) => row.project.id === project.id) || {
    received: 0,
    paidContractors: 0,
    paidObjectExpenses: 0,
    receivable: math.revenue,
    contractorDebt: math.contractorCost,
    objectExpenseDebt: math.directExpenses,
    cashBalance: 0,
  };
  const tabs = [
    ['overview', 'Сводка'],
    ['works', 'Работы'],
    ['expenses', 'Расходы'],
    ['payments', 'Оплаты'],
    ['finance', 'Финансы'],
  ];
  return `
    <section class="panel project-detail-panel">
      <div class="panel-header">
        <div>
          <h2>${project.name}</h2>
          <p>${project.client} · ${project.manager} · ${project.address}</p>
        </div>
        <div class="topbar-actions">
          <button class="secondary-button" data-back-project-return>Назад</button>
          <button class="secondary-button" data-edit-project="${project.id}">Править</button>
        </div>
      </div>
      <div class="grid-3">
        ${renderMetric('Выручка объекта', money(math.revenue))}
        ${renderMetric('Расходы объекта', money(math.contractorCost + math.directExpenses))}
        ${renderMetric('Прибыль объекта', money(math.netProfit), `${number(math.margin)}% маржа`, math.netProfit >= 0 ? 'good' : 'bad')}
      </div>
      <div class="grid-3 cash-mini-grid">
        ${renderMetric('Получено от заказчика', money(cashRow.received), `долг: ${money(cashRow.receivable)}`, cashRow.receivable ? 'bad' : 'good')}
        ${renderMetric('Выплачено по объекту', money(cashRow.paidContractors + cashRow.paidObjectExpenses), `долг: ${money(cashRow.contractorDebt + cashRow.objectExpenseDebt)}`)}
        ${renderMetric('Кассовый баланс', money(cashRow.cashBalance), 'приходы минус выплаты', cashRow.cashBalance >= 0 ? 'good' : 'bad')}
      </div>
      ${renderProjectPeriodControls(period)}
      <div class="tabs" style="margin-top:18px">
        ${tabs.map(([id, label]) => `<button class="tab ${state.activeDetailTab === id ? 'active' : ''}" data-detail-tab="${id}">${label}</button>`).join('')}
      </div>
      <div class="detail-tab-body">
        ${state.activeDetailTab === 'overview' ? renderProjectOverview(project, math, cashRow) : ''}
        ${state.activeDetailTab === 'works' ? renderProjectWorks(project.id, period) : ''}
        ${state.activeDetailTab === 'expenses' ? renderProjectExpenses(project.id, period) : ''}
        ${state.activeDetailTab === 'payments' ? renderProjectPayments(project.id, period) : ''}
        ${state.activeDetailTab === 'finance' ? `
        <p class="muted">${project.note}</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Показатель</th>
                <th class="right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Выручка от заказчика</td><td class="right">${money(math.revenue)}</td></tr>
              <tr><td>Стоимость исполнителей</td><td class="right">${money(math.contractorCost)}</td></tr>
              <tr><td>Объектные расходы</td><td class="right">${money(math.directExpenses)}</td></tr>
              <tr><td>Прибыль объекта</td><td class="right ${math.netProfit >= 0 ? 'profit' : 'danger'}">${money(math.netProfit)}</td></tr>
              <tr><td>Получено денег от заказчика</td><td class="right profit">${money(cashRow.received)}</td></tr>
              <tr><td>Дебиторка по объекту</td><td class="right ${cashRow.receivable ? 'danger' : 'profit'}">${money(cashRow.receivable)}</td></tr>
              <tr><td>Выплачено исполнителям</td><td class="right">${money(cashRow.paidContractors)}</td></tr>
              <tr><td>Долг исполнителям</td><td class="right ${cashRow.contractorDebt ? 'danger' : ''}">${money(cashRow.contractorDebt)}</td></tr>
              <tr><td>Кассовый баланс объекта</td><td class="right ${cashRow.cashBalance >= 0 ? 'profit' : 'danger'}">${money(cashRow.cashBalance)}</td></tr>
            </tbody>
          </table>
        </div>
        ` : ''}
      </div>
    </section>
  `;
}

function renderProjectPeriodControls(period) {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  return `
    <div class="period-controls project-period-controls">
      <select id="projectPeriodType">
        <option value="all" ${period.type === 'all' ? 'selected' : ''}>Всё время</option>
        <option value="year" ${period.type === 'year' ? 'selected' : ''}>Год</option>
        <option value="quarter" ${period.type === 'quarter' ? 'selected' : ''}>Квартал</option>
        <option value="month" ${period.type === 'month' ? 'selected' : ''}>Месяц</option>
      </select>
      ${period.type !== 'all' ? `
        <select id="projectPeriodYear">
          ${period.years.map((year) => `<option value="${escapeHtml(year)}" ${year === period.year ? 'selected' : ''}>${escapeHtml(year)} год</option>`).join('')}
        </select>
      ` : ''}
      ${period.type === 'quarter' ? `
        <select id="projectPeriodQuarter">
          ${['1', '2', '3', '4'].map((quarter) => `<option value="${quarter}" ${quarter === period.quarter ? 'selected' : ''}>${quarter} квартал</option>`).join('')}
        </select>
      ` : ''}
      ${period.type === 'month' ? `
        <select id="projectPeriodMonth">
          ${months.map((month) => `<option value="${escapeHtml(month)}" ${month === period.month ? 'selected' : ''}>${escapeHtml(month)}</option>`).join('')}
        </select>
      ` : ''}
    </div>
  `;
}

function renderProjectOverview(project, math, cashRow) {
  return `
    <div class="project-overview-grid">
      <section class="overview-block">
        <div class="overview-block-title">
          <h3>Экономика объекта</h3>
          ${renderHelp('Начисленная экономика объекта: работы, исполнители, объектные расходы и прибыль до постоянных платежей.')}
        </div>
        ${renderSummaryLine('Начислено заказчику', money(math.revenue), 'по фактическим объемам')}
        ${renderSummaryLine('Исполнители', money(math.contractorCost), 'начисленная стоимость работ')}
        ${renderSummaryLine('Объектные расходы', money(math.directExpenses), 'расходы, привязанные к объекту')}
        ${renderSummaryLine('Прибыль объекта', money(math.netProfit), `${number(math.margin)}% маржа`, math.netProfit >= 0 ? 'profit' : 'danger')}
      </section>
      <section class="overview-block">
        <div class="overview-block-title">
          <h3>Деньги</h3>
          ${renderHelp('Фактические оплаты по объекту: что реально пришло от заказчика и что уже выплачено.')}
        </div>
        ${renderSummaryLine('Получено от заказчика', money(cashRow.received), 'факт оплат', 'profit')}
        ${renderSummaryLine('Долг заказчика', money(cashRow.receivable), 'начислено минус получено', cashRow.receivable ? 'danger' : 'profit')}
        ${renderSummaryLine('Выплачено по объекту', money(cashRow.paidContractors + cashRow.paidObjectExpenses), 'исполнители + объектные платежи')}
        ${renderSummaryLine('Кассовый баланс', money(cashRow.cashBalance), 'получено минус выплачено', cashRow.cashBalance >= 0 ? 'profit' : 'danger')}
      </section>
      <section class="overview-block">
        <div class="overview-block-title">
          <h3>Управление</h3>
          ${renderHelp('Быстрый контроль статуса, сроков и заполненности объекта.')}
        </div>
        ${renderSummaryLine('Статус', projectStatusLabel(project.status), 'текущий статус объекта')}
        ${renderSummaryLine('Старт', project.startDate || '—', 'дата начала работ')}
        ${renderSummaryLine('Плановая сдача', project.dueDate || '—', 'дата, по которой считается просрочка')}
        ${renderSummaryLine('План / факт объема', `${number(math.plannedQty)} / ${number(math.actualQty)}`, 'по строкам работ')}
      </section>
    </div>
  `;
}

function renderProjectWorks(projectId, period = ensureProjectPeriod(projectId)) {
  const searchKey = `projectWorks:${projectId}`;
  const rows = projectWorkForPeriod(projectId, period)
    .filter((row) => {
      const math = workMath(row);
      return matchesSearch([math.price?.name, math.price?.category, math.price?.unit, row.contractor, row.status], searchKey);
    });
  return `
    <div class="toolbar">
      <button class="secondary-button" data-add-work="${projectId}">Добавить работу</button>
    </div>
    ${renderTableSearch(searchKey, 'Работа, исполнитель, статус')}
    ${rows.length ? `
      <div class="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Работа</th>
              <th>Исполнитель</th>
              <th class="right">План/факт</th>
              <th class="right">Заказчик</th>
              <th class="right">Прибыль</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => {
              const math = workMath(row);
              return `
                <tr>
                  <td>${math.price?.name || 'Услуга удалена'}<br><span class="muted">${math.price?.unit || ''}</span></td>
                  <td>${row.contractor}</td>
                  <td class="right">${number(row.plannedQty)} / ${number(row.actualQty)}</td>
                  <td class="right">${money(math.clientRevenue)}</td>
                  <td class="right ${math.grossProfit >= 0 ? 'profit' : 'danger'}">${money(math.grossProfit)}</td>
                  <td>${row.status}</td>
                  <td class="right">
                    <button class="ghost-button" data-edit-work="${row.id}">Править</button>
                    <button class="ghost-button danger" data-delete-work="${row.id}">Удалить</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '<div class="empty-state">Работы по объекту еще не добавлены.</div>'}
  `;
}

function renderProjectExpenses(projectId, period = ensureProjectPeriod(projectId)) {
  const searchKey = `projectExpenses:${projectId}`;
  const rows = projectExpensesForPeriod(projectId, period)
    .filter((row) => matchesSearch([row.date, row.category, row.description, row.amount], searchKey));
  return `
    <div class="toolbar">
      <button class="secondary-button" data-add-expense-project="${projectId}">Добавить расход</button>
    </div>
    ${renderTableSearch(searchKey, 'Дата, категория, описание, сумма')}
    ${renderExpenseTable(rows)}
  `;
}

function renderProjectPayments(projectId, period = ensureProjectPeriod(projectId)) {
  const searchKey = `projectPayments:${projectId}`;
  const rows = projectPaymentsForPeriod(projectId, period)
    .filter((row) => matchesSearch([row.date, paymentTypeLabel(row.type), row.counterparty, row.category, row.description, row.amount], searchKey));
  return `
    <div class="toolbar">
      <button class="secondary-button" data-add-payment-project="${projectId}">Добавить платеж</button>
    </div>
    ${renderTableSearch(searchKey, 'Дата, тип, контрагент, назначение')}
    ${renderPaymentTable(rows)}
  `;
}

function renderPricebook() {
  const rows = state.priceItems
    .filter((item) => matchesSearch([item.category, item.name, item.unit, item.clientPrice, item.contractorPrice], 'pricebook'));
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Прайс услуг</h2>
          <p>Источник для смет: клиентская цена, цена исполнителя и единица измерения.</p>
        </div>
      </div>
      ${renderTableSearch('pricebook', 'Категория, услуга, единица, цена')}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Категория</th>
              <th>Услуга</th>
              <th>Ед.</th>
              <th class="right">Цена заказчика</th>
              <th class="right">Цена исполнителя</th>
              <th class="right">Маржа / ед.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((item) => `
              <tr>
                <td>${item.category}</td>
                <td>${item.name}</td>
                <td>${item.unit}</td>
                <td class="right">${money(item.clientPrice)}</td>
                <td class="right">${money(item.contractorPrice)}</td>
                <td class="right">${money(item.clientPrice - item.contractorPrice)}</td>
                <td class="right"><button class="ghost-button" data-edit-price="${item.id}">Править</button></td>
              </tr>
            `).join('') || '<tr><td colspan="7" class="muted">Ничего не найдено.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderExpenses() {
  const rows = state.expenses
    .filter((row) => {
      const project = byId(state.projects, row.projectId);
      return matchesSearch([row.date, project?.name, row.category, row.description, row.amount], 'expenses');
    });
  return `
    ${renderSummary()}
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Все объектные расходы</h2>
          <p>Расходники, проживание, разнорабочие, налоги и внеплановые траты.</p>
        </div>
      </div>
      ${renderTableSearch('expenses', 'Дата, объект, категория, описание, сумма')}
      ${renderExpenseTable(rows)}
    </section>
  `;
}

function renderExpenseTable(rows) {
  if (!rows.length) return '<div class="empty-state">Расходы еще не добавлены.</div>';
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Объект</th>
            <th>Категория</th>
            <th>Описание</th>
            <th class="right">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${row.date}</td>
              <td>${byId(state.projects, row.projectId)?.name || 'Объект удален'}</td>
              <td>${row.category}</td>
              <td>${row.description}</td>
              <td class="right">${money(row.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPayments() {
  const period = ensureAnalyticsPeriod();
  const cash = getAnalyticsCashFlow(period);
  const searchKey = 'payments';
  const activeView = state.paymentsView === 'objects' ? 'objects' : 'ledger';
  const projectRows = analyticsEngine().getProjectCashRows(period)
    .filter((row) => matchesSearch([row.project.name, row.project.client, row.project.manager, row.received, row.receivable, row.contractorDebt], searchKey));
  const paymentRows = cash.rows
    .map((row) => row.payment)
    .filter((payment) => matchesSearch([
      payment.date,
      paymentTypeLabel(payment.type),
      byId(state.projects, payment.projectId)?.name,
      payment.counterparty,
      payment.category,
      payment.description,
      payment.amount,
    ], searchKey));
  const receivable = projectRows.reduce((sum, row) => sum + row.receivable, 0);
  const contractorDebt = projectRows.reduce((sum, row) => sum + row.contractorDebt, 0);

  return `
    <div class="summary-grid">
      ${renderMetric('Пришло денег', money(cash.inflow), getAnalyticsPeriodLabel(period))}
      ${renderMetric('Ушло денег', money(cash.outflow), 'фактические платежи')}
      ${renderMetric('Чистый поток', money(cash.netCashFlow), cash.netCashFlow >= 0 ? 'денег стало больше' : 'кассовый минус', cash.netCashFlow >= 0 ? 'good' : 'bad')}
      ${renderMetric('Дебиторка', money(receivable), `долг заказчиков, исполнителям: ${money(contractorDebt)}`, receivable ? 'bad' : 'good')}
    </div>
    <section class="panel payments-panel">
      <div class="panel-header">
        <div>
          <h2>Ручной журнал оплат</h2>
          <p>Фактические приходы и выплаты вносятся вручную, без зависимости от выгрузки из 1С.</p>
        </div>
        <button class="primary-button" data-add-payment>Новый платеж</button>
      </div>
      ${renderAnalyticsPeriodControls(period)}
      ${renderTableSearch(searchKey, 'Дата, объект, контрагент, назначение')}
      <div class="tabs payments-view-tabs">
        <button class="tab ${activeView === 'ledger' ? 'active' : ''}" data-payments-view="ledger">Журнал оплат</button>
        <button class="tab ${activeView === 'objects' ? 'active' : ''}" data-payments-view="objects">Оплаты по объектам</button>
      </div>
      <div class="payments-grid">
        ${activeView === 'ledger' ? `
          <div class="payments-column">
            ${renderPaymentLedger(paymentRows)}
          </div>
        ` : `
          <div class="payments-column">
            <p class="muted compact-copy">Начисленная выручка сравнивается с фактическими поступлениями и выплатами.</p>
            ${renderProjectCashCards(projectRows)}
          </div>
        `}
      </div>
    </section>
  `;
}

function renderPaymentLedger(rows) {
  if (!rows.length) return '<div class="empty-state">Платежи за выбранный период не добавлены.</div>';
  const sorted = rows.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  return `
    <div class="payment-ledger">
      ${sorted.map((row) => {
        const inflow = isPaymentInflow(row.type);
        return `
          <article class="payment-card">
            <div class="payment-card-main">
              <div class="payment-card-date">
                <strong>${row.date || '—'}</strong>
                <span class="severity ${inflow ? '' : 'medium'}">${paymentTypeLabel(row.type)}</span>
              </div>
              <div class="payment-card-object">
                <strong>${byId(state.projects, row.projectId)?.name || 'Без объекта'}</strong>
                <span>${row.counterparty || 'Контрагент не указан'}</span>
              </div>
              <div class="payment-card-purpose">
                <strong>${row.category || 'Назначение не указано'}</strong>
                <span>${row.description || 'Без комментария'}</span>
              </div>
              <div class="payment-card-amount ${inflow ? 'profit' : 'danger'}">${inflow ? '+' : '-'}${money(row.amount)}</div>
            </div>
            <div class="payment-card-actions">
              <button class="ghost-button" data-edit-payment="${row.id}">Править</button>
              <button class="ghost-button danger" data-delete-payment="${row.id}">Удалить</button>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderProjectCashCards(rows) {
  if (!rows.length) return '<div class="empty-state">Нет объектов за выбранный период.</div>';
  return `
    <div class="cash-object-list">
      ${rows.map((row) => `
        <article class="cash-object-card">
          <div>
            <strong>${row.project.name}</strong>
            <span class="muted">Начислено ${money(row.math.revenue)}</span>
          </div>
          <div class="cash-object-metrics">
            <span><small>Получено</small><strong class="profit">${money(row.received)}</strong></span>
            <span><small>Долг заказчика</small><strong class="${row.receivable ? 'danger' : 'profit'}">${money(row.receivable)}</strong></span>
            <span><small>Долг исполн.</small><strong class="${row.contractorDebt ? 'danger' : ''}">${money(row.contractorDebt)}</strong></span>
          </div>
          <button class="secondary-button compact-button" data-open-project="${row.project.id}">Открыть</button>
        </article>
      `).join('')}
    </div>
  `;
}

function renderPaymentTable(rows) {
  if (!rows.length) return '<div class="empty-state">Платежи за выбранный период не добавлены.</div>';
  const sorted = rows.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  return `
    <div class="table-wrap">
      <table class="payment-table">
        <colgroup>
          <col class="payment-date">
          <col class="payment-type">
          <col class="payment-project">
          <col class="payment-counterparty">
          <col class="payment-purpose">
          <col class="payment-amount">
          <col class="payment-actions">
        </colgroup>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип</th>
            <th>Объект</th>
            <th>Контрагент</th>
            <th>Назначение</th>
            <th class="right">Сумма</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((row) => `
            <tr>
              <td>${row.date || '—'}</td>
              <td><span class="severity ${isPaymentInflow(row.type) ? '' : 'medium'}">${paymentTypeLabel(row.type)}</span></td>
              <td>${byId(state.projects, row.projectId)?.name || 'Без объекта'}</td>
              <td>${row.counterparty || '—'}</td>
              <td><strong>${row.category || '—'}</strong><br><span class="muted">${row.description || ''}</span></td>
              <td class="right ${isPaymentInflow(row.type) ? 'profit' : 'danger'}">${isPaymentInflow(row.type) ? '+' : '-'}${money(row.amount)}</td>
              <td class="right payment-row-actions">
                <button class="ghost-button" data-edit-payment="${row.id}">Править</button>
                <button class="ghost-button danger" data-delete-payment="${row.id}">Удалить</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderFixedCosts() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Постоянные платежи</h2>
          <p>Ежемесячные расходы компании, которые уменьшают итоговую прибыль.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Месяц</th>
              <th>Категория</th>
              <th class="right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${state.fixedCosts.map((row) => `
              <tr>
                <td>${row.month}</td>
                <td>${row.category}</td>
                <td class="right">${money(row.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderFixedCostsV2() {
  const periodType = getFixedCostPeriodType();
  const selectedYear = getFixedCostSelectedYear();
  const selectedMonth = getFixedCostSelectedMonth();
  const yearOptions = getFixedCostYears();
  const monthOptions = getAvailableMonthNamesForYear(selectedYear);
  const rows = getFixedCostsForPeriod();
  const visibleRows = rows.filter((row) => {
    const items = getFixedCostItems(row);
    return matchesSearch([
      row.month,
      row.category,
      row.amount,
      ...items.flatMap((item) => [item.name, item.role, item.amount]),
    ], 'fixedCosts');
  });
  const total = getFixedCostTotal(rows);
  const largest = rows.slice().sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];

  return `
    <div class="summary-grid">
      ${renderMetric('Период', getFixedCostPeriodLabel() || 'Нет данных', `${rows.length} статей расходов`)}
      ${renderMetric('Всего постоянных платежей', money(total), 'за выбранный период')}
      ${renderMetric('Крупнейшая статья', largest?.category || 'Нет данных', largest ? money(largest.amount) : '')}
      ${renderMetric('Средняя статья', money(rows.length ? total / rows.length : 0), 'по выбранному периоду')}
    </div>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Постоянные платежи</h2>
          <p>Таблица расходов по категориям. В каждой строке видно количество позиций в расшифровке, внутрь статьи можно провалиться.</p>
        </div>
        <div class="period-controls">
          <select id="fixedCostPeriodType">
            <option value="month" ${periodType === 'month' ? 'selected' : ''}>Месяц</option>
            <option value="year" ${periodType === 'year' ? 'selected' : ''}>Год</option>
          </select>
          <select id="fixedCostYearSelect">
            ${yearOptions.map((year) => `<option value="${escapeHtml(year)}" ${year === selectedYear ? 'selected' : ''}>${escapeHtml(year)} год</option>`).join('')}
          </select>
          ${periodType === 'month' ? `
            <select id="fixedCostMonthSelect">
              ${monthOptions.map((month) => `<option value="${escapeHtml(month)}" ${month === selectedMonth ? 'selected' : ''}>${escapeHtml(month)}</option>`).join('')}
            </select>
          ` : ''}
        </div>
      </div>

      ${renderTableSearch('fixedCosts', 'Период, статья, человек, поставщик, сумма')}
      <div class="table-wrap fixed-costs-table">
        <table>
          <thead>
            <tr>
              <th>Период</th>
              <th>Категория</th>
              <th>Расшифровка</th>
              <th class="right">Сумма</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${visibleRows.length ? visibleRows.map(renderFixedCostTableRow).join('') : `
              <tr><td colspan="5" class="muted">За выбранный период платежи не найдены.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderFixedCostTableRow(row) {
  const items = getFixedCostItems(row);
  const itemsTotal = getFixedCostTotal(items);
  const diff = Number(row.amount || 0) - itemsTotal;
  return `
    <tr>
      <td>${row.month}</td>
      <td><strong>${row.category}</strong></td>
      <td>${items.length} позиций в расшифровке${Math.abs(diff) > 1 ? ` · расхождение ${money(diff)}` : ''}</td>
      <td class="right">${money(row.amount)}</td>
      <td class="right"><button class="secondary-button" data-open-fixed-cost="${row.id}">Открыть</button></td>
    </tr>
  `;
}

function renderFixedCostRow(row, selectedId) {
  const items = getFixedCostItems(row);
  const itemsTotal = getFixedCostTotal(items);
  const diff = Number(row.amount || 0) - itemsTotal;
  return `
    <button class="fixed-cost-row ${row.id === selectedId ? 'active' : ''}" data-fixed-cost-id="${row.id}">
      <span>
        <strong>${row.category}</strong>
        <small>${items.length} позиций в расшифровке</small>
      </span>
      <span class="fixed-cost-row-amount">
        ${money(row.amount)}
        ${Math.abs(diff) > 1 ? `<small class="danger">расхождение ${money(diff)}</small>` : '<small>сходится</small>'}
      </span>
    </button>
  `;
}

function renderFixedCostDetail(cost) {
  const items = getFixedCostItems(cost);
  const total = getFixedCostTotal(items);

  return `
    <div class="panel-header">
      <div>
        <h3>${cost.category}</h3>
        <p>${cost.month} · ${money(cost.amount)}</p>
      </div>
      <span class="status active">${items.length} строк</span>
    </div>
    <div class="table-wrap fixed-cost-detail-table">
      <table>
        <thead>
          <tr>
            <th>Кому / поставщик</th>
            <th>Расшифровка</th>
            <th class="right">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.role || ''}</td>
              <td class="right">${money(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Итого по расшифровке</td>
            <td class="right">${money(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function renderFixedCostDetailPage() {
  const cost = state.fixedCosts.find((item) => item.id === state.selectedFixedCostId) || state.fixedCosts[0];
  if (!cost) {
    return '<section class="panel"><div class="empty-state">Платёж не найден.</div></section>';
  }
  const items = getFixedCostItems(cost);
  const total = getFixedCostTotal(items);

  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>${cost.category}</h2>
          <p>${cost.month} · ${items.length} позиций в расшифровке</p>
        </div>
        <div class="topbar-actions">
          <button class="secondary-button" data-back-fixed-costs>К платежам</button>
        </div>
      </div>

      <div class="summary-grid">
        ${renderMetric('Период', cost.month)}
        ${renderMetric('Сумма статьи', money(cost.amount))}
        ${renderMetric('Расшифровка', money(total), `${items.length} позиций`)}
        ${renderMetric('Контроль', Math.abs(Number(cost.amount || 0) - total) > 1 ? 'Есть расхождение' : 'Сходится', Math.abs(Number(cost.amount || 0) - total) > 1 ? money(Number(cost.amount || 0) - total) : '')}
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Кому / поставщик</th>
              <th>Расшифровка</th>
              <th class="right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.role || ''}</td>
                <td class="right">
                  <input class="money-input" data-fixed-cost-item-amount="${index}" type="number" value="${Number(item.amount || 0)}">
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">Итого</td>
              <td class="right" data-fixed-cost-detail-total>${money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="form-actions">
        <button class="primary-button" data-save-fixed-cost-detail="${cost.id}">Сохранить изменения</button>
      </div>
    </section>
  `;
}

function renderOverview() {
  const math = companyMath();
  return `
    ${renderSummary()}
    <div class="grid-2">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Прибыль по объектам</h2>
            <p>Быстро показывает, какие объекты тянут компанию вверх или вниз.</p>
          </div>
        </div>
        <div class="chart-box"><canvas id="projectProfitChart"></canvas></div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Структура расходов</h2>
            <p>Исполнители, объектные расходы и постоянные платежи.</p>
          </div>
        </div>
        <div class="chart-box"><canvas id="costChart"></canvas></div>
      </section>
    </div>
    <section class="panel" style="margin-top:18px">
      <div class="panel-header">
        <div>
          <h2>Контрольная таблица объектов</h2>
          <p>Операционная таблица для управленческого решения.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Объект</th>
              <th>Статус</th>
              <th class="right">Выручка</th>
              <th class="right">Себестоимость</th>
              <th class="right">Прибыль</th>
              <th class="right">Маржа</th>
            </tr>
          </thead>
          <tbody>
            ${math.projects.map(({ project, math: item }) => `
              <tr>
                <td>${project.name}</td>
                <td>${projectStatusLabel(project.status)}</td>
                <td class="right">${money(item.revenue)}</td>
                <td class="right">${money(item.contractorCost + item.directExpenses)}</td>
                <td class="right ${item.netProfit >= 0 ? 'profit' : 'danger'}">${money(item.netProfit)}</td>
                <td class="right">${number(item.margin)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderProfitability() {
  const rows = state.workItems.map((row) => ({ row, math: workMath(row), project: byId(state.projects, row.projectId) }));
  rows.sort((a, b) => b.math.grossProfit - a.math.grossProfit);
  return `
    <div class="grid-2">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Маржинальность видов работ</h2>
            <p>Сравнение по фактическим объемам и разнице цен.</p>
          </div>
        </div>
        <div class="chart-box"><canvas id="workMarginChart"></canvas></div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Риски</h2>
            <p>Что стоит контролировать до закрытия объекта.</p>
          </div>
        </div>
        <div class="object-list">
          <article class="object-card">
            <h3>Низкая маржа</h3>
            <p class="muted">Объекты ниже 15% требуют отдельной проверки расходов и цен исполнителей.</p>
          </article>
          <article class="object-card">
            <h3>План-факт объемов</h3>
            <p class="muted">Перерасход фактического объема без корректировки сметы съедает прибыль.</p>
          </article>
          <article class="object-card">
            <h3>Постоянные платежи</h3>
            <p class="muted">В MVP они списываются на компанию целиком, не распределяются по объектам.</p>
          </article>
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:18px">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Работа</th>
              <th>Объект</th>
              <th class="right">Факт</th>
              <th class="right">Выручка</th>
              <th class="right">Стоимость исполнителя</th>
              <th class="right">Валовая прибыль</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(({ row, math, project }) => `
              <tr>
                <td>${math.price?.name || 'Услуга удалена'}</td>
                <td>${project?.name || 'Объект удален'}</td>
                <td class="right">${number(row.actualQty)} ${math.price?.unit || ''}</td>
                <td class="right">${money(math.clientRevenue)}</td>
                <td class="right">${money(math.contractorCost)}</td>
                <td class="right ${math.grossProfit >= 0 ? 'profit' : 'danger'}">${money(math.grossProfit)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function bindPageEvents() {
  const analyticsPeriodType = document.getElementById('analyticsPeriodType');
  if (analyticsPeriodType) {
    analyticsPeriodType.addEventListener('change', () => {
      state.analyticsPeriodType = analyticsPeriodType.value;
      saveState();
      render();
    });
  }
  const analyticsPeriodYear = document.getElementById('analyticsPeriodYear');
  if (analyticsPeriodYear) {
    analyticsPeriodYear.addEventListener('change', () => {
      state.analyticsPeriodYear = analyticsPeriodYear.value;
      saveState();
      render();
    });
  }
  const analyticsPeriodQuarter = document.getElementById('analyticsPeriodQuarter');
  if (analyticsPeriodQuarter) {
    analyticsPeriodQuarter.addEventListener('change', () => {
      state.analyticsPeriodQuarter = analyticsPeriodQuarter.value;
      saveState();
      render();
    });
  }
  const analyticsPeriodMonth = document.getElementById('analyticsPeriodMonth');
  if (analyticsPeriodMonth) {
    analyticsPeriodMonth.addEventListener('change', () => {
      state.analyticsPeriodMonth = analyticsPeriodMonth.value;
      saveState();
      render();
    });
  }
  document.querySelectorAll('[data-analytics-setting]').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.dataset.analyticsSetting;
      getAnalyticsSettings()[key] = Number(input.value || 0);
      saveState();
      render();
    });
  });
  const projectPeriodType = document.getElementById('projectPeriodType');
  if (projectPeriodType) {
    projectPeriodType.addEventListener('change', () => {
      state.projectPeriodType = projectPeriodType.value;
      saveState();
      render();
    });
  }
  const projectPeriodYear = document.getElementById('projectPeriodYear');
  if (projectPeriodYear) {
    projectPeriodYear.addEventListener('change', () => {
      state.projectPeriodYear = projectPeriodYear.value;
      saveState();
      render();
    });
  }
  const projectPeriodQuarter = document.getElementById('projectPeriodQuarter');
  if (projectPeriodQuarter) {
    projectPeriodQuarter.addEventListener('change', () => {
      state.projectPeriodQuarter = projectPeriodQuarter.value;
      saveState();
      render();
    });
  }
  const projectPeriodMonth = document.getElementById('projectPeriodMonth');
  if (projectPeriodMonth) {
    projectPeriodMonth.addEventListener('change', () => {
      state.projectPeriodMonth = projectPeriodMonth.value;
      saveState();
      render();
    });
  }
  const fixedCostPeriodType = document.getElementById('fixedCostPeriodType');
  if (fixedCostPeriodType) {
    fixedCostPeriodType.addEventListener('change', () => {
      state.fixedCostPeriodType = fixedCostPeriodType.value;
      saveState();
      render();
    });
  }
  const fixedCostYearSelect = document.getElementById('fixedCostYearSelect');
  if (fixedCostYearSelect) {
    fixedCostYearSelect.addEventListener('change', () => {
      state.fixedCostYear = fixedCostYearSelect.value;
      const months = getAvailableMonthNamesForYear(state.fixedCostYear);
      if (!months.includes(state.fixedCostMonth)) {
        state.fixedCostMonth = months[0] || 'Январь';
      }
      saveState();
      render();
    });
  }
  const fixedCostMonthSelect = document.getElementById('fixedCostMonthSelect');
  if (fixedCostMonthSelect) {
    fixedCostMonthSelect.addEventListener('change', () => {
      state.fixedCostMonth = fixedCostMonthSelect.value;
      saveState();
      render();
    });
  }
  document.querySelectorAll('[data-open-fixed-cost]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedFixedCostId = button.dataset.openFixedCost;
      state.activePage = 'fixedCostDetail';
      saveState();
      render();
    });
  });
  document.querySelectorAll('[data-back-fixed-costs]').forEach((button) => {
    button.addEventListener('click', () => setPage('fixedCosts'));
  });
  document.querySelectorAll('[data-fixed-cost-item-amount]').forEach((input) => {
    input.addEventListener('input', updateFixedCostDetailTotal);
  });
  document.querySelectorAll('[data-save-fixed-cost-detail]').forEach((button) => {
    button.addEventListener('click', () => saveFixedCostDetail(button.dataset.saveFixedCostDetail));
  });
  const objectSearch = document.getElementById('objectSearch');
  if (objectSearch) {
    objectSearch.addEventListener('input', () => {
      getObjectFilters().search = objectSearch.value;
      saveState();
      render();
      restoreSearchFocus('#objectSearch');
    });
  }
  document.querySelectorAll('[data-table-search]').forEach((input) => {
    input.addEventListener('input', () => {
      state.tableSearches ||= {};
      state.tableSearches[input.dataset.tableSearch] = input.value;
      saveState();
      render();
      restoreSearchFocus(`[data-table-search="${cssEscape(input.dataset.tableSearch)}"]`);
    });
  });
  document.querySelectorAll('[data-payments-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.paymentsView = button.dataset.paymentsView;
      saveState();
      render();
    });
  });
  document.querySelectorAll('[data-sort-projects]').forEach((button) => {
    button.addEventListener('click', () => {
      const filters = getObjectFilters();
      const nextSort = button.dataset.sortProjects;
      if (filters.sortBy === nextSort) {
        filters.sortDir = filters.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        filters.sortBy = nextSort;
        filters.sortDir = 'desc';
      }
      saveState();
      render();
    });
  });
  document.querySelectorAll('[data-sheet-row] input, [data-sheet-row] textarea').forEach((input) => {
    input.addEventListener('input', updateObjectSheetTotals);
  });
  document.querySelectorAll('[data-save-object-sheet]').forEach((button) => {
    button.addEventListener('click', saveObjectSheet);
  });
  document.querySelectorAll('[data-open-project]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedProjectId = button.dataset.openProject;
      state.projectReturnPage = state.activePage === 'projectDetail' ? (state.projectReturnPage || 'objects') : state.activePage;
      state.activePage = 'projectDetail';
      state.activeDetailTab = 'overview';
      saveState();
      render();
    });
  });
  document.querySelectorAll('[data-back-objects]').forEach((button) => {
    button.addEventListener('click', () => setPage('objects'));
  });
  document.querySelectorAll('[data-back-project-return]').forEach((button) => {
    button.addEventListener('click', () => setPage(state.projectReturnPage || 'objects'));
  });
  document.querySelectorAll('[data-detail-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeDetailTab = button.dataset.detailTab;
      saveState();
      render();
    });
  });
  document.querySelectorAll('[data-edit-project]').forEach((button) => {
    button.addEventListener('click', () => openProjectForm(button.dataset.editProject));
  });
  document.querySelectorAll('[data-edit-price]').forEach((button) => {
    button.addEventListener('click', () => openPriceForm(button.dataset.editPrice));
  });
  document.querySelectorAll('[data-add-work]').forEach((button) => {
    button.addEventListener('click', () => openWorkForm(button.dataset.addWork));
  });
  document.querySelectorAll('[data-edit-work]').forEach((button) => {
    button.addEventListener('click', () => openWorkForm(null, button.dataset.editWork));
  });
  document.querySelectorAll('[data-delete-work]').forEach((button) => {
    button.addEventListener('click', () => deleteWorkItem(button.dataset.deleteWork));
  });
  document.querySelectorAll('[data-add-expense-project]').forEach((button) => {
    button.addEventListener('click', () => openExpenseForm(button.dataset.addExpenseProject));
  });
  document.querySelectorAll('[data-add-payment], [data-add-payment-project]').forEach((button) => {
    button.addEventListener('click', () => openPaymentForm(null, button.dataset.addPaymentProject || ''));
  });
  document.querySelectorAll('[data-edit-payment]').forEach((button) => {
    button.addEventListener('click', () => openPaymentForm(button.dataset.editPayment));
  });
  document.querySelectorAll('[data-delete-payment]').forEach((button) => {
    button.addEventListener('click', () => deletePayment(button.dataset.deletePayment));
  });
  updateObjectSheetTotals();
}

function updateFixedCostDetailTotal() {
  const total = [...document.querySelectorAll('[data-fixed-cost-item-amount]')]
    .reduce((sum, input) => sum + Number(input.value || 0), 0);
  const target = document.querySelector('[data-fixed-cost-detail-total]');
  if (target) target.textContent = money(total);
}

function restoreSearchFocus(selector) {
  requestAnimationFrame(() => {
    const next = document.querySelector(selector);
    if (!next) return;
    next.focus();
    const length = next.value.length;
    next.setSelectionRange(length, length);
  });
}

function cssEscape(value) {
  return window.CSS?.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');
}

function saveFixedCostDetail(costId) {
  const cost = state.fixedCosts.find((item) => item.id === costId);
  if (!cost) return;
  cost.items = getFixedCostItems(cost).map((item, index) => ({
    ...item,
    amount: Number(document.querySelector(`[data-fixed-cost-item-amount="${index}"]`)?.value || 0),
  }));
  cost.amount = getFixedCostTotal(cost.items);
  saveState();
  render();
}

function readSheetNumber(row, field) {
  return Number(row.querySelector(`[data-field="${field}"]`)?.value || 0);
}

function readSheetText(row, field) {
  return String(row.querySelector(`[data-field="${field}"]`)?.value || '').trim();
}

function setSheetCalc(row, name, value) {
  const target = row.querySelector(`[data-calc="${name}"]`);
  if (target) target.textContent = money(value);
}

function updateObjectSheetTotals() {
  const rows = [...document.querySelectorAll('[data-sheet-row]')];
  const totals = {
    client: 0,
    contractor: 0,
    gross: 0,
    advance: 0,
    tools: 0,
    customer: 0,
    tax: 0,
    housing: 0,
    laborers: 0,
    unplanned: 0,
    net: 0,
  };

  rows.forEach((row) => {
    const actualQty = readSheetNumber(row, 'actualQty');
    const clientTotal = actualQty * readSheetNumber(row, 'clientPrice');
    const contractorTotal = actualQty * readSheetNumber(row, 'contractorPrice');
    const grossProfit = clientTotal - contractorTotal;
    const tax = clientTotal * 0.11;
    const advance = readSheetNumber(row, 'advanceAmount');
    const tools = readSheetNumber(row, 'tools');
    const customer = readSheetNumber(row, 'customerExpenses');
    const housing = readSheetNumber(row, 'housing');
    const laborers = readSheetNumber(row, 'laborers');
    const unplanned = readSheetNumber(row, 'unplanned');
    const netProfit = grossProfit - advance - tools - customer - tax - housing - laborers - unplanned;

    setSheetCalc(row, 'clientTotal', clientTotal);
    setSheetCalc(row, 'contractorTotal', contractorTotal);
    setSheetCalc(row, 'grossProfit', grossProfit);
    setSheetCalc(row, 'tax', tax);
    setSheetCalc(row, 'netProfit', netProfit);

    totals.client += clientTotal;
    totals.contractor += contractorTotal;
    totals.gross += grossProfit;
    totals.advance += advance;
    totals.tools += tools;
    totals.customer += customer;
    totals.tax += tax;
    totals.housing += housing;
    totals.laborers += laborers;
    totals.unplanned += unplanned;
    totals.net += netProfit;
  });

  Object.entries(totals).forEach(([key, value]) => {
    const target = document.querySelector(`[data-sheet-total="${key}"]`);
    if (target) target.textContent = money(value);
  });
}

function saveObjectSheet() {
  const projectId = crypto.randomUUID();
  const project = {
    id: projectId,
    name: document.getElementById('sheetProjectName')?.value.trim() || 'Новый объект ремонта',
    client: document.getElementById('sheetProjectClient')?.value.trim() || 'Клиент не указан',
    address: document.getElementById('sheetProjectAddress')?.value.trim() || 'Адрес не указан',
    manager: document.getElementById('sheetProjectManager')?.value.trim() || 'Руководитель не указан',
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    status: 'active',
    note: 'Создано из общей сводной ведомости.',
  };

  const rows = [...document.querySelectorAll('[data-sheet-row]')]
    .map((row) => {
      const workName = readSheetText(row, 'workName');
      const actualQty = readSheetNumber(row, 'actualQty');
      const clientPrice = readSheetNumber(row, 'clientPrice');
      const contractorPrice = readSheetNumber(row, 'contractorPrice');
      return {
        row,
        workName,
        actualQty,
        clientPrice,
        contractorPrice,
      };
    })
    .filter((item) => item.workName || item.actualQty || item.clientPrice || item.contractorPrice);

  if (!rows.length) {
    alert('Добавьте хотя бы одну строку работ в ведомость.');
    return;
  }

  state.projects.unshift(project);

  rows.forEach(({ row, workName, actualQty, clientPrice, contractorPrice }) => {
    const priceItemId = crypto.randomUUID();
    const accountingDate = new Date().toISOString().slice(0, 10);
    state.priceItems.unshift({
      id: priceItemId,
      name: workName || 'Работа без названия',
      unit: readSheetText(row, 'unit') || 'м2',
      clientPrice,
      contractorPrice,
      category: 'Объектная ведомость',
    });
    state.workItems.push({
      id: crypto.randomUUID(),
      projectId,
      priceItemId,
      contractor: readSheetText(row, 'contractor') || 'Исполнитель не указан',
      plannedQty: readSheetNumber(row, 'plannedQty'),
      actualQty,
      status: readSheetText(row, 'status') || 'В работе',
      date: accountingDate,
    });

    const taxAmount = actualQty * clientPrice * 0.11;
    const expenseMap = [
      ['advanceAmount', 'Аванс Исполнитель', readSheetText(row, 'advanceContractor')],
      ['tools', 'Расходники инструмент', ''],
      ['customerExpenses', 'Расходы на Заказчика', ''],
      [taxAmount, 'Налоги', '11% по строке ведомости'],
      ['housing', 'Проживание', ''],
      ['laborers', 'Разнорабочие', ''],
      ['unplanned', 'Внеплановые расходы, аренда, доставка', ''],
    ];
    expenseMap.forEach(([field, category, suffix]) => {
      const amount = typeof field === 'number' ? field : readSheetNumber(row, field);
      if (amount > 0) {
        state.expenses.push({
          id: crypto.randomUUID(),
          projectId,
          date: accountingDate,
          category,
          description: [workName, suffix].filter(Boolean).join(' · '),
          amount,
        });
      }
    });
  });

  state.selectedProjectId = projectId;
  state.projectReturnPage = 'objects';
  state.activeDetailTab = 'overview';
  saveState();
  setPage('projectDetail');
}

function renderCharts() {
  if (document.getElementById('projectProfitChart')) {
    const rows = companyMath().projects;
    addChart('projectProfitChart', {
      type: 'bar',
      data: {
        labels: rows.map(({ project }) => shortName(project.name)),
        datasets: [{ label: 'Прибыль', data: rows.map(({ math }) => math.netProfit), backgroundColor: '#111111' }],
      },
      options: chartOptions({ currency: true }),
    });
  }
  if (document.getElementById('costChart')) {
    const math = companyMath();
    addChart('costChart', {
      type: 'doughnut',
      data: {
        labels: ['Исполнители', 'Объектные расходы', 'Постоянные платежи'],
        datasets: [{ data: [math.contractorCost, math.directExpenses, math.fixedCosts], backgroundColor: ['#111111', '#777777', '#d8d8d8'] }],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }
  if (document.getElementById('workMarginChart')) {
    const rows = state.workItems.map((row) => ({ row, math: workMath(row) })).sort((a, b) => b.math.grossProfit - a.math.grossProfit);
    addChart('workMarginChart', {
      type: 'bar',
      data: {
        labels: rows.map(({ math }) => shortName(math.price?.category || 'Работа')),
        datasets: [{ label: 'Валовая прибыль', data: rows.map(({ math }) => math.grossProfit), backgroundColor: '#111111' }],
      },
      options: chartOptions({ currency: true }),
    });
  }
}

function addChart(id, config) {
  const node = document.getElementById(id);
  if (!node || !window.Chart) return;
  chartInstances.set(id, new Chart(node, config));
}

function destroyCharts() {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances.clear();
}

function chartOptions({ currency = false } = {}) {
  return {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: {
          callback: (value) => (currency ? money(value).replace(',00', '') : value),
        },
      },
      x: { ticks: { maxRotation: 0, minRotation: 0 } },
    },
  };
}

function shortName(value) {
  const text = String(value || '');
  return text.length > 24 ? `${text.slice(0, 23)}…` : text;
}

function openProjectForm(projectId = null) {
  const project = projectId ? byId(state.projects, projectId) : null;
  openForm(project ? 'Редактировать объект' : 'Новый объект', [
    field('name', 'Название', project?.name || '', 'text', true, 'full'),
    field('client', 'Клиент', project?.client || ''),
    field('manager', 'Руководитель объекта', project?.manager || ''),
    field('address', 'Адрес', project?.address || '', 'text', true, 'full'),
    field('startDate', 'Дата старта', project?.startDate || '', 'date'),
    field('dueDate', 'Плановая сдача', project?.dueDate || '', 'date'),
    selectField('status', 'Статус', project?.status || 'active', [
      ['active', 'В работе'],
      ['risk', 'Риск'],
      ['closed', 'Закрыт'],
    ]),
    field('note', 'Комментарий', project?.note || '', 'textarea', false, 'full'),
  ], (data) => {
    if (project) Object.assign(project, data);
    else {
      state.projects.unshift({ id: crypto.randomUUID(), ...data });
      state.selectedProjectId = state.projects[0].id;
    }
    saveState();
    render();
  });
}

function openPriceForm(priceId = null) {
  const item = priceId ? byId(state.priceItems, priceId) : null;
  openForm(item ? 'Редактировать услугу' : 'Новая услуга', [
    field('category', 'Категория', item?.category || ''),
    field('unit', 'Ед. измерения', item?.unit || 'м2'),
    field('name', 'Услуга', item?.name || '', 'text', true, 'full'),
    field('clientPrice', 'Цена заказчика', item?.clientPrice || 0, 'number'),
    field('contractorPrice', 'Цена исполнителя', item?.contractorPrice || 0, 'number'),
  ], (data) => {
    data.clientPrice = Number(data.clientPrice || 0);
    data.contractorPrice = Number(data.contractorPrice || 0);
    if (item) Object.assign(item, data);
    else state.priceItems.unshift({ id: crypto.randomUUID(), ...data });
    saveState();
    render();
  });
}

function openWorkForm(projectId, workId = null) {
  const work = workId ? byId(state.workItems, workId) : null;
  const targetProjectId = projectId || work?.projectId || state.selectedProjectId;
  openForm(work ? 'Редактировать работу' : 'Добавить работу в объект', [
    selectField('priceItemId', 'Услуга из прайса', work?.priceItemId || state.priceItems[0]?.id || '', state.priceItems.map((item) => [item.id, `${item.category}: ${item.name}`]), 'full'),
    field('contractor', 'Исполнитель', work?.contractor || ''),
    field('status', 'Статус', work?.status || 'В работе'),
    field('plannedQty', 'Проектный объем', work?.plannedQty || 0, 'number'),
    field('actualQty', 'Фактический объем', work?.actualQty || 0, 'number'),
    field('date', 'Дата учета', work?.date || byId(state.projects, targetProjectId)?.startDate || new Date().toISOString().slice(0, 10), 'date'),
  ], (data) => {
    const payload = {
      projectId: targetProjectId,
      priceItemId: data.priceItemId,
      contractor: data.contractor,
      status: data.status,
      plannedQty: Number(data.plannedQty || 0),
      actualQty: Number(data.actualQty || 0),
      date: data.date,
    };
    if (work) Object.assign(work, payload);
    else state.workItems.push({ id: crypto.randomUUID(), ...payload });
    state.activeDetailTab = 'works';
    saveState();
    render();
  });
}

function deleteWorkItem(workId) {
  const work = byId(state.workItems, workId);
  if (!work) return;
  const price = byId(state.priceItems, work.priceItemId);
  const confirmed = window.confirm(`Удалить работу "${price?.name || 'без названия'}" из объекта?`);
  if (!confirmed) return;
  state.workItems = state.workItems.filter((item) => item.id !== workId);
  saveState();
  render();
}

function openExpenseForm(projectId = state.selectedProjectId) {
  openForm('Новый расход', [
    selectField('projectId', 'Объект', projectId || state.projects[0]?.id || '', state.projects.map((item) => [item.id, item.name]), 'full'),
    field('date', 'Дата', new Date().toISOString().slice(0, 10), 'date'),
    selectField('category', 'Категория', 'Расходники инструмент', [
      ['Расходники инструмент', 'Расходники инструмент'],
      ['Расходы на заказчика', 'Расходы на заказчика'],
      ['Налоги', 'Налоги'],
      ['Проживание', 'Проживание'],
      ['Разнорабочие', 'Разнорабочие'],
      ['Внеплановые расходы', 'Внеплановые расходы'],
    ]),
    field('amount', 'Сумма', 0, 'number'),
    field('description', 'Описание', '', 'textarea', false, 'full'),
  ], (data) => {
    state.expenses.unshift({ id: crypto.randomUUID(), ...data, amount: Number(data.amount || 0) });
    saveState();
    render();
  });
}

function openPaymentForm(paymentId = null, projectId = '') {
  const payment = paymentId ? byId(state.payments, paymentId) : null;
  const targetProjectId = projectId || payment?.projectId || state.selectedProjectId || '';
  openForm(payment ? 'Редактировать платеж' : 'Новый платеж', [
    field('date', 'Дата платежа', payment?.date || new Date().toISOString().slice(0, 10), 'date', true),
    selectField('type', 'Тип платежа', payment?.type || 'customer_income', [
      ['customer_income', 'Поступление от заказчика'],
      ['contractor_payment', 'Выплата исполнителю'],
      ['object_expense_payment', 'Оплата объектного расхода'],
      ['fixed_cost_payment', 'Оплата постоянного платежа'],
      ['other_income', 'Прочий приход'],
      ['other_outflow', 'Прочий расход'],
    ], 'full'),
    selectField('projectId', 'Объект', targetProjectId, [['', 'Без объекта'], ...state.projects.map((item) => [item.id, item.name])], 'full'),
    field('counterparty', 'Контрагент', payment?.counterparty || ''),
    field('category', 'Назначение / статья', payment?.category || ''),
    field('amount', 'Сумма', payment?.amount || 0, 'number', true),
    field('description', 'Комментарий', payment?.description || '', 'textarea', false, 'full'),
  ], (data) => {
    const payload = {
      date: data.date,
      type: data.type,
      projectId: data.projectId,
      counterparty: data.counterparty,
      category: data.category,
      amount: Number(data.amount || 0),
      description: data.description,
    };
    if (payment) Object.assign(payment, payload);
    else state.payments.unshift({ id: crypto.randomUUID(), ...payload });
    saveState();
    render();
  });
}

function deletePayment(paymentId) {
  const payment = byId(state.payments, paymentId);
  if (!payment) return;
  const confirmed = window.confirm(`Удалить платеж "${payment.category || paymentTypeLabel(payment.type)}" на ${money(payment.amount)}?`);
  if (!confirmed) return;
  state.payments = state.payments.filter((item) => item.id !== paymentId);
  saveState();
  render();
}

function openFixedCostForm() {
  openForm('Новый постоянный платеж', [
    field('month', 'Месяц', 'Май 2026'),
    field('category', 'Категория', ''),
    field('amount', 'Сумма', 0, 'number'),
  ], (data) => {
    state.fixedCosts.unshift({ id: crypto.randomUUID(), ...data, amount: Number(data.amount || 0) });
    saveState();
    render();
  });
}

function field(name, label, value = '', type = 'text', required = false, klass = '') {
  const input = type === 'textarea'
    ? `<textarea name="${name}" ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>`
    : `<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${required ? 'required' : ''}>`;
  return `<div class="field ${klass}"><label>${label}</label>${input}</div>`;
}

function selectField(name, label, value, options, klass = '') {
  return `
    <div class="field ${klass}">
      <label>${label}</label>
      <select name="${name}">
        ${options.map(([id, text]) => `<option value="${escapeHtml(id)}" ${id === value ? 'selected' : ''}>${escapeHtml(text)}</option>`).join('')}
      </select>
    </div>
  `;
}

function openForm(title, fields, onSubmit) {
  document.getElementById('modalTitle').textContent = title;
  const form = document.getElementById('modalForm');
  form.innerHTML = `
    ${fields.join('')}
    <div class="form-actions">
      <button type="button" class="secondary-button" id="cancelForm">Отмена</button>
      <button type="submit" class="primary-button">Сохранить</button>
    </div>
  `;
  form.onsubmit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    onSubmit(data);
    closeModal();
  };
  document.getElementById('cancelForm').onclick = closeModal;
  document.getElementById('modalBackdrop').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.add('hidden');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function iconBuilding() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V5a2 2 0 0 1 2-2h9v18"/><path d="M9 7h1M9 11h1M9 15h1M15 9h3a2 2 0 0 1 2 2v10"/></svg>';
}

function iconList() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>';
}

function iconReceipt() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1 2-1V3z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>';
}

function iconCalendar() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>';
}

function iconChart() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16v-5M12 16V7M17 16v-8"/></svg>';
}

function iconTrend() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 17 6-6 4 4 7-8"/><path d="M14 7h6v6"/></svg>';
}

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', (event) => {
  if (event.target.id === 'modalBackdrop') closeModal();
});
document.getElementById('seedButton').addEventListener('click', () => render());

render();
