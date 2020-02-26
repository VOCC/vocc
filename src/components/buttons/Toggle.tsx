import React, { PropsWithChildren } from "react";

type ToggleProps = {
  state: boolean;
  onClick: (newState: boolean) => void;
};

export default function Toggle({
  state,
  onClick,
  children
}: PropsWithChildren<ToggleProps>): JSX.Element {
  return (
    <button
      className={state ? "toggle-on" : "toggle-off"}
      onClick={() => onClick(!state)}
    >
      {children}
    </button>
  );
}
