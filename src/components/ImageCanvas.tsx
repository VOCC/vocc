import React, { useEffect, useReducer, useRef, useState, useCallback } from "react";
import {
  Color,
  Dimensions,
  ImageInterface,
  EditorSettings,
  ImageCoordinates
} from "../lib/interfaces";
import { COLORS } from "../lib/consts";
import { start } from "repl";

interface ImageCanvasProps {
  imageObject: ImageInterface;
  settings: EditorSettings;
  onChangeScale: (newScale: number) => void;
}

function scaleReducer(state: number, e: WheelEvent) {
  let direction = e.deltaY < 0 ? -1 : 1;
  let newScale = state + direction / 2;
  return newScale < 1 ? 1 : newScale;
}

type Coordinate = {
  x: number;
  y: number;
};

function ImageCanvas({
  imageObject,
  settings,
  onChangeScale
}: ImageCanvasProps): JSX.Element {
  const [image, setImage] = useState<ImageInterface>(imageObject);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(
    canvasRef ? getContext(canvasRef) : null
  );
  const [canvasSize, setCanvasSize] = useState<Dimensions>({
    height: 0,
    width: 0
  });
  const [scale, dispatch] = useReducer(scaleReducer, settings.startingScale);

  ///////////////////// Drawing Tool
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<Coordinate | undefined>(undefined);
  /////////////////////

  useEffect(() => {
    const setupCanvas = () => {
      let canvas = getCanvas(canvasRef);
      if (!canvas) return;
      setContext(getContext(canvasRef));
      if (!context) return;

      var devicePixelRatio = window.devicePixelRatio || 1;

      var rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      setCanvasSize({ height: canvas.height, width: canvas.width });

      canvas.addEventListener("wheel", e => dispatch(e));

      window.addEventListener("resize", () => {
        if (canvas) {
          let devicePixelRatio = window.devicePixelRatio || 1;
          let rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * devicePixelRatio;
          canvas.height = rect.height * devicePixelRatio;
          setCanvasSize({ height: canvas.height, width: canvas.width });
        }
      });

      context.scale(devicePixelRatio, devicePixelRatio);

      console.log("Setting up canvas...");
    };
    setupCanvas();
  }, [context]);

  useEffect(() => {
    const drawGrid = () => {
      if (!context) return;
      const { width, height } = image.dimensions;
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

    const drawPixel = (pos: ImageCoordinates, color: Color) => {
      if (!context) return;
      let colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      context.fillStyle = colorString;
      context.fillRect(pos.x * scale, pos.y * scale, scale, scale);
    };

    const drawImage = (image: ImageInterface) => {
      // console.log("drawing image of size", image.dimensions);
      for (let x = 0; x < image.dimensions.width; x++) {
        for (let y = 0; y < image.dimensions.height; y++) {
          // console.log("trying to get color at", x, y);
          drawPixel({ x, y }, image.getPixelColorAt({ x, y }));
        }
      }
    };

    if (context && canvasRef.current) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      drawImage(image);
      if (settings.grid) {
        drawGrid();
      }
    }
  }, [image, context, scale, canvasSize, settings]);

  /////////////////////////////////////////////////////////////////////////////
  // Drawing Tool
  const getMousePos = (e: MouseEvent): Coordinate | undefined => {
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
    startingPos: Coordinate, endingPos: Coordinate, color: Color
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

  useEffect(() => {
    onChangeScale(scale);
  }, [scale, onChangeScale]);

  useEffect(() => {
    setImage(imageObject);
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

export default ImageCanvas;
