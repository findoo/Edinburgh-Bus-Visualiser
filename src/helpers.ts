import { RouteStop, Stop, Bus, JourneyTime } from "./types";
import {
  ALL,
  SERVICES_EASTCOAST,
  SERVICES_CROSSCOUNTRY,
  SERVICES_AIRPORT,
  PROVIDER_EASTCOAST,
  PROVIDER_COUNTRY,
  PROVIDER_LOTHIAN,
  TYPE_TRAM,
  PROVIDER_TRAM,
  PROVIDER_AIRPORT,
  TYPE_BUS,
} from "./consts";

export function buildRoute(
  bus: Bus,
  journeyTimes: JourneyTime[],
  stops: Stop[]
): RouteStop[] {
  return [
    {
      lat: bus.Lat,
      lng: bus.Lon,
    },
    ...journeyTimes[0].journeyTimeDatas.map((upcomingStop) => {
      const matchedStop = stops.find((st) => st.stopId === upcomingStop.stopId);
      return {
        lat: matchedStop?.x,
        lng: matchedStop?.y,
        name: matchedStop?.name,
        time: upcomingStop.time,
      };
    }),
  ];
}

export function filterType(bus: Bus, typeFilter: string): boolean {
  if (typeFilter === ALL) {
    return true;
  }

  if (typeFilter === PROVIDER_EASTCOAST) {
    return SERVICES_EASTCOAST.includes(bus.MnemoService);
  }

  if (typeFilter === PROVIDER_COUNTRY) {
    return SERVICES_CROSSCOUNTRY.includes(bus.MnemoService);
  }

  if (typeFilter === PROVIDER_LOTHIAN) {
    return (
      bus.Type === TYPE_BUS &&
      ![
        ...SERVICES_CROSSCOUNTRY,
        ...SERVICES_AIRPORT,
        ...SERVICES_EASTCOAST,
      ].includes(bus.MnemoService)
    );
  }

  if (typeFilter === PROVIDER_AIRPORT) {
    return SERVICES_AIRPORT.includes(bus.MnemoService);
  }

  if (typeFilter === PROVIDER_TRAM) {
    return bus.Type === TYPE_TRAM;
  }

  return false;
}

export function filterFleet(bus: Bus, fleetNumberFilter: string): boolean {
  const rangeSplit = fleetNumberFilter.split("-");
  if (rangeSplit.length === 2) {
    return (
      bus.BusId >= parseInt(rangeSplit[0]) &&
      bus.BusId <= parseInt(rangeSplit[1])
    );
  }

  return bus.BusId === parseInt(fleetNumberFilter);
}
