import { Color, Dimensions, ImageCoordinates } from "../../lib/interfaces";
import {
  generateHeaderString,
  generateCSourceFileString
} from "../../lib/exportUtils";
import * as Loader from "../../lib/fileLoadUtils";
import Bitmap from "./Bitmap";
import ImageCanvas from "./ImageCanvas";

export default class Bitmap3 extends Bitmap {
  protected imageCanvas: ImageCanvas;

  constructor(
    fileName: string,
    dimensions: Dimensions,
    imageData: Uint8ClampedArray
  ) {
    super(fileName, dimensions, imageData);

    this.imageCanvas = new ImageCanvas(this);
  }

  public getCSourceData(): string {
    return generateCSourceFileString(this, 3);
  }

  public getHeaderData(): string {
    return generateHeaderString(
      { fileName: this.fileName, imageDimensions: this.dimensions },
      3
    );
  }

  public getPixelColorAt(pos: ImageCoordinates): Color {
    return {
      r: this.imageData[Loader.offset(pos, this.dimensions)],
      g: this.imageData[Loader.offset(pos, this.dimensions) + 1],
      b: this.imageData[Loader.offset(pos, this.dimensions) + 2],
      a: this.imageData[Loader.offset(pos, this.dimensions) + 3]
    };
  }

  public setPixelColor(pos: ImageCoordinates, color: Color): void {
    console.log("setting pixel color bmp3");
    super.updateImageData(pos, color);
    this.imageCanvas.updatePixel(pos, color);
  }
}
