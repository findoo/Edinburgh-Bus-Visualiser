var bngconvert = require("bngconvert");
var compress = require('compression');
var crypto = require('crypto');
var csv = require("csv");
var express = require('express');
var http = require('http');
var moment = require('moment');
var request = require('request');
var winston = require('winston');
var zlib = require("zlib");

winston.add(
    winston.transports.File, {
        filename: 'logs.log',
        level: 'info',
        json: true,
        eol: 'n',
        timestamp: true
    }
);

process.on('uncaughtException', (err) => {
    winston.log('fatal', 'Application terminated from uncaught exception.', err);
    process.exit(1);
});

var app = express(),
    port = (process.env.PORT || 8000),
    maxAge = 2629746000;

app.use(express.static('webapp', {
    maxAge: maxAge
}));
app.disable('x-powered-by');

function getAPIKey() {
    var date = new moment().format("YYYYMMDDHH");
    var key = crypto.createHash('md5').update("2E7S4J8WN5MK1DKPCK28YK56C" + date).digest("hex");
    return key;
}

String.prototype.replaceAll = function (t, r) {
    return this.split(t).join(r);
};

function busLocationParsing(input, service, id) {
    var lines = input.split("\n"),
        result = [],
        headers = lines[0].split(",");

    var minId = id;
    var maxId = id;
    if(id) {
        var split = id.replace(/\s+/g, '')
                .split('-')
                .map(str => parseInt(str));
        if(split.length > 1) {
            minId = split[0];
            maxId = split[1];
        }
    }
    
    for (var i = 1; i < lines.length; i++) {
        var vehicle = {},
            currentline = lines[i].split(",");
        for (var j = 0; j < headers.length; j++) {
            if (currentline[j]) {
                var head = headers[j].replaceAll("\"", ""),
                    content = currentline[j].replaceAll("\"", "");
                vehicle[head] = content;
            }
        }
        vehicle["busId"] = parseInt(vehicle.busId);

        switch (vehicle.mnemoService === undefined ? '' : vehicle.mnemoService.substr(0, 1)) {
        case "N":
            vehicle.type = "night";
            break;
        case "T":
            vehicle.type = "tram";
            break;
        default:
            vehicle.type = "bus";
        }

        var coordinates = bngconvert.OSGB36toWGS84(vehicle.x, vehicle.y);
        vehicle.lat = coordinates[0];
        vehicle.lon = coordinates[1];

        if(service) {
            if (service === "All") {
                result.push(vehicle);
            } else if (vehicle.refService === service) {
                result.push(vehicle);
            }
        }

        if(id && (vehicle.busId >= minId && vehicle.busId <= maxId)) {
            result.push(vehicle);
        }
    }
    return JSON.stringify(result);
}

function getGzipped(url, callback) {
    var buffer = [];
    http.get(url, (res) => {
        var gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', (data) => {
            buffer.push(data.toString());
        }).on("end", () => {
            return callback(null, buffer.join(""));
        }).on("error", (e) => {
            return callback(e);
        });
    }).on('error', (e) => {
        return callback(e);
    });
}

app.get('/getServices', (req, res) => {
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getServices",
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
        } else {
            winston.log('error', 'Error fetching getServices', error);
            res.send("Error fetching services");
        }
    });
});

app.get('/getBuses/:service', (req, res) => {
    getGzipped("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations",
        (error, data) => {
            if (!error) {
                res.setHeader('Content-Type', 'application/json');
                var returnData = busLocationParsing(data, req.params.service, undefined);
                res.send(returnData);
            } else {
                winston.log('error', 'Error fetching getBuses', error);
                res.send("Error fetching bus GPS");
            }
        });
});

app.get('/getBus/:id', (req, res) => {
    getGzipped("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations",
        (error, data) => {
            if (!error) {
                res.setHeader('Content-Type', 'application/json');
                var returnData = busLocationParsing(data, undefined, req.params.id);
                res.send(returnData);
            } else {
                winston.log('error', 'Error fetching getBuses', error);
                res.send("Error fetching bus GPS");
            }
        });
});

app.get('/getBusStops', (req, res) => {
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getBusStops",
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
        } else {
            winston.log('error', 'Error fetching getBusStops', error);
            res.send("Error fetching bus stops");
        }
    });
});

app.get('/getRoute/:busId/:journeyId/:nextStop', (req, res) => {
    var par = req.params;
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() +
        "&function=getJourneyTimes&stopId=" + par.nextStop +
        "&journeyId=" + par.journeyId +
        "&busId=" + par.busId,
        json: true
    }, (error, response, body) => {
        if (!error) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
        } else {
            winston.log('error', 'Error fetching getRoute', error);
            res.send("Error fetching journey times");
        }
    });
});

var server = app.listen(port, function () {
    console.log("Server running");
});
module.exports = server;
