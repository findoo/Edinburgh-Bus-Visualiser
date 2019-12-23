export type Bus = {
  Type: string;
  Lat: number;
  Lon: number;
  BusId: number;
  MnemoService: string;
  RefService: string;
};

export type Stop = {
  stopId: string;
  name: string;
  x: number;
  y: number;
};

export type RouteStop = {
  lat?: number;
  lng?: number;
  name?: string;
  time?: string;
};

export type JourneyTime = {
  journeyTimeDatas: {
    stopId: string;
    time: string;
  }[];
};

export type BusIcons = {
  [key: string]: string;
};

export type Service = {
  mnemo: string;
  ref: string;
};
