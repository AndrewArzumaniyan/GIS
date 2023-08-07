import { pool } from "../db.js";

class Point {
  async getPoints(req, res) {
    try {
      const client = await pool.connect();
      
      const query = `
        SELECT * FROM point;
      `; 
  
      const result = await client.query(query);
  
      client.release();
  
      const points = result.rows;
  
      res.json(points);
    } catch (error) {
      console.error('Ошибка при получении информации о датчиках:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    } 
  }

  // данные о загрязнения за день по датчику
  async getPointDataDay(req, res) {
    try {
      const { id, time } = req.params;
      const [day, month, year] = time.split('-');
      const formattedDate = `${year}-${month}-${day}`;
    
      const client = await pool.connect();
    
      const query = `
        SELECT * FROM gis_post WHERE point_id = $1 AND created_at::date = $2;
      `;
    
      const result = await client.query(query, [id, formattedDate]);
    
      client.release();
    
      const posts = result.rows;
    
      res.json(posts);
    } catch (error) {
      console.error('Ошибка при получении информации о датчиках:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
  

  // загрязнение по всем датчикам в какое-то время
  async getDataPerTime(req, res) {
    try {
      const { time } = req.params;
  
      // Разбиваем строку на составляющие
      const [date, timeStr] = time.split('T');
      const [day, month, year] = date.split('-').map(Number);
      const [hours, minutes, seconds] = timeStr.split('-').map(Number);
  
      // Создаем объект Date на основе составляющих
      const startTime = new Date(year, month - 1, day, hours, minutes, seconds);
      const endTime = new Date(year, month - 1, day, hours, minutes, seconds);
      
      // Добавляем 30 минут к startTime и вычитаем 30 минут из endTime
      startTime.setMinutes(startTime.getMinutes() - 30);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      console.log(startTime, endTime)
  
      const client = await pool.connect();
  
      const query = `
        SELECT * FROM gis_post WHERE created_at BETWEEN $1 AND $2;
      `;
  
      const result = await client.query(query, [startTime, endTime]);
  
      client.release();
  
      const posts = result.rows;
  
      res.json(posts);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
};

const point = new Point();

export default point;