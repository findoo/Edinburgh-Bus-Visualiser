import React, { useState } from "react";

import Marker from "./marker";
import { Bus, Stop } from "../../types";

type MarkersProps = {
  buses: Bus[];
  stops: Stop[];
};

const Markers = ({ buses, stops }: MarkersProps) => {
  const [selectedBus, setSelected] = useState<Bus | null>(null);

  return buses.map(bus => (
    <Marker
      key={bus.BusId}
      bus={bus}
      isSelected={selectedBus?.BusId === bus.BusId}
      setSelected={setSelected}
      stops={stops}
    />
  ));
};

export default Markers;
