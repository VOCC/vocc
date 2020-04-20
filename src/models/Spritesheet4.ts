import { createHiddenCanvas } from "../util/fileLoadUtils";
import {
  PALETTE_HEADER,
  SS_TILES_HEADER,
  PaletteToGBA,
} from "../util/exportUtils";
import {
  Dimensions,
  ImageCoordinates,
  ImageDataStore,
  ImageInterface,
  SpriteDimensions,
  SpritesheetDataStore,
  SpriteDataStore,
} from "../util/types";
import Color from "./Color";
import { PixelGrid } from "./ImageCanvas";
import Palette, { paletteIndexToCol } from "./Palette";
import Sprite from "./Sprite";

const ALERT_INVALID_SPRITE = () =>
  alert("There's already a sprite at that location!");

/**
 * Size of a 4bpp spritesheet in pixels
 */
const SS4_SIZE_PIXELS: Dimensions = { height: 256, width: 256 };

/**
 * Size of a 4bpp spritesheet in tiles
 */
const SS4_SIZE_TILES: Dimensions = { height: 32, width: 32 };

/**
 * Size of a single tile in pixels
 */
const TILE_SIZE: Dimensions = { height: 8, width: 8 };

const TILEGRID_RATIO = 8;

/**
 * Representation of a 256x256 pixel (32x32 tile), 4bpp Spritesheet to be
 * used on the Gameboy Advance
 */
export default class Spritesheet4 implements ImageInterface {
  public fileName: string;

  private _backgroundColor: Color;
  private _palette: Palette;

  /** The currently selected palette column to be drawn on the spritesheet */
  private _selectedPaletteCol: number;

  /** Dimensions of the spritesheet in pixels */
  private _pixelDimensions: Dimensions = SS4_SIZE_PIXELS;

  /** Dimensions of the spritesheet in tiles */
  private _tileDimensions: Dimensions = SS4_SIZE_TILES;

  /** Hidden canvas that is drawn directly to the editor's canvas. Contains a
      composite of all children sprites. */
  private _hiddenCanvas: HTMLCanvasElement;

  /** A PixelGrid instance that holds a hidden canvas with ONLY the pixel grid,
      and no tile grid. */
  private _pixelGrid: PixelGrid;

  /** Hidden canvas that contains a tile grid. Shouldn't need to be modified. */
  private _tileGridHiddenCanvas: HTMLCanvasElement;

  /** Array of sprites that belong to this spritesheet */
  private _sprites: Sprite[];

  /**
   * A 2D mapping of tiles to which sprite is in that tile. Used mostly for
   * determining which sprite belongs to a given tile for drawing and
   * displaying purposes.
   */
  private _spriteMap: (Sprite | null)[][] = new Array(SS4_SIZE_TILES.height)
    .fill(null)
    .map(() => new Array(32).fill(null));

  constructor(fileName: string, palette: Palette, paletteCol: number) {
    this.fileName = fileName;
    this._palette = palette;
    this._selectedPaletteCol = paletteCol;
    this._hiddenCanvas = createHiddenCanvas(this.dimensions);
    this._pixelGrid = new PixelGrid(this._pixelDimensions, 16);
    this._tileGridHiddenCanvas = TileGridUtils.createHiddenCanvas(
      this._tileDimensions
    );
    this._backgroundColor = this._palette[0];
    this.fillBackground();
    this._sprites = [];
  }

  /**
   * Creates a new Spritesheet4 object from a SpritesheetDataStore. This is
   * intended to be used when restoring the image editor state from localstorage
   * or perhaps when loading a spritesheet from a json or text file.
   *
   * @param spritesheetDataStore the spritesheet data store to construct a spritesheet from.
   * @param palette the palette to construct the spritesheet with
   * @param paletteCol the palette column that's currently selected in the app,
   * in case it is different from 0
   */
  public static fromDataStore(
    { fileName, sprites }: SpritesheetDataStore,
    palette: Palette,
    paletteCol: number = 0
  ) {
    let ss = new Spritesheet4(fileName, palette, paletteCol);
    ss.dangerouslySetSprites(ss.decodeSprites(sprites));
    return ss;
  }

  /**
   * Decodes sprites from their string format and creates Sprite objects out
   * of them. Does not check if sprites are valid! This isn't an issue if you
   * trust the output of the encoding functions, but could result in bugs if
   * someone, for instance, manually modified their localstorage
   *
   * @param sprites the decoded array of strings that represents all of the
   * sprites to be further decoded
   * @returns an array of decoded Sprite objects
   */
  private decodeSprites(sprites: string[]): Sprite[] {
    let decodedSprites = sprites.map((s) =>
      Sprite.fromDataStore(
        JSON.parse(s) as SpriteDataStore,
        this._palette,
        () => this.drawToHiddenCanvas()
      )
    );
    decodedSprites.forEach((s) => this.addToSpriteMap(s));
    return decodedSprites;
  }

