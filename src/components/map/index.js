import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";

const EDINBURGH = { lat: 55.961776, lng: -3.201612 };

const Container = <div style={{ height: `100vh` }} />;

const Hoc = withScriptjs(
  withGoogleMap(({ mapRef, children }) => (
    <GoogleMap
      ref={mapRef}
      defaultZoom={12}
      defaultCenter={EDINBURGH}
      mapTypeControl={false}
      options={{
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
    >
      {children}
    </GoogleMap>
  ))
);

const Map = ({ mapRef, children }) => (
  <Hoc
    mapRef={mapRef}
    googleMapURL={process.env.REACT_APP_MAP_API}
    loadingElement={Container}
    containerElement={Container}
    mapElement={Container}
  >
    {children}
  </Hoc>
);

export default Map;
