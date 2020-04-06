import { createHiddenCanvas } from "../util/fileLoadUtils";
import { PALETTE_HEADER, SS_TILES_HEADER } from "../util/exportUtils";
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
 * Size of a single tile
 */
const TILE_SIZE: Dimensions = { height: 8, width: 8 };

const TILEGRID_RATIO = 8;

/**
 * Representation of a 256 by 256 pixel (32x32 tile), 4bpp Spritesheet to be
 * used on the Gameboy Advance
 */
export default class Spritesheet4 implements ImageInterface {
  public fileName: string;

  private _palette: Palette;
  private _selectedPaletteCol: number;
  private _pixelDimensions: Dimensions = SS4_SIZE_PIXELS;
  private _tileDimensions: Dimensions = SS4_SIZE_TILES;
  /** Hidden canvas that is drawn directly to the editor's canvas. Contains a
      composite of all children sprites. */
  private _hiddenCanvas: HTMLCanvasElement;
  private _pixelGrid: PixelGrid;
  /** Hidden canvas that contains a tile grid. Shouldn't need to be modified. */
  private _tileGridHiddenCanvas: HTMLCanvasElement;
  /** Array of sprites that belong to this spritesheet */
  private _sprites: Sprite[];
  /** A 2D mapping of tiles to which sprite is in that tile */
  private _spriteMap: (Sprite | null)[][] = new Array(SS4_SIZE_TILES.height)
    .fill(null)
    .map(() => new Array(32).fill(null));

  // TODO: Implement
  constructor(fileName: string, palette: Palette, paletteCol: number) {
    this.fileName = fileName;
    this._palette = palette;
    this._selectedPaletteCol = paletteCol;
    this._hiddenCanvas = createHiddenCanvas(this.dimensions);
    this._pixelGrid = new PixelGrid(this._pixelDimensions, 16);
    this._tileGridHiddenCanvas = createTileGridHiddenCanvas(
      this._tileDimensions
    );
    this.fillBlack();
    this._sprites = [];
  }

  public static fromDataStore(
    { fileName, sprites }: SpritesheetDataStore,
    palette: Palette,
    paletteCol: number
  ) {
    let ss = new Spritesheet4(fileName, palette, paletteCol);
    ss.dangerouslySetSprites(ss.decodeSprites(sprites));
    return ss;
  }

  /** Decodes sprites from their string format and creates Sprite objects out
   * of them. Also tries to add them to the spritemap without checking to make
   * sure they're valid :( */
  public decodeSprites(sprites: string[]): Sprite[] {
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

  public dangerouslySetSprites(sprites: Sprite[]) {
    this._sprites = sprites;
    redrawTileGridCanvas(
      this._tileGridHiddenCanvas,
      sprites,
      this._tileDimensions
    );
    this.drawToHiddenCanvas();
  }

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
    addSpriteBoxToTileGridCanvas(
      { x, y },
      dimensions,
      newSpriteIndex,
      this._tileGridHiddenCanvas
    );
    console.log("Added sprite of size", dimensions, "at", { x, y });
  }

