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
  fileName: string;
  getPixelColorAt: (pos: ImageCoordinates) => Color;
  // getImageData can be changed depending on how the Sprite object is
  // implemented (if necessary) -- just make sure to also change ImageObject
  // accordingly
  getImageData: () => Uint8ClampedArray;
}

export interface ModifiableImage extends Drawable {
  setPixelColor: (
    pos: ImageCoordinates,
    paletteIndex: number
  ) => ModifiableImage;
}

export interface EditorSettings {
  grid: boolean;
  startingScale: number;
  currentTool: Tools;
}

export interface ImageCoordinates {
  x: number;
  y: number;
}

export interface MouseCoordinate {
  x: number;
  y: number;
}
