import {
  Color,
  Dimensions,
  ImageCoordinates,
  ModifiableImage
} from "../../lib/interfaces";
import Palette from "./Palette";

export default class Sprite implements ModifiableImage {
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
    // console.log(
    //   "Getting palette index at",
    //   pos,
    //   "index",
    //   this.dimensions.width * pos.x + pos.y
    // );
    return this.palette.getColorAt(
      this.data[this.dimensions.width * pos.y + pos.x]
    );
  }

  public setPixelColor({ x, y }: ImageCoordinates): ModifiableImage {
    console.warn(
      "Setting pixel colors not implemented yet! Returning unchanged image."
    );
    return this;
  }
}
