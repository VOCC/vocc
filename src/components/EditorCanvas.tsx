import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Color,
  Dimensions,
  ImageInterface,
  EditorSettings,
  ImageCoordinates
} from "../lib/interfaces";
import { createHiddenCanvas } from "../lib/imageLoadUtils";

interface EditorCanvasProps {
  imageObject: ImageInterface;
  settings: EditorSettings;
  onChangeScale: (newScale: number) => void;
}

function scaleReducer(state: number, e: WheelEvent) {
  let direction = e.deltaY < 0 ? -1 : 1;
  let newScale = state + direction / 4;
  return newScale < 1 ? 1 : newScale;
}

function EditorCanvas({
  imageObject,
  settings,
  onChangeScale
}: EditorCanvasProps): JSX.Element {
  const [image, setImage] = useState<ImageInterface>(imageObject);
  const [imageCanvas, setImageCanvas] = useState<ImageCanvas>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(
    canvasRef ? getContext(canvasRef) : null
  );
  const [scale, scaleDispatch] = useReducer(
    scaleReducer,
    settings.startingScale
  );

  /**
   * Set up the canvas every time the context changes.
   */
  useEffect(() => {
    console.log("Setting up canvas...");

    const setupCanvas = () => {
      let canvas = getCanvas(canvasRef);
      if (!canvas) return;
      setContext(getContext(canvasRef));
      if (!context) return;

      const setupCanvasSize = (canvas: HTMLCanvasElement) => {
        const devicePixelRatio = window.devicePixelRatio || 1;
        // var rect = canvas.getBoundingClientRect();
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
      };

      setupCanvasSize(canvas);
      window.addEventListener("resize", () => {
        if (canvas) setupCanvasSize(canvas);
      });

      // Add the event listener for updating the scale with the scale dispatcher
      canvas.addEventListener("wheel", e => scaleDispatch(e));

      // Make pixel art look better at smaller scales
      context.imageSmoothingEnabled = false;
    };
    setupCanvas();
  }, [context]);

  /**
   * Draw the image whenever the image, imageCanvas, context, scale, or editor
   * settings change.
   */
  useEffect(() => {
    if (context && canvasRef.current && imageCanvas) {
      // Clear the context
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      // Draw the image at the correct position and scale
      context.drawImage(
        imageCanvas.getImageCanvasElement(),
        0,
        0,
        imageCanvas.dimensions.width * scale,
        imageCanvas.dimensions.height * scale
      );
      // Draw the grid (if we need to)
      if (settings.grid && scale >= imageCanvas.pixelGridRatio / 2) {
        context.drawImage(
          imageCanvas.getPixelGridCanvasElement(),
          0,
          0,
          imageCanvas.dimensions.width * scale,
          imageCanvas.dimensions.height * scale
        );
      }
    }
  }, [image, imageCanvas, context, scale, settings]);

  /**
   * When we change the scale, then we should update the scale display in the
   * app.
   */
  useEffect(() => {
    onChangeScale(scale);
  }, [scale, onChangeScale]);

  /**
   * When the App passes us a new image, then we need to reset the image and
   * make a new imageCanvas.
   */
  useEffect(() => {
    setImage(imageObject);
    setImageCanvas(new ImageCanvas(imageObject));
  }, [imageObject]);

  return <canvas ref={canvasRef} className="image-canvas" />;
}

class ImageCanvas {
  public dimensions: Dimensions;
  public pixelGridRatio = 16;

  private image: ImageInterface;
  private hiddenCanvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;
  private pixelGrid: PixelGrid;

  public constructor(image: ImageInterface) {
    console.log("Creating new internal ImageCanvas.");

    this.image = image;
    this.dimensions = image.dimensions;
    this.hiddenCanvas = createHiddenCanvas(image.dimensions);
    this.context = this.hiddenCanvas.getContext("2d");

    this.pixelGrid = new PixelGrid(this.image.dimensions, this.pixelGridRatio);

    this.drawImage();
  }

  public getImageCanvasElement(): HTMLCanvasElement {
    return this.hiddenCanvas;
  }

  public getPixelGridCanvasElement(): HTMLCanvasElement {
    return this.pixelGrid.getCanvasElement();
  }

  private drawPixel(pos: ImageCoordinates, color: Color): void {
    if (!this.context) return;
    let colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    this.context.fillStyle = colorString;
    this.context.fillRect(pos.x, pos.y, 1, 1);
  }

  private drawImage() {
    console.log("Drawing internal image.");
    for (let x = 0; x < this.image.dimensions.width; x++) {
      for (let y = 0; y < this.image.dimensions.height; y++) {
        this.drawPixel({ x, y }, this.image.getPixelColorAt({ x, y }));
      }
    }
  }
}

class PixelGrid {
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

  public getCanvasElement(): HTMLCanvasElement {
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

const getCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  if (canvasRef == null) return;
  return canvasRef.current;
};

const getContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvas = getCanvas(canvasRef);
  if (canvas == null) return null;
  let context = null;
  if (!(context = canvas.getContext("2d"))) {
    throw new Error(`2d context not supported or canvas already initialized`);
  }
  return context;
};

export default EditorCanvas;
