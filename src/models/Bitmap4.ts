import Color from "../models/Color";
import {
  generateCSourceFileString,
  generateHeaderString
} from "../util/exportUtils";
import { Dimensions, ImageCoordinates, ImageDataStore } from "../util/types";
import Bitmap from "./Bitmap";
import ImageCanvas from "./ImageCanvas";
import Palette from "./Palette";

export default class Bitmap4 extends Bitmap {
  private data: number[];
  private palette: Palette;
  private currentPaletteIndex: number;

  protected imageCanvas: ImageCanvas;

  constructor(
    fileName: string,
    palette: Palette,
    dimensions: Dimensions,
    indexArray?: number[]
  ) {
    super(fileName, dimensions);
    if (indexArray) {
      this.data = indexArray;
    } else {
      this.data = Array<number>(dimensions.height * dimensions.width).fill(0);
    }
    this.palette = palette;
    this.imageCanvas = new ImageCanvas(this);
    this.currentPaletteIndex = 0;
  }

  static fromDataStore(
    { imageData, dimensions, fileName }: ImageDataStore,
    palette: Palette
  ): Bitmap4 {
    return new Bitmap4(fileName, palette, dimensions, imageData as number[]);
  }

  public updateFromStore({ imageData }: ImageDataStore): void {
    this.data = imageData as number[];
    this.imageCanvas.redrawImage(this);
  }

  public get headerData(): string {
    return generateHeaderString(
      {
        fileName: this.fileName,
        imageDimensions: this.dimensions,
        palette: this.palette
      },
      4
    );
  }

  public get cSourceData(): string {
    return generateCSourceFileString(this, 4, this.palette);
  }

  /**
   * Returns the color at the specified index in the image by indexing into the
   * color palette
   * @param ImageCoordinates the index in the Sprite that you would like to get
   *    the color at
   */
  public getPixelColorAt(pos: ImageCoordinates): Color {
    if (pos.x >= this.dimensions.width || pos.y >= this.dimensions.height) {
      console.error(
        "Tried to access pixel at",
        pos,
        "but dimensions of sprite are",
        this.dimensions
      );
    }
    return this.palette[this.data[this.dimensions.width * pos.y + pos.x]];
  }

  public setPixelColor(pos: ImageCoordinates): void {
    this.data[pos.y * this.dimensions.width + pos.x] = this.currentPaletteIndex;
    this.imageCanvas.updatePixel(pos, this.palette[this.currentPaletteIndex]);
  }

  setPaletteIndex(newPaletteIndex: number) {
    this.currentPaletteIndex = newPaletteIndex;
  }

  public updatePalette(newPalette: Palette): void {
    this.palette = newPalette;
    this.imageCanvas.redrawImage(this);
  }

  public get imageDataStore(): ImageDataStore {
    return {
      imageData: this.data.slice(),
      dimensions: this.dimensions,
      fileName: this.fileName
    };
  }
}
