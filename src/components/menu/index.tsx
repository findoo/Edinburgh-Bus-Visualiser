import React, { useState } from "react";
import cx from "classnames";

import styles from "./index.module.scss";
import { Bus, Service } from "../../types";
import refreshIcon from "./refreshicon.svg";
import { lang } from "./lang";
import Burger from "../burger";

type MenuProps = {
  buses: Bus[];
  services: Service[];
  fleetNumberFilter: string;
  setFleetNumber: (fleetNumber: string) => void;
  setServiceNumber: (serviceNumber: string) => void;
  refresh: () => void;
};

const Menu = ({
  buses,
  fleetNumberFilter,
  setFleetNumber,
  setServiceNumber,
  refresh,
  services
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
        <div className={styles.control}>
          <label htmlFor="services" className={styles.label}>
            {lang.service}
          </label>
          <br />
          <select
            className={styles.select}
            name="services"
            data-testid="services"
            onChange={e => setServiceNumber(e.target.value)}
            disabled={!!fleetNumberFilter}
          >
            {services.map(service => (
              <option key={service.ref} value={service.ref}>
                {service.mnemo}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.control}>
          <label htmlFor="fleet" className={styles.label}>
            {lang.fleet}
          </label>
          <br />
          <input
            name="fleet"
            data-testid="fleet"
            type="number"
            className={styles.input}
            onChange={e => setFleetNumber(e.target.value)}
          />
        </div>

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
