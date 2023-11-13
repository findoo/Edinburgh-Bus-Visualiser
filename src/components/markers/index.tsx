import React, { useState, Fragment } from "react";

import Marker from "./marker";
import { Bus } from "../../types";

type MarkersProps = {
  buses: Bus[];
};

const Markers = ({ buses }: MarkersProps): JSX.Element => {
  const [selectedBus, setSelected] = useState<Bus | null>(null);

  return (
    <Fragment>
      {buses.map((bus) => (
        <Marker
          key={bus.BusId}
          bus={bus}
          isSelected={selectedBus?.BusId === bus.BusId}
          setSelected={setSelected}
        />
      ))}
    </Fragment>
  );
};

export default Markers;
