import React, { useEffect, useReducer, useRef, useState } from "react";
import { ImageInterface, EditorSettings } from "../lib/interfaces";
import ImageCanvas from "./objects/ImageCanvas";

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
