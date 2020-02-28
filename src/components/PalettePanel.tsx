import React, { useState, useEffect, useCallback } from "react";
import Palette from "./objects/Palette";
import PaletteDisplay from "./PaletteDisplay";
import QuantizeButton from "./buttons/QuantizeButton";
import { Color, Color32 } from "../lib/interfaces";

interface PalettePanelProps {
  palette: Palette;
  paletteHash: string;
  selectedColorIndex: number;
  updatePalette: (newPalette: Palette) => void;
  onChangeSelectedColorIndex: (newIndex: number) => void;
  handleQuantize: (newColorDepth: number) => void;
}

export default function PalettePanel({
  palette,
  paletteHash,
  updatePalette,
  selectedColorIndex,
  onChangeSelectedColorIndex,
  handleQuantize
}: PalettePanelProps): JSX.Element {
  const handleColorChange = useCallback(
    (newColor: Color) => {
      let newPalette = palette;
      newPalette.setColorAt(selectedColorIndex, newColor);
      updatePalette(newPalette);
    },
    [selectedColorIndex, palette]
  );

  return (
    <div>
      <div className="panel-label">Color Palette</div>
      <div className="palette-container">
        <PaletteDisplay
          palette={palette}
          paletteHash={paletteHash}
          selectedColorIndex={selectedColorIndex}
          onChangeSelectedColorIndex={onChangeSelectedColorIndex}
        />
      </div>
      <ColorInput
        currentColor={palette.getColorAt(selectedColorIndex)}
        onChangeColor={handleColorChange}
      ></ColorInput>
      <QuantizeButton handleQuantize={handleQuantize} />
    </div>
  );
}

const MIN_COLOR_VAL = "0";
const MAX_COLOR_VAL = "31";

interface ColorInputProps {
  currentColor: Color;
  onChangeColor: (newColor: Color) => void;
}

function ColorInput({
  currentColor,
  onChangeColor
}: ColorInputProps): JSX.Element {
  const [color, setColor] = useState<Color>(Color256to32(currentColor));

  /**
   * When we select a new color from props, we should update which color is being inspected
   */
  useEffect(() => {
    setColor(Color256to32(currentColor));
  }, [currentColor]);

  useEffect(() => {
    onChangeColor(Color32to256(color));
  }, [color, onChangeColor]);

  const handleRChange = (newRValue: number) => {
    setColor({ r: newRValue, g: color.g, b: color.g, a: 1 });
  };

  const handleGChange = (newGValue: number) => {
    setColor({ r: color.r, g: newGValue, b: color.b, a: 1 });
  };

  const handleBChange = (newBValue: number) => {
    setColor({ r: color.r, g: color.g, b: newBValue, a: 1 });
  };

  return (
    <div>
      <div>
        <label>Red: </label>
        <input
          type="number"
          max={MAX_COLOR_VAL}
          min={MIN_COLOR_VAL}
          value={color.r}
          onChange={e => handleRChange(parseInt(e.target.value))}
        ></input>
      </div>
      <div>
        <label>Green: </label>
        <input
          type="number"
          max={MAX_COLOR_VAL}
          min={MIN_COLOR_VAL}
          value={color.g}
          onChange={e => handleGChange(parseInt(e.target.value))}
        ></input>
      </div>
      <div>
        <label>Blue: </label>
        <input
          type="number"
          max={MAX_COLOR_VAL}
          min={MIN_COLOR_VAL}
          value={color.b}
          onChange={e => handleBChange(parseInt(e.target.value))}
        ></input>
      </div>
    </div>
  );
}

const Color256to32 = ({ r, g, b }: Color): Color => {
  return {
    r: Math.ceil((r + 1) / 8) - 1,
    g: Math.ceil((g + 1) / 8) - 1,
    b: Math.ceil((b + 1) / 8) - 1,
    a: 1
  };
};

const Color32to256 = ({ r, g, b }: Color): Color => {
  return {
    r: (r + 1) * 8 - 1,
    g: (g + 1) * 8 - 1,
    b: (b + 1) * 8 - 1,
    a: 1
  };
};
