const mqttjs = require('mqtt');
const mysql = require('./mysql.service');

let host = "M4.WQTT.RU";
let port = 3097;
let topics = [];

let client;
let tempData = {};
let allData = {};
let isWorking = false;

function MQTTconnect() {
    mysql.getTopics().then(data => {
        topics = data;

        console.log('--- MQTTconnect:', topics);

        var endpoint = 'wss://' + host + ':' + port;
        let options = {
            username: "u_177PB1",
            password: "899FSWSo",
        };

        isWorking = true;
        client = mqttjs.connect(endpoint, options);
        client.on('connect', () => {
            for (let i = 0; i < topics.length; i++) {
                client.subscribe(topics[i].topic);
                //console.log('--- subscribe:', topics[i].topic);
            }
        });
        client.on('message', function (topic, message) {
            for (let i = 0; i < topics.length; i++) {
                if (topic === topics[i].topic) {
                    tempData = {
                        "tstamp": timestamp(),
                        "sensor": parseFloat(message.toString()),
                        "node": topics[i].node,
                        "site": topics[i].site
                    }
                    let itx = topics[i].site + '/' + topics[i].node;
                    allData[itx] = tempData;
                    mysql.writeSensorsData(tempData);
                    //console.log(tempData)
                }
            }
        });
    });
}

function timestamp() {
    return Date().slice(16, 24);
    //return new Date().toISOString();
}

function stopProcessing() {
    isWorking = false;
    client.end(function () {
        mysql.stop();
    });
}

function readSensorsData() {
    allData.working = isWorking;
    return allData;
}

function getTopics() {
    return topics;
}

module.exports.start = MQTTconnect;
module.exports.stop = stopProcessing;
module.exports.readSensorsData = readSensorsData;
module.exports.getTopics = getTopics;
