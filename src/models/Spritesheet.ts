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
  private _imageCanvas: ImageCanvas;
  private _sprites: Sprite[];
  private _spriteMap: (Sprite | null)[][] = new Array(TILEMAP_DIM.height)
    .fill(null)
    .map(() => new Array(32).fill(TILEMAP_DIM.width));

  // TODO: Implement
  constructor(fileName: string, palette: Palette) {
    this.fileName = fileName;
    this._palette = palette;
    this._imageCanvas = new ImageCanvas(this);
    this._sprites = [];
  }

  public addSprite({ x, y }: ImageCoordinates, dimensions: SpriteDimensions) {
    const newSprite = new Sprite({ x, y }, dimensions, this._palette, 0);
    const newSpriteIndex = this._sprites.length;
    this._sprites[newSpriteIndex] = newSprite;
    for (let r = y; r < y + dimensions.height; r++) {
      for (let c = x; c < x + dimensions.width; c++) {
        this._spriteMap[c][r] = newSprite;
      }
    }
    this._imageCanvas.redrawImage(this);
  }

  public get sprites() {
    return this._sprites;
  }

  // TODO: Implement
  public getPixelColorAt(pos: ImageCoordinates): Color {
    return new Color(0, 0, 0);
  }

  public get imageCanvasElement() {
    return this._imageCanvas.imageCanvasElement;
  }

  public get pixelGridCanvasElement() {
    return this._imageCanvas.pixelGridCanvasElement;
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

  // TODO: Implement
  public updateFromStore(store: ImageDataStore) {
    return;
  }

  public setPixelColor(pos: ImageCoordinates, color: Color) {
    return;
  }
}
