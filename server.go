package main

import (
	"compress/gzip"
	"crypto/md5"
	"encoding/csv"
	"encoding/hex"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	osgb "github.com/mjjbell/go-osgb"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Bus struct {
	BusId        int
	JourneyId    string
	RefService   string
	MnemoService string
	OperatorId   string
	RefDest      string
	NameDest     string
	NextStop     string
	Speed        string
	Bearing      string
	LastTimeKnow string
	Type         string
	Lat          float64
	Lon          float64
}

var trans, _ = osgb.NewOSTN15Transformer()

var netClient = &http.Client{
	Timeout: time.Second * 10,
}

func check(e error) {
	if e != nil {
		log.Fatal(e)
	}
}

func main() {
	router := mux.NewRouter()
	fs := http.FileServer(http.Dir("static"))
	router.Handle("/", fs)
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))
	router.HandleFunc("/getBus/{id}", getBuses).Methods("GET")
	router.HandleFunc("/getBusStops", getBusStops).Methods("GET")
	router.HandleFunc("/getServices", getServices).Methods("GET")
	router.HandleFunc("/getBuses/{service}", getBuses).Methods("GET")
	router.HandleFunc("/getRoute/{busId}/{journeyId}/{nextStop}", getRoute).Methods("GET")

	log.Println("Listening...")
	log.Println(getAPIKey())
	gzip := handlers.CompressHandler(router)
	http.ListenAndServe(":3000", gzip)
}

func getAPIKey() (key string) {
	t := time.Now().Format("2006010215")
	keyWithTime := "XXXXXXXXX" + t
	hasher := md5.New()
	hasher.Write([]byte(keyWithTime))
	return hex.EncodeToString(hasher.Sum(nil))
}

func getServices(w http.ResponseWriter, req *http.Request) {
	rs, err := netClient.Get("http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getServices")
	check(err)
	defer rs.Body.Close()

	bodyBytes, err := ioutil.ReadAll(rs.Body)
	check(err)
	w.Write(bodyBytes)
}

func getBuses(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	rs, err := netClient.Get("http://ws.mybustracker.co.uk/?module=csv&key=" + getAPIKey() + "&function=getVehicleLocations")
	check(err)
	defer rs.Body.Close()

	bodyBytes, err := ioutil.ReadAll(rs.Body)
	check(err)

	ioutil.WriteFile("/tmp/dat", bodyBytes, 0644)
	f, err := os.Open("/tmp/dat")
	check(err)
	defer f.Close()

	gr, err := gzip.NewReader(f)
	check(err)
	defer gr.Close()

	cr := csv.NewReader(gr)
	rec, err := cr.ReadAll()
	check(err)

	busLocationParsing(rec, w, params["service"], params["id"])
}

func getBusStops(w http.ResponseWriter, req *http.Request) {
	rs, err := netClient.Get("http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getBusStops")
	check(err)
	defer rs.Body.Close()

	bodyBytes, err := ioutil.ReadAll(rs.Body)
	check(err)
	w.Write(bodyBytes)
}

func getRoute(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	rs, err := netClient.Get("http://ws.mybustracker.co.uk/?module=json&key=" + getAPIKey() + "&function=getJourneyTimes&stopId=" + params["nextStop"] + "&journeyId=" + params["journeyId"] + "&busId=" + params["busId"])
	check(err)
	defer rs.Body.Close()

	bodyBytes, err := ioutil.ReadAll(rs.Body)
	check(err)
	w.Write(bodyBytes)
}

func getType(mnemoService string, busId int) (t string) {
	switch mnemoService {
	case "N":
		return "night"
	case "T":
		return "tram"
	default:
		if busId >= 251 && busId <= 277 {
			return "tram"
		} else {
			return "bus"
		}
	}
}

func Map(vs [][]string, f func([]string) Bus) []Bus {
	vsm := make([]Bus, len(vs))
	for i, v := range vs {
		vsm[i] = f(v)
	}
	return vsm
}

func parse(in []string) (bus Bus) {
	t := Bus{}
	busId, _ := strconv.Atoi(in[0])
	t.BusId = busId
	t.JourneyId = in[1]
	t.RefService = in[2]
	t.MnemoService = in[3]
	t.OperatorId = in[4]
	t.RefDest = in[5]
	t.NameDest = in[6]
	t.NextStop = in[7]
	x, _ := strconv.ParseFloat(in[8], 64)
	y, _ := strconv.ParseFloat(in[9], 64)
	t.Speed = in[10]
	t.Bearing = in[11]
	t.LastTimeKnow = in[12]
	t.Type = getType(t.MnemoService, t.BusId)

	nationalGridCoord := osgb.NewOSGB36Coord(x, y, 0)
	gpsCoord, _ := trans.FromNationalGrid(nationalGridCoord)

	if gpsCoord != nil {
		t.Lat = gpsCoord.Lat
		t.Lon = gpsCoord.Lon
	}
	return t
}

func busLocationParsing(lines [][]string, w http.ResponseWriter, service string, id string) {
	buses := Map(lines[1:], parse)

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

	var output []Bus
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
