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

app.use(compression());
http.globalAgent.maxSockets = Infinity;

function haltOnTimedout(req, res, next){
    if (!req.timedout) next();
}

function getAPIKey() {
    var date = moment().format("YYYYMMDDHH");
    return crypto.createHash("md5").update("2E7S4J8WN5MK1DKPCK28YK56C" + date).digest("hex");
}

function busLocationParsing(input, service, id, res) {
    res.write("[");

    var lines = input.split("\n"),
        headers = lines[0].split(","),
        written = 0;

    var minId = id;
    var maxId = id;
    if (id) {
        var split = id.replace(/\s+/g, "")
            .split("-")
            .map(str => parseInt(str));
        if (split.length > 1) {
            minId = split[0];
            maxId = split[1];
        }
    }

    if (lines.length > 0) {
        for (var i = 1; i < lines.length; i++) {
            var vehicle = {},
                currentline = lines[i].split(",");
            for (var j = 0; j < headers.length; j++) {
                if (currentline[j]) {
                    var head = replaceall("\"", "", headers[j]),
                        content = replaceall("\"", "", currentline[j]);
                    vehicle[head] = content;
                }
            }
            vehicle.busId = parseInt(vehicle.busId);

            switch (vehicle.mnemoService === undefined ? "" : vehicle.mnemoService.substr(0, 1)) {
            case "N":
                vehicle.type = "night";
                break;
            case "T":
                vehicle.type = "tram";
                break;
            default:
                if (vehicle.busId >= 251 && vehicle.busId <= 277) {
                    vehicle.type = "tram";
                } else {
                    vehicle.type = "bus";
                }
            }

            var coordinates = bngconvert.OSGB36toWGS84(vehicle.x, vehicle.y);
            vehicle.lat = coordinates[0];
            vehicle.lon = coordinates[1];

            if (service) {
                if (service === "All") {
                    res.write((written > 0 ? ',' : '') + JSON.stringify(vehicle));
                    written++;
                } else if (vehicle.refService === service) {
                    res.write((written > 0 ? ',' : '') + JSON.stringify(vehicle));
                    written++;
                }
            } else if (id && (vehicle.busId >= minId && vehicle.busId <= maxId)) {
                res.write((written > 0 ? ',' : '') + JSON.stringify(vehicle));
                written++;
            }
        }
    }
    res.write(']');
    res.end();
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
            res.json(body);
        } else {
            res.status(500).end();
        }
    });
});

app.get("/getBuses/:service", function (req, res) {
    getGzipped("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations",
        (error, data) => {
            if (!error) {
                res.setHeader("Content-Type", "application/json");
                busLocationParsing(data, req.params.service, undefined, res);
            } else {
                res.status(500).end();
            }
        });
});

app.get("/getBus/:id", function (req, res) {
    getGzipped("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations",
        (error, data) => {
            if (!error) {
                res.setHeader("Content-Type", "application/json");
                busLocationParsing(data, undefined, req.params.id, res);
            } else {
                res.status(500).end();
            }
        });
});

app.get("/getBusStops", function (req, res) {
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getBusStops",
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.json(body);
        } else {
            res.status(500).end();
        }
    });
});

app.get("/getRoute/:busId/:journeyId/:nextStop", function (req, res) {
    var par = req.params;
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() +
        "&function=getJourneyTimes&stopId=" + par.nextStop +
        "&journeyId=" + par.journeyId +
        "&busId=" + par.busId,
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.setHeader("Content-Type", "application/json");
            res.json(body);
        } else {
            res.status(500).end();
        }
    });
});

app.use(express.static("webapp"));

app.use(timeout(120000));
app.use(haltOnTimedout);

var server = app.listen(port, () => {
    console.log("Server running");
});
module.exports = server;