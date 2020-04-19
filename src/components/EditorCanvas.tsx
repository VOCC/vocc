import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Color from "../models/Color";
import Palette from "../models/Palette";
import Spritesheet4 from "../models/Spritesheet4";
import { Tool } from "../util/consts";
import {
  EditorSettings,
  ImageCoordinates,
  ImageInterface,
} from "../util/types";
import { spritesheetCoordsToSpriteCoords } from "../models/Spritesheet4";

// The pixel grid will not be visible when the scale is smaller than this value.
const PIXELGRID_ZOOM_LIMIT = 8;
const TILEGRID_ZOOM_LIMIT = 4;

interface EditorCanvasProps {
  image: ImageInterface;
  palette: Palette;
  selectedPaletteIndex: number;
  settings: EditorSettings;
  scale: number;
  onChangeImage: (newImage: ImageInterface) => void;
  onChangeColor: (newColor: Color) => void;
  onMouseWheel: (e: WheelEvent) => void;
}

export default function EditorCanvas({
  image,
  palette,
  selectedPaletteIndex,
  settings,
  scale,
  onChangeImage,
  onChangeColor,
  onMouseWheel,
}: EditorCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<number[]>([0, 0]);

  ///////////////////// Drawing Tool
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<ImageCoordinates | undefined>(
    undefined
  );
  const [startPos, setStartPos] = useState<ImageCoordinates>({
    x: 0,
    y: 0,
  });
  const [imagePosition, setImagePosition] = useState<ImageCoordinates>({
    x: 0,
    y: 0,
  });
  const [endingPos, setEndingPos] = useState<ImageCoordinates | undefined>(
    undefined
  );
  ///////////////////////////////////////////

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
      image.imageCanvasElement,
      imagePosition.x,
      imagePosition.y,
      image.dimensions.width * scale,
      image.dimensions.height * scale
    );
    // Draw the grid (if we need to)
    if (settings.grid && scale >= PIXELGRID_ZOOM_LIMIT) {
      context.drawImage(
        image.pixelGridCanvasElement,
        imagePosition.x,
        imagePosition.y,
        image.dimensions.width * scale,
        image.dimensions.height * scale
      );
    }
    // Always draw tile grid on spritesheets
    // TODO: Add option for this
    if (
      settings.grid &&
      image instanceof Spritesheet4 &&
      scale >= TILEGRID_ZOOM_LIMIT
    ) {
      context.drawImage(
        (image as Spritesheet4).tileGridCanvasElement,
        imagePosition.x,
        imagePosition.y,
        image.dimensions.width * scale,
        image.dimensions.height * scale
      );
    }
  }, [image, imagePosition, canvasRef, scale, settings.grid]);

  /**
   * Handle window resizing and set the new canvasSize state.
   */
  useLayoutEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize([
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight,
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
  useLayoutEffect(() => drawImageOnCanvas());

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
        y: (e.clientY - rect.top) * scaleY,
      };
    }
    return undefined;
  };

  const getImageCoord = useCallback(
    (mousePos: ImageCoordinates): ImageCoordinates | undefined => {
      const x = Math.floor((mousePos.x - imagePosition.x) / scale);
      const y = Math.floor((mousePos.y - imagePosition.y) / scale);
      if (
        x < 0 ||
        x > image.dimensions.width ||
        y < 0 ||
        y > image.dimensions.height
      )
        return undefined;
      return { x, y };
    },
    [scale, imagePosition, image.dimensions]
  );

  // const atNewPixel = useCallback((newPos: ImageCoordinates): boolean => {
  //   if (!mousePos) return false;
  //   const prevImgCoord = getImageCoord(mousePos);
  //   if (!prevImgCoord) return false;
  //   const prevPixel = {
  //     x: imagePosition.x + prevImgCoord.x * scale,
  //     y: imagePosition.y + prevImgCoord.y * scale
  //   }

  //   if (prevPixel.x === newPos.x && prevPixel.y === newPos.y) {
  //     return false;
  //   }
  //   return true;
  // }, [mousePos, getImageCoord, imagePosition, scale]);

  const fillPixel = useCallback(
    (pos: ImageCoordinates | undefined, color: Color): void => {
      if (!pos) return;
      if (!canvasRef.current) return;
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      image.setPixelColor(pos, color);
      drawImageOnCanvas();
    },
    [drawImageOnCanvas, image]
  );

  const bucketFill = useCallback(
    (
      pos: ImageCoordinates | undefined,
      newColor: Color,
      topLeft: ImageCoordinates,
      botRight: ImageCoordinates
    ): void => {
      // BFS fill
      if (!pos) return;
      const color = image.getPixelColorAt(pos);
      if (color.isEqual(newColor)) return;
      image.setPixelColor(pos, newColor);
      let queue = new Array<ImageCoordinates>(pos);
      let explored = new Array<ImageCoordinates>(pos);
      while (queue[0] !== undefined) {
        let curr = queue.shift() as ImageCoordinates;
        let edges = new Array<ImageCoordinates>(0);
        // add edges
        if (curr.y > topLeft.y) {
          edges.push({ x: curr.x, y: curr.y - 1 });
        }
        if (curr.y < botRight.y - 1) {
          edges.push({ x: curr.x, y: curr.y + 1 });
        }
        if (curr.x > topLeft.x) {
          edges.push({ x: curr.x - 1, y: curr.y });
        }
        if (curr.x < botRight.x - 1) {
          edges.push({ x: curr.x + 1, y: curr.y });
        }
        ///
        edges
          .filter((n) => !explored.includes(n))
          .forEach((n) => {
            explored.push(n);
            if (image.getPixelColorAt(n).isEqual(color)) {
              queue.push(n);
              image.setPixelColor(n, newColor);
            }
          });
      }

      drawImageOnCanvas();
    },
    [image, drawImageOnCanvas]
  );

  // const rectangle = useCallback((): void => {
  //   if (!endingPos) return;
  //   if (!canvasRef.current) return;
  //   const context = canvasRef.current.getContext('2d');
  //   if (!context) return;
  //   // drawImageOnCanvas();
  //   const color = palette[selectedPaletteIndex];
  //   const colorString = `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  //   context.fillStyle = colorString;
  //   context.lineWidth = 1;
  //   context.rect(
  //     startPos.x, startPos.y,
  //     endingPos.x - startPos.x, endingPos.y - startPos.y);
  //   context.fill();
  // }, [startPos, endingPos, palette, selectedPaletteIndex]);

  const startPaint = useCallback(
    (e: MouseEvent) => {
      const mousePosition = getMousePos(e);
      if (!mousePosition) return;
      setMousePos(mousePosition);
      const imageCoord = getImageCoord(mousePosition);
      if (!imageCoord) return;
      if (!canvasRef.current) return;
      const context = canvasRef.current.getContext("2d");
      if (!context) return;
      // if (!imageCoord) return;
      switch (settings.currentTool) {
        case Tool.PENCIL:
          setIsPainting(true);
          fillPixel(imageCoord, palette[selectedPaletteIndex]);
          break;
        case Tool.BUCKET:
          let topLeft = { x: 0, y: 0 };
          let dims = image.dimensions;
          let botRight = { x: dims.width, y: dims.height };
          if (image instanceof Spritesheet4) {
            const sprite = image.getSpriteFromCoordinates(imageCoord);
            if (!sprite) return;
            dims = sprite.dimensions;
            const spriteCoord = spritesheetCoordsToSpriteCoords(
              imageCoord,
              image.dimensions,
              sprite.position,
              sprite.dimensions
            );
            topLeft = {
              x: imageCoord.x - spriteCoord.x,
              y: imageCoord.y - spriteCoord.y,
            };
            botRight = {
              x: topLeft.x + dims.width,
              y: topLeft.y + dims.height,
            };
          }
          bucketFill(
            imageCoord,
            palette[selectedPaletteIndex],
            topLeft,
            botRight
          );
          break;
        case Tool.SQUARE:
          if (!imageCoord) return;
          const startingPos = imageCoord;
          setStartPos(startingPos);
          setIsPainting(true);
          break;
        case Tool.ELLIPSE:
          if (!imageCoord) return;
          setStartPos(imageCoord);
          setIsPainting(true);
          break;
        case Tool.PAN:
          setIsPainting(true);
          break;
        case Tool.DROPPER:
          if (!imageCoord) return;
          const color = image.getPixelColorAt(imageCoord);
          onChangeColor(color);
          break;
      }
    },
    [
      image,
      onChangeColor,
      settings.currentTool,
      bucketFill,
      fillPixel,
      getImageCoord,
      palette,
      selectedPaletteIndex,
    ]
  );

  const paint = useCallback(
    (e: MouseEvent) => {
      const newMousePos = getMousePos(e);
      if (!newMousePos) return;
      const imageCoord = getImageCoord(newMousePos);
      switch (settings.currentTool) {
        case Tool.PENCIL:
          if (isPainting) {
            fillPixel(imageCoord, palette[selectedPaletteIndex]);
            setMousePos(newMousePos);
          }
          break;
        case Tool.SQUARE:
          if (isPainting) {
            if (!imageCoord) return;
            const endingPos = imageCoord;
            setEndingPos(endingPos);
          }
          break;
        case Tool.ELLIPSE:
          if (isPainting) {
            if (!imageCoord) return;
            const endingPos = imageCoord;
            setEndingPos(endingPos);
          }
          break;
        case Tool.PAN:
          if (isPainting && mousePos) {
            const newImagePosition = {
              x: imagePosition.x + (newMousePos.x - mousePos.x),
              y: imagePosition.y + (newMousePos.y - mousePos.y),
            };
            setImagePosition(newImagePosition);
            setMousePos(newMousePos);
          }
          break;
      }
    },
    [
      isPainting,
      fillPixel,
      getImageCoord,
      palette,
      selectedPaletteIndex,
      imagePosition,
      mousePos,
      settings.currentTool,
    ]
  );

  const stopPaint = useCallback(() => {
    setMousePos(undefined);
    setIsPainting(false);
    if (settings.currentTool === Tool.SQUARE) {
      if (!endingPos) return;
      let s = startPos;
      let e = endingPos;
      if (e.x < s.x) {
        let temp = s.x;
        s = { x: e.x, y: s.y };
        e = { x: temp, y: e.y };
      }
      if (e.y < s.y) {
        let temp = s.y;
        s = { x: s.x, y: e.y };
        e = { x: e.x, y: temp };
      }
      for (let i = s.y; i <= e.y; i++) {
        for (let j = s.x; j <= e.x; j++) {
          let pos: ImageCoordinates = { x: j, y: i };
          image.setPixelColor(pos, palette[selectedPaletteIndex]);
        }
      }
      drawImageOnCanvas();
    }

    if (settings.currentTool === Tool.ELLIPSE) {
      console.log("drawing ellipse");
      if (!endingPos) return;
      let s = startPos;
      let e = endingPos;
      if (e.x < s.x) {
        let temp = s.x;
        s = { x: e.x, y: s.y };
        e = { x: temp, y: e.y };
      }
      if (e.y < s.y) {
        let temp = s.y;
        s = { x: s.x, y: e.y };
        e = { x: e.x, y: temp };
      }
      let center = {
        x: (s.x + e.x) / 2,
        y: (s.y + e.y) / 2,
      };
      // let center = startPos;
      let a = Math.abs(e.x - center.x);
      let b = Math.abs(e.y - center.y);
      // let s = { x: center.x - a, y: center.y - b };
      // let e = { x: center.x + a, y: center.y + b };
      for (let i = s.y; i <= e.y; i++) {
        for (let j = s.x; j <= e.x; j++) {
          let point = { x: j, y: i };
          console.log(point);
          // solve for equation of ellipse to check if inside or on ellipse
          let l = Math.pow(point.x - center.x, 2) / Math.pow(a, 2);
          let r = Math.pow(point.y - center.y, 2) / Math.pow(b, 2);
          console.log(l + r);
          let isInside: boolean = l + r <= 1;
          if (isInside) {
            image.setPixelColor(point, palette[selectedPaletteIndex]);
          }
        }
      }
      drawImageOnCanvas();
    }
    setEndingPos(undefined);
    onChangeImage(image);
  }, [
    settings.currentTool,
    startPos,
    endingPos,
    drawImageOnCanvas,
    image,
    palette,
    selectedPaletteIndex,
    onChangeImage,
  ]);

  const mouseLeave = useCallback(() => {
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
    canvas.addEventListener("mouseleave", mouseLeave);
    return () => {
      canvas.removeEventListener("mouseup", stopPaint);
      canvas.removeEventListener("mouseleave", mouseLeave);
    };
  }, [stopPaint, mouseLeave]);

  /////////////////////////////////////////////////////////////////////////////

  return (
    <canvas
      ref={canvasRef}
      className={generateEditorCanvasProps(settings.currentTool)}
    />
  );
}

const generateEditorCanvasProps = (tool: Tool): string => {
  const base = "image-canvas ";
  switch (tool) {
    case Tool.PENCIL:
      return base + "pencil";
    case Tool.BUCKET:
      return base + "bucket";
    case Tool.SQUARE:
      return base + "square";
    case Tool.ELLIPSE:
      return base + "ellipse";
    case Tool.PAN:
      return base + "pan";
    case Tool.DROPPER:
      return base + "dropper";
  }
  return base;
};
