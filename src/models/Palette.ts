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
    context.fillRect(i % 16, Math.floor(i / 16), 1, 1);
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

export default Palette;

// export default class Palette implements IPalette {
//   public dimensions: Dimensions;
//   private colorArray: Color[];
//   private hiddenCanvas: HTMLCanvasElement;
//   private pixelGrid: PixelGrid;

//   // constructor input will be the inputs needed for generatePalette() function
//   constructor(colorArray?: Color[]) {
//     this.dimensions = PALETTE_SIZE;

//     this.colorArray = new Array(this.dimensions.width * this.dimensions.height);
//     if (colorArray === undefined) {
//       this.colorArray.fill(COLORS.black);
//     } else {
//       if (colorArray.length > PALETTE_SIZE.height * PALETTE_SIZE.width) {
//         console.warn(
//           "why would you ever try to make a palette bigger than 16x16 -_-"
//         );
//         this.colorArray = colorArray.slice(0, 255);
//       } else {
//         this.colorArray = colorArray;
//       }
//     }

//     this.hiddenCanvas = createHiddenCanvas(this.dimensions);
//     this.drawPaletteToHiddenCanvas(this.hiddenCanvas);
//     this.pixelGrid = new PixelGrid(PALETTE_SIZE, 8);
//   }

//   public swapRows(row1: number, row2: number) {
//     if (row1 >= this.dimensions.height || row2 >= this.dimensions.height) {
//       console.error("cannot swap rows: input out of bounds");
//     } else {
//       console.log("swapping rows...");
//       const start1 = row1 * this.dimensions.height;
//       const start2 = row2 * this.dimensions.height;
//       this.groupSwap(start1, start2, this.dimensions.width);
//     }
//   }

//   public getColorAt(index: number): Color {
//     if (index >= PALETTE_LENGTH || index < 0) {
//       console.error(
//         "Attempting to access palette at index greater than " +
//           PALETTE_LENGTH +
//           "."
//       );
//     }
//     // console.log("Palette index", i, "Color at index", this.colorArray[i]);
//     return this.colorArray[index];
//   }

//   public setColorAt(index: number, color: Color) {
//     this.colorArray[index] = color;
//     this.drawPaletteToHiddenCanvas(this.hiddenCanvas);
//   }

//   public getPaletteCanvas(): HTMLCanvasElement {
//     return this.hiddenCanvas;
//   }

//   public getPixelGridCanvas(): HTMLCanvasElement {
//     return this.pixelGrid.getCanvasElement();
//   }

//   public getColorArray(): Color[] {
//     return this.colorArray;
//   }

//   private swapIndices(index1: number, index2: number) {
//     const size = this.dimensions.width * this.dimensions.height;
//     if (index1 >= size || index2 >= size) {
//       console.error("cannot swip indices: input out of bounds");
//     } else {
//       const temp = this.colorArray[index1];
//       this.setColorAt(index1, this.colorArray[index2]);
//       this.setColorAt(index2, temp);
//     }
//   }

//   private groupSwap(start1: number, start2: number, len: number) {
//     for (let i = 0; i < len; i++) {
//       this.swapIndices(start1 + i, start2 + i);
//     }
//   }

//   private drawPaletteToHiddenCanvas(canvas: HTMLCanvasElement) {
//     const context = canvas.getContext("2d");
//     if (!context) {
//       console.error("Failed to get Palette hidden canvas context!");
//       return;
//     }
//     for (let i = 0; i < PALETTE_LENGTH; i++) {
//       const color = this.colorArray[i];
//       context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
//       context.fillRect(i % 16, Math.floor(i / 16), 1, 1);
//     }
//   }
// }
