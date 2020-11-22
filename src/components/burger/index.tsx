import React from "react";
import cx from "classnames";

import styles from "./index.module.scss";

type BurgerProps = {
  isOpen: boolean;
  toggleOpen: () => void;
};

const Burger = ({ isOpen, toggleOpen }: BurgerProps) => (
  <div className={cx({ [styles.burgerOpen]: isOpen })}>
    <div className={styles.burger} data-testid="burger" onClick={toggleOpen}>
      <div
        className={cx({
          [styles.barOpen]: isOpen,
          [styles.bar]: true,
        })}
      ></div>
      <div
        className={cx({
          [styles.barOpen2]: isOpen,
          [styles.bar]: true,
        })}
      ></div>
      <div
        className={cx({
          [styles.barOpen3]: isOpen,
          [styles.bar]: true,
        })}
      ></div>
    </div>
  </div>
);

export default Burger;
