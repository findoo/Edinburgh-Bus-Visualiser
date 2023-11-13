import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Bus, JourneyTime, Service, Stop } from "../../types";
import { ALL } from "../../consts";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_API_URL }),
  endpoints: (builder) => ({
    getBuses: builder.query<Bus[], string>({
      query: (id) => `/getBuses/${id}`,
    }),
    getBusStops: builder.query<Stop[], void>({
      query: () => "/getBusStops",
      transformResponse: (response: { busStops: Stop[] }) => response.busStops,
    }),
    getServices: builder.query<Service[], void>({
      query: () => "/getServices",
      transformResponse: (response: { services: Service[] }) => [
        {
          mnemo: ALL,
          ref: ALL,
        },
        ...response.services.sort((a, b) => a.mnemo.localeCompare(b.mnemo)),
      ],
    }),
    getRouteData: builder.query<{ journeyTimes: JourneyTime[] }, Bus>({
      query: (bus) => `/getRoute/${bus.BusId}/${bus.JourneyId}/${bus.NextStop}`,
    }),
  }),
});

export const {
  useGetBusesQuery,
  useGetBusStopsQuery,
  useGetServicesQuery,
  useGetRouteDataQuery,
} = apiSlice;
