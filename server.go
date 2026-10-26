package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

// Transport for Edinburgh's app API: Lothian, Lothian Country, East Coast and trams
const vehiclesURL = "https://lothianapi.com/vehicles/all"

type Bus struct {
	BusId        int
	JourneyId    string
	RefService   string
	MnemoService string
	NameDest     string
	NextStop     string
	Speed        float64
	Bearing      int
	LastTimeKnow string
	Type         string
	Lat          float64
	Lon          float64
}

type Service struct {
	Mnemo string `json:"mnemo"`
	Ref   string `json:"ref"`
}

type tfeVehicle struct {
	VehicleID    string
	TripID       string
	TransitMode  string
	Coordinate   struct{ Latitude, Longitude float64 }
	LastUpdated  string
	Bearing      int
	Speed        float64
	RouteName    string
	Destination  string
	NextStopCode string
}

var netClient = &http.Client{
	Timeout: time.Second * 10,
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/getBus/{id}", getBuses).Methods("GET")
	router.HandleFunc("/getServices", getServices).Methods("GET")
	router.HandleFunc("/getBuses/{service}", getBuses).Methods("GET")
	// static/ holds the CRA build output
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("static")))

	log.Println("Listening...")
	gzip := handlers.CompressHandler(handlers.CORS()(router))
	log.Fatal(http.ListenAndServe(":1234", gzip))
}

func fetchBuses() ([]Bus, error) {
	rs, err := netClient.Get(vehiclesURL)
	if err != nil {
		return nil, err
	}
	defer rs.Body.Close()
	if rs.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("TfE API returned %s", rs.Status)
	}
	return parseVehicles(rs.Body)
}

func parseVehicles(r io.Reader) ([]Bus, error) {
	var feed struct{ Vehicles []tfeVehicle }
	if err := json.NewDecoder(r).Decode(&feed); err != nil {
		return nil, err
	}

	buses := make([]Bus, 0, len(feed.Vehicles))
	for _, v := range feed.Vehicles {
		t := "bus"
		if v.TransitMode == "tram" {
			t = "tram"
		}
		buses = append(buses, Bus{
			BusId:        fleetNumber(v.VehicleID),
			JourneyId:    v.TripID,
			RefService:   v.RouteName,
			MnemoService: v.RouteName,
			NameDest:     v.Destination,
			NextStop:     v.NextStopCode,
			Speed:        v.Speed,
			Bearing:      v.Bearing,
			LastTimeKnow: v.LastUpdated,
			Type:         t,
			Lat:          v.Coordinate.Latitude,
			Lon:          v.Coordinate.Longitude,
		})
	}
	return buses, nil
}

// Trams are prefixed, e.g. "T263"
func fleetNumber(id string) int {
	n, _ := strconv.Atoi(strings.TrimPrefix(id, "T"))
	return n
}

func getServices(w http.ResponseWriter, req *http.Request) {
	buses, err := fetchBuses()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	// ponytail: only services currently running, a GTFS timetable import would list them all
	seen := map[string]bool{}
	services := []Service{}
	for _, bus := range buses {
		if bus.RefService != "" && !seen[bus.RefService] {
			seen[bus.RefService] = true
			services = append(services, Service{bus.MnemoService, bus.RefService})
		}
	}
	sort.Slice(services, func(i, k int) bool { return services[i].Mnemo < services[k].Mnemo })

	json.NewEncoder(w).Encode(map[string][]Service{"services": services})
}

func getBuses(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	buses, err := fetchBuses()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	busLocationParsing(buses, w, params["service"], params["id"])
}

func busLocationParsing(buses []Bus, w http.ResponseWriter, service string, id string) {
	var minFleetId, maxFleetId int
	if len(id) > 0 {
		strippedId := strings.Replace(id, " ", "", -1)
		splitId := strings.Split(strippedId, "-")
		if len(splitId) > 1 {
			minFleetId, _ = strconv.Atoi(splitId[0])
			maxFleetId, _ = strconv.Atoi(splitId[1])
		} else {
			minFleetId, _ = strconv.Atoi(strippedId)
			maxFleetId, _ = strconv.Atoi(strippedId)
		}
	}

	output := []Bus{}
	for _, bus := range buses {
		if len(service) > 0 {
			if service == "All" || bus.RefService == service {
				output = append(output, bus)
			}
		} else if len(id) > 0 && (bus.BusId >= minFleetId && bus.BusId <= maxFleetId) {
			output = append(output, bus)
		}

	}

	json.NewEncoder(w).Encode(output)
}
