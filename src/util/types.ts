import { Tool } from "./consts";
import Color from "../models/Color";

export interface Color32 {
  r: number;
  g: number;
  b: number;
}

export interface Dimensions {
  height: number;
  width: number;
}

export type SpriteDimensions =
  // Square sizes
  | { height: 8; width: 8 }
  | { height: 16; width: 16 }
  | { height: 32; width: 32 }
  | { height: 64; width: 64 }
  // Not square sizes
  | { height: 16; width: 8 }
  | { height: 32; width: 8 }
  | { height: 32; width: 16 }
  | { height: 64; width: 32 }
  // Same as above but rotated 90 degrees
  | { height: 8; width: 16 }
  | { height: 8; width: 32 }
  | { height: 16; width: 32 }
  | { height: 32; width: 64 };

export type Mode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export enum EditorMode {
  Bitmap = "Bitmap",
  Spritesheet = "Spritesheet",
  Background = "Background",
}

export interface Drawable {
  dimensions: Dimensions;
  imageCanvasElement: HTMLCanvasElement;
  pixelGridCanvasElement: HTMLCanvasElement;
  getPixelColorAt: (pos: ImageCoordinates) => Color;
}

/**
 * Eventually, these methods should be entirely encapsulated within the classes
 * themselves, not separated as part of a utilities file. Make classes do the
 * work, not functions with access to the classes' private information.
 * Perhaps an abstract class with default implementations will work well here.
 */
export interface Exportable {
  fileName: string;
  imageDataStore: ImageDataStore;
  headerData: string;
  cSourceData: string;
  getImageFileBlob: () => Promise<Blob | null>;
  getPixelColorAt: (pos: ImageCoordinates) => Color;
}

export interface Modifiable {
  setPixelColor: (pos: ImageCoordinates, color: Color) => void;
}

export interface Undoable {
  updateFromStore: (store: ImageDataStore) => void;
}

export interface ImageInterface
  extends Drawable,
  Exportable,
  Modifiable,
  Undoable { }

export interface EditorSettings {
  grid: boolean;
  currentTool: Tool;
  imageMode: Mode;
  editorMode: EditorMode;
}

export interface ImageCoordinates {
  x: number;
  y: number;
}

export interface ImageDataStore {
  fileName: string;
  dimensions: Dimensions;
  imageData: Uint8ClampedArray | number[];
}

export interface SpritesheetDataStore {
  fileName: string;
  dimensions: Dimensions;
  sprites: string[];
  bpp: number;
}

export interface SpriteDataStore {
  position: ImageCoordinates;
  dimensions: SpriteDimensions;
  paletteRow: number;
  data: Uint8ClampedArray;
}
