const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const flowchartRoutes = require('./routes/flowcharts');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '../public')));

// API маршруты
app.use('/auth', authRoutes);
app.use('/flowcharts', flowchartRoutes);


const rooms = new Map();

io.on('connection', (socket) => {
    console.log('Клиент подключился:', socket.id);

    // Проверка существования комнаты (до join)
    socket.on('room:check', ({ roomId }, callback) => {
        callback({ exists: rooms.has(roomId) });
    });

    socket.on('room:join', ({ roomId, userId, username, isCreating }) => {
        // Если не создатель — проверяем что комната существует
        if (!isCreating && !rooms.has(roomId)) {
            socket.emit('room:not_found');
            return;
        }

        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.username = username;

        if (!rooms.has(roomId)) {
            // Первый вошедший — владелец (создатель)
            rooms.set(roomId, { ownerId: userId, users: new Map() });
        }

        const room = rooms.get(roomId);
        const isOwner = room.ownerId === userId;
        const role = isOwner ? 'owner' : 'viewer'; // по умолчанию читатель

        room.users.set(socket.id, { userId, username, role });

        console.log(`${username} (${role}) вошёл в комнату ${roomId}`);

        // Отправляем новому участнику полный список
        const userList = Array.from(room.users.values());
        socket.emit('room:init', { ownerId: room.ownerId, users: userList });

        // Остальным — что кто-то подключился
        socket.to(roomId).emit('room:user_joined', { userId, username, role });

        // Если новый участник не владелец — просим владельца прислать снапшот холста
        if (!isOwner) {
            // Находим сокет владельца
            for (const [sid, user] of room.users) {
                if (user.userId === room.ownerId) {
                    io.to(sid).emit('room:request_snapshot', { requesterId: socket.id });
                    break;
                }
            }
        }
    });

    // Владелец присылает снапшот — пересылаем конкретному участнику
    socket.on('room:send_snapshot', ({ requesterId, snapshot }) => {
        io.to(requesterId).emit('room:snapshot', { snapshot });
    });

    // Владелец меняет роль
    socket.on('room:set_role', ({ targetUserId, role }) => {
        const room = rooms.get(socket.roomId);
        if (!room || room.ownerId !== socket.userId) return; // только владелец

        // Обновляем роль в Map
        for (const [sid, user] of room.users) {
            if (user.userId === targetUserId) {
                user.role = role;
                // Говорим самому участнику что его роль изменилась
                io.to(sid).emit('room:role_changed', { userId: targetUserId, role });
                break;
            }
        }

        io.to(socket.roomId).emit('room:role_changed', { userId: targetUserId, role });
    });

    // Событие редактирования — пропускаем только если у отправителя editor/owner
    socket.on('editor:event', (event) => {
        const room = rooms.get(socket.roomId);
        if (!room) return;
        const user = room.users.get(socket.id);
        if (!user || (user.role !== 'editor' && user.role !== 'owner')) return;

        socket.to(socket.roomId).emit('editor:event', event);
    });

    socket.on('cursor:move', ({ x, y }) => {
        if (!socket.roomId) return;
        socket.to(socket.roomId).emit('cursor:move', {
            userId: socket.userId,
            username: socket.username,
            x, y
        });
    });

    // Live-перемещение блока во время drag (не финальное)
    socket.on('block:live_move', (payload) => {
        const room = rooms.get(socket.roomId);
        if (!room) return;
        const user = room.users.get(socket.id);
        if (!user || (user.role !== 'editor' && user.role !== 'owner')) return;
        socket.to(socket.roomId).emit('block:live_move', payload);
    });

    // Live-ресайз блока во время тащения ручки (не финальное)
    socket.on('block:live_resize', (payload) => {
        const room = rooms.get(socket.roomId);
        if (!room) return;
        const user = room.users.get(socket.id);
        if (!user || (user.role !== 'editor' && user.role !== 'owner')) return;
        socket.to(socket.roomId).emit('block:live_resize', payload);
    });

    // Захват блока
    socket.on('block:lock', ({ blockId }) => {
        const room = rooms.get(socket.roomId);
        if (!room) return;
        const user = room.users.get(socket.id);
        if (!user || (user.role !== 'editor' && user.role !== 'owner')) return;

        if (!room.locks) room.locks = new Map();

        // Блок уже занят другим — отклоняем
        const existing = room.locks.get(blockId);
        if (existing && existing.userId !== socket.userId) return;

        room.locks.set(blockId, { userId: socket.userId, username: socket.username });

        // Уведомляем всех в комнате (включая самого отправителя — для синхронизации)
        io.to(socket.roomId).emit('block:locked', {
            blockId,
            userId: socket.userId,
            username: socket.username
        });
    });

    // Освобождение блока
    socket.on('block:unlock', ({ blockId }) => {
        const room = rooms.get(socket.roomId);
        if (!room || !room.locks) return;

        const lock = room.locks.get(blockId);
        if (!lock || lock.userId !== socket.userId) return;

        room.locks.delete(blockId);
        io.to(socket.roomId).emit('block:unlocked', { blockId });
    });

    socket.on('disconnect', () => {
        const room = rooms.get(socket.roomId);
        if (room) {
            room.users.delete(socket.id);

            // Снимаем все блокировки этого пользователя
            if (room.locks) {
                for (const [blockId, lock] of room.locks) {
                    if (lock.userId === socket.userId) {
                        room.locks.delete(blockId);
                        io.to(socket.roomId).emit('block:unlocked', { blockId });
                    }
                }
            }

            socket.to(socket.roomId).emit('room:user_left', {
                userId: socket.userId,
                username: socket.username
            });
            if (room.users.size === 0) rooms.delete(socket.roomId);
        }
        console.log('Клиент отключился:', socket.id);
    });
});

server.listen(3000, () => {
  console.log('Сервер: http://localhost:3000');
});