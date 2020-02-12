import ImageObject from "./ImageObject";
import {
  Color,
  Dimensions,
  ImageCoordinates,
  ModifiableImage,
  PaletteCoordinates
} from "../../lib/interfaces";
import Palette from "./Palette";

export default class Sprite implements ModifiableImage {
  public dimensions: Dimensions;
  public fileName: string;

  private data: number[][];
  private palette: Palette;

  /**
   *
   * @param indexArray (rows, columns) a 2D array that represents the colors in
   *    the image as indices into the palette
   * @param palette the color palette that the sprite should draw from
   */
  constructor(fileName: string, indexArray: number[][], palette: Palette) {
    this.dimensions = {
      height: indexArray.length,
      width: indexArray[0].length
    };
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
  public getPixelColorAt({ x, y }: ImageCoordinates): Color {
    return this.palette.getColorAt(this.data[x][y]);
  }

  public setPixelColor({ x, y }: ImageCoordinates): ModifiableImage {
    console.warn(
      "Setting pixel colors not implemented yet! Returning unchanged image."
    );
    return this;
  }
}
