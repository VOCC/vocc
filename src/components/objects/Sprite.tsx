import {
  Color,
  Dimensions,
  ImageCoordinates,
  ImageInterface
} from "../../lib/interfaces";
import * as Loader from "../../lib/imageLoadUtils";
import Palette from "./Palette";

export default class Sprite implements ImageInterface {
  public dimensions: Dimensions;
  public fileName: string;

  private data: number[];
  private palette: Palette;

  /**
   *
   * @param indexArray (rows, columns) a 2D array that represents the colors in
   *    the image as indices into the palette
   * @param palette the color palette that the sprite should draw from
   */
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
  }

  public getImageData(): Uint8ClampedArray {
    return new Uint8ClampedArray();
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    const drawPixel = (
      pos: ImageCoordinates,
      color: Color,
      ctx: CanvasRenderingContext2D
    ) => {
      const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      ctx.fillStyle = colorString;
      ctx.fillRect(pos.x, pos.y, 1, 1);
    };

    let hiddenCanvas = Loader.createHiddenCanvas(this.dimensions);
    let context = hiddenCanvas.getContext("2d");

    if (context) {
      for (let r = 0; r < this.dimensions.height; r++) {
        for (let c = 0; c < this.dimensions.width; c++) {
          let pos = { x: c, y: r };
          drawPixel(pos, this.getPixelColorAt(pos), context);
        }
      }
    } else {
      console.error(
        "Failed to get hidden canvas context when constructing image file blob!"
      );
    }

    return new Promise(resolve => {
      hiddenCanvas.toBlob(blob => resolve(blob));
    });
  }

  public isBlankImage(): boolean {
    // set to false because if a sprite is initialized,
    return false; // an image has been imported (i think this is the case)
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
