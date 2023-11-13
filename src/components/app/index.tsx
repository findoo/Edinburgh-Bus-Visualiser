import React, { Fragment, useState, useEffect, useRef } from "react";

import { filterFleet, filterSpeed, filterType } from "../../helpers";
import { ALL } from "../../consts";
import Markers from "../markers";
import Map from "../map";
import Menu from "../menu";
import { Bus, MapType } from "../../types";
import { useGetBusesQuery, useGetServicesQuery } from "./apiSlice";

const App = () => {
  const mapRef = useRef<MapType>();
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [fleetNumberFilter, setFleetNumber] = useState<string>("");
  const [speedMinFilter, setSpeedMinFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>(ALL);
  const [showOutOfService, setShowOutOfService] = useState<boolean>(true);

  const { data: buses = [], refetch } = useGetBusesQuery(serviceFilter);
  const { data: services = [] } = useGetServicesQuery();

  const filteredBuses = buses.filter((bus: Bus): boolean => {
    if (fleetNumberFilter) {
      return filterFleet(bus, fleetNumberFilter);
    }

    if (speedMinFilter) {
      return filterSpeed(bus, speedMinFilter);
    }

    if (!showOutOfService && !bus.RefService) {
      return false;
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
    if (fleetNumberFilter && filteredBuses.length === 1 && mapRef.current) {
      mapRef.current.panTo({
        lat: filteredBuses[0].Lat,
        lng: filteredBuses[0].Lon,
      });
    }
  }, [fleetNumberFilter]);

  return (
    <Fragment>
      <Menu
        buses={filteredBuses}
        fleetNumberFilter={fleetNumberFilter}
        speedMinFilter={speedMinFilter}
        refresh={refetch}
        serviceFilter={serviceFilter}
        services={services}
        setFleetNumber={setFleetNumber}
        setServiceNumber={setServiceFilter}
        setShowOutOfService={setShowOutOfService}
        setTypeFilter={setTypeFilter}
        setSpeedMinFilter={setSpeedMinFilter}
        showOutOfService={showOutOfService}
        typeFilter={typeFilter}
      />
      <Map mapRef={mapRef}>
        <Markers buses={filteredBuses} />
      </Map>
    </Fragment>
  );
};

export default App;
