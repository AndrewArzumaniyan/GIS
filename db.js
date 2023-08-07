import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  password: '28122011',
  host: 'localhost',
  port: 5432,
  database: 'node_gis'
});

async function insertDataIntoPointTable(data) {
  try {
    // подсоединяемся к базе данных
    const client = await pool.connect();

    // создаем sql запрос
    const query = `
      INSERT INTO point (lat, lon, name, city, id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    // параметры вставки
    const values = [data.lat, data.lon, data.name, data.city, data.id];

    // выполняем запрос
    const result = await client.query(query, values);

    // отключаемся
    client.release();

    // возвращаем данные из функции
    return result.rows[0];
  } catch (error) {
    console.error('Ошибка при добавлении данных:', error);
    throw error;
  }
}

async function insertDataIntoPostTable(data) {
  try {
    // подсоединяемся к базе данных
    const client = await pool.connect();

    // создаем sql запрос
    const query = `
      INSERT INTO gis_post (kaz_hydromet_code, name_en, name_ru, name_kk, oceanus_code, measured_parameter_unit_id, mpc_daily_average, mpc_max_single, created_at, point_id, value)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    // параметры вставки
    const values = [
      data.kaz_hydromet_code,
      data.name_en,
      data.name_ru,
      data.name_kk,
      data.oceanus_code, 
      data.measured_parameter_unit_id, 
      data.mpc_daily_average, 
      data.mpc_max_single, 
      data.created_at, 
      data.point_id,
      data.value
    ];

    // выполняем запрос
    const result = await client.query(query, values);

    // отключаемся
    client.release();

    // возвращаем данные из функции
    return result.rows[0];
  } catch (error) {
    console.error('Ошибка при добавлении данных:', error);
    throw error;
  }
}

export { pool, insertDataIntoPointTable, insertDataIntoPostTable };