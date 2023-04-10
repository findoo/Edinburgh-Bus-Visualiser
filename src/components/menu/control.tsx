import React from "react";

type ControlProps = {
  children: object;
  label: string;
  name: string;
};

const Control = ({ children, label, name }: ControlProps) => (
  <div className="flex flex-col items-center justify-center text-center font-bold">
    <label htmlFor={name} className="mx-4 mb-2">
      {label}
    </label>
    {children}
  </div>
);

export default Control;
