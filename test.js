const b = require('./service/beerlogger.service');
const mqtt = require('./service/mqtt.service');

b.start();
//testTopicsDiff();

function testTopicsDiff() {
    let topics1 = [
        { "id": 1, "topic": "s1/n1/noise/decibels" },
        { "id": 2, "topic": "s1/n2/noise/decibels" }
    ];
    let topics2 = [
        { "id": 1, "topic": "s1/n1/noise/decibels" },
        { "id": 2, "topic": "s1/n2/noise/decibels" },
        { "id": 3, "topic": "s1/n3/noise/decibels" }
    ];

    let diff_1 = mqtt.topicsDiff(topics1, topics2);
    console.log('--- diff_1:', diff_1);

    let diff_2 = mqtt.topicsDiff(topics2, topics1);
    console.log('--- diff_2:', diff_2);

    let diff_3 = mqtt.topicsDiff(topics2, topics2);
    console.log('--- diff_3:', diff_3);
}