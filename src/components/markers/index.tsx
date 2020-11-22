import React, { useState, Fragment } from "react";

import Marker from "./marker";
import { Bus, Stop } from "../../types";

type MarkersProps = {
  buses: Bus[];
  stops: Stop[];
};

const Markers = ({ buses, stops }: MarkersProps): JSX.Element => {
  const [selectedBus, setSelected] = useState<Bus | null>(null);

  return (
    <Fragment>
      {buses.map((bus) => (
        <Marker
          key={bus.BusId}
          bus={bus}
          isSelected={selectedBus?.BusId === bus.BusId}
          setSelected={setSelected}
          stops={stops}
        />
      ))}
    </Fragment>
  );
};

export default Markers;
