import React, { useState, useRef, useEffect } from "react";
import ImageObject from "./ImageObject";

interface MouseCoordinate {
  x: number;
  y: number;
}

interface ImageCoordinate {
  x: number;
  y: number;
}

interface ImageCanvasProps {
  imageObject: ImageObject;
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

function ImageCanvas({ imageObject }: ImageCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(
    canvasRef ? getContext(canvasRef) : null
  );
  const [mousePosition, setMousePosition] = useState<
    MouseCoordinate | undefined
  >(undefined);
  const [scale, setScale] = useState<number>(8);

  const setupCanvas = () => {
    let canvas = getCanvas(canvasRef);
    if (!canvas) return;
    setContext(getContext(canvasRef));
    if (!context) return;

    var devicePixelRatio = window.devicePixelRatio || 1;

    var rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    context.scale(devicePixelRatio, devicePixelRatio);

    console.log("Setting up canvas...");
  };

  useEffect(() => setupCanvas(), [context]);

  const drawPixel = (pos: ImageCoordinate, color: string) => {
    if (!context) return;
    context.fillStyle = color;
    context.fillRect(pos.x * scale, pos.y * scale, scale, scale);
  };

  const drawImage = (image: ImageObject) => {
    for (let x = 0; x < image.dimensions.width; x++) {
      for (let y = 0; y < image.dimensions.height; y++) {
        drawPixel({ x, y }, image.getPixelColorAt({ x, y }));
      }
    }
  };

  const drawGrid = () => {
    if (!context) return;
    const { width, height } = imageObject.dimensions;
    context.strokeStyle = "gray";
    context.beginPath();

    for (let x = 0; x <= width; x++) {
      context.moveTo(x * scale, 0);
      context.lineTo(x * scale, height * scale);
    }

    for (let y = 0; y <= height; y++) {
      context.moveTo(0, y * scale);
      context.lineTo(width * scale, y * scale);
    }

    context.stroke();
  };

  useEffect(() => {
    drawImage(imageObject);
    drawGrid();
  });

  return <canvas ref={canvasRef} className="image-canvas" />;
}

export default ImageCanvas;
