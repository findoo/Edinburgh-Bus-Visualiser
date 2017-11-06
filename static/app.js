var myApp = angular.module('tracker', []);

const ICONS = {
    bus: 'static/images/busicon.png',
    night: 'static/images/nighticon.png',
    tram: 'static/images/tramicon.png'
};

myApp.controller('trackerController', ['$scope', '$http', ($scope, $http) => {

    var map;

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function initialSetup() {
        $scope.dropdownSelected = "All";
        $scope.auto = false;

        $scope.refresh = update;

        $scope.toggleAuto = () => {
            $scope.auto = !$scope.auto;
        };

        setInterval(() => { 
            if($scope.auto) {
                update();
            }
        }, 6000);

        map = new google.maps.Map(document.getElementById('gmap'), {
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
    }

    function getServices() {
        $http.get('/getServices')
            .then((response) => {
                $scope.services = response.data.services;
                $scope.services.unshift({
                    mnemo: "All",
                    ref: "All"
                });
            });
    }

    function getBusStops() {
        $http.get('/getBusStops')
            .then((response) => {
                $scope.stops = response.data.busStops;
            });
    }

    function getBusesByService(service) {
        $http.get('/getBuses/' + service)
            .then((response) => {
                cleanMap(true);

                $scope.buses = response.data;
                $scope.buses.forEach((bus) => {
                    if (isNumeric(bus.Lat) && isNumeric(bus.Lon)) {
                        $scope.busMarkers.push(createNewMarker(bus));
                    }
                });
            });
    }

    function getSingleBus(id) {
        $http.get('/getBus/' + id)
            .then((response) => {
                cleanMap(true);

                $scope.buses = response.data;
                $scope.buses.forEach((bus) => {
                    if (isNumeric(bus.Lat) && isNumeric(bus.Lon)) {
                        newMarker = createNewMarker(bus);
                        $scope.busMarkers.push(newMarker);
                        map.setCenter(newMarker.getPosition());
                    }
                });
            });
    }

    function getActiveBusMarkerContent(content) {
        $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
            content: content + "<h4>Fetching Route...</h4>"
        });
        $scope.selectedMarker.infoWindow.open(map, $scope.selectedMarker);

        $http.get('/getRoute/' + $scope.selectedBus.BusId +
            '/' + $scope.selectedBus.JourneyId +
            '/' + $scope.selectedBus.NextStop)
            .then((response) => {
                if (response.data.journeyTimes[0]) {
                    var route = [{
                        lat: $scope.selectedBus.Lat,
                        lng: $scope.selectedBus.Lon
                    }];

                    content += "<ul>";
                    response.data.journeyTimes[0].journeyTimeDatas.forEach((upcomingStop) => {
                        $scope.stops
                            .filter((st) => st.stopId === upcomingStop.stopId)
                            .forEach((nextOnRoute) => {
                                route.push({
                                    lat: nextOnRoute.x,
                                    lng: nextOnRoute.y
                                });
                                content += "<li>" + upcomingStop.stopName + ": " + upcomingStop.time + "</li>";
                            });
                    });
                    content += "</ul>";
                    drawRouteOnMap(route);
                } else {
                    content += "Lothian buses are not currently providing route information for this vehicle. Try again later.";
                }

                $scope.selectedMarker.infoWindow.close();
                $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
                    content: content
                });
                $scope.selectedMarker.infoWindow.open(map, $scope.selectedMarker);
            });
    }

    function getInactiveBusMarkerContent() {
        var content =
            "<h3>Fleet num: " + $scope.selectedBus.BusId + "</h3>" +
            "<h4>Not in service</h4>";

        $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
            content: content
        });
        $scope.selectedMarker.infoWindow.open(map, $scope.selectedMarker);
    }

    function drawRouteOnMap(route) {
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
    }

    function cleanMap(removeMarkers) {
        if ($scope.selectedMarker && $scope.selectedMarker.infoWindow) {
            $scope.selectedMarker.infoWindow.close();
        }

        if ($scope.drawnRoute) {
            $scope.drawnRoute.setMap(null);
        }
        $scope.selectedMarker = null;
        $scope.drawnRoute = null;

        if(removeMarkers) {
            if ($scope.busMarkers) {
                $scope.busMarkers.forEach((busMarker) => {
                    busMarker.setMap(null);
                });
            }
            $scope.busMarkers = [];
        }
    }

    function createNewMarker(bus) {
        let marker = new google.maps.Marker({
            position: {
                lat: bus.Lat,
                lng: bus.Lon
            },
            map: map,
            icon: ICONS[bus.Type],
            bus: bus.BusId,
            title:
            'Fleet num: ' + bus.BusId +
            ', Service: ' +
            bus.MnemoService
        });

        marker.addListener('click', () => {
            cleanMap(false);
            $scope.selectedMarker = marker;
            $scope.selectedBus = bus;
            busRouteClick();
        });

        return marker;
    }

    function busRouteClick() {
        var content = "<div style=\"width:250px; max-height:172px; overflow:auto;\">" +
            "<h3>Fleet num: " + $scope.selectedBus.BusId +
            ", Service: " + $scope.selectedBus.MnemoService +
            "</h3>";

        if ($scope.selectedBus.NextStop !== "") {
            getActiveBusMarkerContent(content);
        } else {
            getInactiveBusMarkerContent();
        }
    }

    function update() {
        if($scope.busId) {
            getSingleBus($scope.busId);
        } else {
            getBusesByService($scope.dropdownSelected);
        }
    };

    initialSetup();
}]);