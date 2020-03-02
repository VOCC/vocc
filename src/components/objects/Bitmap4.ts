import { Color, Dimensions, ImageCoordinates } from "../../lib/interfaces";
import {
  generateHeaderString,
  generateCSourceFileString
} from "../../lib/exportUtils";
import Palette from "./Palette";
import ImageCanvas from "./ImageCanvas";
import Bitmap from "./Bitmap";

export default class Bitmap4 extends Bitmap {
  private data: number[];
  private palette: Palette;
  private currentPaletteIndex: number;

  protected imageCanvas: ImageCanvas;

  constructor(
    fileName: string,
    indexArray: number[],
    palette: Palette,
    dimensions: Dimensions
  ) {
    super(fileName, dimensions);
    this.data = indexArray;
    this.palette = palette;
    this.imageCanvas = new ImageCanvas(this);
    this.currentPaletteIndex = 0;
  }

  public getHeaderData(): string {
    return generateHeaderString(
      {
        fileName: this.fileName,
        imageDimensions: this.dimensions,
        palette: this.palette
      },
      4
    );
  }

  public getCSourceData(): string {
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

  // TODO: this is totally broken
  public setPixelColor(pos: ImageCoordinates): void {
    // // console.log("setting pixel color bmp4");
    // const paletteIndex = 255;
    this.data[pos.y * this.dimensions.width + pos.x] = this.currentPaletteIndex;
    // this.data[pos.y * this.dimensions.width + pos.x] = paletteIndex;
    this.imageCanvas.updatePixel(pos, this.palette[this.currentPaletteIndex]);
  }

  setPaletteIndex(newPaletteIndex: number) {
    this.currentPaletteIndex = newPaletteIndex;
  }

  public updatePalette(newPalette: Palette): void {
    this.palette = newPalette;
    this.imageCanvas.redrawImage(this);
  }
}
