import React from "react";
import { InfoWindow } from "react-google-maps";

import { lang } from "./lang";
import { Bus, RouteStop } from "../../types";

type PopupProps = {
  isShown: boolean;
  bus: Bus;
  route: RouteStop[] | null;
  dismiss: () => void;
};

const Popup = ({ isShown, bus, route, dismiss }: PopupProps) => {
  if (!isShown) {
    return null;
  }

  return (
    <InfoWindow onCloseClick={dismiss}>
      <div className="max-h-[172px] overflow-auto p-2">
        <h3>
          {`${lang.fleetNum}${bus.BusId}`}
          {bus.MnemoService && `${lang.service}${bus.MnemoService}`}
        </h3>

        {route === null && lang.loading}
        {route?.length === 0 && lang.noJourney}
        {route && !!route.length && (
          <ul>
            {route
              .filter((stop: RouteStop) => !!stop.time)
              .map((stop) => (
                <li key={stop.name}>
                  {stop.name}: {stop.time}
                </li>
              ))}
          </ul>
        )}
      </div>
    </InfoWindow>
  );
};

export default Popup;
