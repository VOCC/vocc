import React from "react";
import Palette from "./objects/Palette";
import PaletteDisplay from "./PaletteDisplay";
import QuantizeButton from "./buttons/QuantizeButton";

interface PalettePanelProps {
  palette: Palette;
  selectedColorIndex: number;
  onChangeSelectedColorIndex: (newIndex: number) => void;
  handleQuantize: (newColorDepth: number) => void;
}

export default function PalettePanel({
  palette,
  selectedColorIndex,
  onChangeSelectedColorIndex,
  handleQuantize
}: PalettePanelProps): JSX.Element {
  return (
    <div>
      <div className="panel-label">Color Palette</div>
      <div className="palette-container">
        <PaletteDisplay
          palette={palette}
          selectedColorIndex={selectedColorIndex}
          onChangeSelectedColorIndex={onChangeSelectedColorIndex}
        />
      </div>
      <QuantizeButton handleQuantize={handleQuantize} />
    </div>
  );
}
