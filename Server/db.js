const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Redact',
  user: 'postgres',
  password: 'postgres',
});

pool.connect((err, client, done) => {
  if (err) {
    console.log('Ошибка подключения к БД:', err.message);
  } else {
    console.log('БД подключена успешно');
    done();
  }
});

module.exports = pool;