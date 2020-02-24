import {
  Color,
  Dimensions,
  ImageInterface,
  ImageCoordinates
} from "../../lib/interfaces";
import {
  generateHeaderString,
  generateCSourceFileString
} from "../../lib/exportUtils";
import * as Loader from "../../lib/imageLoadUtils";
import ImageCanvas from "./ImageCanvas";

export default class ImageObject implements ImageInterface {
  public fileName: string;
  public dimensions: Dimensions = {
    height: 32,
    width: 32
  };

  private hiddenCanvas: HTMLCanvasElement;
  private hiddenImage: HTMLImageElement;
  private imageData: Uint8ClampedArray;
  private imageCanvas: ImageCanvas;

  constructor(
    fileName: string,
    imageData?: Uint8ClampedArray,
    dimensions?: Dimensions
  ) {
    this.fileName = fileName;
    this.hiddenImage = document.createElement("img");
    this.hiddenImage.height = this.dimensions.height;
    this.hiddenImage.width = this.dimensions.width;
    this.hiddenCanvas = Loader.createHiddenCanvas(this.dimensions);

    if (imageData) {
      this.imageData = imageData;
      if (dimensions) {
        this.dimensions = dimensions;
      }
    } else {
      this.imageData = new Uint8ClampedArray(
        this.dimensions.height * this.dimensions.width
      );
    }

    this.imageCanvas = new ImageCanvas(this);
  }

  public getImageCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.getImageCanvasElement();
  }

  public getPixelGridCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.getPixelGridCanvasElement();
  }

  public getHeaderData(): string {
    return generateHeaderString(
      { fileName: this.fileName, imageDimensions: this.dimensions },
      3
    );
  }

  public getCSourceData(): string {
    return generateCSourceFileString(this, 3);
  }

  public getImageData(): Uint8ClampedArray {
    return this.imageData;
  }

  public getPixelColorAt(pos: ImageCoordinates): Color {
    const context = this.hiddenCanvas.getContext("2d");
    if (context == null) {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      };
    } else {
      return {
        r: this.imageData[Loader.offset(pos, this.dimensions)],
        g: this.imageData[Loader.offset(pos, this.dimensions) + 1],
        b: this.imageData[Loader.offset(pos, this.dimensions) + 2],
        a: this.imageData[Loader.offset(pos, this.dimensions) + 3]
      };
    }
  }

  public setPixelColor(
    pos: ImageCoordinates,
    paletteIndex: number
  ): ImageInterface {
    console.warn(
      "Method setPixelColor in ImageObject not implemented yet. " +
        "Returning the current image."
    );
    return this;
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    return new Promise(resolve => {
      this.getImageCanvasElement().toBlob(blob => resolve(blob));
    });
  }
}
