const mqtt = require('./service/mqtt.service');
const mysql = require('./service/mysql.service');

//mqtt.start();
test_mysql();

function test_mysql() {
    console.log("--- test_mysql");
    mysql.start();
    mysql.writeSensorsData({"num":4, "sensor":-30.05350718384101 });
    mysql.stop();
}

