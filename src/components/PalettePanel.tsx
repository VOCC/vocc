import React from "react";
import Color from "../models/Color";
import Palette from "../models/Palette";
import { EditorSettings } from "../util/types";
import QuantizeButton from "./buttons/QuantizeButton";
import PaletteDisplay from "./PaletteDisplay";

interface PalettePanelProps {
  palette: Palette;
  selectedColorIndex: number;
  updatePalette: (newPalette: Palette) => void;
  onChangeSelectedColorIndex: (newIndex: number) => void;
  onChangeColor: (newColor: Color) => void;
  handleQuantize: (newColorDepth: number) => void;
  settings: EditorSettings;
  onSettingsChange: (newSettings: EditorSettings) => void;
}

export default function PalettePanel({
  palette,
  selectedColorIndex,
  onChangeSelectedColorIndex,
  onChangeColor,
  handleQuantize,
  settings,
  onSettingsChange,
}: PalettePanelProps): JSX.Element {
  return (
    <div>
      <div className="panel-header-top">Palette</div>
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
      <div className="panel-header">Properties</div>
      <div className="properties-container">
        <div>
          Mode: &nbsp; {settings.imageMode}
          <br />
          Type: &nbsp; {settings.editorMode.toString()}
        </div>
      </div>
    </div>
  );
}

const MIN_COLOR_VAL = "0";
const MAX_COLOR_VAL = "31";

const color256to32 = (color: Color): Color => {
  const r = Math.ceil((color.r + 1) / 8) - 1;
  const g = Math.ceil((color.g + 1) / 8) - 1;
  const b = Math.ceil((color.b + 1) / 8) - 1;

  return new Color(r, g, b, 1);
};

const color32to256 = (color: Color): Color => {
  const r = (color.r + 1) * 8 - 1;
  const g = (color.g + 1) * 8 - 1;
  const b = (color.b + 1) * 8 - 1;

  return new Color(r, g, b, 1);
};

interface ColorInputProps {
  currentColor: Color;
  onChangeColor: (newColor: Color) => void;
}

function ColorInput({
  currentColor,
  onChangeColor,
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
    color32.r = newRValue;
    const color256 = color32to256(color32);
    onChangeColor(color256);
  };

  const handleGChange = (newGValue: number) => {
    color32.g = newGValue;
    const color256 = color32to256(color32);
    onChangeColor(color256);
  };

  const handleBChange = (newBValue: number) => {
    color32.b = newBValue;
    const color256 = color32to256(color32);
    onChangeColor(color256);
  };

  return (
    <div className="rgb-container">
      <label className="rgb-label">R</label>
      <input
        type="number"
        max={MAX_COLOR_VAL}
        min={MIN_COLOR_VAL}
        value={color32.r}
        onChange={(e) => handleRChange(parseInt(e.target.value))}
      ></input>
      <label className="rgb-label">G</label>
      <input
        type="number"
        max={MAX_COLOR_VAL}
        min={MIN_COLOR_VAL}
        value={color32.g}
        onChange={(e) => handleGChange(parseInt(e.target.value))}
      ></input>
      <label className="rgb-label">B</label>
      <input
        type="number"
        max={MAX_COLOR_VAL}
        min={MIN_COLOR_VAL}
        value={color32.b}
        onChange={(e) => handleBChange(parseInt(e.target.value))}
      ></input>
    </div>
  );
}
