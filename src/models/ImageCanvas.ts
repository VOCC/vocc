import Color from "../models/Color";
import { createHiddenCanvas } from "../util/fileLoadUtils";
import { Dimensions, ImageCoordinates, Drawable } from "../util/types";

export default class ImageCanvas {
  public dimensions: Dimensions;
  public pixelGridRatio = 16;

  private hiddenCanvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;
  private pixelGrid: PixelGrid;

  public constructor(image: Drawable) {
    console.log("Creating new internal ImageCanvas.");

    this.dimensions = image.dimensions;
    this.hiddenCanvas = createHiddenCanvas(image.dimensions);
    this.context = this.hiddenCanvas.getContext("2d");
    this.pixelGrid = new PixelGrid(image.dimensions, this.pixelGridRatio);

    this.drawImageToHiddenCanvas(image);
  }

  public get imageCanvasElement(): HTMLCanvasElement {
    return this.hiddenCanvas;
  }

  public get pixelGridCanvasElement(): HTMLCanvasElement {
    return this.pixelGrid.canvasElement;
  }

  public updatePixel(pos: ImageCoordinates, color: Color): void {
    this.drawPixel(pos, color);
  }

  public updateRegion(
    image: Drawable,
    x: number,
    y: number,
    dx: number,
    dy: number
  ): void {
    // for (let x = 0; x < image.dimensions.width; x++) {
    //   for (let y = 0; y < image.dimensions.height; y++) {
    //     this.drawPixel({ x, y }, image.getPixelColorAt({ x, y }));
    //   }
    // }
  }

  public redrawImage(image: Drawable): void {
    this.drawImageToHiddenCanvas(image);
  }

  private drawPixel({ x, y }: ImageCoordinates, color: Color): void {
    if (!this.context) return;
    this.context.fillStyle = color.toString();
    this.context.fillRect(x, y, 1, 1);
  }

  private drawImageToHiddenCanvas(image: Drawable) {
    for (let x = 0; x < image.dimensions.width; x++) {
      for (let y = 0; y < image.dimensions.height; y++) {
        this.drawPixel({ x, y }, image.getPixelColorAt({ x, y }));
      }
    }
  }
}

export class PixelGrid {
  public dimensions: Dimensions;
  public pixelGridRatio = 16;

  private hiddenCanvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;

  constructor(dimensions: Dimensions, pixelGridRatio: number) {
    console.log("Setting up pixel grid.");

    this.pixelGridRatio = pixelGridRatio;

    this.dimensions = dimensions;
    this.hiddenCanvas = createHiddenCanvas({
      width: this.dimensions.width * this.pixelGridRatio,
      height: this.dimensions.height * this.pixelGridRatio
    });
    this.context = this.hiddenCanvas.getContext("2d");

    this.drawGrid();
  }

  public get canvasElement(): HTMLCanvasElement {
    return this.hiddenCanvas;
  }

  private drawGrid(): void {
    if (!this.context) return;
    const { width, height } = this.dimensions;
    this.context.strokeStyle = "gray";
    this.context.beginPath();

    for (let x = 0; x <= width; x++) {
      this.context.moveTo(x * this.pixelGridRatio, 0);
      this.context.lineTo(
        x * this.pixelGridRatio,
        height * this.pixelGridRatio
      );
    }

    for (let y = 0; y <= height; y++) {
      this.context.moveTo(0, y * this.pixelGridRatio);
      this.context.lineTo(width * this.pixelGridRatio, y * this.pixelGridRatio);
    }

    this.context.stroke();
  }
}
