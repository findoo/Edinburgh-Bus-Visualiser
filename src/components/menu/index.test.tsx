import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Menu, { MenuProps } from ".";
import { Bus } from "../../types";

const requiredProps: MenuProps = {
  buses: [],
  services: [],
  fleetNumberFilter: "",
  speedMinFilter: "",
  serviceFilter: "",
  typeFilter: "",
  showOutOfService: false,
  setFleetNumber: jest.fn(),
  setServiceNumber: jest.fn(),
  setShowOutOfService: jest.fn(),
  setSpeedMinFilter: jest.fn(),
  setTypeFilter: jest.fn(),
  refresh: jest.fn(),
};

const mockBus: Bus = {
  BusId: 1,
  Lat: 1,
  Lon: 2,
  MnemoService: "44",
  RefService: "1",
  JourneyId: "23",
  NextStop: "99",
  Type: "bus",
  Speed: 1,
};

describe("Menu", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders vehicle count", async () => {
    render(<Menu {...requiredProps} buses={[mockBus, mockBus, mockBus]} />);
    await userEvent.click(screen.getByTestId("filter-button"));
    expect(screen.getByTestId("vehicleCount")).toHaveTextContent(
      "Showing 3 vehicle/s"
    );
  });

  it("should call refresh when refresh button clicked", () => {
    render(<Menu {...requiredProps} />);
    screen.getByTestId("refresh").click();
    expect(requiredProps.refresh).toHaveBeenCalledTimes(1);
  });

  it("should render services select", async () => {
    render(
      <Menu
        {...requiredProps}
        services={[
          { mnemo: "1", ref: "2" },
          { mnemo: "3", ref: "4" },
        ]}
      />
    );
    await userEvent.click(screen.getByTestId("filter-button"));
    const select = screen.getByTestId("services");
    expect(select.childElementCount).toBe(2);
  });

  it("should render fleet number filter", async () => {
    render(<Menu {...requiredProps} />);
    await userEvent.click(screen.getByTestId("filter-button"));
    const input = screen.getByTestId("fleet");
    expect(input).toBeInTheDocument();
  });
});