  public addToSpriteMap(sprite: Sprite): boolean {
    let { x, y } = sprite.position; // tiles
    let { height, width } = sprite.dimensions; // pixels

    for (let r = y; r < y + height / TILE_SIZE.height; r++) {
      for (let c = x; c < x + width / TILE_SIZE.width; c++) {
        if (this._spriteMap[r][c] != null) {
          // There's already a sprite at the location we'd be putting this one,
          // or it overlaps, so the new sprite is invalid.
          ALERT_INVALID_SPRITE();
          return false;
        }
      }
    }

    for (let r = y; r < y + height / 8; r++) {
      for (let c = x; c < x + width / 8; c++) {
        this._spriteMap[r][c] = sprite;
      }
    }

    return true;
  }

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
    redrawTileGridCanvas(
      this._tileGridHiddenCanvas,
      this._sprites,
      this._tileDimensions
    );
  }

  // TODO: Implement
  public getPixelColorAt(pos: ImageCoordinates): Color {
    return new Color(0, 0, 0);
  }

  /**
   * Returns the Sprite that contains the pixel at the given position
   * @param p position on image in pixels
   */
  private getSpriteFromCoordinates(p: ImageCoordinates): Sprite | null {
    const t = this.getTileIndexFromCoordinates(p);
    const sprite = this._spriteMap[t.y][t.x];
    return sprite;
  }

  private getTileIndexFromCoordinates(p: ImageCoordinates): ImageCoordinates {
    const tileX = Math.floor(p.x / 8);
    const tileY = Math.floor(p.y / 8);
    return { x: tileX, y: tileY };
  } // TODO: Implement

  public updatePalette(newPalette: Palette) {
    this._palette = newPalette;
    // for each sprite, set the new palette
    // the sprites take care of redrawing themselves
    this._sprites.map((s) => (s.palette = newPalette));
    this.drawToHiddenCanvas();
  }

  public updateFromStore(store: ImageDataStore) {
    return;
  }

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

  /**
   * Sets the selected palette column using the given palette index.
   * @param newPaletteIndex the index in the palette to set the selected column
   * to. Row is ignored.
   */
  public setPaletteIndex(newPaletteIndex: number) {
    this._selectedPaletteCol = paletteIndexToCol(newPaletteIndex);
    console.log(this._selectedPaletteCol);
  }

  private fillBlack() {
    const ctx = this._hiddenCanvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = new Color(0, 0, 0).toString();
    ctx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
  }

  private drawToHiddenCanvas() {
    const ctx = this._hiddenCanvas.getContext("2d");
    if (!ctx) return;

    this.fillBlack();

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

  // TODO: fix
  public get pixelGridCanvasElement() {
    return this._pixelGrid.canvasElement;
  }

  // TODO: Implement
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
  // tileHeader, tileData, mapHeader, mapData, paletteHeader, paletteData
  public get headerData(): string {
    return SS_TILES_HEADER(this.fileName) + PALETTE_HEADER(this.fileName);
  }

  // TODO: Implement
  // size = (height * width) / bpp (4 bpp)
  // private get tilesHeader(): string {
  //   const size = (this.dimensions.height * this.dimensions.width) / 4
  //   const name = this.fileName.slice(0, this.fileName.lastIndexOf("."));
  //   const imageDefinitionString = `const unsigned short [${name}] __attribute__((aligned(4)))=\n{\n\t`;
  //   return "const unsigned short " + name + "[" + size + "]" + "__attribute__((aligned(4)))";
  // }

  // //TODO: impliment
  // // same as image data export for mode 3
  // private get tileData(): String {
  //   return "";
  // }

  // TODO: Implement
  public get cSourceData(): string {
    return "lol sorry not done yet";
  }
}

function createTileGridHiddenCanvas(tileDimensions: Dimensions) {
  // height vs. width doesn't matter, since tiles /should/ be square...
  const ratio = TILEGRID_RATIO * TILE_SIZE.height;
  const hiddenCanvas = createHiddenCanvas({
    height: ratio * tileDimensions.height,
    width: ratio * tileDimensions.width,
  });
  drawTilesOnCanvas(hiddenCanvas, tileDimensions);
  return hiddenCanvas;
}

function drawTilesOnCanvas(
  canvas: HTMLCanvasElement,
  tileDimensions: Dimensions
) {
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
}

function redrawTileGridCanvas(
  canvas: HTMLCanvasElement,
  sprites: Sprite[],
  tileDimensions: Dimensions
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTilesOnCanvas(canvas, tileDimensions);
  sprites.map((s, i) =>
    addSpriteBoxToTileGridCanvas(s.position, s.dimensions, i, canvas)
  );
}

function addSpriteBoxToTileGridCanvas(
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
}

/**
 * Translates coordinates from spritesheet space to the context of a sprite
 * @param ssc coordinates on the spritesheet to translate, in pixels
 * @param ssd the size of the spritesheet, in pixels
 * @param stp the position of the sprite on the spritesheet, in tiles
 * @param spd the size of the sprite, in pixels
 * @returns coordinates of the pixel in terms of a sprite at the given position
 */
function spritesheetCoordsToSpriteCoords(
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
