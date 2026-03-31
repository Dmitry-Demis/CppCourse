# Архитектура проекта cppQuest

## Структура репозитория

```
cppQuest/
├── CppCourse/          — фронтенд (статика: HTML, JS, CSS)
└── cppQuest.Server/    — бэкенд (ASP.NET Core + SQLite)
```

---

## Фронтенд — CppCourse/

### Страницы (HTML)

| Файл | Назначение |
|------|-----------|
| `index.html` | Лендинг / главная страница курса |
| `login.html` | Страница входа (ISU-номер + пароль) |
| `profile.html` | Профиль пользователя: статистика, достижения, магазин |
| `achievements.html` | Страница всех достижений |
| `quiz-standalone.html` | Отдельная страница для прохождения теста |
| `DEMO.html` | Демо-страница компонентов |
| `theory/chapter-N/group/page.html` | Страницы теории. Путь = `chapter-{N}/{groupId}/{paragraphId}.html` |

Каждая страница теории подключает стандартный набор CSS/JS и содержит `<div data-slot="N" data-std="NN">` — заглушки для платного контента.

---

### JavaScript — CppCourse/js/

| Файл | Назначение |
|------|-----------|
| `navigation.js` | Левый сайдбар, prev/next кнопки, прогресс-бар чтения, мобильное меню. Загружает `course-meta.json` и строит навигацию динамически. Также подключает `highlight.js` и `streak.js` |
| `course.js` | Загрузчик `course-meta.json`. Нормализует параграфы, подтягивает `<title>` из HTML если не указан. Кэширует результат |
| `auth-guard.js` | Редирект на `login.html` если нет `cpp_user` в localStorage. Сохраняет URL для возврата после логина |
| `gamification.js` | Вся игровая механика: монеты, XP, уровни, квесты, достижения, дневная награда, трекинг времени чтения. HUD в шапке. Хранит состояние в localStorage |
| `streak.js` | Стрик-система: ежедневный чекин через `/api/streak`, модалка с огнём, заморозки стрика (🧊), снежинки, milestone-награды |
| `std-gate.js` | Система платного контента. Находит `[data-slot][data-std]`, запрашивает `/api/gated/slots`, рендерит заглушки или загружает купленный контент. Анимация разблокировки: 3D-ключ (Three.js) → замочная скважина → стихия → дверь |
| `compiler.js` | Запуск C++ кода через API. Подключается к блокам `.code-block[data-example]` |
| `feedback.js` | Виджет оценки страницы (1–10 звёзд + комментарий). GET/POST `/api/feedback` |
| `quiz-system.js` | Мини-тесты и финальные тесты. Данные хранятся в JS-объекте. Результаты в localStorage + POST на сервер |
| `quiz-modal.js` | Модальное окно для прохождения теста прямо на странице теории |
| `quiz.js` | Логика quiz-компонента (рендер вопросов, проверка ответов, результаты) |
| `theme.js` | Переключатель тем (dark/blue/light/emerald/sunset). Сохраняет в localStorage `cpp_theme` |
| `toc.js` | Генерация оглавления (Table of Contents) из заголовков страницы |
| `effects.js` | Визуальные эффекты и анимации |
| `code-highlighter.js` | Подсветка синтаксиса кода |
| `core/callout.js` | Callout-блоки (info/warning/note). Анимирует появление при скролле |

---

### CSS — CppCourse/css/

| Файл | Назначение |
|------|-----------|
| `variables.css` | CSS-переменные: цвета, шрифты, отступы для всех тем |
| `base.css` | Типографика, сброс стилей, базовые элементы |
| `layout.css` | Сетка страницы: header, sidebar, main-content, footer |
| `theory.css` | Стили страниц теории: заголовки, таблицы, цитаты, секции |
| `components.css` | Переиспользуемые компоненты: кнопки, бейджи, карточки |
| `std-gate.css` | Заглушки платного контента (`.std-gate`), анимации разблокировки (дверь, замочная скважина, вспышка) |
| `gamification.css` | HUD (монеты/XP/уровень), панель квестов, всплывающие награды |
| `achievements.css` | Карточки достижений |
| `quiz.css` | Стили тестов: варианты ответов, прогресс, результаты |
| `quiz-game.css` | Геймифицированный UI тестов |
| `feedback.css` | Виджет оценки страницы: звёзды, форма комментария |
| `code-highlight.css` | Цвета подсветки синтаксиса |
| `compiler.css` | UI редактора кода и вывода компилятора |
| `effects.css` | Keyframe-анимации общего назначения |
| `game-ui.css` | Игровые UI-элементы |
| `landing.css` | Стили лендинга |
| `shop.css` | Магазин: карточки товаров, стандарты C++ |
| `theme-picker.css` | Переключатель тем |
| `callout.css` | Callout-блоки (info/warning/tip/danger) |

