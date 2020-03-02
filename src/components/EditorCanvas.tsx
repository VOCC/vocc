import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect
} from "react";
import { EditorSettings, ImageCoordinates, Color } from "../lib/interfaces";
import Bitmap from "./objects/Bitmap";
import Palette from "./objects/Palette";
import { Tool } from "../lib/consts";

// The pixel grid will not be visible when the scale is smaller than this value.
const PIXELGRID_ZOOM_LIMIT = 8;

interface EditorCanvasProps {
  image: Bitmap;
  palette: Palette;
  selectedPaletteIndex: number;
  settings: EditorSettings;
  scale: number;
  onMouseWheel: (e: WheelEvent) => void;
}

export default function EditorCanvas({
  image,
  palette,
  selectedPaletteIndex,
  settings,
  scale,
  onMouseWheel
}: EditorCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<number[]>([0, 0]);

  ///////////////////// Drawing Tool
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<ImageCoordinates | undefined>(
    undefined
  );
  /////////////////////

  const drawImageOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
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
    const context = canvas.getContext("2d");
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
    const context = canvas.getContext("2d");
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
  useLayoutEffect(() => drawImageOnCanvas(), [
    drawImageOnCanvas,
    palette,
    canvasSize
  ]);

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
  };

  const getImageCoord = useCallback(
    (mousePos: ImageCoordinates): ImageCoordinates => {
      const x = Math.floor(mousePos.x / scale);
      const y = Math.floor(mousePos.y / scale);
      return { x, y };
    },
    [scale]
  );

  const fillPixel = useCallback(
    (pos: ImageCoordinates, color: Color): void => {
      if (!canvasRef.current) return;
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      image.setPixelColor(pos, color);
      drawImageOnCanvas();
    },
    [drawImageOnCanvas, image]
  );

  const bucketFill = useCallback(
    (pos: ImageCoordinates, newColor: Color): void => {
    // BFS fill
    const color = image.getPixelColorAt(pos);
    image.setPixelColor(pos, newColor);
    // console.log(color);
    let queue = new Array<ImageCoordinates>(pos);
    let explored = new Array<ImageCoordinates>(pos);
    while (queue[0] !== undefined) {
      let curr = queue.shift() as ImageCoordinates;
      console.log(curr);
      let edges = new Array<ImageCoordinates>(0);
      // add edges
      if (curr.y > 0) { edges.push({x: curr.x, y: curr.y - 1}) }
      if (curr.y < image.dimensions.height - 1) { 
        edges.push({x: curr.x, y: curr.y + 1})
      }
      if (curr.x > 0) { edges.push({x: curr.x - 1, y: curr.y}) }
      if (curr.x < image.dimensions.width - 1) {
        edges.push({x: curr.x + 1, y: curr.y})
      }
      // console.log(edges);
      ///
      edges.filter(n => !explored.includes(n)).forEach(n => {
        explored.push(n);
        if (image.getPixelColorAt(n) === color) {
          queue.push(n);
          image.setPixelColor(n, newColor);
        }
      });
    }

    drawImageOnCanvas();
  }, [image, drawImageOnCanvas]);

  const startPaint = useCallback((e: MouseEvent) => {
    const mousePosition = getMousePos(e);
    if (mousePosition) {
      const tool = settings.currentTool;
      setMousePos(mousePosition);
      if (tool === Tool.PENCIL) {
        setIsPainting(true);
      } else if (tool === Tool.BUCKET) {
        bucketFill(getImageCoord(mousePosition), palette[selectedPaletteIndex])
      }
    }
  }, [settings.currentTool, bucketFill
    ,getImageCoord, palette, selectedPaletteIndex]);

  const paint = useCallback(
    (e: MouseEvent) => {
      const newMousePos = getMousePos(e);
      if (isPainting && newMousePos) {
        fillPixel(getImageCoord(newMousePos), palette[selectedPaletteIndex]);
        setMousePos(newMousePos);
      }
    },
    [isPainting, fillPixel, getImageCoord, palette, selectedPaletteIndex]
  );

  const stopPaint = useCallback(() => {
    setMousePos(undefined);
    setIsPainting(false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener("mousedown", startPaint);
    return () => canvas.removeEventListener("mousedown", startPaint);
  }, [startPaint]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener("mousemove", paint);
    return () => {
      canvas.removeEventListener("mousemove", paint);
    };
  }, [paint]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener("mouseup", stopPaint);
    canvas.addEventListener("mouseleave", stopPaint);
    return () => {
      canvas.removeEventListener("mouseup", stopPaint);
      canvas.removeEventListener("mouseleave", stopPaint);
    };
  }, [stopPaint]);

  /////////////////////////////////////////////////////////////////////////////

  return <canvas ref={canvasRef} className="image-canvas" />;
}
