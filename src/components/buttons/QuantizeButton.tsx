import React, { useState } from "react";

const MIN_QUANTIZE = 1;
const MAX_QUANTIZE = 256;

interface ExportButtonProps {
  handleQuantize: (newColorDepth: number) => void;
}

function ExportButton({ handleQuantize }: ExportButtonProps): JSX.Element {
  const [depth, setDepth] = useState<number>(15);

  const handleClick = () => {
    if (!depth) {
      alert("Can't quantize with unspecified color depth!");
      return;
    }
    handleQuantize(depth);
  };

  return (
    <div className="quantize-container">
      <button className="quantize-button" onClick={handleClick}>
        Quantize
      </button>
      <input
        className="quantize-input"
        type="number"
        value={depth}
        min={MIN_QUANTIZE}
        max={MAX_QUANTIZE}
        onChange={e => setDepth(parseInt(e.target.value))}
      ></input>
    </div>
  );
}

export default ExportButton;
