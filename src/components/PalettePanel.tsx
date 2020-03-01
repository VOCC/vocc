import React, { useState, useEffect, useCallback } from "react";
import Palette, * as PaletteUtils from "./objects/Palette";
import PaletteDisplay from "./PaletteDisplay";
import QuantizeButton from "./buttons/QuantizeButton";
import { Color, Color32 } from "../lib/interfaces";

interface PalettePanelProps {
  palette: Palette;
  selectedColorIndex: number;
  updatePalette: (newPalette: Palette) => void;
  onChangeSelectedColorIndex: (newIndex: number) => void;
  onChangeColor: (newColor: Color) => void;
  handleQuantize: (newColorDepth: number) => void;
}

export default function PalettePanel({
  palette,
  selectedColorIndex,
  onChangeSelectedColorIndex,
  onChangeColor,
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
      <ColorInput
        currentColor={palette[selectedColorIndex]}
        onChangeColor={onChangeColor}
      ></ColorInput>
      <QuantizeButton handleQuantize={handleQuantize} />
    </div>
  );
}

const MIN_COLOR_VAL = "0";
const MAX_COLOR_VAL = "31";

const color256to32 = ({ r, g, b }: Color): Color => {
  return {
    r: Math.ceil((r + 1) / 8) - 1,
    g: Math.ceil((g + 1) / 8) - 1,
    b: Math.ceil((b + 1) / 8) - 1,
    a: 1
  };
};

const color32to256 = ({ r, g, b }: Color): Color => {
  return {
    r: (r + 1) * 8 - 1,
    g: (g + 1) * 8 - 1,
    b: (b + 1) * 8 - 1,
    a: 1
  };
};

interface ColorInputProps {
  currentColor: Color;
  onChangeColor: (newColor: Color) => void;
}

function ColorInput({
  currentColor,
  onChangeColor
}: ColorInputProps): JSX.Element {
  // const [color, setColor] = useState<Color>(Color256to32(currentColor));

  /**
   * When we select a new color from props, we should update which color is being inspected
   */
  // useEffect(() => {
  //   setColor(Color256to32(currentColor));
  // }, [currentColor]);

  // useEffect(() => {
  //   onChangeColor(Color32to256(color));
  // }, [color, onChangeColor]);

  const color32 = color256to32(currentColor);

  const handleRChange = (newRValue: number) => {
    const color256 = color32to256({
      r: newRValue,
      g: color32.g,
      b: color32.b,
      a: 1
    });
    onChangeColor(color256);
  };

  const handleGChange = (newGValue: number) => {
    const color256 = color32to256({
      r: color32.r,
      g: newGValue,
      b: color32.b,
      a: 1
    });
    onChangeColor(color256);
  };

  const handleBChange = (newBValue: number) => {
    const color256 = color32to256({
      r: color32.r,
      g: color32.g,
      b: newBValue,
      a: 1
    });
    onChangeColor(color256);
  };

  return (
    <div>
      <div>
        <label>Red: </label>
        <input
          type="number"
          max={MAX_COLOR_VAL}
          min={MIN_COLOR_VAL}
          value={color32.r}
          onChange={e => handleRChange(parseInt(e.target.value))}
        ></input>
      </div>
      <div>
        <label>Green: </label>
        <input
          type="number"
          max={MAX_COLOR_VAL}
          min={MIN_COLOR_VAL}
          value={color32.g}
          onChange={e => handleGChange(parseInt(e.target.value))}
        ></input>
      </div>
      <div>
        <label>Blue: </label>
        <input
          type="number"
          max={MAX_COLOR_VAL}
          min={MIN_COLOR_VAL}
          value={color32.b}
          onChange={e => handleBChange(parseInt(e.target.value))}
        ></input>
      </div>
    </div>
  );
}
