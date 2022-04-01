const mqttjs = require('mqtt');
const mysql = require('./mysql.service');
const config = require('./config.service');

let client;

let topics = [];

let tempData = {};
let allData = {};
let isWorking = false;

async function MQTTconnect() {
    return new Promise((resolve, reject) => {
        mysql._getTopics().then(data => {
            topics = data;

            console.log('--- MQTTconnect:', topics);

            var endpoint = 'wss://' + config.wqtt_host + ':' + config.wqtt_wss_port;
            let options = {
                username: config.wqtt_username,
                password: config.wqtt_password,
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

                /* Обработать сообщения.
                */
                //console.log('--- message:', topic);
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
                        //console.log('--------------- data:',tempData);
                        //               writeSensorsData
                    }
                }

            });

            resolve();
        }, () => {
            reject();
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

function getCurrentTopics() {
    return topics;
}


/* Проверить изменения в топиках.
    */
function checkTopics() {
    //console.log('--- checkTopics');
    mysql._getTopics().then(data => {

        let newTopics = topicsDiff(data, topics);
        if (newTopics.length > 0) {
            console.log('--- newTopics:', newTopics);
            for (let i = 0; i < newTopics.length; i++) {
                client.subscribe(newTopics[i].topic);
            }
            topics = data;
        }

        let oldTopics = topicsDiff(topics, data);
        if (oldTopics.length > 0) {
            console.log('--- oldTopics:', oldTopics);
            for (let i = 0; i < oldTopics.length; i++) {
                client.unsubscribe(oldTopics[i].topic);
            }
            topics = data;
        }
    });
}

/**
 * Найти разницу `topics1 - topics2`.
 */
 function topicsDiff(topics1, topics2) {
    return topics1.filter(t1 => !topics2.some(t2 => {
        return t1.topic === t2.topic;
    }));
}

module.exports.start = MQTTconnect;
module.exports.stop = stopProcessing;
module.exports.readSensorsData = readSensorsData;
module.exports.getCurrentTopics = getCurrentTopics;
module.exports.checkTopics = checkTopics;

