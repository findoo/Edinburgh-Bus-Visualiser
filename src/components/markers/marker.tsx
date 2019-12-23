import React, { Fragment, useState, useEffect } from "react";
import { Marker } from "react-google-maps";

import { getRouteData } from "../../dispatches";
import { buildRoute } from "../../helpers";
import { Bus, BusIcons, Stop, RouteStop } from "../../types";
import Popup from "../popup";
import RoutePath from "../routePath";
import bus from "./images/busicon.png";
import night from "./images/nighticon.png";
import tram from "./images/tramicon.png";
import noservice from "./images/noserviceicon.png";

type MarkerProps = {
  bus: Bus;
  isSelected: boolean;
  setSelected: (bus: Bus | null) => void;
  stops: Stop[];
};

const ICONS: BusIcons = {
  bus,
  night,
  tram,
  noservice
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
        icon={!!bus.MnemoService ? ICONS[bus.Type] : ICONS.noservice}
        title={`Fleet num: ${bus.BusId}, Service: ${bus.MnemoService}`}
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
