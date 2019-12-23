import axios from "axios";
import { ALL } from "./components/app/consts";

const ENDPOINT_BUSES = `${process.env.REACT_APP_API_URL}/getBuses/`;

const ENDPOINT_STOPS = `${process.env.REACT_APP_API_URL}/getBusStops`;

const ENDPOINT_ROUTE = `${process.env.REACT_APP_API_URL}/getRoute/`;

const ENDPOINT_SERVICES = `${process.env.REACT_APP_API_URL}/getServices`;

export const getBusesByService = (service, setBuses) =>
  axios.get(`${ENDPOINT_BUSES}${service}`).then(({ data }) => setBuses(data));

export const getBusStops = setStops =>
  axios.get(ENDPOINT_STOPS).then(response => setStops(response.data.busStops));

export const getRouteData = bus =>
  axios.get(`${ENDPOINT_ROUTE}${bus.BusId}/${bus.JourneyId}/${bus.NextStop}`);

export const getServices = setServices =>
  axios.get(ENDPOINT_SERVICES).then(response =>
    setServices([
      {
        mnemo: ALL,
        ref: ALL
      },
      ...response.data.services
    ])
  );
