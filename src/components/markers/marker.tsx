import React, { Fragment, useState, useEffect } from "react";
import { Marker } from "react-google-maps";

import lang from "./lang";
import { getRouteData } from "../../dispatches";
import { buildRoute } from "../../helpers";
import { Bus, BusIcons, Stop, RouteStop } from "../../types";
import Popup from "../popup";
import RoutePath from "../routePath";
import airport from "./images/airport.png";
import bus from "./images/busicon.png";
import crosscountry from "./images/crosscountry.png";
import eastcoast from "./images/eastcoast.png";
import night from "./images/nighticon.png";
import tram from "./images/tramicon.png";
import noservice from "./images/noserviceicon.png";
import {
  SERVICES_CROSSCOUNTRY,
  SERVICES_EASTCOAST,
  SERVICES_AIRPORT,
  TYPE_TRAM
} from "../../consts";

type MarkerProps = {
  bus: Bus;
  isSelected: boolean;
  setSelected: (bus: Bus | null) => void;
  stops: Stop[];
};

const ICONS: BusIcons = {
  airport,
  bus,
  crosscountry,
  eastcoast,
  night,
  tram,
  noservice
};

const getIcon = (bus: Bus) => {
  if (bus.Type === TYPE_TRAM) {
    return ICONS.tram;
  }

  if (!bus.MnemoService) {
    return ICONS.noservice;
  }

  if (SERVICES_AIRPORT.includes(bus.MnemoService)) {
    return ICONS.airport;
  }

  if (SERVICES_CROSSCOUNTRY.includes(bus.MnemoService)) {
    return ICONS.crosscountry;
  }

  if (SERVICES_EASTCOAST.includes(bus.MnemoService)) {
    return ICONS.eastcoast;
  }

  return ICONS.bus;
};

const Markers = ({ bus, isSelected, setSelected, stops }: MarkerProps) => {
  const [route, setRoute] = useState<RouteStop[] | null>([]);

  useEffect(() => {
    setRoute(null);

    if (isSelected) {
      getRouteData(bus)
        .then(response => {
          if (response.data.journeyTimes.length) {
            setRoute(buildRoute(bus, response.data.journeyTimes, stops));
          }
        })
        .catch(() => {
          setRoute([]);
        });
    }
  }, [isSelected]);

  return (
    <Fragment>
      <Marker
        key={bus.BusId}
        position={{ lat: bus.Lat, lng: bus.Lon }}
        icon={getIcon(bus)}
        title={`${lang.fleet}${bus.BusId}${lang.service}${bus.MnemoService}`}
        onClick={() => setSelected(bus)}
      >
        <Popup
          bus={bus}
          route={route}
          isShown={isSelected}
          dismiss={() => setSelected(null)}
        />
      </Marker>
      <RoutePath route={route} isShown={isSelected} />
    </Fragment>
  );
};

export default Markers;
