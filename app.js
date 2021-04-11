const express = require('express');
const path = require('path');
const mqtt = require('./service/mqtt.service');
const mysql = require('./service/mysql.service');

const port = process.env.PORT || 4200;

let app = express();

app.use(express.static(path.join(__dirname, 'public')));

let readingSensors = false;

app.get('/data', (req, res, next) => {
    let data = mqtt.readSensorsData();
    res.send(data);
});

app.get('/topics', (req, res, next) => {
    let topics = mqtt.getTopics();
    res.send(topics);
});

app.get('/start', (req, res, next) => {
    console.log('--- start');
    mysql.start().then(mqtt.start());
    res.send({ success: true });
});

app.get('/stop', (req, res, next) => {
    console.log('--- stop');
    mqtt.stop();
    res.send({ success: true });
});

app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

// start server
app.listen(port, () => console.log('[app] BeerLogger started on port ' + port));

module.exports = app;
