const mysql = require('mysql');
const config = require('./config.service');

let connection;

function MySQLconnect(func) {
  const mysqlConfig = {
    host: config.mysql_host,
    user: config.mysql_user,
    password: config.mysql_password,
    database: config.mysql_database
  };

  connection = mysql.createConnection(mysqlConfig);
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
