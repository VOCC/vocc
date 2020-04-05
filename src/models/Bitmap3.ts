import {
  Color,
  Dimensions,
  ImageCoordinates,
  ImageDataStore
} from "../util/interfaces";
import {
  generateHeaderString,
  generateCSourceFileString
} from "../util/exportUtils";
import * as Loader from "../util/fileLoadUtils";
import Bitmap from "./Bitmap";
import ImageCanvas from "./ImageCanvas";

class Bitmap3 extends Bitmap {
  protected imageCanvas: ImageCanvas;

  constructor(
    fileName: string,
    dimensions: Dimensions,
    imageData?: Uint8ClampedArray
  ) {
    super(fileName, dimensions, imageData);

    this.imageCanvas = new ImageCanvas(this);
  }

  static fromDataStore({
    imageData,
    dimensions,
    fileName
  }: ImageDataStore): Bitmap3 {
    return new Bitmap3(fileName, dimensions, Uint8ClampedArray.from(imageData));
  }

  public updateFromStore({ imageData }: ImageDataStore) {
    console.log(imageData as Uint8ClampedArray);
    this.imageData = imageData as Uint8ClampedArray;
    this.imageCanvas.redrawImage(this);
  }

  public getImageDataStore(): ImageDataStore {
    return {
      fileName: this.fileName,
      dimensions: this.dimensions,
      imageData: Array.from(this.imageData)
    };
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
    const r = this.imageData[Loader.offset(pos, this.dimensions)];
    const g = this.imageData[Loader.offset(pos, this.dimensions) + 1];
    const b = this.imageData[Loader.offset(pos, this.dimensions) + 2];
    const a = this.imageData[Loader.offset(pos, this.dimensions) + 3];

    return new Color(r, g, b, a);
  }

  public setPixelColor(pos: ImageCoordinates, color: Color): void {
    super.updateImageData(pos, color);
    this.imageCanvas.updatePixel(pos, color);
  }
}

export default Bitmap3;
