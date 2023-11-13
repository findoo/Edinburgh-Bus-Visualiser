import React from "react";
import { Circle, Polyline } from "react-google-maps";

import { RouteStop } from "../../types";

type RoutePathProps = {
  route: RouteStop[] | null;
  isShown: boolean;
};

const RoutePath = ({ route, isShown }: RoutePathProps) => {
  if (!isShown || !route?.length) {
    return null;
  }

  return (
    <>
      {route.map((stop) => (
        <Circle
          key={stop.lat}
          center={{ lat: stop.lat, lng: stop.lng }}
          radius={14}
          options={{
            clickable: false,
            fillColor: "#0000FF",
            fillOpacity: 1,
            strokeColor: "#0000FF",
            strokeOpacity: 1,
            strokeWeight: 1,
          }}
        />
      ))}
      <Polyline
        path={route}
        options={{
          clickable: false,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
          icons: [
            {
              icon: { path: 2 },
              offset: "100%",
            },
            {
              icon: { path: 2 },
              offset: "75%",
            },
            {
              icon: { path: 2 },
              offset: "50%",
            },
            {
              icon: { path: 2 },
              offset: "25%",
            },
          ],
        }}
      />
    </>
  );
};

export default RoutePath;
