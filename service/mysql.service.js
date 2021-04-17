const mysql = require('mysql');
const config = require('./config.service');

let pool;

async function MySQLconnect(func) {

  const mysqlConfig = {
    connectionLimit: 10,
    host: config.mysql_host,
    user: config.mysql_user,
    password: config.mysql_password,
    database: config.mysql_database
  };

  pool = mysql.createPool(mysqlConfig);

  return _getPoolConnection();
}

async function _getPoolConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject();
      } else {
        resolve(connection);
      }
    });
  });
}

function writeSensorsData(data) {
  _getPoolConnection().then(conn => {
    //console.log('--- writeSensorsData:', data);
    conn.query('INSERT INTO sensors (site, node, sensor) VALUES (?, ?, ?)',
      [data.site, data.node, data.sensor], (error, results, fields) => {

        conn.release();
        if (error) {
          if (error.code != 'ER_DUP_ENTRY') {
            console.log(error);
          } else {
            /* В базе уже есть запись от этого датчика
             * за эту секунду, игнорируем.
             */
          }
        }
      });
  });
}

function stopProcessing() {
  pool.end();
}

async function _getTopics() {
  return new Promise((resolve, reject) => {
    _getPoolConnection().then(conn => {
      conn.query('SELECT site,node,topic FROM topics', (error, results, fields) => {

        conn.release();
        if (error) {
          reject();
        } else {
          resolve(results);
        }
      });
    });
  });
}

module.exports.start = MySQLconnect;
module.exports.stop = stopProcessing;
module.exports.writeSensorsData = writeSensorsData;
module.exports._getTopics = _getTopics;
