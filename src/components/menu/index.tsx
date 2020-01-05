import React, { useState } from "react";
import cx from "classnames";

import styles from "./index.module.scss";
import Control from "./control";
import { Bus, Service } from "../../types";
import refreshIcon from "./refreshicon.svg";
import { lang } from "./lang";
import Burger from "../burger";
import { ALL, PROVIDERS } from "../../consts";

type MenuProps = {
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
  typeFilter
}: MenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={cx({ [styles.nav]: true, [styles.navOpen]: isOpen })}>
      <h1 className={cx({ [styles.title]: true, [styles.openTitle]: isOpen })}>
        {lang.title}
      </h1>
      <div
        className={cx({
          [styles.fullScreenMobileClosed]: !isOpen,
          [styles.fullScreenMobileOpen]: isOpen
        })}
      >
        <Control name="services" label={lang.service}>
          <select
            className={styles.select}
            name="services"
            data-testid="services"
            onChange={e => setServiceNumber(e.target.value)}
            disabled={!!fleetNumberFilter || typeFilter !== ALL}
          >
            {services.map(service => (
              <option key={service.ref} value={service.ref}>
                {service.mnemo}
              </option>
            ))}
          </select>
        </Control>

        <Control name="type" label={lang.type}>
          <select
            className={styles.select}
            name="type"
            data-testid="type"
            onChange={e => setTypeFilter(e.target.value)}
            disabled={!!fleetNumberFilter || serviceFilter !== ALL}
          >
            {PROVIDERS.map(provider => (
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
            className={styles.input}
            onChange={e => setFleetNumber(e.target.value)}
          />
        </Control>

        <Control name="inService" label={lang.outOfService}>
          <input
            name="inService"
            type="checkbox"
            checked={showOutOfService}
            onChange={e => setShowOutOfService(!showOutOfService)}
            disabled={!!fleetNumberFilter}
          />
        </Control>

        <label className={styles.busCount} data-testid="vehicleCount">
          {lang.showing}
          {buses.length}
          {lang.vehicles}
        </label>

        <button
          className={styles.refresh}
          onClick={refresh}
          data-testid="refresh"
        >
          <img className={styles.refreshIcon} alt="refresh" src={refreshIcon} />
        </button>
      </div>

      <Burger isOpen={isOpen} toggleOpen={() => setIsOpen(!isOpen)} />
    </nav>
  );
};

export default Menu;
