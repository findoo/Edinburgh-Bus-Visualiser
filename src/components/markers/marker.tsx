import React, { Fragment, memo, useMemo } from "react";
import { Marker } from "react-google-maps";

import lang from "./lang";
import { buildRoute } from "../../helpers";
import { Bus, BusIcons } from "../../types";
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
  TYPE_TRAM,
} from "../../consts";
import { useGetBusStopsQuery, useGetRouteDataQuery } from "../app/apiSlice";

type MarkerProps = {
  bus: Bus;
  isSelected: boolean;
  setSelected: (bus: Bus | null) => void;
};

const ICONS: BusIcons = {
  airport,
  bus,
  crosscountry,
  eastcoast,
  night,
  tram,
  noservice,
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

const Markers = memo(
  ({ bus, isSelected, setSelected }: MarkerProps): JSX.Element => {
    const { data: routeData } = useGetRouteDataQuery(bus, {
      skip: !isSelected,
    });
    const { data: stops = [] } = useGetBusStopsQuery();

    const route = useMemo(
      () =>
        isSelected && routeData
          ? buildRoute(bus, routeData.journeyTimes, stops)
          : null,
      [isSelected, routeData, bus, stops]
    );

    return (
      <Fragment>
        <Marker
          key={bus.BusId}
          position={{ lat: bus.Lat, lng: bus.Lon }}
          icon={{ url: getIcon(bus), scaledSize: { width: 34, height: 38 } }}
          options={{
            optimized: true,
          }}
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
  }
);

export default Markers;
