

=========================================
            Обзор Проекта
-----------------------------------------

Full-stack application for managing refund requests.

Backend: Django + DRF + JWT
Frontend: React (Vite)
Database: PostgreSQL
Deployment: Docker (docker-compose)


=========================================
            Запуск Проекта
-----------------------------------------

Проект полностью контейнеризирован.

Требования:
- Docker Desktop (или Docker Engine)

Убедитесь, что Docker запущен.
В корне проекта выполните:
- docker compose up --build

После запуска:
- Backend API: http://127.0.0.1:8000
- Frontend: http://127.0.0.1:4444
- DB: http://127.0.0.1:5432

Остановка:
- docker compose down


## Тестирование ##


Для тестирования введите в консоль:
- docker compose exec backend python manage.py test

Всего 16 тестов на разные случаи,
которые разделены на несколько блоков:

- test_admin_review
- test_auth
- test_iban
- test_refunds_read_create


## POSTMAN ##
https://www.postman.com/galactic-equinox-378836/workspace/refund

Возможность протестировать енд-поинты с помощью Postman

auth/
    Admin login
    User login
    logout
refund/
    Get Refunds
    Get Refund
    Create Refund
    Update Refund Status

access токен автоматически используется во всех запросах после выполнения:
- Admin login
- User login


=========================================
         Архитектурные решения
-----------------------------------------


## Аутентификация ##


Используется JWT (SimpleJWT).

- POST /api/v1/auth/token/          — login
- POST /api/v1/auth/token/refresh/  — обновление access токена
- POST /api/v1/auth/logout/         — logout

Access токен — lifetime: 5 min
Refresh токен — lifetime: 7 days

Со стороны фронтенда, access token автоматически продлевается после его окончания
(Если refresh token все еще жив)


## Кеширование ##


Используется Django cache (LocMemCache) для временного хранения результатов валидации IBAN.

- Снижает повторные вычисления
- Не требует внешних сервисов
- Подходит для development/MVP

Кеш живёт в памяти процесса и очищается при перезапуске контейнера.


## Индексация ##


В моделях используются индексы для:

- status
- user
- country
- временных полей

Это ускоряет:
- фильтрацию списка
- выборку по статусу
- административные операции

Также используется:
- select_related
- prefetch_related

для предотвращения N+1 запросов.


## Обработка Ошибок ##


Система разделяет:

- Domain ошибки (бизнес-логика)
- API ошибки (HTTP уровень)

Используются корректные HTTP статусы:

- 400 — валидация
- 401 — не аутентифицирован
- 403 — нет прав
- 404 — не найдено / нет доступа
- 409 — конфликт состояния (например, смена статуса)
- 503 — внешний сервис недоступен

Изменение статусов выполняется внутри transaction.atomic()
Используется select_for_update() для защиты от race conditions.


## Бизнес-логика ##


Статусы:
pending → in_review → approved | rejected
- Нельзя перепрыгивать статусы
- Финальные статусы неизменяемы
- При первом переводе в in_review назначается администратор
- Второй администратор не может изменить уже взятую заявку
- Все изменения сохраняются в истории


=========================================
         Структура Backend
-----------------------------------------
Django + DRF + JWT

refunds/
    models/
    serializers/
    services/
    views/
    permissions/
    tests/

Принцип разделения:
- Models — структура данных
- Services — бизнес-логика
- Views — HTTP слой
- Serializers — валидация и представление



=========================================
         Структура Frontend
-----------------------------------------

React (Vite) + MUI (Material UI)

src/
    api/
    auth/
    components/
        auth/           2 components
        layout/         2 components
        refunds/
            details/    4 components
            list/       6 components
    pages/
        LoginPage.jsx
        RefundDetailsPage.jsx
        RefundsList.jsx
    services/


## Основные решения ##


- Использован JWT (access + refresh токены) для аутентификации.
- Реализован apiClient на базе axios:
  - с автоматической подстановкой access token
  - обработка 401
  - поддержкой refresh token
- Вся работа с API вынесена в отдельный слой (`/api`).
- Логика аутентификации вынесена в `/auth` (tokenStorage, authService).
- Утилиты (например форматирование дат) вынесены в `/services`.

---


## Реализованный функционал ##


Авторизация:
- Страница входа
- Хранение токенов в localStorage
- Автоматическое продление access токена

Refund List:
- Отображение списка запросов
- Фильтрация по:
  - статусу
  - стране
  - дате создания (from / to)
- Обновление списка
- Создание нового запроса (диалоговое окно)
- Переход к деталям

Refund Details:
- Разделение интерфейса на:
  - User view
  - Admin view
- Адаптивная верстка:
  - Desktop — выдвижная боковая админ-панель
  - Mobile — раскрывающийся Accordion
- Отображение:
  - статуса
  - метаданных
  - списка товаров
  - истории изменений
- Управление статусами:
  - pending → in_review
  - in_review → approved / rejected / pending
- UI управляется через поле `can_manage`, получаемое с backend

---


## Архитектурные принципы ##


- Разделение layout и content компонентов
- Минимизация дублирования
- Чистая структура:
  - pages
  - components
  - api
  - auth
  - services
- UI адаптирован под desktop и mobile

---


## Возможные улучшения ##


- Добавить пагинацию для списка запросов
- Реализовать полноценный деплой (Docker production, Nginx, CI/CD)
- Добавить регистрацию пользователей как отдельный Django app
- Добавить комментарии к коду и улучшить документацию

