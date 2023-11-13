import React from "react";

import Control from "./control";
import { Bus, Service } from "../../types";
import { lang } from "./lang";
import { ALL, PROVIDERS } from "../../consts";
import { Popover, Transition } from "@headlessui/react";
import { RefreshIcon } from "./refreshicon";

export type MenuProps = {
  buses: Bus[];
  fleetNumberFilter: string;
  refresh: () => void;
  services: Service[];
  serviceFilter: string;
  setFleetNumber: (fleetNumber: string) => void;
  setServiceNumber: (serviceNumber: string) => void;
  setShowOutOfService: (showOutOfService: boolean) => void;
  setTypeFilter: (type: string) => void;
  showOutOfService: boolean;
  typeFilter: string;
};

const Menu = ({
  buses,
  fleetNumberFilter,
  refresh,
  serviceFilter,
  services,
  setFleetNumber,
  setShowOutOfService,
  setTypeFilter,
  setServiceNumber,
  showOutOfService,
  typeFilter,
}: MenuProps) => {
  return (
    <nav
      className={
        "fixed top-0 z-50 flex h-20 w-full items-center justify-between bg-white p-8 text-sm text-black dark:bg-slate-600 dark:text-white"
      }
    >
      <h1 className="text-lg">{lang.title}</h1>
      <div className="flex gap-4">
        <button
          className="mx-auto flex-shrink-0 rounded-xl border p-4 text-center hover:bg-gray-100 dark:hover:bg-slate-500"
          onClick={refresh}
          data-testid="refresh"
        >
          <RefreshIcon />
        </button>

        <Popover className="relative">
          <Popover.Button
            className="rounded-xl border p-4 hover:bg-gray-100 dark:hover:bg-slate-500"
            data-testid="filter-button"
          >
            {lang.filters}
          </Popover.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="absolute right-0 top-3 z-10 flex w-60 flex-col gap-4 rounded border bg-white p-4 shadow-lg dark:bg-slate-600">
              <Control name="services" label={lang.service}>
                <select
                  className="w-full rounded border border-gray-300 px-4 py-2 text-center disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-slate-500 dark:text-white dark:disabled:bg-gray-600"
                  name="services"
                  data-testid="services"
                  onChange={(e) => setServiceNumber(e.target.value)}
                  disabled={!!fleetNumberFilter || typeFilter !== ALL}
                >
                  {services.map((service) => (
                    <option key={service.ref} value={service.ref}>
                      {service.mnemo}
                    </option>
                  ))}
                </select>
              </Control>

              <Control name="type" label={lang.type}>
                <select
                  className="w-full rounded border border-gray-300 px-4 py-2 text-center text-black disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-slate-500 dark:text-white dark:disabled:bg-gray-600"
                  name="type"
                  data-testid="type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  disabled={!!fleetNumberFilter || serviceFilter !== ALL}
                >
                  {PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </Control>

              <Control name="fleet" label={lang.fleet}>
                <input
                  name="fleet"
                  data-testid="fleet"
                  type="text"
                  className="w-full rounded border border-gray-300 px-4 py-2 text-center text-black dark:bg-slate-500 dark:text-white dark:disabled:bg-gray-600"
                  placeholder="(12 or 12-100)"
                  onChange={(e) => setFleetNumber(e.target.value)}
                />
              </Control>

              <Control name="inService" label={lang.outOfService}>
                <input
                  name="inService"
                  type="checkbox"
                  checked={showOutOfService}
                  onChange={(_e) => setShowOutOfService(!showOutOfService)}
                  disabled={!!fleetNumberFilter}
                />
              </Control>

              <label className="mx-auto text-center" data-testid="vehicleCount">
                {lang.showing}
                {buses.length}
                {lang.vehicles}
              </label>
            </Popover.Panel>
          </Transition>
        </Popover>
      </div>
    </nav>
  );
};

export default Menu;
