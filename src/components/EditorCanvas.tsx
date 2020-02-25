import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  ImageInterface,
  EditorSettings,
  ImageCoordinates,
  Color } from "../lib/interfaces";
import { COLORS } from "../lib/consts";
import Bitmap from "./objects/Bitmap";

// The pixel grid will not be visible when the scale is smaller than this value.
const PIXELGRID_ZOOM_LIMIT = 8;

interface EditorCanvasProps {
  image: Bitmap | undefined;
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

  ///////////////////// Drawing Tool
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<ImageCoordinates | undefined>(undefined);
  /////////////////////

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

  /////////////////////////////////////////////////////////////////////////////
  // Drawing Tool
  const getMousePos = (e: MouseEvent): ImageCoordinates | undefined => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return undefined;
  }
  
  // todo: make drawing only fill pixel grids
  const drawLine = (
    startingPos: ImageCoordinates, endingPos: ImageCoordinates, color: Color
    ): void => {
      
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    context.strokeStyle = colorString;
    const lineWidth = 4;
    const lineJoin = 'round';
    context.lineWidth = lineWidth;
    context.lineJoin = lineJoin;

    context.beginPath();
    context.moveTo(startingPos.x, startingPos.y);
    context.lineTo(endingPos.x, endingPos.y);
    context.closePath();
    context.stroke();
  }

  const startPaint = useCallback((e: MouseEvent) => {
    const mousePosition = getMousePos(e);
    if (mousePosition) {
      setMousePos(mousePosition);
      setIsPainting(true);
    }
  }, []);

  const paint = useCallback((e: MouseEvent) => {
    if (isPainting) {
      const newMousePos = getMousePos(e);
      if (mousePos && newMousePos) {
        drawLine(mousePos, newMousePos, COLORS.red);
        setMousePos(newMousePos);
      }
    }
  }, [isPainting, mousePos]);

  const stopPaint = useCallback(() => {
    setMousePos(undefined);
    setIsPainting(false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', startPaint);
    return () => canvas.removeEventListener('mousedown', startPaint);
  }, [startPaint]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', paint);
    return () => canvas.removeEventListener('mousemove', paint);
  }, [paint]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener('mouseup', stopPaint);
    canvas.addEventListener('mouseleave', stopPaint)
    return () => {
      canvas.removeEventListener('mouseup', stopPaint);
      canvas.removeEventListener('mouseleave', stopPaint);
    }
  }, [stopPaint]);

  /////////////////////////////////////////////////////////////////////////////

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
