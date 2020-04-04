import { PALETTE_LENGTH, PALETTE_SIZE } from "../util/consts";
import { createHiddenCanvas } from "../util/fileLoadUtils";
import Color from "./Color";
import { PixelGrid } from "./ImageCanvas";

// interface IPalette {
//   readonly dimensions: Dimensions;
//   getColorAt: (index: number) => Color;
//   setColorAt: (index: number, color: Color) => void;
//   swapRows: (row1: number, row2: number) => void;
//   getColorArray: () => Color[];
// }

type Palette = Color[];

export interface PaletteDrawables {
  readonly pixelGrid: PixelGrid;
  readonly hiddenCanvas: HTMLCanvasElement;
}

/**
 * Constructor for Palette objects. Contains initial draw call.
 * @param colorArray color array to be used as data for the palette
 */
export function PaletteDrawablesGenerator(): PaletteDrawables {
  const pixelGrid = new PixelGrid(PALETTE_SIZE, 8);
  const hiddenCanvas = createHiddenCanvas(PALETTE_SIZE);
  // drawPaletteToHiddenCanvas(colorArray, hiddenCanvas);
  return { pixelGrid, hiddenCanvas };
}

export function drawPaletteToHiddenCanvas(
  palette: Palette,
  hiddenCanvas: HTMLCanvasElement
) {
  const context = hiddenCanvas.getContext("2d");
  if (!context) {
    console.error("Failed to get Palette hidden canvas context!");
    return;
  }
  for (let i = 0; i < PALETTE_LENGTH; i++) {
    const color = palette[i];
    context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    context.fillRect(paletteIndexToCol(i), paletteIndexToRow(i), 1, 1);
  }
}

export function setPaletteColorAndRedraw(
  palette: Palette,
  hiddenCanvas: HTMLCanvasElement,
  index: number,
  color: Color
) {
  palette[index] = color;
  drawPaletteToHiddenCanvas(palette, hiddenCanvas);
}

export function paletteIndexToRow(i: number): number {
  return Math.floor(i / 16);
}

export function paletteIndexToCol(i: number): number {
  return i % 16;
}

export default Palette;
