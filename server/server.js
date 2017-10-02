var bngconvert = require("bngconvert");
var compression = require('compression');
var crypto = require("crypto");
var express = require("express");
var http = require("http");
var moment = require("moment");
var replaceall = require("replaceall");
var request = require("request");
var timeout = require('connect-timeout');
var zlib = require("zlib");

var app = express(),
    port = (process.env.PORT || 8000);

function getAPIKey() {
    var date = moment().format("YYYYMMDDHH");
    return crypto.createHash("md5").update("2E7S4J8WN5MK1DKPCK28YK56C".concat(date)).digest("hex");
}

function busLocationParsing(input, service, id, res) {
    var outputArray = [],
        lines = input.split("\n"),
        headers = lines[0].split(",");

    // fleet ID filtering limits (allows entering range of X - Y)
    var minFleetId = id;
    var maxFleetId = id;
    if (id) {
        var split = id.replace(/\s+/g, "")
            .split("-")
            .map(str => parseInt(str));
        if (split.length > 1) {
            minFleetId = split[0];
            maxFleetId = split[1];
        }
    }

    // parse the raw CSV into Object
    if (lines.length > 1) {
        for (var i = 1; i < lines.length; i++) {
            var vehicle = getVehicle(lines[i], headers);

            if (service) {
                if (service === "All" || vehicle.refService === service) {
                    outputArray.push(vehicle);
                }
            } else if (id && (vehicle.busId >= minFleetId && vehicle.busId <= maxFleetId)) {
                outputArray.push(vehicle);
            }
        }
    }
    res.write(JSON.stringify(outputArray));
    res.end();
}

function getVehicle(line, headers) {
    var vehicle = {},
        currentLine = line.split(",");
    for (var i = 0; i < headers.length; i++) {
        if (currentLine[i]) {
            var head = replaceall("\"", "", headers[i]),
                content = replaceall("\"", "", currentLine[i]);
            vehicle[head] = content;
        }
    }

    return cleanUpVehicleData(vehicle);
}

function cleanUpVehicleData(vehicle) {
    vehicle.busId = parseInt(vehicle.busId);
    vehicle.type = getType(vehicle);

    var coordinates = bngconvert.OSGB36toWGS84(vehicle.x, vehicle.y);
    vehicle.lat = coordinates[0];
    vehicle.lon = coordinates[1];
    return vehicle;
}

function getType(vehicle) {
    switch (vehicle.mnemoService === undefined ? "" : vehicle.mnemoService.substr(0, 1)) {
    case "N":
        return "night";
    case "T":
        return "tram";
    default:
        if (vehicle.busId >= 251 && vehicle.busId <= 277) {
            return "tram";
        } else {
            return "bus";
        }
    }
}

function getGzipped(url, callback) {
    var headers = { "Accept-Encoding": "gzip" };

    var buffer = [];
    var gunzip = zlib.createGunzip();

    request({ url, headers })
        .pipe(gunzip);

    gunzip.on("data", (data) => {
        buffer.push(data.toString());
    }).on("finish", () => {
        return callback(undefined, buffer.join(""));
    }).on("error", (e) => {
        return callback(e, "");
    });
}

app.get("/getServices", function (req, res) {
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getServices",
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.set("Connection", "close");
            res.setHeader("Content-Type", "application/json");
            res.json(body);
        } else {
            console.error(error);
            res.status(500).end();
        }
    });
});

app.get("/getBuses/:service", function (req, res) {
    console.log(moment().format() + ' - get buses - ' + req.params.service);
    getGzipped("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations",
        (error, data) => {
            if (!error) {
                res.set("Connection", "close");
                res.setHeader("Content-Type", "application/json");
                busLocationParsing(data, req.params.service, undefined, res);
            } else {
                console.error(error);
                res.status(500).send(error);
            }
        });
});

app.get("/getBus/:id", function (req, res) {
    console.log(moment().format() + ' - get bus - ' + req.params.id);
    getGzipped("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations",
        (error, data) => {
            if (!error) {
                res.set("Connection", "close");
                res.setHeader("Content-Type", "application/json");
                busLocationParsing(data, undefined, req.params.id, res);
            } else {
                console.error(error);
                res.status(500).send(error);
            }
        });
});

app.get("/getBusStops", function (req, res) {
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getBusStops",
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.set("Connection", "close");
            res.setHeader("Content-Type", "application/json");
            res.json(body);
        } else {
            console.error(error);
            res.status(500).send(error);
        }
    });
});

app.get("/getRoute/:busId/:journeyId/:nextStop", function (req, res) {
    console.log(moment().format() + ' - get route - ' + req.params.busId);
    var par = req.params;
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() +
        "&function=getJourneyTimes&stopId=" + par.nextStop +
        "&journeyId=" + par.journeyId +
        "&busId=" + par.busId,
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.set("Connection", "close");
            res.setHeader("Content-Type", "application/json");
            res.json(body);
        } else {
            console.error(error);
            res.status(500).send(error);
        }
    });
});

http.globalAgent.maxSockets = Infinity;

app.use(compression());
app.use(express.static("webapp"));
app.use(timeout(120000));
app.use((err, req, res, next) => {
    if (req.timedout) {
        console.error(req + ' timed out');
    }
    next();
});

module.exports = app.listen(port, () => {
    console.log("Server running on port - " + port);
});