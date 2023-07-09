function createTableTr(key, value) {
  const tr = document.createElement('tr');
  const tdKey = document.createElement('td');
  const tdValue = document.createElement('td');

  tdKey.innerHTML = `<div>${key}</div>`;
  tdValue.innerHTML = `<div>${value}</div>`;

  tr.append(tdKey);
  tr.append(tdValue);
  return tr;
}

function createModalContent(point) {
  const title = document.createElement('h3');
  const modalBox = document.createElement('div');
  title.classList.add('modal-title');
  modalBox.classList.add('modal-box');
  title.textContent = point.name;

  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body');

  const table = document.createElement('table');
  table.classList.add('modal-table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  thead.innerHTML = `<tr><th>Загрязняющие вещества</th><th>Концентрация</th></tr>`;

  for(let i = 0; i < point.posts.length; i++) {
    const post = point.posts[i];
    const tr = createTableTr(post.kazhydrometCode, post.mpcDailyAverage);

    tbody.append(tr);
  }

  table.append(thead);
  table.append(tbody);

  modalBox.append(title);
  modalBody.append(table);
  modalBox.append(modalBody);
  
  return modalBox;
}

function openModal(point) {
  const modal = document.getElementById('modal');
  const modalWrapper = document.querySelector('.modal-wrapper');
  modal.classList.add('active');

  const closeBtn = modal.querySelector('.modal-btn-close');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active')
    modalWrapper.querySelector('.modal-box').remove()
  });

  const modalBody = createModalContent(point);

  modalWrapper.append(modalBody)
}

function initialMap(data) {
  ymaps.ready(() => {
    const myMap = new ymaps.Map("map", {
        center: [43.237163, 76.945627],
        zoom: 11
    });

    for (let i = 0; i < data.length; i++) {
      let point = data[i];
      let content = '';

      for (let j = 0; j < point.posts.length; j++) {
        content += point.posts[j].kazhydrometCode + ': ' + point.posts[j].mpcDailyAverage + ' | ';
      }

      let marker = new ymaps.Placemark([point.coors[0], point.coors[1]]);
      myMap.geoObjects.add(marker);

      marker.events.add('click', () => {
        openModal(point);
      });
    }
  });
}

export default initialMap;