  /**
   * Sets the internal _sprites variable without performing any checks, draws
   * the tile grid, and draws the hidden canvas so that the view is completely
   * updated.
   *
   * @remarks It's necessary for this to be its own method since the static
   * Spritesheet4 constructor doesn't have access to this classes' private
   * instance variables, but since we're inside the class we can call private
   * methods from the static function.
   *
   * @param sprites the new value for the internal _sprites variable
   */
  private dangerouslySetSprites(sprites: Sprite[]) {
    this._sprites = sprites;
    TileGridUtils.redrawCanvas(
      this._tileGridHiddenCanvas,
      sprites,
      this._tileDimensions
    );
    this.drawToHiddenCanvas();
  }

  /**
   * Adds a new, blank sprite to the spritesheet by adding it to the sprite
   * list, the sprite map, redrawing the hidden canvas, and adding the sprite
   * box and number to the tile grid canvas.
   *
   * @param imageCoordinates the position to add a new sprite at, in tiles
   * @param dimensions the size of the new sprite in pixels
   */
  public addSprite({ x, y }: ImageCoordinates, dimensions: SpriteDimensions) {
    const newSprite = new Sprite({ x, y }, dimensions, this._palette, 0, () =>
      this.drawToHiddenCanvas()
    );

    if (!this.addToSpriteMap(newSprite)) {
      return; // failed since there was another sprite in the way
    }

    const newSpriteIndex = this._sprites.length;
    this._sprites[newSpriteIndex] = newSprite;

    this.drawToHiddenCanvas();
    TileGridUtils.addSpriteBoxToCanvas(
      { x, y },
      dimensions,
      newSpriteIndex,
      this._tileGridHiddenCanvas
    );
    console.log("Added sprite of size", dimensions, "at", { x, y });
  }

  /**
   * Adds a sprite to the sprite map at the sprite's location.
   *
   * @param sprite the sprite to add to the sprite map
   * @returns true or false depending on whether or not the sprite's placement
   * was valid
   */
  private addToSpriteMap(sprite: Sprite): boolean {
    const { x, y } = sprite.position; // tiles
    const { height: h, width: w } = sprite.dimensions; // pixels
    const tw = w / TILE_SIZE.width;
    const th = h / TILE_SIZE.height;

    // Check if the sprite ends up outside of the bounds of the spritesheet
    if (
      y + th >= this._tileDimensions.height ||
      x + tw >= this._tileDimensions.width
    ) {
      ALERT_INVALID_SPRITE();
      return false;
    }

    // Check if the sprite overlaps another one
    for (let r = y; r < y + th; r++) {
      for (let c = x; c < x + tw; c++) {
        if (this._spriteMap[r][c] != null) {
          ALERT_INVALID_SPRITE();
          return false;
        }
      }
    }

    // Finally, assign the sprite
    for (let r = y; r < y + th; r++) {
      for (let c = x; c < x + tw; c++) {
        this._spriteMap[r][c] = sprite;
      }
    }

    return true;
  }

  /**
   * Removes a sprite from the spritesheet, redraws the hidden canvas, and
   * redraws the tile grid, sprite boxes, and numbers.
   *
   * @remarks Keep in mind that the indices will be reassigned, since this
   * just deletes the sprite from the list and shifts the rest of the list
   * over.
   *
   * @param index the index of the sprite array to remove the sprite at
   */
  public removeSprite(index: number) {
    const sprite = this._sprites[index];
    const { x, y } = sprite.position;
    // Clear out spritemap
    for (let r = y; r < y + sprite.dimensions.height / TILE_SIZE.height; r++) {
      for (let c = x; c < x + sprite.dimensions.width / TILE_SIZE.width; c++) {
        this._spriteMap[r][c] = null;
      }
    }
    // Remove from sprite array
    this._sprites.splice(index, 1);
    this.drawToHiddenCanvas();
    TileGridUtils.redrawCanvas(
      this._tileGridHiddenCanvas,
      this._sprites,
      this._tileDimensions
    );
  }

