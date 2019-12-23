import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";

const EDINBURGH = { lat: 55.961776, lng: -3.201612 };

const Map = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      ref={props.mapRef}
      defaultZoom={12}
      defaultCenter={EDINBURGH}
      mapTypeControl={false}
    >
      {props.children}
    </GoogleMap>
  ))
);

export default Map;
