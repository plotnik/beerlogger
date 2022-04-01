const mysql = require('./mysql.service');
const mqtt = require('./mqtt.service');
const config = require('./config.service');

var timer;

function startLogger() {
    console.log('--- start');
    mysql.start().then(mqtt.start().then(() => {
        timer = setInterval(mqtt.checkTopics, config.refresh_topics_sec*1000);
    }));
    return { success: true };
}

function stopLogger() {
    console.log('--- stop');
    clearInterval(timer);
    mqtt.stop();
    return { success: true };
}

module.exports.start = startLogger;
module.exports.stop = stopLogger;
