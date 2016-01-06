var myApp = angular.module('tracker', []);

myApp.controller('trackerController', ['$scope', '$http', function ($scope, $http) {
    var icons = {
        bus: 'images/busicon.png',
        night: 'images/nighticon.png',
        tram: 'images/tramicon.png'
    };

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function getServices() {
        $http.get('/getServices')
            .then(function (response) {
                $scope.services = response.data.services;
                $scope.services.unshift({
                    mnemo: "All",
                    ref: "All"
                });
            });
    }

    function getBusStops() {
        $http.get('/getBusStops')
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

        $http.get('/getBuses/' + service)
            .then(function (response) {
                $scope.buses = response.data;

                $scope.buses.forEach(function (bus) {
                    if (isNumeric(bus.lat) && isNumeric(bus.lon)) {
                        var marker = new google.maps.Marker({
                            position: {
                                lat: bus.lat,
                                lng: bus.lon
                            },
                            map: map,
                            icon: icons[bus.type],
                            title: 'Id: ' + bus.busId +
                                '; Service: ' +
                                bus.mnemoService
                        });

                        var content = "<div style=\"width:250px; max-height:172px; overflow:auto;\"><h3>Bus: " + bus.busId +
                            ", Service: " + bus.mnemoService +
                            "</h3>";
                        marker.addListener('click', function () {
                            cleanMap();
                            $scope.selectedMarker = marker;

                            if (bus.nextStop !== "") {

                                $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
                                    content: content + "<h4>Fetching Route...</h4>"
                                });
                                $scope.selectedMarker.infoWindow.open(map, marker);
                                $http.get('/getRoute/' + bus.busId +
                                        '/' + bus.journeyId +
                                        '/' + bus.nextStop)
                                    .then(function (response) {
                                        var route = [{
                                            lat: bus.lat,
                                            lng: bus.lon
                                        }];

                                        content += "<ul>";
                                        response.data.journeyTimes[0].journeyTimeDatas.forEach(function (upcomingStop) {
                                            $scope.stops.filter(function (st) {
                                                return st.stopId === upcomingStop.stopId;
                                            }).forEach(function (nextOnRoute) {
                                                route.push({
                                                    lat: nextOnRoute.x,
                                                    lng: nextOnRoute.y
                                                });
                                                content += "<li>" + upcomingStop.stopName + ": " + upcomingStop.time;
                                            });
                                        });
                                        content += "</ul>";

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

                                        $scope.selectedMarker.infoWindow.close();
                                        $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
                                            content: content
                                        });
                                        $scope.selectedMarker.infoWindow.open(map, marker);
                                    });
                            } else {
                                content = "<h3>Bus: " + bus.busId +
                                    "</h3><h4>Not in service</h4>";

                                $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
                                    content: content
                                });
                                $scope.selectedMarker.infoWindow.open(map, marker);
                            }
                        });

                        $scope.busMarkers.push(marker);
                    }
                });
            });
    }

    $scope.dropdownSelected = "All";
    $scope.refresh = function () {
        getBusesByService($scope.dropdownSelected);
    };

    var map = new google.maps.Map(document.getElementById('gmap'), {
        center: {
            lat: 55.961776,
            lng: -3.201612
        },
        scrollwheel: true,
        zoom: 12
    });

    getServices();
    getBusesByService("All");
    getBusStops();
}]);