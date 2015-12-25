var myApp = angular.module('tracker', ['angularMoment', 'angular-md5']);

myApp.controller('trackerController', function ($scope, $http, moment, md5) {

    $scope.mode = "DEV";
    if ($scope.mode === "DEV") {
        $scope.baseUrl = "http://localhost:8000";
    } else {
        $scope.baseUrl = "http://finlaysmith.co.uk";
    }

    var map,
        icons = {
            bus: 'images/busicon.png',
            night: 'images/nighticon.png',
            tram: 'images/tramicon.png'
        };

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function getServices() {
        $http.get($scope.baseUrl + '/getServices')
            .then(function (response) {
                $scope.services = response.data.services;
                $scope.services.unshift({
                    mnemo: "All",
                    ref: "All"
                });
            });
    }

    function getBusStops() {
        $http.get($scope.baseUrl + '/getBusStops')
            .then(function (response) {
                $scope.stops = response.data.busStops;
            });
    }

    function cleanMap() {
        if ($scope.selectedMarker !== undefined && $scope.selectedMarker !== null) {
            if ($scope.selectedMarker.infoWindow !== undefined && $scope.selectedMarker.infoWindow !== null) {
                $scope.selectedMarker.infoWindow.close();
            }
        }

        if ($scope.drawnRoute !== undefined && $scope.drawnRoute !== null) {
            $scope.drawnRoute.setMap(null);
        }

        $scope.selectedMarker = null;
        $scope.drawnRoute = null;

    }

    function cleanMapAndRemoveMarkers() {
        cleanMap();

        if ($scope.busMarkers !== undefined && $scope.busMarkers !== null) {
            for (var i = 0; i < $scope.busMarkers.length; i++) {
                $scope.busMarkers[i].setMap(null);
            }
        }

        $scope.busMarkers = [];
    }

    function getBusesByService(service) {
        cleanMapAndRemoveMarkers();

        $http.get($scope.baseUrl + '/getBuses/' + service)
            .then(function (response) {
                $scope.buses = response.data;

                $scope.buses.forEach(function (element) {
                    if (isNumeric(element.lat) && isNumeric(element.lon)) {
                        var marker = new google.maps.Marker({
                            position: {
                                lat: element.lat,
                                lng: element.lon
                            },
                            map: map,
                            icon: icons[element.type],
                            title: 'Id: ' + element.busId + '; Service: ' +
                                element.mnemoService,
                            mnemoService: element.mnemoService,
                            busId: element.busId
                        });

                        // Marker selected listener - close existing info windows, open new one, fetch route polyline.
                        marker.addListener('click', function () {
                            cleanMap();

                            $scope.selectedMarker = marker;

                            var content = "<div style=\"width:250px; max-height:172px; overflow:auto;\"><h3>Bus: " + marker.busId + ", Service: " + marker.mnemoService + "</h3><ul>";
                            if (element.nextStop != "") {
                                $http.get($scope.baseUrl + '/getRoute/' + element.busId + '/' + element.journeyId + '/' + element.nextStop)
                                    .then(function (response) {
                                        var route = [{
                                            lat: element.lat,
                                            lng: element.lon
                                        }];

                                        response.data.journeyTimes[0].journeyTimeDatas.forEach(function (stop) {
                                            content += "<li>" + stop.stopName + ": " + stop.time;

                                            $scope.stops.forEach(function (cachedStop) {
                                                if (cachedStop.stopId === stop.stopId) {
                                                    route.push({
                                                        lat: cachedStop.x,
                                                        lng: cachedStop.y
                                                    });
                                                }
                                            });
                                        });
                                        content += "</ul>";

                                        $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
                                            content: content
                                        });
                                        $scope.selectedMarker.infoWindow.open(map, marker);

                                        var lineSymbol = {
                                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                                        };
                                        $scope.drawnRoute = new google.maps.Polyline({
                                            path: route,
                                            geodesic: true,
                                            strokeColor: '#FF0000',
                                            strokeOpacity: 1.0,
                                            strokeWeight: 2,
                                            icons: [{
                                                icon: lineSymbol,
                                                offset: '100%'
                                            }, {
                                                icon: lineSymbol,
                                                offset: '75%'
                                            }, {
                                                icon: lineSymbol,
                                                offset: '50%'
                                            }, {
                                                icon: lineSymbol,
                                                offset: '25%'
                                            }],
                                            map: map
                                        });
                                    });
                            } else {
                                var content = "<h3>Bus: " + marker.busId + ", Service: " + marker.mnemoService + "</h3>Not in service";
                                $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
                                    content: content
                                });
                                $scope.selectedMarker.infoWindow.open(map, marker);
                            }
                        });

                        $scope.busMarkers.push(marker);
                    }
                })
            });
    }

    function initMap() {
        map = new google.maps.Map(document.getElementById('gmap'), {
            center: {
                lat: 55.961776,
                lng: -3.201612
            },
            scrollwheel: true,
            zoom: 12
        });
    }

    $scope.dropdownSelected = "All";
    $scope.showStops = false;
    $scope.refresh = function () {
        getBusesByService($scope.dropdownSelected);
    }

    getServices();
    getBusesByService("All");
    initMap();
    getBusStops();
});