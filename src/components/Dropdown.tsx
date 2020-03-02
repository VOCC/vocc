import React, { useState, PropsWithChildren } from "react";

export default function Dropdown({ children }: PropsWithChildren<{}>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dd-container">
      <button onClick={() => setOpen(!open)} className="dd-button">
        Dropdown
      </button>
      <div
        id="myDropdown"
        className={open ? "dd-content dd-show" : "dd-content"}
      >
        {children}
      </div>
    </div>
  );
}
