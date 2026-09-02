# WebRedServer

Онлайн-редактор блок-схем с совместным редактированием в реальном времени. Можно рисовать схему на SVG-холсте, сохранять её на сервере и звать друзей в одну сессию по коду комнаты — все изменения синхронизированы между участниками через Socket.IO.

Автор ШНН

## Что умеет

- Рисовать блок-схемы: терминатор, процесс, решение, данные, предопределённый процесс, соединитель. Блоки можно двигать, ресайзить, соединять линиями, редактировать текст внутри.
- Стикеры-заметки на холсте — двойной клик по пустому месту создаёт текстовую заметку, её можно двигать и редактировать.
- Совместная работа над одной схемой в реальном времени: курсоры участников видно на холсте, перемещение и ресайз блоков транслируются.
- Блокировка блока: пока один человек редактирует блок, у остальных он подсвечивается как занятый — конфликтов при одновременном редактировании нет.
- Роли в сессии: owner (создал комнату, раздаёт роли), editor (может рисовать), viewer (только смотрит).
- Новый участник сразу получает актуальное состояние схемы (снапшот от владельца), а не пустой холст.
- Если владелец комнаты выходит — сессия закрывается для всех.
- Регистрация и вход, пароли хранятся хешированными (bcrypt).
- Сохранение схем в PostgreSQL: создание, обновление, переименование, удаление, список своих схем с превью.
- Экспорт схемы прямо из главного меню (три точки на карточке): в JPG (картинка) или в JSON (можно потом загрузить обратно и продолжить редактирование).
- Импорт схемы из JSON-файла при создании новой блок-схемы.

## На чём написано

Backend — Node.js, Express, Socket.IO, PostgreSQL (пакет `pg`), bcrypt.
Frontend — обычные HTML/CSS/JS без фреймворков, холст на SVG.

## Структура проекта

```
WebRedServer/
├── Public/                    # Статический фронтенд
│   ├── index.html             # Страница входа / регистрации
│   ├── indexstyle.css
│   ├── MainMenu.html          # Главное меню: список схем, вход в сессию
│   ├── MainMenustyle.css
│   ├── editor.html            # Редактор блок-схем
│   ├── editorstyle.css
│   └── WorkWithredact.js      # Вся логика редактора и совместной работы
│
├── Server/                    # Backend
│   ├── index.js                # Точка входа: Express + Socket.IO сервер
│   ├── db.js                   # Подключение к PostgreSQL
│   ├── routes/
│   │   ├── auth.js             # /auth — регистрация и вход
│   │   └── flowcharts.js       # /flowcharts — CRUD схем
│   └── package.json
│
└── .gitattributes
```

## API

Авторизация:

```
POST /auth/register   { login, email, password }
POST /auth/login      { login, password }
```

Блок-схемы:

```
GET    /flowcharts/:userId       список схем пользователя
POST   /flowcharts               создать { userId, title, preview, svgContent }
GET    /flowcharts/single/:id    получить одну схему (используется и для экспорта в JPG/JSON)
PUT    /flowcharts/:id           обновить { preview, svgContent }
PATCH  /flowcharts/rename/:id    переименовать { title }
DELETE /flowcharts/:id           удалить
```

Экспорт и импорт схем происходят на клиенте: JPG собирается из превью через `<canvas>` и скачивается как файл, JSON — это просто `svg_content` схемы, отданный как файл; такой же JSON можно загрузить обратно при создании новой схемы.

Совместное редактирование живёт на сокетах:

```
room:check           — проверить, существует ли комната, до входа
room:join            — войти в комнату { roomId, userId, username, isCreating }
room:not_found       — комната не найдена
room:init            — стартовое состояние комнаты + список участников
room:request_snapshot / room:send_snapshot / room:snapshot — подтягиваем состояние холста для нового участника
room:set_role        — владелец меняет роль участника
room:role_changed    — роль изменилась
room:owner_left      — владелец вышел, комната закрыта

editor:event         — событие редактирования (проходит только если роль editor/owner)
cursor:move          — позиция курсора участника
block:live_move / block:live_resize — перемещение/ресайз блока в реальном времени, пока его тащат
block:lock / block:locked / block:unlock / block:unlocked — блокировка блока на время редактирования
```

## Запуск

Нужны Node.js и PostgreSQL.

```bash
git clone https://github.com/Garbage77/WebRedServer.git
cd WebRedServer/Server
npm install
node index.js
```

Сервер стартует на `http://localhost:3000` и сам раздаёт фронтенд из папки `Public`.

Перед запуском нужна база `Redact` в PostgreSQL с таблицами под пользователей и схемы они выглядят так:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE flowcharts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    preview TEXT,
    svg_content TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

Сейчас логин/пароль от БД зашиты прямо в `Server/db.js` (`localhost`, база `Redact`, юзер `postgres`) — для чего-то серьёзнее локальной разработки это стоит вынести в `.env`.

## Что можно доделать

- Вынести конфиг БД в переменные окружения.
- Нормальную авторизацию (сейчас данные юзера просто лежат в localStorage, нужны токены, сессия).
- Проверку, что редактировать/удалять схему может только её владелец.
- Undo/redo с синхронизацией между участниками.
