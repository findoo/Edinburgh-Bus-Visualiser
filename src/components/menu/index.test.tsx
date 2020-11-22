import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Menu, { MenuProps } from ".";
import { Bus } from "../../types";

const requiredProps: MenuProps = {
  buses: [],
  services: [],
  fleetNumberFilter: "",
  serviceFilter: "",
  typeFilter: "",
  showOutOfService: false,
  setFleetNumber: jest.fn(),
  setServiceNumber: jest.fn(),
  setShowOutOfService: jest.fn(),
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
};

describe("Menu", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders vehicle count", () => {
    const { getByTestId } = render(
      <Menu {...requiredProps} buses={[mockBus, mockBus, mockBus]} />
    );
    expect(getByTestId("vehicleCount")).toHaveTextContent(
      "Showing 3 vehicle/s"
    );
  });

  it("should call refresh when refresh button clicked", () => {
    const { getByTestId } = render(<Menu {...requiredProps} />);
    getByTestId("refresh").click();
    expect(requiredProps.refresh).toHaveBeenCalledTimes(1);
  });

  it("should render services select", () => {
    const { getByTestId } = render(
      <Menu
        {...requiredProps}
        services={[
          { mnemo: "1", ref: "2" },
          { mnemo: "3", ref: "4" },
        ]}
      />
    );
    const select = getByTestId("services");
    expect(select.childElementCount).toBe(2);
  });

  it("should call setServiceFilter when option chosen", () => {
    const { getByTestId } = render(
      <Menu
        {...requiredProps}
        services={[
          { mnemo: "a", ref: "1" },
          { mnemo: "b", ref: "2" },
        ]}
      />
    );
    const select = getByTestId("services");
    userEvent.selectOptions(select, ["2"]);
    expect(requiredProps.setServiceNumber).toHaveBeenCalledWith("2");
  });

  it("should render fleet number filter", () => {
    const { getByTestId } = render(<Menu {...requiredProps} />);
    const input = getByTestId("fleet");
    expect(input).toBeInTheDocument();
  });
});
