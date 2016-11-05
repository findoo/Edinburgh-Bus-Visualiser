var myApp = angular.module('tracker', []);

myApp.controller('trackerController', ['$scope', '$http', ($scope, $http) => {
    var icons = {
        bus: 'images/busicon.png',
        night: 'images/nighticon.png',
        tram: 'images/tramicon.png'
    };

    var map;

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
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

    function cleanMap() {
        if ($scope.selectedMarker && $scope.selectedMarker.infoWindow) {
            $scope.selectedMarker.infoWindow.close();
        }

        if ($scope.drawnRoute) {
            $scope.drawnRoute.setMap(null);
        }
        $scope.selectedMarker = null;
        $scope.drawnRoute = null;
    }

    function cleanMapAndRemoveMarkers() {
        cleanMap();

        if ($scope.busMarkers) {
            $scope.busMarkers.forEach((busMarker) => {
                busMarker.setMap(null);
            });
        }
        $scope.busMarkers = [];
    }

    function getBusesByService(service) {
        cleanMapAndRemoveMarkers();

        $http.get('/getBuses/' + service)
            .then((response) => {
                $scope.buses = response.data;
                $scope.buses.forEach((bus) => {
                    if (isNumeric(bus.lat) && isNumeric(bus.lon)) {
                        $scope.busMarkers.push(createNewMarker(bus));
                    }
                });
            });
    }

    function createNewMarker(bus) {
        var marker = new google.maps.Marker({
            position: {
                lat: bus.lat,
                lng: bus.lon
            },
            map: map,
            icon: icons[bus.type],
            title:
            'Id: ' + bus.busId +
            '; Service: ' +
            bus.mnemoService
        });

        marker.addListener('click', () => {
            cleanMap();
            $scope.selectedMarker = marker;

            var content = "<div style=\"width:250px; max-height:172px; overflow:auto;\">" +
                "<h3>Bus: " + bus.busId +
                ", Service: " + bus.mnemoService +
                "</h3>";

            if (bus.nextStop !== "") {
                getActiveBusMarkerContent(bus, content, marker);
            } else {
                getInactiveBusMarkerContent(bus);
            }
        });

        return marker;
    }

    function getActiveBusMarkerContent(bus, content, marker) {
        $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
            content: content + "<h4>Fetching Route...</h4>"
        });
        $scope.selectedMarker.infoWindow.open(map, marker);

        $http.get('/getRoute/' + bus.busId +
            '/' + bus.journeyId +
            '/' + bus.nextStop)
            .then((response) => {
                if (response.data.journeyTimes[0]) {
                    var route = [{
                        lat: bus.lat,
                        lng: bus.lon
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
                $scope.selectedMarker.infoWindow.open(map, marker);
            });
    }

    function getInactiveBusMarkerContent() {
        var content =
            "<h3>Bus: " + bus.busId + "</h3>" +
            "<h4>Not in service</h4>";

        $scope.selectedMarker.infoWindow = new google.maps.InfoWindow({
            content: content
        });
        $scope.selectedMarker.infoWindow.open(map, marker);
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

    function initialSetup() {
        $scope.dropdownSelected = "All";
        $scope.refresh = () => {
            getBusesByService($scope.dropdownSelected);
        };

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

    initialSetup();
}]);