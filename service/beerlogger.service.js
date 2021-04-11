const mysql = require('./mysql.service');
const mqtt = require('./mqtt.service');

function startLogger() {
    console.log('--- start');
    mysql.start().then(mqtt.start());
    return { success: true };
}

function stopLogger() {
    console.log('--- stop');
    mqtt.stop();
    return { success: true };
}

module.exports.start = startLogger;
module.exports.stop = stopLogger;
