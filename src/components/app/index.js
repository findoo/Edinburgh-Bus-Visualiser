import React, { Fragment, useState, useEffect, useRef } from "react";

import { getBusesByService, getBusStops, getServices } from "../../dispatches";
import { filterFleet, filterType } from "../../helpers";
import { ALL } from "../../consts";
import Markers from "../markers";
import Map from "../map";
import Menu from "../menu";

const App = () => {
  const mapRef = useRef();
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [services, setServices] = useState([]);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [fleetNumberFilter, setFleetNumber] = useState(null);
  const [serviceFilter, setServiceFilter] = useState(ALL);

  useEffect(() => {
    getBusesByService(ALL, setBuses);
    getBusStops(setStops);
    getServices(setServices);
  }, []);

  const filteredBuses = buses.filter(bus => {
    if (fleetNumberFilter) {
      return filterFleet(bus, fleetNumberFilter);
    }

    if (typeFilter !== ALL) {
      return filterType(bus, typeFilter);
    }

    if (serviceFilter !== ALL) {
      return bus.RefService === serviceFilter;
    }

    return true;
  });

  useEffect(() => {
    if (fleetNumberFilter && filteredBuses.length === 1) {
      mapRef.current.panTo({
        lat: filteredBuses[0].Lat,
        lng: filteredBuses[0].Lon
      });
    }
  }, [fleetNumberFilter]);

  return (
    <Fragment>
      <Menu
        buses={filteredBuses}
        serviceFilter={serviceFilter}
        typeFilter={typeFilter}
        fleetNumberFilter={fleetNumberFilter}
        setFleetNumber={setFleetNumber}
        refresh={() => getBusesByService(ALL, setBuses)}
        services={services}
        setServiceNumber={setServiceFilter}
        setTypeFilter={setTypeFilter}
      />
      <Map mapRef={mapRef}>
        <Markers buses={filteredBuses} stops={stops} />
      </Map>
    </Fragment>
  );
};

export default App;
