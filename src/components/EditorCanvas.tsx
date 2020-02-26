import React, { useCallback, useRef, useState, useLayoutEffect } from "react";
import { ImageInterface, EditorSettings } from "../lib/interfaces";

// The pixel grid will not be visible when the scale is smaller than this value.
const PIXELGRID_ZOOM_LIMIT = 8;

interface EditorCanvasProps {
  image: ImageInterface | undefined;
  settings: EditorSettings;
  scale: number;
  onMouseWheel: (e: WheelEvent) => void;
}

export default function EditorCanvas({
  image,
  settings,
  scale,
  onMouseWheel
}: EditorCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState([0, 0]); // width, height

  const drawImageOnCanvas = useCallback(() => {
    let canvas = getCanvas(canvasRef);
    if (!canvas) return;
    let context = getContext(canvasRef);
    if (!context) return;
    if (!image) return;

    // Clear the context
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the image at the correct position and scale
    context.drawImage(
      image.getImageCanvasElement(),
      0,
      0,
      image.dimensions.width * scale,
      image.dimensions.height * scale
    );
    // Draw the grid (if we need to)
    if (settings.grid && scale >= PIXELGRID_ZOOM_LIMIT) {
      context.drawImage(
        image.getPixelGridCanvasElement(),
        0,
        0,
        image.dimensions.width * scale,
        image.dimensions.height * scale
      );
    }
  }, [image, canvasRef, scale, settings.grid]);

  /**
   * Handle window resizing and set the new canvasSize state.
   */
  useLayoutEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize([
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        ]);
      }
    };
    window.addEventListener("resize", () => updateCanvasSize());
  }, []);

  /**
   * Set up the canvas.
   */
  useLayoutEffect(() => {
    console.log("Setting up canvas...");
    let canvas = getCanvas(canvasRef);
    if (!canvas) return;
    let context = getContext(canvasRef);
    if (!context) return;
    setCanvasSize([canvas.clientWidth, canvas.clientHeight]);
    context.imageSmoothingEnabled = false;
  }, [canvasRef]);

  /**
   * Change the dimensions of the canvas when the canvasSize changes.
   */
  useLayoutEffect(() => {
    let canvas = getCanvas(canvasRef);
    if (!canvas) return;
    let context = getContext(canvasRef);
    if (!context) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvasSize[0] * devicePixelRatio;
    canvas.height = canvasSize[1] * devicePixelRatio;
    context.imageSmoothingEnabled = false;
  }, [canvasSize, canvasRef]);

  /**
   * Handle mousewheel zooming
   */
  useLayoutEffect(() => {
    canvasRef.current?.addEventListener("wheel", onMouseWheel);
  }, [onMouseWheel]);

  /**
   * Draw the image whenever the image, imageCanvas, context, scale, or editor
   * settings change.
   */
  useLayoutEffect(() => drawImageOnCanvas(), [drawImageOnCanvas, canvasSize]);

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
