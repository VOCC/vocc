import {
  Color,
  Dimensions,
  ImageCoordinates,
  ImageInterface
} from "../../lib/interfaces";
import {
  generateHeaderString,
  generateCSourceFileString
} from "../../lib/exportUtils";
import Palette from "./Palette";
import ImageCanvas from "./ImageCanvas";

export default class Bitmap4 implements ImageInterface {
  public dimensions: Dimensions;
  public fileName: string;

  private data: number[];
  private palette: Palette;
  private imageCanvas: ImageCanvas;

  constructor(
    fileName: string,
    indexArray: number[],
    palette: Palette,
    dimensions: Dimensions
  ) {
    this.dimensions = dimensions;
    this.fileName = fileName;
    this.data = indexArray;
    this.palette = palette;
    this.imageCanvas = new ImageCanvas(this);
  }

  public getImageCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.getImageCanvasElement();
  }

  public getPixelGridCanvasElement(): HTMLCanvasElement {
    return this.imageCanvas.getPixelGridCanvasElement();
  }

  public getImageData(): Uint8ClampedArray {
    return new Uint8ClampedArray(this.data);
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

  public async getImageFileBlob(): Promise<Blob | null> {
    return new Promise(resolve => {
      this.getImageCanvasElement().toBlob(blob => resolve(blob));
    });
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
    return this.palette.getColorAt(
      this.data[this.dimensions.width * pos.y + pos.x]
    );
  }

  public setPixelColor({ x, y }: ImageCoordinates): ImageInterface {
    console.warn(
      "Setting pixel colors not implemented yet! Returning unchanged image."
    );
    return this;
  }
}
