import { Tool } from "./consts";

export class Color {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public isEqual(other: Object): boolean {
    if (other === this) {
      return true;
    }
    if (!(other instanceof Color)) {
      return false;
    }
    const that: Color = other as Color;
    return (
      this.r === that.r &&
      this.g === that.g &&
      this.b === that.b &&
      this.a === that.a
    );
  }
}

export interface Color32 {
  r: number;
  g: number;
  b: number;
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
  getImageDataStore: () => ImageDataStore;
  getImageFileBlob: () => Promise<Blob | null>;
  getHeaderData: () => string;
  getCSourceData: () => string;
  getPixelColorAt: (pos: ImageCoordinates) => Color;
}

export interface Modifiable {
  setPixelColor: (pos: ImageCoordinates, color: Color) => void;
}

export interface ImageInterface extends Drawable, Exportable, Modifiable {}

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
