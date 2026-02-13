============================================================
REFUND MANAGEMENT SYSTEM
Backend: Django + DRF + JWT
============================================================

1. PROJECT OVERVIEW
------------------------------------------------------------

Refund Management System — это backend API для обработки
запросов на возврат средств.

Система поддерживает:

- Аутентификацию через JWT
- Разграничение ролей (Admin / User)
- Создание заявок на возврат
- Просмотр заявок
- Изменение статуса возврата (только Admin) (Frontend доделать)
- Историю изменения статусов                (Frontend доделать)
- Назначение администратора на заявку       (Frontend доделать)
- Базовые тесты API

Проект построен на:
- Python 3.11
- Django
- Django REST Framework
- PostgreSQL
- JWT (SimpleJWT)


============================================================
2. ARCHITECTURE
------------------------------------------------------------

Проект разделён на логические слои:

refunds/
    models/              — модели БД
    serializers/         — сериализаторы DRF
    views/               — API endpoints
    services/            — бизнес-логика
    permissions/         — кастомные permissions
    tests/               — тесты API

Архитектурный принцип:
- Models — только структура данных
- Services — бизнес-логика
- Views — HTTP-уровень
- Permissions — доступы
- Serializers — валидация и представление данных


============================================================
3. AUTHENTICATION (JWT)
------------------------------------------------------------

Используется JSON Web Token (JWT).

Flow:

1) Логин
POST /api/v1/auth/token/
→ возвращает access + refresh

2) Все защищённые запросы требуют:
Authorization: Bearer <access_token>

3) Refresh токена:
POST /api/v1/auth/token/refresh/

4) Logout:
POST /api/v1/auth/logout/
→ refresh токен попадает в blacklist

Access токен:
- короткоживущий
- stateless
- проверяется по подписи и exp

Refresh токен:
- долгоживущий
- хранится сервером
- может быть отозван


============================================================
4. ROLES AND PERMISSIONS
------------------------------------------------------------

Admin:
- is_staff = True
- видит все заявки
- может менять статус
- назначается ответственным при первом изменении

User:
- обычный пользователь
- видит только свои заявки
- не может менять статус


============================================================
5. DATA MODELS
------------------------------------------------------------

RefundRequest:
- id
- user (FK)
- iban
- country
- status (pending | approved | rejected)
- assigned_admin (FK, nullable)
- assigned_at (datetime, nullable)
- created_at
- updated_at

RefundRequestItem:
- refund_request (FK)
- sku
- name
- qty
- price

RefundStatusHistory:
- refund_request (FK)
- changed_by (FK)
- from_status
- to_status
- changed_at


============================================================
6. BUSINESS LOGIC
------------------------------------------------------------

Status transitions:

Allowed:
pending → approved
pending → rejected

Not allowed:
approved → any
rejected → any

Ownership logic:

- При первом изменении статуса:
    assigned_admin = текущий admin
    assigned_at = now()

- Если заявка уже назначена другому admin:
    возвращается 409 Conflict

История статусов:
- Создаётся при каждом успешном изменении статуса


============================================================
7. API ENDPOINTS
------------------------------------------------------------

AUTH:

POST   /api/v1/auth/token/
POST   /api/v1/auth/token/refresh/
POST   /api/v1/auth/logout/

IBAN:

POST   /api/v1/iban/validate/

REFUNDS:

POST   /api/v1/refunds/
GET    /api/v1/refunds/
GET    /api/v1/refunds/{id}/
PATCH  /api/v1/refunds/{id}/status/


============================================================
8. ERROR CODES
------------------------------------------------------------

200 — OK
201 — Created
204 — No Content
400 — Validation error
401 — Not authenticated
403 — Forbidden
404 — Not found
409 — Conflict (invalid status transition / taken by another admin)
503 — External service unavailable


============================================================
9. DATABASE OPTIMIZATION
------------------------------------------------------------

Используется:

- select_related() для ForeignKey
- prefetch_related() для one-to-many

Это предотвращает проблему N+1 запросов.

В статусном сервисе используется:
- select_for_update()
- transaction.atomic()

Это защищает от race conditions.


============================================================
10. TESTING (ERROR)
------------------------------------------------------------

Тесты разделены на:

- test_auth.py
- test_refunds_read_create.py
- test_refunds_status.py

Покрываются сценарии:

- Успешный логин
- Неверные креды
- Logout
- Создание заявки
- Валидация данных
- Доступ user/admin
- 401 / 403 / 404 / 409
- Назначение администратора
- История статусов

Запуск тестов:

python manage.py test

---
В связи с изменениями в коде и недоступным сервисом кеширования IBAN большинство выдают ошибки
---


============================================================
11. STARTING PROJECT (DOCKER)
============================================================

Проект полностью запускается через Docker.
Все необходимые сервисы уже настроены.

1) Убедитесь, что Docker запущен.

2) В корне проекта выполните:

   docker compose up --build

После запуска backend будет доступен по адресу:

   http://127.0.0.1:8000

Остановить систему:

   docker compose down

Запустить тесты:

   docker compose exec backend python manage.py test


============================================================
12. DESIGN DECISIONS
------------------------------------------------------------

- Используется JWT вместо session auth
- Бизнес-логика вынесена в services
- Используется audit history для статусов
- Введена защита от одновременной обработки заявки
- Применён separation of concerns
- Код ориентирован на расширяемость


============================================================
13. POSSIBLE IMPROVEMENTS
------------------------------------------------------------

- Finish frontend
- Fix Iban cache
- Swagger / OpenAPI
- Code comments
- Dockerized full stack deployment
- Deploy project

============================================================
END OF DOCUMENT
============================================================
