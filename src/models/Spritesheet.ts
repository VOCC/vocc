import Color from "../models/Color";
import Sprite from "../models/Sprite";
import {
  Dimensions,
  ImageCoordinates,
  ImageDataStore,
  ImageInterface,
  SpriteDimensions
} from "../util/types";
import ImageCanvas from "./ImageCanvas";
import Palette from "./Palette";
import { createHiddenCanvas } from "../util/fileLoadUtils";

const SPRITESHEET_DIM: Dimensions = { height: 256, width: 256 };
const TILEMAP_DIM: Dimensions = { height: 32, width: 32 };

/**
 * Representation of a 256 by 256 pixel (32x32 tile), 4bpp Spritesheet to be
 * used on the Gameboy Advance
 */
export default class Spritesheet implements ImageInterface {
  public fileName: string;
  public readonly dimensions: Dimensions = SPRITESHEET_DIM;

  private _palette: Palette;
  private _hiddenCanvas: HTMLCanvasElement;
  private _pixelGridHiddenCanvas: HTMLCanvasElement;
  private _sprites: Sprite[];
  private _spriteMap: (Sprite | null)[][] = new Array(TILEMAP_DIM.height)
    .fill(null)
    .map(() => new Array(32).fill(null));

  // TODO: Implement
  constructor(fileName: string, palette: Palette) {
    this.fileName = fileName;
    this._palette = palette;
    this._hiddenCanvas = createHiddenCanvas(this.dimensions);
    this._pixelGridHiddenCanvas = createHiddenCanvas(this.dimensions);
    this.fillBlack();
    this._sprites = [];
  }

  public addSprite({ x, y }: ImageCoordinates, dimensions: SpriteDimensions) {
    const newSprite = new Sprite({ x, y }, dimensions, this._palette, 0);
    const newSpriteIndex = this._sprites.length;
    this._sprites[newSpriteIndex] = newSprite;
    for (let r = y; r < y + dimensions.height / 8; r++) {
      for (let c = x; c < x + dimensions.width / 8; c++) {
        this._spriteMap[r][c] = newSprite;
      }
    }
    this.drawToHiddenCanvas();
    console.log("Added sprite. Spritemap:", this._spriteMap);
  }

  // TODO: Implement
  public getPixelColorAt(pos: ImageCoordinates): Color {
    const sprite = this.getSpriteFromCoordinates(pos);
    if (sprite) {
      return this.getColorFromSprite(pos, sprite);
    } else {
      return new Color(0, 0, 0);
    }
  }

  /**
   * Translates spritesheet pixel coordinates to sprite pixel coordinates and
   * retrieves the color from the sprite.
   *
   *    position in sprite coordinates =
   *        spritesheet pixel coordinates - 8 * sprite position in tiles
   *
   * @param spriteSheetPixelPos position of pixel to get color from in
   *    spritesheet coordinates
   * @param sprite the sprite to get the pixel color from
   */
  private getColorFromSprite(
    spriteSheetPixelPos: ImageCoordinates,
    sprite: Sprite
  ) {
    const p = {
      x: spriteSheetPixelPos.x - 8 * sprite.position.x,
      y: spriteSheetPixelPos.y - 8 * sprite.position.y
    };
    console.log(p);
    return sprite.getPixelColorAt(p);
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
    const tileY = Math.floor(p.x / 8);
    return { x: tileX, y: tileY };
  } // TODO: Implement

  public updateFromStore(store: ImageDataStore) {
    return;
  }

  public setPixelColor(pos: ImageCoordinates, color: Color) {
    return;
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

    this.sprites.forEach(sprite => {
      ctx.drawImage(
        sprite.imageCanvasElement,
        8 * sprite.position.x,
        8 * sprite.position.y,
        sprite.dimensions.width,
        sprite.dimensions.height
      );
      ctx.stroke();
    });

    this.drawGrid();
  }

  private drawGrid() {
    const ctx = this._hiddenCanvas.getContext("2d");
    if (!ctx) return;

    this.sprites.forEach(sprite => {
      ctx.drawImage(
        sprite.pixelGridCanvasElement,
        8 * sprite.position.x,
        8 * sprite.position.y,
        sprite.dimensions.width,
        sprite.dimensions.height
      );
      ctx.stroke();
    });
  }

  // Getters and setters -------------------------------------------------------

  public get sprites() {
    return this._sprites;
  }

  public get imageCanvasElement() {
    return this._hiddenCanvas;
  }

  // TODO: fix
  public get pixelGridCanvasElement() {
    return this._pixelGridHiddenCanvas;
  }

  // TODO: Implement
  public get imageDataStore() {
    const tempData: ImageDataStore = {
      fileName: this.fileName,
      dimensions: this.dimensions,
      imageData: []
    };
    return tempData;
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    return new Promise(resolve => {
      this.imageCanvasElement.toBlob(blob => resolve(blob));
    });
  }

  // TODO: Implement
  public get headerData(): string {
    return "";
  }

  // TODO: Implement
  public get cSourceData(): string {
    return "";
  }
}
