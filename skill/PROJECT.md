# PROJECT.md — контекст проекта ph-town

> Этот файл читается **в начале каждой задачи**, чтобы понимать, что это за проект,
> как он устроен и что уже менялось. После значимых изменений его нужно **обновлять**
> (см. правило 8 в [CLAUDE.md](./CLAUDE.md) и раздел «Журнал изменений» ниже).

---

## 1. Что это за проект

Веб-приложение (админ-панель / CRM) для **строительной компании**, которая продаёт
квартиры в новостройках и ведёт по ним расчёты. Основные бизнес-процессы:

- **Шахматка (checkerboard / shaxmatka)** — визуальная сетка объектов: проект → блок →
  подъезд (entrance) → этаж (floor) → квартира (apartment) → комнаты (room).
- **Контракты** — продажа квартиры клиенту: наличными или в рассрочку, с генерацией
  договора в `.docx`, подтверждением, расторжением, оплатами.
- **Оплаты (payments) и просрочки (overdue)** — график платежей, приём оплат, контроль
  просроченных.
- **Бартер (barter / bartercontracts)** — сделки по бартеру.
- **Склад (warehouse), касса (kassa-bank / kassa-sklad)** — материалы и финансы.
- **Риелторы (realtor), клиенты (client / contragents)** — участники сделок.

UI полностью на **русском языке**. Валюты — USD и SUM (узб. сум).

---

## 2. Стек

- **React 18 + Vite** (JS, не TS; `.jsx`). Шаблон — **Minimal UI (MUI) v5.7**.
- **MUI v5** (`@mui/material`, `@mui/lab`, `@mui/x-data-grid`, `@mui/x-date-pickers`) +
  Emotion.
- **SWR** для данных, **axios** для запросов.
- **react-router v6**, **react-hook-form + yup** для форм.
- Генерация документов: `easy-template-x`, `docxtemplater`, `docx-preview`, `pdf-lib`.
- Иконки: `@iconify/react` (в основном набор `solar:*`), обёртка `src/components/iconify`.
- Линт: ESLint (airbnb + prettier). Проверять изменения: `npx eslint <файлы>`.
- Запуск: `npm run dev` (vite), сборка `npm run build`.

---

## 3. Архитектура и соглашения

### Структура
- `src/sections/<feature>/` — вся UI-логика фичи. Внутри:
  - `view/<feature>-list-view.jsx` — страница-контейнер (список).
  - `<feature>-table-row.jsx`, `<feature>-table-toolbar.jsx` (у контрактов —
    `user-table-toolbar.jsx`), формы `*-new-edit-form.jsx` и т.д.
- `src/api/<feature>.js` — SWR-хуки (`useGetXxx`, `useSearchXxx`) + мутации
  (create/update/remove) через `axios`.
- `src/pages/dashboard/**` — тонкие обёртки-страницы, рендерят `view`.
- `src/routes/sections/dashboard.jsx` — маршруты; `src/routes/paths.js` — все пути
  (объект `paths.dashboard.*`).
- `src/components/*` — переиспользуемые компоненты шаблона (`table`, `label`, `iconify`,
  `custom-popover`, `snackbar`, `settings` и т.д.).
- `src/auth/*` — контекст авторизации (`useAuthContext`), `RoleBasedGuard`.

### Данные и API
- База API: `axiosInstance` с `baseURL = HOST_API` (env `VITE_HOST_API`); также
  `CUSTOM_BASE_URL` из `src/utils/custom-base-url.js` для «ручных» `fetch`.
- Эндпоинты собраны в `src/utils/axios.js` → объект `endpoints` (напр.
  `endpoints.contract.list = '/api/v1/contractlist'`).
- Списки, как правило, отдают `{ count, option: [...], page, ... }`; хуки маппят
  `option` → массив и `count` → число.
- SWR-ключ обычно строится как строка `` `${URL}?${query}` ``; смена ключа = рефетч.
- Бэкенд — **PHP 8.3 + Slim 4** (см. skill `php-slim-backend`): контроллеры/репозитории
  на PDO, JWT-авторизация, роли, деньги через **BCMath**. Фронт форматирует деньги через
  `Intl.NumberFormat('de-DE')`.

### Роли
- `user?.role` — строки: `'1'`, `'2'` (админы/менеджеры), `'3'`, `'5'` и т.д.
  Доступ к действиям гейтится проверками вида `['1','2'].includes(user?.role)` и
  `RoleBasedGuard roles={[...]}`.

