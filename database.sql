-- создаем базу данных
CREATE DATABASE node_gis;

-- подключаемся к базе данных
\connect node_gis

-- создаем таблицу point в базе данных node_gis
CREATE TABLE point (
  id SERIAL PRIMARY KEY,
  lat FLOAT,
  lon FLOAT,
  city VARCHAR(255),
  name VARCHAR(255)
);

-- создаем таблицу gis_post в базе данных node_gis
CREATE TABLE gis_post (
  id SERIAL PRIMARY KEY,
  kaz_hydromet_code VARCHAR(255),
  name_en VARCHAR(255),
  name_ru VARCHAR(255),
  name_kk VARCHAR(255),
  oceanus_code VARCHAR(255),
  measured_parameter_unit_id INTEGER,
  mpc_daily_average FLOAT,
  mpc_max_single FLOAT,
  value FLOAT,
  created_at TIMESTAMP,
  point_id INTEGER,
  FOREIGN KEY (point_id) REFERENCES point (id)
);


-- если хотим посмотреть содержимое таблицы
SELECT * FROM gis_post;
SELECT * FROM point;