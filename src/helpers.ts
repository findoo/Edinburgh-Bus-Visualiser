import { RouteStop, Stop, Bus, JourneyTime } from "./types";

export function buildRoute(
  bus: Bus,
  journeyTimes: JourneyTime[],
  stops: Stop[]
): RouteStop[] {
  return [
    {
      lat: bus.Lat,
      lng: bus.Lon
    },
    ...journeyTimes[0].journeyTimeDatas.map(upcomingStop => {
      const matchedStop = stops.find(st => st.stopId === upcomingStop.stopId);
      return {
        lat: matchedStop?.x,
        lng: matchedStop?.y,
        name: matchedStop?.name,
        time: upcomingStop.time
      };
    })
  ];
}
