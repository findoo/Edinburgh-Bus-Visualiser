package main

import (
	"strings"
	"testing"
)

const sample = `{"vehicles":[
  {"id":"T263","tripID":"2349_139","transitMode":"tram","coordinate":{"latitude":55.97,"longitude":-3.17},"lastUpdated":"2026-10-26T11:39:25","bearing":207,"speed":12,"routeName":"Tram","destination":"Edinburgh Airport","nextStopCode":null,"vehicleID":"T263"},
  {"id":"1121","tripID":"20032","transitMode":"bus","coordinate":{"latitude":55.93,"longitude":-3.23},"lastUpdated":"2026-10-26T11:39:20","bearing":90,"speed":0,"routeName":"2","destination":"Hermiston Gait","nextStopCode":"36232345","vehicleID":"1121"}
]}`

func TestParseVehicles(t *testing.T) {
	buses, err := parseVehicles(strings.NewReader(sample))
	if err != nil {
		t.Fatal(err)
	}
	if len(buses) != 2 {
		t.Fatalf("got %d buses", len(buses))
	}
	tram, bus := buses[0], buses[1]
	if tram.BusId != 263 || tram.Type != "tram" || tram.Speed != 12 || tram.Lat != 55.97 {
		t.Fatalf("bad tram: %+v", tram)
	}
	if bus.BusId != 1121 || bus.Type != "bus" || bus.RefService != "2" || bus.NextStop != "36232345" || bus.Lon != -3.23 {
		t.Fatalf("bad bus: %+v", bus)
	}
}
