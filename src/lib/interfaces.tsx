export interface Drawable {
  dimensions: Dimensions;
  fileName: string;
  getPixelColorAt: (pos: ImageCoordinates) => Color;
  // getImageData can be changed depending on how the Sprite object is
  // implemented (if necessary) -- just make sure to also change ImageObject
  // accordingly
  getImageData: () => Uint8ClampedArray;
}

export interface MouseCoordinate {
  x: number;
  y: number;
}

export interface ImageCoordinate {
  x: number;
  y: number;
}

export interface Dimensions {
  height: number;
  width: number;
}

export interface ImageCoordinates {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface EditorSettings {
  grid: boolean;
  startingScale: number;
}
