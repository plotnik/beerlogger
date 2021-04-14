let isWorking = false;
let tick;
let topics = [];
const TICK = 500;

const sensors = [1, 2, 3];

function startStop(event) {
    if (isWorking) {
        $.get("/stop").then(switchButton);
    } else {
        $.get("/start").then(switchButton);
    }
    event.preventDefault();
}


function switchButton() {
    if (isWorking) {
        clearInterval(tick);
        isWorking = false;
    } else {
        tick = setInterval(updateControls, TICK);
        isWorking = true;
    }
    $("#button")[0].innerHTML = isWorking ? "Stop" : "Start";
    //location.reload();
    //console.log("isWorking:", isWorking);
}

function ifx(x) {
    return x || '...';
}

function updateControls() {

    $.get("/topics").then(data => {
        if (topics.length==0) {
            topics = data;
            console.log('topics:', topics);
        } else {
            if (topics.length != data.length) {
                location.reload();
            }
        }
    });

    $.get("/data").then(data => {
        let sensorBox = '';
        for (let i = 0; i < topics.length; i++) {
            let itx = topics[i].site + '/' + topics[i].node;
            let t = data[itx] || {};
            sensorBox += `<tr>
                <td>${ifx(t.site)}</td>
                <td>${ifx(t.node)}</td>
                <td>${ifx(t.sensor)}</td>
                <td>${ifx(t.tstamp)}</td>
            </tr>`;
        }
        $("#sensor-box")[0].innerHTML = sensorBox;
    });
}

$(function () {
    $.get("/data").then(data => {
        isWorking = data.working;
        $("#button")[0].innerHTML = isWorking ? "Stop" : "Start";
        if (isWorking) {
            tick = setInterval(updateControls, TICK);
        }
    });
});