import React, { useReducer, useState, useRef, useEffect } from "react";
import ImageObject from "./ImageObject";
import {
  Color,
  ImageCoordinates,
  Dimensions,
  EditorSettings
} from "../lib/interfaces";

interface ImageCanvasProps {
  imageObject: ImageObject;
  settings: EditorSettings;
  onChangeScale: (newScale: number) => void;
}

function scaleReducer(state: number, e: WheelEvent) {
  let direction = e.deltaY < 0 ? -1 : 1;
  let newScale = state + direction / 2;
  return newScale < 1 ? 1 : newScale;
}

function ImageCanvas({
  imageObject,
  settings,
  onChangeScale
}: ImageCanvasProps): JSX.Element {
  const [image, setImage] = useState<ImageObject>(imageObject);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(
    canvasRef ? getContext(canvasRef) : null
  );
  const [canvasSize, setCanvasSize] = useState<Dimensions>({
    height: 0,
    width: 0
  });
  const [scale, dispatch] = useReducer(scaleReducer, settings.startingScale);

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
      const { width, height } = image.getDimensions();
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

    const drawImage = (image: ImageObject) => {
      console.log("drawing the image...");
      for (let x = 0; x < image.getDimensions().width; x++) {
        for (let y = 0; y < image.getDimensions().height; y++) {
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
      drawGrid();
    }
  }, [image, context, scale, canvasSize, settings]);

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
