const express = require('express');
const pool = require('../db');
const router = express.Router();

// Получить все схемы пользователя
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('Запрос схем для пользователя:', userId);

  try {
    const result = await pool.query(
      `SELECT id, title, preview, updated_at 
       FROM flowcharts 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [userId]
    );
    res.json({ ok: true, flowcharts: result.rows });
  } catch (e) {
    console.log('Ошибка загрузки схем:', e.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новую схему
router.post('/', async (req, res) => {
  const { userId, title, preview, svgContent } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO flowcharts (user_id, title, preview, svg_content, updated_at) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
      [userId, title, preview, svgContent]
    );
    res.json({ ok: true, flowchartId: result.rows[0].id });
  } catch (e) {
    console.log('❌ Ошибка сохранения:', e.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить существующую схему
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { preview, svgContent } = req.body;
  try {
    await pool.query(
      `UPDATE flowcharts SET preview=$1, svg_content=$2, updated_at=NOW() WHERE id=$3`,
      [preview, svgContent, id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.log('❌ Ошибка обновления:', e.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/single/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM flowcharts WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Схема не найдена' });
    res.json({ ok: true, flowchart: result.rows[0] });
  } catch (e) {
    console.log('Ошибка:', e.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Переименовать
router.patch('/rename/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    await pool.query('UPDATE flowcharts SET title=$1 WHERE id=$2', [title, id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM flowcharts WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


module.exports = router;