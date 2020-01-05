import axios from "axios";
import { ALL } from "./consts";
import { Bus, Stop, Service } from "./types";

const ENDPOINT_BUSES = `${process.env.REACT_APP_API_URL}/getBuses/`;

const ENDPOINT_STOPS = `${process.env.REACT_APP_API_URL}/getBusStops`;

const ENDPOINT_ROUTE = `${process.env.REACT_APP_API_URL}/getRoute/`;

const ENDPOINT_SERVICES = `${process.env.REACT_APP_API_URL}/getServices`;

export const getBusesByService = (
  service: string,
  setBuses: (data: Bus[]) => void
) =>
  axios.get(`${ENDPOINT_BUSES}${service}`).then(({ data }) => setBuses(data));

export const getBusStops = (setStops: (data: Stop[]) => void) =>
  axios.get(ENDPOINT_STOPS).then(response => setStops(response.data.busStops));

export const getRouteData = (bus: Bus) =>
  axios.get(`${ENDPOINT_ROUTE}${bus.BusId}/${bus.JourneyId}/${bus.NextStop}`);

export const getServices = (setServices: (data: Service[]) => void) =>
  axios.get(ENDPOINT_SERVICES).then(response =>
    setServices([
      {
        mnemo: ALL,
        ref: ALL
      },
      ...response.data.services
    ])
  );
