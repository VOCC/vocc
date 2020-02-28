import { Tool } from "./consts";

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

export type Mode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export enum EditorMode {
  Bitmap = "Bitmap",
  Spritesheet = "Spritesheet",
  Background = "Background"
}

export enum DropdownMenu {
  None,
  Import,
  Export,
  Settings
}

export interface Drawable {
  dimensions: Dimensions;
  getImageCanvasElement: () => HTMLCanvasElement;
  getPixelGridCanvasElement: () => HTMLCanvasElement;
}

/**
 * Eventually, these methods should be entirely encapsulated within the classes
 * themselves, not separated as part of a utilities file. Make classes do the
 * work, not functions with access to the classes' private information.
 * Perhaps an abstract class with default implementations will work well here.
 */
export interface Exportable {
  fileName: string;
  getImageData: () => Uint8ClampedArray;
  getImageFileBlob: () => Promise<Blob | null>;
  getHeaderData: () => string;
  getCSourceData: () => string;
  getPixelColorAt: (pos: ImageCoordinates) => Color;
}

export interface Modifiable {
  setPixelColor: (
    pos: ImageCoordinates,
    color: Color
  ) => void;
}

export interface ImageInterface extends Drawable, Exportable, Modifiable {}

export interface EditorSettings {
  grid: boolean;
  currentTool: Tool;
  mode: Mode;
  editorMode: EditorMode;
}

export interface ImageCoordinates {
  x: number;
  y: number;
}