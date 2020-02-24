import React, { useEffect, useRef, useState } from "react";
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
  // const [localImage, setImage] = useState<ImageInterface>(image);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(
    canvasRef ? getContext(canvasRef) : null
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
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
        context.imageSmoothingEnabled = false;
      };

      setupCanvasSize(canvas);
      window.addEventListener("resize", () => {
        if (canvas) setupCanvasSize(canvas);
      });

      // Add the event listener for updating the scale with the scale dispatcher
      canvas.addEventListener("wheel", onMouseWheel);
    };
    setupCanvas();
  }, [context, onMouseWheel]);

  /**
   * Draw the image whenever the image, imageCanvas, context, scale, or editor
   * settings change.
   */
  useEffect(() => {
    if (!image || !context || !canvasRef.current) return;
    // Clear the context
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
  }, [image, context, scale, settings]);

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
