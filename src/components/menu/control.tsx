import React from "react";
import styles from "./control.module.scss";

type ControlProps = {
  children: object;
  label: string;
  name: string;
};

const Control = ({ children, label, name }: ControlProps) => (
  <div className={styles.control}>
    <label htmlFor={name} className={styles.label}>
      {label}
    </label>
    <br />
    {children}
  </div>
);

export default Control;
