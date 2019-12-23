import React from "react";
import { Polyline } from "react-google-maps";

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
    <Polyline
      path={route}
      options={{
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        icons: [
          {
            icon: { path: 2 },
            offset: "100%"
          },
          {
            icon: { path: 2 },
            offset: "75%"
          },
          {
            icon: { path: 2 },
            offset: "50%"
          },
          {
            icon: { path: 2 },
            offset: "25%"
          }
        ]
      }}
    />
  );
};

export default RoutePath;
