import { PALETTE_SIZE } from "../util/consts";
import {
  Dimensions,
  Drawable,
  ImageCoordinates,
  SpriteDimensions,
  SpriteDataStore,
} from "../util/types";
import Color from "./Color";
import ImageCanvas from "./ImageCanvas";
import Palette from "./Palette";

interface ISprite extends Drawable {
  dimensions: SpriteDimensions; // In pixels
  position: ImageCoordinates; // In tiles
  palette: Palette;
  paletteRow: number;
}

export default class Sprite implements ISprite, Drawable {
  private _data: Uint8ClampedArray;
  private _dimensions: SpriteDimensions;
  private _position: ImageCoordinates;
  private _palette: Palette;
  private _paletteRow: number;
  private _imageCanvas: ImageCanvas;
  private _redrawSpritesheet: () => void;

  constructor(
    position: ImageCoordinates,
    dimensions: SpriteDimensions,
    palette: Palette,
    paletteRow: number,
    redrawSpritesheet: () => void
  ) {
    this._dimensions = dimensions;
    this._position = position;
    this._palette = palette;
    this._paletteRow = paletteRow;
    this._data = new Uint8ClampedArray(dimensions.height * dimensions.width);
    this._imageCanvas = new ImageCanvas(this);
    this._redrawSpritesheet = redrawSpritesheet;
  }

  public static fromDataStore(
    { position, dimensions, paletteRow, data }: SpriteDataStore,
    palette: Palette,
    redrawSpritesheet: () => void
  ): Sprite {
    const sprite = new Sprite(
      position,
      dimensions,
      palette,
      paletteRow,
      redrawSpritesheet
    );
    sprite.dangerouslySetData(data);
    return sprite;
  }

  public updateFromDataStore({
    position,
    dimensions,
    paletteRow,
    data,
  }: SpriteDataStore) {
    this._position = position;
    this._dimensions = dimensions;
    this._paletteRow = paletteRow;
    this._data = data;
  }

  /**
   * Sets the pixel color to the given palette column color (row is not
   * applicable), then updates internal image canvas.
   * @param pos the position on the sprite to draw the color, in pixels
   * @param col column of the palette to draw the color of
   */
  public setPixelColorAt(pos: ImageCoordinates, col: number) {
    if (pos.x >= this._dimensions.width || pos.y >= this._dimensions.height) {
      console.error("Sprite: tried to set pixel color outside image bounds.");
      console.error(
        "Sprite dimensions:",
        this._dimensions,
        "Attempted to set color at coordinates:",
        pos
      );
    } else if (col < 0 || col > 0xf) {
      console.error(
        "Sprite: tried to set pixel color outside palette bounds:",
        col
      );
      return;
    }
    console.log("set pixel color on sprite");
    this._data[offset(this._dimensions, pos)] = col;
    this._imageCanvas.updatePixel(
      pos,
      this._palette[offset(PALETTE_SIZE, { x: col, y: this._paletteRow })]
    );
  }

  public getPixelColorAt(pos: ImageCoordinates) {
    const col = this._data[offset(this._dimensions, pos)];
    return this._palette[offset(PALETTE_SIZE, { x: col, y: this._paletteRow })];
  }

  /**
   * Gets the 4bpp data (the palette column) for a specific pixel in the sprite.
   * Used for exporting data.
   * @param pos the position on the sprtie to get data from, in pixels
   * @returns the sprite data from position pos. Guaranteed to fit in 4 bits.
   */
  public getDataAt(pos: ImageCoordinates): number {
    return this._data[offset(this._dimensions, pos)];
  }

  public dangerouslySetData(data: Uint8ClampedArray) {
    this._data = data;
    this._imageCanvas.redrawImage(this);
  }

  // Getters and setters

  /** Position of sprite, in tiles */
  public get position() {
    return this._position;
  }

  /** Dimensions of the sprite, in pixels */
  public get dimensions() {
    return this._dimensions;
  }

  // returns array of 8x8 pixel times
  public get tiles() {
    let tileArr: Color[][][] = [];

    let tileStartRow = 0;
    let tileStartCol = 0;

    //get the number of tiles needed to represent this sprite
    // # pixels in image / # pixles in sprite
    let numberTiles =
      (this.dimensions.height * this.dimensions.width) / (8 * 8);

    while (tileArr.length < numberTiles) {
      let tile: Color[][] = [];
      for (let i = 0; i < 8; i++) {
        tile[i] = [];
      }

      for (let i = tileStartRow; i === tileStartRow || i % 8 !== 0; i++) {
        for (let j = tileStartCol; j === tileStartCol || j % 8 !== 0; j++) {
          tile[i - tileStartRow][j - tileStartCol] = this.getPixelColorAt({
            x: i,
            y: j,
          });
        }
      }
      tileStartRow + 8 >= this.dimensions.height
        ? (tileStartRow = 0)
        : (tileStartRow += 8);
      tileStartCol + 8 >= this.dimensions.width
        ? (tileStartCol = 0)
        : (tileStartCol += 8);
      tileArr.push(tile);
    }

    return tileArr;
  }

  public set dimensions(newDimensions: SpriteDimensions) {
    console.warn("Sprite: Setting sprite dimensions not yet implemented.");
    // Make sure we properly resize the sprite data, as the Uint8ClampedArray
    // is flattened
  }

  public get paletteRow() {
    return this._paletteRow;
  }

  public set paletteRow(newPaletteRow: number) {
    if (newPaletteRow < 0 || newPaletteRow > 0xf) {
      console.error(
        "Sprite: tried to set palette row outside bounds: ",
        newPaletteRow
      );
      return;
    }
    this._paletteRow = newPaletteRow;
    this._imageCanvas.redrawImage(this);
    this._redrawSpritesheet();
  }

  public get imageCanvasElement() {
    return this._imageCanvas.imageCanvasElement;
  }

  public get pixelGridCanvasElement() {
    return this._imageCanvas.pixelGridCanvasElement;
  }

  public set palette(newPalette: Palette) {
    this._palette = newPalette;
    this._imageCanvas.redrawImage(this);
  }

  public get spriteDataStore(): SpriteDataStore {
    return {
      position: this._position,
      dimensions: this._dimensions,
      paletteRow: this._paletteRow,
      data: this._data,
    };
  }
}

function offset({ width }: Dimensions, { x, y }: ImageCoordinates) {
  return width * y + x;
}