  /**
   * Gets the specified color of the sprite on the spritesheet.
   * @param pos position on image in pixels
   * @returns the color of the sprite at the given position or the transparent 
   * background color if there is no sprite at the given position.
   */
  public getPixelColorAt(pos: ImageCoordinates): Color {
    const sprite = this.getSpriteFromCoordinates(pos);
    if (!sprite) {
      console.warn("Spritesheet: trying to get color but there's no sprite!");
      return this._palette[0];
    }
    const pixelPosInSprite = spritesheetCoordsToSpriteCoords(
      pos,
      this._pixelDimensions,
      sprite.position,
      sprite.dimensions
    );
    const color = sprite.getPixelColorAt(pixelPosInSprite);
    return color;
  }

  /**
   * Returns the Sprite that contains the pixel at the given position
   * @param p position on spritesheet in pixels
   */
  public getSpriteFromCoordinates(p: ImageCoordinates): Sprite | null {
    const t = this.getTileIndexFromCoordinates(p);
    const sprite = this._spriteMap[t.y][t.x];
    return sprite;
  }

  /**
   * Computes what tile a position lies in on the spritesheet
   * @param p position on spritesheet in pixels
   * @returns the coordinates (in tiles) of the tile that contains the
   * position p
   */
  private getTileIndexFromCoordinates(p: ImageCoordinates): ImageCoordinates {
    const tileX = Math.floor(p.x / 8);
    const tileY = Math.floor(p.y / 8);
    return { x: tileX, y: tileY };
  } // TODO: Implement

  /**
   * Sets the new palette and redraws all sprites with the new palette, then
   * redraws the spritesheet
   * @param newPalette the new palette to redraw all sprites with
   */
  public updatePalette(newPalette: Palette) {
    this._palette = newPalette;
    // for each sprite, set the new palette
    // the sprites take care of redrawing themselves
    this._sprites.map((s) => (s.palette = newPalette));
    this.drawToHiddenCanvas();
  }

  // TODO: Implement
  // Can we replace SpritesheetDataStore with optional properties in ImageDataStore?
  public updateFromStore(store: ImageDataStore) {
    return;
  }

  /**
   * Sets the pixel at the given position to the given color. Automatically
   * determines what Sprite to edit.
   * @param pos the position to set a new color at, in pixels
   * @param color the color to set
   */
  public setPixelColor(pos: ImageCoordinates, color: Color) {
    const sprite = this.getSpriteFromCoordinates(pos);
    if (!sprite) {
      console.warn("Spritesheet: trying to set color but there's no sprite!");
      return;
    }
    const pixelCoords = spritesheetCoordsToSpriteCoords(
      pos,
      this._pixelDimensions,
      sprite.position,
      sprite.dimensions
    );
    sprite.setPixelColorAt(pixelCoords, this._selectedPaletteCol);
    this.drawToHiddenCanvas();
    return;
  }

  public setBackgroundColor(color: Color): void {
    this._backgroundColor = color;
  }

  /**
   * Sets the selected palette column using the given palette index.
   * @param newPaletteIndex the index in the palette to set the selected column
   * to. Row is ignored.
   */
  public setPaletteIndex(newPaletteIndex: number) {
    this._selectedPaletteCol = paletteIndexToCol(newPaletteIndex);
    console.log(this._selectedPaletteCol);
  }

  private fillBackground() {
    const ctx = this._hiddenCanvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = this._backgroundColor.toString();
    ctx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
  }

  /**
   * Redraws every sprite to the hidden canvas. This is usually inexpensive,
   * and at worst there will be 1024 canvas draw calls (full spritesheet of 8x8
   * sprites).
   */
  private drawToHiddenCanvas() {
    const ctx = this._hiddenCanvas.getContext("2d");
    if (!ctx) return;

    this.fillBackground();

    this.sprites.forEach((sprite) => {
      ctx.drawImage(
        sprite.imageCanvasElement,
        8 * sprite.position.x,
        8 * sprite.position.y,
        sprite.dimensions.width,
        sprite.dimensions.height
      );
      ctx.stroke();
    });
  }

  // Getters and setters -------------------------------------------------------

  public get dimensions() {
    return this._pixelDimensions;
  }

  public get sprites() {
    return this._sprites;
  }

  public get imageCanvasElement() {
    return this._hiddenCanvas;
  }

  public get tileGridCanvasElement() {
    return this._tileGridHiddenCanvas;
  }

  public get pixelGridCanvasElement() {
    return this._pixelGrid.canvasElement;
  }

  public get imageDataStore() {
    const tempData: ImageDataStore = {
      fileName: this.fileName,
      dimensions: this.dimensions,
      imageData: [],
    };
    return tempData;
  }

