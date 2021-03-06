const express = require('express');
const path = require('path');
const mqtt = require('./service/mqtt.service');
const config = require('./service/config.service');
const b = require('./service/beerlogger.service');

const port = process.env.PORT || config.app_port;

let app = express();

app.use(express.static(path.join(__dirname, 'public')));


app.get('/data', (req, res, next) => {
    let data = mqtt.readSensorsData();
    res.send(data);
});

app.get('/topics', (req, res, next) => {
    let topics = mqtt.getCurrentTopics();
    res.send(topics);
});

app.get('/start', (req, res, next) => {
    let result = b.start();
    res.send(result);
});

app.get('/stop', (req, res, next) => {
    let result = b.stop();
    res.send(result);
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
app.listen(port, () => console.log('[app] BeerLogger1 started on port ' + port));

b.start();

module.exports = app;