---

### Прочее — CppCourse/

| Файл/Папка | Назначение |
|-----------|-----------|
| `course-meta.json` | Структура курса: главы, параграфы, тесты. Читается `course.js` и `navigation.js` |
| `components/quiz/` | Шаблоны и логика quiz-виджета |
| `img/achievements/` | SVG-иконки достижений |
| `add_callout.py` | Скрипт добавления callout-блоков в HTML страницы |
| `add_feedback.py` | Скрипт добавления виджета обратной связи в HTML страницы |
| `check_callout.py` | Проверка наличия callout-блоков |
| `clean_feedback.py` | Очистка дублей виджета feedback |

---

## Бэкенд — cppQuest.Server/

### Точка входа

`Program.cs` — настройка DI, middleware, маппинг эндпоинтов, раздача статики из `CppCourse/`.

---

### База данных (SQLite — `cppquest.db`)

#### Таблицы

**`AllowedIsus`** — белый список ISU-номеров для регистрации
```
Id (PK), IsuNumber
```

**`Users`** — пользователи
```
Id (PK), FirstName, LastName, IsuNumber (unique), PasswordHash,
IsActive, RegisteredAt, LastLoginDate
```

**`GamificationProfiles`** — игровой профиль (1:1 с User)
```
UserId (PK/FK), Xp, Level, Coins, Keys,
CurrentStreak, MaxStreak, TotalStreakDays, LastActivityDate,
FreezeCount, SnowflakeCount,
UnlockedContentStds (legacy), UnlockedSlots (legacy)
```

**`ParagraphReadingStats`** — статистика чтения параграфов (PK: UserId+ParagraphId)
```
UserId (FK), ParagraphId,
TotalReadingSeconds, ReadingSessionsCount, CodeRunsCount, LastReadAt,
SrInterval, SrEaseFactor, SrRepetitions, SrNextDue   ← SM-2 spaced repetition
```

**`ParagraphTestStats`** — агрегированная статистика тестов (PK: UserId+TestId)
```
UserId (FK), TestId, ParagraphId, TestTitle,
AttemptsCount, BestScore, TotalScoreSum, LastScore, BestStatus, LastAttemptAt
```
`BestStatus`: 0=нет, 1=passed, 2=bronze, 3=silver, 4=gold

**`TestAttempts`** — каждая попытка теста (индекс: UserId+TestId)
```
Id (PK), UserId (FK), ParagraphId, TestId,
Score, CorrectAnswers, TotalQuestions,
WrongQuestionIds (JSON), CorrectQuestionIds (JSON),
TimeSpent, CreatedAt
```

**`ActivityLogs`** — лог действий пользователя (индекс: UserId)
```
Id (PK), UserId (FK), ActionType, ParagraphId, TestId,
XpEarned, CoinsEarned, TimeSpent, CreatedAt
```
`ActionType`: `test_complete` | `read_paragraph` | `code_run` | `login`

**`ShopItems`** — товары магазина (PK строковый)
```
Id (PK), Emoji, Name, Description, ItemType,
CostCoins, CostKeys, RequiredLevel, RequiredStd
```
`ItemType`: `std_unlock` | `content_slot`

Seed-данные стандартов:
| Id | Стоимость | Уровень |
|----|-----------|---------|
| `std_cpp11` | 500 🪙 | 2 |
| `std_cpp14` | 20 000 🪙 | 7 |
| `std_cpp17` | 40 000 🪙 | 14 |
| `std_cpp20` | 80 000 🪙 | 21 |
| `std_cpp23` | 100 000 🪙 | 28 |

**`UserPurchases`** — покупки из магазина (уникальный индекс: UserId+ItemId)
```
Id (PK), UserId (FK), ItemId (FK → ShopItems), PurchasedAt
```

**`ParagraphSlotPurchases`** — покупки платных слотов в параграфах (уникальный индекс: UserId+Page+Slot+Std)
```
Id (PK), UserId (FK), Page, Slot, Std, CostCoins, CostKeys, PurchasedAt
```
Пример: `Page="chapter-2/fundamental-types/integer-types"`, `Slot="1"`, `Std="11"`

**`PageFeedbacks`** — оценки страниц
```
Id (PK), UserId (FK, nullable), PageId, Rating (1–10), Comment (до 1024), CreatedAt
```

---

### Endpoints

**`AuthEndpoints.cs`** — `/api/auth`
- `POST /register` — регистрация (проверяет AllowedIsus)
- `POST /login` — вход, возвращает профиль + токен