  public get spritesheetDataStore(): SpritesheetDataStore {
    let temp = {
      fileName: this.fileName,
      dimensions: this._pixelDimensions,
      sprites: this._sprites.map((s) => JSON.stringify(s.spriteDataStore)),
      bpp: 4,
    };
    return temp;
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.imageCanvasElement.toBlob((blob) => resolve(blob));
    });
  }

  // The correct order should be:
  // tileHeader, tileData, paletteHeader, paletteData
  public get headerData(): string {
    return SS_TILES_HEADER(this.fileName) + PALETTE_HEADER(this.fileName);
  }

  /**
   * Get properly formatted c code cotaining an array of spritesheet tile data.
   * Each index is the hex color value of the pixel.
   * Iterates one 8x8 TILE at a time going left to right and then down...
   *
   * ex. 32 tiles x 32 tiles spritesheet
   * -------------------------
   * | 0  | 1  | 2  |...| 32 |
   * | 33 | 34 | 35 |...| 64 |
   * | .                     |
   * | .    .                |
   * | .         .           |
   * | 992| 993| 994|...|1024|
   * -------------------------
   */
  private get tileData(): String {
    const name = this.fileName.slice(0, this.fileName.lastIndexOf("."));
    const size = (this.dimensions.height * this.dimensions.width) / 4; // 4bpp
    let toReturn =
      "const unsigned short " +
      name +
      "Tiles[" +
      size +
      "] __attribute__((aligned(4)))=\n{\n\t";
    // for (
    //   let tileNum = 0;
    //   tileNum < SS4_SIZE_TILES.height * SS4_SIZE_TILES.width;
    //   tileNum++
    // ) {
    for (let ssty = 0; ssty < this._tileDimensions.height; ssty++) {
      for (let sstx = 0; sstx < this._tileDimensions.width; sstx++) {
        const sprite = this._spriteMap[ssty][sstx];
        if (sprite) {
          for (let tileRow = 0; tileRow < 8; tileRow += 1) {
            for (let tileCol = 0; tileCol < 8; tileCol += 4) {
              // const ssCoords: ImageCoordinates = {
              //   x: (tileCol + tileNum * 8) % SS4_SIZE_PIXELS.width,
              //   y: tileRow + Math.floor(tileNum / SS4_SIZE_TILES.width) * 8,
              // };
              // toReturn += colorToHex(this.getPixelColorAt(coords)) + ",";
              const ssCoords: ImageCoordinates = {
                x: sstx * TILE_SIZE.width + tileCol,
                y: ssty * TILE_SIZE.height + tileRow,
              };
              // Translate coordinates to be relative to sprite
              const spCoords = spritesheetCoordsToSpriteCoords(
                ssCoords,
                this._pixelDimensions,
                sprite.position,
                sprite.dimensions
              );
              // Get 8 bits worth of data
              const d0 = sprite.getDataAt(spCoords);
              const d1 = sprite.getDataAt({ x: spCoords.x + 1, y: spCoords.y });
              const d2 = sprite.getDataAt({ x: spCoords.x + 2, y: spCoords.y });
              const d3 = sprite.getDataAt({ x: spCoords.x + 3, y: spCoords.y });
              const out = (d0 << 0) + (d1 << 4) + (d2 << 8) + (d3 << 12);
              const outString = "0x" + out.toString(16).padStart(4, "0") + ", ";
              console.log(outString);
              toReturn += outString;
            }
            if (tileRow === 3 || tileRow === 7) {
              toReturn += "\n\t";
            }
          }
        } else {
          toReturn +=
            "0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,\n\t" +
            "0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,\n\t";
        }
        if ((sstx + 1) % 4 === 0) {
          toReturn += "\n\t";
        }
      }
    }
    toReturn += "};";
    return toReturn;
  }

  /**
   * Get the c source code for the current spritesheet.
   * Contains the spritesheet data and palette.
   */
  public get cSourceData(): string {
    return (
      "//spritesheet export\n" +
      this.tileData +
      "\n\n" +
      PaletteToGBA(this._palette)
    );
  }
}

/**
 * It's not entirely necessary for the tile grid to be it's own class like the
 * PixelGrid, since it's not really being re-used. So, TileGridUtils is a
 * collection of methods that create and operate on an HTMLCanavsElement that
 * contains a tile grid and also displays boxes around sprites.
 */
