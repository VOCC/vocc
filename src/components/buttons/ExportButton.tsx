import React from "react";

interface ExportButtonProps {
  startImageExport: () => void;
  buttonLabel: string;
}

function ExportButton({ startImageExport, buttonLabel }: ExportButtonProps): JSX.Element {
  const handleClick = () => {
    startImageExport();
  };

  return (
    <button className="button export-button" onClick={handleClick}>
      {buttonLabel}
    </button>
  );
}

export default ExportButton;
