import { pool, insertDataIntoPointTable, insertDataIntoPostTable } from "./db.js";

async function getPoints() {
  try {
    const client = await pool.connect();
    
    const query = `
      SELECT * FROM point;
    `; 

    const result = await client.query(query);

    client.release();

    return result.rows;
  } catch (error) {
    console.error('Ошибка при получении информации о датчиках:', error);
  } 
}

function filterDataByCity(data) {
  let result = []
  data.forEach((e) => {
    if (e.monitoringPost.northLatitude >= 43 &&
      e.monitoringPost.northLatitude <= 44 &&
      e.monitoringPost.eastLongitude >= 76 &&
      e.monitoringPost.eastLongitude <= 77.5) {
        e.city = 'Almaty';
        result.push(e);
      }
  });

  return result;
}

function createData(data) {
  let result = [];

  data.forEach((e) => {
    if (!result.filter((el) => el.monitoring_post_id === e.monitoringPostId).length) {
      const resObj = {
        name: e.monitoringPost.name,
        monitoring_post_id: e.monitoringPostId,
        lat: e.monitoringPost.northLatitude,
        lon: e.monitoringPost.eastLongitude,
        city: e.city,
        posts: [
          {
            kaz_hydromet_code: e.measuredParameter.kazhydrometCode,
            name_en: e.measuredParameter.nameShortEN,
            name_ru: e.measuredParameter.nameShortRU,
            name_kk: e.measuredParameter.nameShortKK,
            oceanus_code: e.measuredParameter.oceanusCode,
            measured_parameter_unit_id: e.measuredParameter.measuredParameterUnitId,
            mpc_daily_average: e.measuredParameter.mpcDailyAverage,
            mpc_max_single: e.measuredParameter.mpcMaxSingle,
            value: e.value
          },
        ],
      };

      result.push(resObj);
    } else {
      result.forEach((el) => {
        if (el.monitoring_post_id === e.monitoringPostId) {
          el.posts.push({
            kaz_hydromet_code: e.measuredParameter.kazhydrometCode,
            name_en: e.measuredParameter.nameShortEN,
            name_ru: e.measuredParameter.nameShortRU,
            name_kk: e.measuredParameter.nameShortKK,
            oceanus_code: e.measuredParameter.oceanusCode,
            measured_parameter_unit_id: e.measuredParameter.measuredParameterUnitId,
            mpc_daily_average: e.measuredParameter.mpcDailyAverage,
            mpc_max_single: e.measuredParameter.mpcMaxSingle,
            value: e.value
          });
        }
      });
    }
  });

  return result;
}

async function fetchDataAndUpdateDatabase() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWNhZ29yQG91dGxvb2suY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiS2F6aHlkcm9tZXQiLCJuYmYiOjE2NzcxMzA2NjAsImV4cCI6MTcwODc1MzA2MCwiaXNzIjoiU21hcnRFY28iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUyMjA3LyJ9.gpFBGaHbJ5sdv5AWU0TkujO6E4sR_HxRKgUrd7nrcaQ'; // Замените 'YOUR_USER_TOKEN' на ваш реальный токен

  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() - 190);
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const year = String(currentDate.getFullYear());
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  const currentTime = `${hours}:${minutes}:${seconds}`;
  const currentDateFormatted = `${year}-${month}-${day}`;

  const apiUrl = 'http://185.125.44.116:8084/api/MeasuredDatas';
  const queryParams = new URLSearchParams({
    SortOrder: 'MonitoringPost',
    Language: 'en',
    DateTimeFrom: currentDateFormatted + 'T' + currentTime,
    PageSize: 100,
    PageNumber: 1,
    Averaged: true,
  });

  const fullUrl = `${apiUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('ok')
      const data = await response.json();
      const filteredData = filterDataByCity(data);
      
      const monitoringData = createData(filteredData);
      
      const pointsData = await getPoints()
      // Добавляем данные в базу данных
      for (const dataItem of monitoringData) {
        let pointId, flag = 1;
        for (let pointData of pointsData) {
          if (pointData.id === dataItem.monitoring_post_id) {
            pointId = pointData.id;
            flag = 0;
            break;
          }  
        }

        if (flag === 1) {
          const pointData = {
            id: dataItem.monitoring_post_id,
            lat: dataItem.lat,
            lon: dataItem.lon,
            name: dataItem.name,
            city: dataItem.city
          };
          
          // Добавляем запись в таблицу "point"
          const point = await insertDataIntoPointTable(pointData);
          pointId = point.id;
        }

        for (const postData of dataItem.posts) {
          const post = {
            kaz_hydromet_code: postData.kaz_hydromet_code,
            measured_parameter_unit_id: postData.measured_parameter_unit_id,
            mpc_daily_average: postData.mpc_daily_average,
            mpc_max_single: postData.mpc_max_single,
            name_en: postData.name_en,
            name_ru: postData.name_ru,
            name_kk: postData.name_kk,
            value: postData.value,
            created_at: new Date(),
            point_id: pointId, // Используйте правильное поле, которое связывает точку и пост в вашей базе данных
          };

          // Добавляем запись в таблицу "gis_post"
          await insertDataIntoPostTable(post);
        }
      }

      console.log('Данные успешно добавлены в базу данных');
    } else {
      throw new Error('Ошибка при получении данных');
    }
  } catch (error) {
    console.error('Ошибка при запросе данных:', error);
  }
}

// Вызываем функцию для получения данных и добавления их в базу данных
fetchDataAndUpdateDatabase();
