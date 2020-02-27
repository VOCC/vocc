import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import {
  EditorSettings,
  ImageCoordinates,
  Color } from "../lib/interfaces";
import { COLORS } from "../lib/consts";
import Bitmap from "./objects/Bitmap";

// The pixel grid will not be visible when the scale is smaller than this value.
const PIXELGRID_ZOOM_LIMIT = 8;

interface EditorCanvasProps {
  image: Bitmap;
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
  const [canvasSize, setCanvasSize] = useState([0, 0]);

  ///////////////////// Drawing Tool
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<
    ImageCoordinates | undefined>(undefined);
  /////////////////////

  const drawImageOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    setCanvasSize([canvas.clientWidth, canvas.clientHeight]);
    context.imageSmoothingEnabled = false;
  }, [canvasRef]);

  /**
   * Change the dimensions of the canvas when the canvasSize changes.
   */
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
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
    if (canvasRef.current) {
      canvasRef.current.addEventListener("wheel", onMouseWheel);
    }
  }, [onMouseWheel]);

  /**
   * Draw the image whenever the image, imageCanvas, context, scale, or editor
   * settings change.
   */
  useLayoutEffect(() => drawImageOnCanvas(), [drawImageOnCanvas, canvasSize]);

  /////////////////////////////////////////////////////////////////////////////
  // Drawing Tool
  const getMousePos = (e: MouseEvent): ImageCoordinates | undefined => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
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