import React from "react";

type ButtonProps = {
  message: string;
  onClick: Function;
};

export const Button = ({ message, onClick }: ButtonProps) => (
  <button onClick={() => onClick()}>{message}</button>
);
