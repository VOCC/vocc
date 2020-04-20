import React, { useState, PropsWithChildren } from "react";

interface DropdownProps {
  label: string;
}

export default function Dropdown({
  label,
  children
}: PropsWithChildren<DropdownProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dd-container">
      <button onClick={() => setOpen(!open)} className="dd-button">
        {label}
      </button>
      <div
        id="myDropdown"
        className={open ? "dd-content dd-show" : "dd-content"}
        onClick={() => setOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
