import { pool } from "../db.js";

class Post {
  async getPosts(req, res) {
    try {
      const client = await pool.connect();

      const query = `
        SELECT * FROM gis_post;
      `;

      const result = await client.query(query);

      client.release();
      
      const posts = result.rows;
      res.json(posts);
    } catch (error) {
      console.error('Ошибка при получении постов:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  async getPostsByPointId(req, res) {
    try {
      const pointId = req.params.pointId;

      const client = await pool.connect();

      const query = `
        SELECT * FROM gis_post WHERE point_id = $1;
      `;

      const result = await client.query(query, [pointId]);

      client.release();
      
      const posts = result.rows;
      res.json(posts);
    } catch (error) {
      console.error('Ошибка при получении постов:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  async getPostsByPointIdPerTime(req, res) {
    try {
      const pointId = req.params.pointId;
      const timeStr = req.params.time;

      // Парсим строку запроса с временем в объект Date
      const parts = timeStr.split(/[T:-]/).map(Number);
      console.log(parts)
      const [day, month, year, hours, minutes, seconds] = parts;
      // Месяцы в JavaScript объекте Date начинаются с 0, поэтому вычитаем 1 из значения месяца
      const time = new Date(year, month - 1, day, hours, minutes, seconds);

      const client = await pool.connect();

      // Проверка на валидность даты
      if (isNaN(time.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      // Calculate the time range (± 19 minutes 59 seconds)
      const timeRangeStart = new Date(time.getTime() - 19 * 60 * 1000);
      const timeRangeEnd = new Date(time.getTime() + 19 * 60 * 1000);

      // SQL-запрос для получения постов для указанной точки в указанном временном диапазоне
      const query = `
        SELECT * 
        FROM gis_post 
        WHERE point_id = $1 
        AND created_at BETWEEN $2 AND $3;
      `;

      // Выполнение SQL-запроса с использованием параметров pointId и временного диапазона
      const result = await pool.query(query, [pointId, timeRangeStart, timeRangeEnd]);
      
      client.release();

      const posts = result.rows;

      return res.json(posts);
    } catch (err) {
      console.error('Error fetching posts by pointId and time:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

}

const post = new Post();

export default post;