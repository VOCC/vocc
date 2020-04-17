import Color from "../models/Color";
import * as Loader from "../util/fileLoadUtils";
import {
  Dimensions,
  ImageCoordinates,
  ImageDataStore,
  ImageInterface
} from "../util/types";
import ImageCanvas from "./ImageCanvas";

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

  public get imageCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.imageCanvasElement;
  }

  public get pixelGridCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.pixelGridCanvasElement;
  }

  public get imageDataStore(): ImageDataStore {
    return {
      fileName: this.fileName,
      dimensions: this.dimensions,
      imageData: this.imageData.slice()
    };
  }

  public updateFromStore(store: ImageDataStore): void {
    this.dimensions = store.dimensions;
    this.fileName = store.fileName;
    this.imageData = store.imageData as Uint8ClampedArray;
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    return new Promise(resolve => {
      this.imageCanvasElement.toBlob(blob => resolve(blob));
    });
  }

  protected updateImageData(pos: ImageCoordinates, color: Color): void {
    this.imageData[Loader.offset(pos, this.dimensions)] = color.r;
    this.imageData[Loader.offset(pos, this.dimensions) + 1] = color.g;
    this.imageData[Loader.offset(pos, this.dimensions) + 2] = color.b;
    this.imageData[Loader.offset(pos, this.dimensions) + 3] = color.a;
  }

  /////////////////////////////////////// abstract classes

  public abstract get cSourceData(): string;
  public abstract get headerData(): string;
  public abstract getPixelColorAt(pos: ImageCoordinates): Color;
  public abstract setPixelColor(pos: ImageCoordinates, color: Color): void;
}
