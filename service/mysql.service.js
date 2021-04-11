const mysql = require('mysql');

let connection;

function MySQLconnect(func) {
  connection = mysql.createConnection({
    host: 'server193.hosting.reg.ru',
    user: 'u1342734_mysql',
    password: '899FSWSo',
    database: 'u1342734_mqtt'
  });
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

function writeSensorsData(data) {
  connection.query('INSERT INTO sensors (site, node, sensor) VALUES (?, ?, ?)',
                   [data.site, data.node, data.sensor], (error, results, fields) => {
    if (error) {
      console.log(error);
    }
  });
}

function stopProcessing() {
  connection.end();
}

function getTopics() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT site,node,topic FROM topics', (error, results, fields) => {
      if (error) {
        reject();
      } else {
        resolve(results);
      }
    });
  });
}

module.exports.start = MySQLconnect;
module.exports.stop = stopProcessing;
module.exports.writeSensorsData = writeSensorsData;
module.exports.getTopics = getTopics;
