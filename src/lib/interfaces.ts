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
  getImageData: () => Uint8ClampedArray;
  getImageFileBlob: () => Blob;
  isBlankImage: () => boolean;
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
