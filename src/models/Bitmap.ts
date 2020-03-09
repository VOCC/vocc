import {
  Color,
  Dimensions,
  ImageInterface,
  ImageCoordinates,
  ImageDataStore
} from "../util/interfaces";
import ImageCanvas from "./ImageCanvas";
import * as Loader from "../util/fileLoadUtils";

export default abstract class Bitmap implements ImageInterface {
  public fileName: string;
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

  // public getRawImageData(): Uint8ClampedArray {
  //   return this.imageData;
  // }

  public getImageDataStore(): ImageDataStore {
    return {
      fileName: this.fileName,
      dimensions: this.dimensions,
      imageData: this.imageData
    };
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    return new Promise(resolve => {
      this.getImageCanvasElement().toBlob(blob => resolve(blob));
    });
  }

  protected updateImageData(pos: ImageCoordinates, color: Color): void {
    this.imageData[Loader.offset(pos, this.dimensions)] = color.r;
    this.imageData[Loader.offset(pos, this.dimensions) + 1] = color.g;
    this.imageData[Loader.offset(pos, this.dimensions) + 2] = color.b;
    this.imageData[Loader.offset(pos, this.dimensions) + 3] = color.a;
  }

  /////////////////////////////////////// abstract classes

  public abstract getCSourceData(): string;
  public abstract getHeaderData(): string;
  public abstract getPixelColorAt(pos: ImageCoordinates): Color;
  public abstract setPixelColor(pos: ImageCoordinates, color: Color): void;
}