**`ProgressEndpoints.cs`** — `/api`
- `GET /api/profile` — профиль + гейм-статистика
- `GET /api/streak/{isuNumber}` — данные стрика
- `POST /api/streak/{isuNumber}/checkin` — ежедневный чекин
- `POST /api/streak/{isuNumber}/freeze` — использовать заморозку
- `GET /api/shop/items` — список товаров магазина
- `POST /api/shop/buy` — купить товар из магазина
- `GET /api/gated/all-slots` — все gated-слоты всех страниц со статусом покупки
- `GET /api/gated/slots?page=...` — слоты конкретной страницы (цена, куплено, стандарт разблокирован)
- `GET /api/gated/content?page=&slot=&std=` — HTML-контент купленного слота
- `POST /api/gated/purchase` — купить слот (списывает монеты/ключи)

**`QuizEndpoints.cs`** — `/api/quiz`
- `POST /api/quiz/attempt` — сохранить попытку теста
- `GET /api/quiz/stats/{paragraphId}` — статистика тестов параграфа
- `GET /api/quiz/attempts/{testId}` — история попыток теста

**`CourseEndpoints.cs`** — `/api`
- `GET /api/examples/{path}` — отдаёт `.cpp` файл из `examples/`
- `GET /api/tests/{path}` — отдаёт JSON-тест из `tests/`
- `POST /api/reading/complete` — сохранить сессию чтения (секунды, запуски кода)

**`FeedbackEndpoints.cs`** — `/api/feedback`
- `POST /api/feedback` — отправить оценку страницы
- `GET /api/feedback/{pageId}` — получить статистику (count, average, myRating)

---

### Services

| Файл | Назначение |
|------|-----------|
| `AuthService.cs` | Регистрация, логин, хэширование паролей |
| `GamificationService.cs` | Начисление XP/монет, повышение уровня, стрик-логика, заморозки |
| `GatedContentService.cs` | Парсинг `<section data-slot data-std coins keys>` из gated-файлов. `ExtractSlotDefs()` — список слотов, `ExtractSlot()` — HTML конкретного слота |
| `ProfileService.cs` | Получение профиля пользователя по ISU-номеру |
| `QuizService.cs` | Сохранение попыток, обновление `ParagraphTestStats`, SM-2 spaced repetition |
| `StatsService.cs` | Агрегация статистики чтения и активности |

### Repositories

Паттерн Repository над EF Core:

| Интерфейс | Реализация | Что делает |
|-----------|-----------|-----------|
| `IUserRepository` | `UserRepository` | CRUD пользователей, поиск по ISU |
| `IGamificationRepository` | `GamificationRepository` | Профиль геймификации, монеты, XP, стрик |
| `IShopRepository` | `ShopRepository` | Товары магазина, покупки, проверка наличия |
| `ISlotRepository` | `SlotRepository` | Покупки gated-слотов параграфов |
| `IStatsRepository` | `StatsRepository` | Статистика чтения и тестов |

---

### Gated-контент — как работает

```
CppCourse/theory/.../page.html          ← фронтенд
  <div data-slot="1" data-std="11">     ← пустая заглушка

cppQuest.Server/gated/.../page.html     ← серверный контент
  <section data-slot="1" data-std="11" coins="4000">
    ... реальный HTML ...
  </section>
```

**Поток:**
1. Страница загружается → `std-gate.js` находит все `[data-slot][data-std]`
2. `GET /api/gated/slots?page=chapter-2/...` → сервер читает gated-файл, возвращает `[{slot, std, costCoins, costKeys, purchased, stdUnlocked}]`
3. Если `purchased=true` → сразу загружает контент через `GET /api/gated/content`
4. Если нет → рендерит заглушку с ценой и кнопкой
5. Клик "Разблокировать" → `POST /api/gated/purchase` → списываются монеты/ключи → запись в `ParagraphSlotPurchases` → загружается контент → анимация

**Условия покупки слота:**
- Нужный стандарт C++ должен быть куплен в магазине (`UserPurchases` содержит `std_cppNN`)
- Достаточно монет/ключей в `GamificationProfile`

---

### Аутентификация

Используется заголовок `X-Isu-Number` (не JWT). Пользователь хранится в `localStorage` как `cpp_user`:
```json
{ "isuNumber": "123456", "firstName": "Иван", "lastName": "Иванов", "currentStreak": 5 }
```

---

### Файловая структура сервера

```
cppQuest.Server/
├── examples/chapter-N/.../*.cpp    — примеры кода для страниц теории
├── tests/chapter-N/.../*.json      — JSON-файлы тестов
├── gated/chapter-N/.../*.html      — платный HTML-контент (section-теги)
├── Models/                         — EF Core модели + AppDbContext
├── Endpoints/                      — Minimal API эндпоинты
├── Services/                       — Бизнес-логика
├── Repositories/                   — Слой доступа к данным
├── DTOs/                           — DTO для запросов/ответов
├── Migrations/                     — EF Core миграции
└── cppquest.db                     — SQLite база данных
```
