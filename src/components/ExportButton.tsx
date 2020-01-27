import React from "react";
import "../styles/buttons.scss";

///////////// Type Definitions:
interface IProps {
  startImageExport: () => void;
}

function ExportButton({startImageExport}: IProps): JSX.Element {
  const handleClick = (e: any): void => {
    startImageExport();
  }
  
  return (
    <button
      className="button export-button"
      onClick={handleClick}
    >
      Export
    </button>
  );
}

export default ExportButton;