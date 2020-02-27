import {
  Color,
  Dimensions,
  ImageInterface,
  ImageCoordinates
} from "../../lib/interfaces";
import ImageCanvas from "./ImageCanvas";

export default abstract class Bitmap implements ImageInterface {
  public  fileName: string;
  public dimensions: Dimensions;

  protected imageData: Uint8ClampedArray;
  protected abstract imageCanvas: ImageCanvas;

  constructor(
    fileName: string,
    dimensions: Dimensions,
    imageData?: Uint8ClampedArray
  ) {
    this.fileName = fileName;
    this.dimensions = dimensions;

    if (imageData) {
      this.imageData = imageData;
    } else {
      this.imageData = new Uint8ClampedArray(
        this.dimensions.width * this.dimensions.height * 4
      );
    }
  }

  public getImageCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.getImageCanvasElement();
  }

  public getPixelGridCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.getPixelGridCanvasElement();
  }

  public getImageData(): Uint8ClampedArray {
    return this.imageData;
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    return new Promise(resolve => {
      this.getImageCanvasElement().toBlob(blob => resolve(blob));
    });
  }

  /////////////////////////////////////// abstract classes

  public abstract getCSourceData(): string;
  public abstract getHeaderData(): string;
  public abstract getPixelColorAt(pos: ImageCoordinates): Color;
  public abstract setPixelColor(
    pos: ImageCoordinates,
    paletteIndex?: number,
    color?: Color
  ): void;
}