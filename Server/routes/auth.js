const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();


// Регистрация
router.post('/register', async (req, res) => {
  const { login, email, password } = req.body;
  console.log('Попытка регистрации:', { login, email });

  if (!login || !email || !password) {
    console.log('Не все поля заполнены');
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (login, email, password_hash) VALUES ($1, $2, $3) RETURNING id, login, email',
      [login, email, hash]
    );
    console.log('Пользователь создан:', result.rows[0]);
    res.json({ ok: true, user: result.rows[0] });
  } catch (e) {
    console.log('Ошибка при регистрации:', e.message);
    if (e.code === '23505') {
      res.status(409).json({ error: 'Логин или email уже занят' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  console.log('Попытка входа:', { login });

  try {
    const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
    const user = result.rows[0];

    if (!user) {
      console.log('Пользователь не найден');
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      console.log('Неверный пароль');
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    console.log('Успешный вход:', user.login);
    res.json({ ok: true, user: { id: user.id, login: user.login, email: user.email } });
  } catch (e) {
    console.log('Ошибка при входе:', e.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


module.exports = router;