const TileGridUtils = {
  /**
   * Creates a hidden canvas with a tile grid already in place
   * @param tileDimensions the dimensions of the hidden canvas to create
   */
  createHiddenCanvas(tileDimensions: Dimensions) {
    // height vs. width doesn't matter, since tiles /should/ be square...
    const ratio = TILEGRID_RATIO * TILE_SIZE.height;
    const hiddenCanvas = createHiddenCanvas({
      height: ratio * tileDimensions.height,
      width: ratio * tileDimensions.width,
    });
    this.drawTilesOnCanvas(hiddenCanvas, tileDimensions);
    return hiddenCanvas;
  },

  /**
   * Draws a tile grid on an HTMLCanvasElement. Depends on the canvas and the
   * tile dimensions matching up based on the TILEGRID_RATIO. They will match
   * up if the hidden canvas was created with
   * TileGridUtils.createHiddenCanvas().
   * @param canvas the existing canvas to draw tiles on
   * @param tileDimensions the dimensions of the tile grid to draw on the canvas
   */
  drawTilesOnCanvas(canvas: HTMLCanvasElement, tileDimensions: Dimensions) {
    const error = () =>
      console.error(
        "Spritesheet: Failed to get context for tile grid canvas.",
        "Cannot draw tile grid."
      );

    const ratio = TILEGRID_RATIO * TILE_SIZE.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      error();
      return canvas;
    }

    ctx.globalAlpha = 1;
    ctx.strokeStyle = "blue";
    ctx.beginPath();

    for (let x = 0; x <= tileDimensions.width; x++) {
      ctx.moveTo(x * ratio, 0);
      ctx.lineTo(x * ratio, tileDimensions.height * ratio);
    }

    for (let y = 0; y <= tileDimensions.height; y++) {
      ctx.moveTo(0, y * ratio);
      ctx.lineTo(tileDimensions.width * ratio, y * ratio);
    }

    ctx.stroke();
  },

  /**
   * Completely redraws the tile grid and all sprite boxes and numbers. To be
   * used when deleting a sprite or when creating a new canvas after restoring
   * or loading a pre-existing spritesheet.
   *
   * @remarks the grid needs to be redrawn as well, since if a sprite is
   * deleted, then the old box and number would still be there. So it's
   * necessary to clear the canvas.
   *
   * @param canvas the canvas to redraw the tile grid to
   * @param sprites the list of sprites to draw the boxes and numbers of
   * @param tileDimensions the dimensions of the spritesheet and canvas, in tiles
   */
  redrawCanvas(
    canvas: HTMLCanvasElement,
    sprites: Sprite[],
    tileDimensions: Dimensions
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawTilesOnCanvas(canvas, tileDimensions);
    sprites.map((s, i) =>
      this.addSpriteBoxToCanvas(s.position, s.dimensions, i, canvas)
    );
  },

  /**
   * Draws a bounding box around a sprite depending on its position and
   * dimensions, and also draws a number in the corner of the box as an
   * identifier.
   * @param spritePos position of the sprite, in tiles
   * @param spriteDim dimensions of the sprite, in pixels
   * @param spriteNum the number to be drawn in the corner of the sprite box
   * @param canvas the canvas to draw the sprite box on
   */
  addSpriteBoxToCanvas(
    spritePos: ImageCoordinates,
    spriteDim: Dimensions,
    spriteNum: number,
    canvas: HTMLCanvasElement
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = TILEGRID_RATIO * TILE_SIZE.height;
    ctx.strokeStyle = "yellow";
    ctx.strokeRect(
      spritePos.x * ratio,
      spritePos.y * ratio,
      spriteDim.width * TILEGRID_RATIO,
      spriteDim.height * TILEGRID_RATIO
    );
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText(
      spriteNum.toString(),
      spritePos.x * ratio + 2,
      spritePos.y * ratio + 12
    );
  },
};

/**
 * Translates coordinates from spritesheet space to the context of a sprite
 * @param ssc coordinates on the spritesheet to translate, in pixels
 * @param ssd the size of the spritesheet, in pixels
 * @param stp the position of the sprite on the spritesheet, in tiles
 * @param spd the size of the sprite, in pixels
 * @returns coordinates of the pixel in terms of a sprite at the given position
 */
export function spritesheetCoordsToSpriteCoords(
  ssc: ImageCoordinates,
  ssd: Dimensions,
  stp: ImageCoordinates,
  spd: Dimensions
): ImageCoordinates {
  const spp: ImageCoordinates = {
    x: stp.x * TILE_SIZE.width,
    y: stp.y * TILE_SIZE.height,
  };
  // console.log("in:", ssc, ssd, spp, spd);

  if (ssc.y >= ssd.height || ssc.x >= ssd.width) {
    console.warn("Trying to translate spritesheet coordinates out of range!");
  }

  const pixelPos: ImageCoordinates = {
    x: ssc.x - spp.x,
    y: ssc.y - spp.y,
  };

  if (pixelPos.x >= spd.width || pixelPos.y >= spd.height) {
    console.warn("Translated sprite coordinates out of sprite range!");
  }

  // console.log("out", pixelPos);

  return pixelPos;
}
