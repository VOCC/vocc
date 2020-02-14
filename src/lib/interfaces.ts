import { Tools } from "./consts";

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Dimensions {
  height: number;
  width: number;
}

export interface Drawable {
  dimensions: Dimensions;
  getPixelColorAt: (pos: ImageCoordinates) => Color;
}

export interface Exportable {
  fileName: string;
  getImageData: () => Uint8ClampedArray;
  getImageFileBlob: () => Promise<Blob | null>;
}

export interface Modifiable {
  setPixelColor: (pos: ImageCoordinates, paletteIndex: number) => Modifiable;
}

export interface ImageInterface extends Drawable, Exportable, Modifiable {}

export interface EditorSettings {
  grid: boolean;
  startingScale: number;
  currentTool: Tools;
}

export interface ImageCoordinates {
  x: number;
  y: number;
}
