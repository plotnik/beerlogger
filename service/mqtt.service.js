const mqttjs = require('mqtt');
const mysql = require('./mysql.service');
const config = require('./config.service');

let client;

let topics = [];
let updatedTopics = [];
let lastTopicsUpdate = Date.now();
let tempData = {};
let allData = {};
let isWorking = false;

function MQTTconnect() {
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

            /* Проверить изменения в топиках.
             */
            const curTime = Date.now();
            if (curTime - lastTopicsUpdate > config.refresh_topics_sec*1000) {
                lastTopicsUpdate = curTime;
                mysql._getTopics().then(data => {

                    let newTopics = topicsDiff(topics, data);
                    if (newTopics.length > 0) {
                        console.log('--- newTopics:', newTopics);
                        for (let i = 0; i < newTopics.length; i++) {
                            client.subscribe(newTopics[i].topic);
                        }
                    }

                    let oldTopics = topicsDiff(data, topics);
                    if (oldTopics.length > 0) {
                        console.log('--- oldTopics:', oldTopics);
                        for (let i = 0; i < oldTopics.length; i++) {
                            client.unsubscribe(oldTopics[i].topic);
                        }
                    }
                });
            }
        });
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

module.exports.start = MQTTconnect;
module.exports.stop = stopProcessing;
module.exports.readSensorsData = readSensorsData;
module.exports.getCurrentTopics = getCurrentTopics;
module.exports.topicsDiff = topicsDiff;
