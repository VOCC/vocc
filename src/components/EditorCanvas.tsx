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

  useEffect(() => {
    // const drawGrid = () => {
    //   if (!context) return;
    //   const { width, height } = image.dimensions;
    //   context.strokeStyle = "gray";
    //   context.beginPath();

    //   for (let x = 0; x <= width; x++) {
    //     context.moveTo(x * scale, 0);
    //     context.lineTo(x * scale, height * scale);
    //   }

    //   for (let y = 0; y <= height; y++) {
    //     context.moveTo(0, y * scale);
    //     context.lineTo(width * scale, y * scale);
    //   }

    //   context.stroke();
    // };

    // const drawPixel = (pos: ImageCoordinates, color: Color) => {
    //   if (!context) return;
    //   let colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    //   context.fillStyle = colorString;
    //   context.fillRect(pos.x * scale, pos.y * scale, scale, scale);
    // };

    // const drawImage = (image: ImageInterface) => {
    //   // console.log("drawing image of size", image.dimensions);
    //   for (let x = 0; x < image.dimensions.width; x++) {
    //     for (let y = 0; y < image.dimensions.height; y++) {
    //       // console.log("trying to get color at", x, y);
    //       drawPixel({ x, y }, image.getPixelColorAt({ x, y }));
    //     }
    //   }
    // };

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
        imageCanvas.getCanvasElement(),
        0,
        0,
        imageCanvas.dimensions.width * scale,
        imageCanvas.dimensions.height * scale
      );
      // Draw the grid (if we need to)
      // if (settings.grid) {
      //   drawGrid();
      // }
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

  private image: ImageInterface;
  private hiddenCanvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;

  public constructor(image: ImageInterface) {
    console.log("Creating new internal ImageCanvas.");

    this.image = image;
    this.dimensions = image.dimensions;
    this.hiddenCanvas = createHiddenCanvas(image.dimensions);
    this.context = this.hiddenCanvas.getContext("2d");

    this.drawImage();
  }

  public getCanvasElement(): HTMLCanvasElement {
    return this.hiddenCanvas;
  }

  private drawGrid(): void {
    if (!this.context) return;
    const { width, height } = this.image.dimensions;
    this.context.strokeStyle = "gray";
    this.context.beginPath();

    for (let x = 0; x <= width; x++) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height);
    }

    for (let y = 0; y <= height; y++) {
      this.context.moveTo(0, y);
      this.context.lineTo(width, y);
    }

    this.context.stroke();
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
