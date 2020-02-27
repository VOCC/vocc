import React from "react";

interface ExportButtonProps {
  startImageExport: () => void;
}

function ExportButton({ startImageExport }: ExportButtonProps): JSX.Element {
  const handleClick = () => {
    startImageExport();
  };

  return (
    <button className="button export-button" onClick={handleClick}>
      Export
    </button>
  );
}

export default ExportButton;
