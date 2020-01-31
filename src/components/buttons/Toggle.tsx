import React, { useState, PropsWithChildren } from "react";

type ToggleProps = {
  state: boolean;
  onClick: (newState: boolean) => void;
};

export default function Toggle({
  state,
  onClick,
  children
}: PropsWithChildren<ToggleProps>): JSX.Element {
  return <button onClick={() => onClick(!state)}>{children}</button>;
}
