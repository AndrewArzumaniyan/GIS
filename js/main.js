import initialMap from "./map.js"

function createData(data) {
  let result = []
  data.forEach((e) => {
    if (!result.filter((el) => el.monitoringPostId === e.monitoringPostId).length) {
      const resObj = {
        name: e.monitoringPost.name,
        monitoringPostId: e.monitoringPostId,
        coors: [e.monitoringPost.northLatitude, e.monitoringPost.eastLongitude],
        posts: [
          {
            kazhydrometCode:  e.measuredParameter.kazhydrometCode,
            measuredParameterUnit: e.measuredParameter.measuredParameterUnit,
            measuredParameterUnitId: e.measuredParameter.measuredParameterUnitId,
            mpcDailyAverage: e.measuredParameter.mpcDailyAverage,
            mpcMaxSingle: e.measuredParameter.mpcMaxSingle,
          }
        ],
      }
  
      result.push(resObj)
    } else {
      result.forEach((el) => {
        if (el.monitoringPostId === e.monitoringPostId) {
          el.posts.push({
            kazhydrometCode:  e.measuredParameter.kazhydrometCode,
            measuredParameterUnit: e.measuredParameter.measuredParameterUnit,
            measuredParameterUnitId: e.measuredParameter.measuredParameterUnitId,
            mpcDailyAverage: e.measuredParameter.mpcDailyAverage,
            mpcMaxSingle: e.measuredParameter.mpcMaxSingle,
          })
        }
      })
    }
  })

  return result
}

document.addEventListener('DOMContentLoaded', () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWNhZ29yQG91dGxvb2suY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiS2F6aHlkcm9tZXQiLCJuYmYiOjE2NzcxMzA2NjAsImV4cCI6MTcwODc1MzA2MCwiaXNzIjoiU21hcnRFY28iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUyMjA3LyJ9.gpFBGaHbJ5sdv5AWU0TkujO6E4sR_HxRKgUrd7nrcaQ'; // Замените 'YOUR_USER_TOKEN' на ваш реальный токен

  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() - 20);
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const year = String(currentDate.getFullYear());
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  const currentTime = `${hours}:${minutes}:${seconds}`;
  const currentDateFormatted = `${year}-${month}-${day}`;

  console.log(currentDateFormatted + 'T' + currentTime);

  const apiUrl = 'https://185.125.44.116:8084/api/MeasuredDatas';
  const queryParams = new URLSearchParams({
    SortOrder: 'MonitoringPost', 
    Language: 'en', 
    DateTimeFrom: currentDateFormatted + 'T' + currentTime, 
    PageSize: 100, 
    PageNumber: 1, 
    Averaged: true,
  });

  const fullUrl = `${apiUrl}?${queryParams.toString()}`;

  fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => response.json())
  .then((data) => {
    const filteredData = data.filter((item) => {
      return (
        item.monitoringPost.northLatitude >= 43 && item.monitoringPost.northLatitude <= 44 &&
        item.monitoringPost.eastLongitude >= 76 && item.monitoringPost.eastLongitude <= 77.5
      );
    });

    const monitoringData = createData(filteredData)
    
    console.log(filteredData)
    console.log(monitoringData)
    
    initialMap(monitoringData);
  })
  .catch((error) => {
    console.error('Ошибка при запросе данных:', error);
  });
});
