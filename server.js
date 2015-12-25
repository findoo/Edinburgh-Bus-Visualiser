var http = require('http');
var moment = require('moment');
var request = require('request');
var crypto = require('crypto');
var express = require('express');
var zlib = require("zlib");
var csv = require("csv");
var bngconvert = require("bngconvert");

var app = express();

var mode = "DEV",
    timeOffset = 0,
    port = 8000;
if (mode !== "DEV") {
    timeOffset = 5;
    port = 80;
}

app.use(express.static('public'));

function getAPIKey() {
    var date = new moment().add(timeOffset, 'h').format("YYYYMMDDHH");
    var key = crypto.createHash('md5').update("2E7S4J8WN5MK1DKPCK28YK56C" + date).digest("hex");
    return key;
}

String.prototype.replaceAll = function (t, r) {
    return this.split(t).join(r);
};

function busLocationParsing(input, service) {
    var lines = input.split("\n"),
        result = [],
        headers = lines[0].split(",");
    for (var i = 1; i < lines.length; i++) {
        var obj = {},
            currentline = lines[i].split(",");
        for (var j = 0; j < headers.length; j++) {
            if (currentline[j] !== undefined) {
                var head = headers[j].replaceAll("\"", ""),
                    cont = currentline[j].replaceAll("\"", "");
                obj[head] = cont;
            }
        }

        obj.type = "bus";
        if (obj.mnemoService !== undefined) {
            var firstChar = obj.mnemoService.substr(0, 1);
            if (firstChar == "N") {
                obj.type = "night";
            } else if (firstChar == "T") {
                obj.type = "tram";
            }
        }

        var coordinates = bngconvert.OSGB36toWGS84(obj.x, obj.y);
        obj.lat = coordinates[0];
        obj.lon = coordinates[1];

        if (service !== "All") {
            if (obj['refService'] == service) {
                result.push(obj);
            }
        } else {
            result.push(obj);
        }
    }
    return JSON.stringify(result);
}

function getGzipped(url, callback) {
    var buffer = [];
    http.get(url, function (res) {
        var gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', function (data) {
            buffer.push(data.toString())
        }).on("end", function () {
            callback(null, buffer.join(""));
        }).on("error", function (e) {
            callback(e);
        })
    }).on('error', function (e) {
        callback(e)
    });
}

app.get('/getServices', function (req, res) {
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getServices",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
        }
    })
});

app.get('/getBuses/:service', function (req, res) {
    getGzipped("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations", function (err, data) {
        res.setHeader('Content-Type', 'application/json');
        var returnData = busLocationParsing(data, req.params.service);
        res.send(returnData);
    });
});

app.get('/getBusStops', function (req, res) {
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getBusStops",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
        }
    })
});

app.get('/getRoute/:busId/:journeyId/:nextStop', function (req, res) {
    var par = req.params;
    request({
        url: "http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getJourneyTimes&stopId=" + par.nextStop + "&journeyId=" + par.journeyId + "&busId=" + par.busId,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
        }
    })
});

var server = app.listen(port, function () {
    console.log("Server running in mode: " + mode);
});