### Важные нюансы / подводные камни
- **Легаси-файлы с префиксом `old*` / `old2*`** (`oldcontract-list-view.jsx`,
  `oldcontract-apartment-details.jsx` и др.) — **мёртвый код**, нигде не импортируются и
  не входят в сборку Vite. Не трогать без явной просьбы, но и не опираться на них.
- Многие поля из API — **строки**, а не числа (`contract_status === '2'`,
  `is_terminated === '1'`, `is_active === '0'`). Будь внимателен со сравнением типов:
  например `is_terminated === 1` (число) — всегда `false` и является багом.
  Исключение: `contract_payment_status` приходит **числом** (1/2/3) — приводи к строке.
- Пагинация в контрактах — через URL (`/dashboard/contracts/:page?`), индекс страницы
  0-based в state, `page + 1` уходит в запрос.

---

## 4. Модуль «Контракты» (наиболее проработанный)

- Хук: `useGetContracts(params)` в `src/api/contract.js`. **Сигнатура — объект-параметры**
  (page, contractStatus, contractType, contractPaymentStatus, isBarter, isTerminated,
  contractCashType). Пустые фильтры (`''`) в запрос не добавляются. Вызов без аргументов
  (`useGetContracts()`) используется во многих местах только ради мутаций
  (create/update/remove/terminate/confirm).
- Эндпоинт списка `contractlist` (GET) принимает фильтры в query, комбинирует через AND,
  возвращает `{ count, confirmed_count, process_count, page, option: [...] }`.
- Query-фильтры: `contract_type` (0 наличка / 1 рассрочка), `contract_status`
  (1 в процессе / 2 подписан), `contract_payment_status` (1 не оплачен / 2 частично /
  3 полностью), `is_barter` (0/1), `is_terminated` (0/1), `contract_cash_type`
  (0 USD / 1 SUM).
- Список: `view/contract-list-view.jsx` (страница), `user-table-toolbar.jsx` (панель
  фильтров), `contract-table-row.jsx` (строка).
- Статусы контракта в строке: `is_active === '0'` → удалён, `is_terminated === '1'` →
  расторгнут, `contract_status` '1'/'2' → в процессе/подтверждён.

---

## 5. Журнал изменений

> Обновлять при каждом значимом изменении: коротко **что** и **почему**, ссылки на файлы.
> Новые записи — сверху.

### 2026-07-09 — Контракты: фильтры, статус оплаты, правки строки
- **Новая панель фильтров** контрактов (`user-table-toolbar.jsx`): 6 селектов (Тип,
  Статус договора, Статус оплаты, Бартер, Расторгнутые, Валюта) + поиск по клиенту —
  всё в одном ряду. Значение `''` = «Все» = фильтр не отправляется. Вкладки статуса
  (Все/Подтверждённые/В процессе) **удалены** — статус стал селектом. Бартер и
  Расторгнутые — трёхпозиционные селекты (Все/Да/Нет), т.к. бинарный switch не выражает
  «не фильтровать».
- **`useGetContracts` переведён на объект-параметры** и получил 4 новых фильтра
  (`src/api/contract.js`). При смене фильтра — сброс на 1-ю страницу + рефетч.
- **Колонка «Оплата»** в списке (`contract-table-row.jsx` + `TABLE_HEAD` в view):
  `Label` с текстом `contract_payment_status_text` и цветом/иконкой по числу
  `contract_payment_status` (1 красный / 2 жёлтый / 3 зелёный).
- **SMS-свитч**: исправлен баг (`is_terminated === 1` никогда не срабатывал), теперь
  отключается для удалённых **и** расторгнутых (`disabled={isInactive || contract_status
  !== '2'}`).
- **Колонка «Файл»** (кнопка предпросмотра `.docx`) убрана из списка. Проп
  `onPreviewDocument` и `generateDocument` в view стали неиспользуемыми — оставлены как
  есть (не вычищались).
- **«Изменить» (карандашик)** в поповере строки отключается для подтверждённых
  контрактов (`disabled={isConfirmed}`, где `isConfirmed = contract_status === '2'`).

---

## 6. Как поддерживать этот файл

1. В начале задачи — прочитай этот файл целиком.
2. Если изменил поведение/структуру — обнови соответствующий раздел и добавь запись в
   «Журнал изменений» (сверху, с датой и ссылками на файлы).
3. Если наткнулся на новый подводный камень — добавь его в раздел «Важные нюансы».
4. Держи файл кратким и точным: факты, а не пересказ кода.
