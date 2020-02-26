import React, { useRef, useEffect, useCallback } from "react";
import Palette from "./objects/Palette";

interface IPaletteDisplay {
  palette: Palette;
  selectedColorIndex: number;
  onChangeSelectedColorIndex: (newIndex: number) => void;
}

interface MousePos {
  x: number;
  y: number;
}

// This size is defined the same in app.scss
const PALETTE_CANVAS_SIZE = {
  height: 192,
  width: 192
};

const SCALE = PALETTE_CANVAS_SIZE.height / 16;

const INDEX_TO_X = (index: number) => index % 16;
const INDEX_TO_Y = (index: number) => Math.floor(index / 16);
const XY_TO_INDEX = ({ x, y }: { x: number; y: number }) => y * 16 + x;
const MOUSE_POS_TO_XY = ({ x, y }: { x: number; y: number }) => ({
  x: Math.floor(x / SCALE),
  y: Math.floor(y / SCALE)
});
const MOUSE_POS_TO_INDEX = (pos: { x: number; y: number }) =>
  XY_TO_INDEX(MOUSE_POS_TO_XY(pos));

function PaletteDisplay({
  palette,
  selectedColorIndex,
  onChangeSelectedColorIndex
}: IPaletteDisplay): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * method to draw the palette grid
   */
  const drawGrid = useCallback(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    context.drawImage(
      palette.getPixelGridCanvas(),
      0,
      0,
      PALETTE_CANVAS_SIZE.width * window.devicePixelRatio,
      PALETTE_CANVAS_SIZE.height * window.devicePixelRatio
    );
  }, [palette]);

  /**
   * method to populate the palette with colors
   * fills palette index with proper color using palette colorArray
   */
  const drawPalette = useCallback(() => {
    const context = canvasRef?.current?.getContext("2d");
    if (!context) return;
    context.drawImage(
      palette.getPaletteCanvas(),
      0,
      0,
      PALETTE_CANVAS_SIZE.width * window.devicePixelRatio,
      PALETTE_CANVAS_SIZE.height * window.devicePixelRatio
    );
  }, [palette]);

  const drawSelectedColorHighlight = useCallback(
    (index: number) => {
      let context = canvasRef?.current?.getContext("2d");
      if (!context) return;
      context.beginPath();
      context.strokeStyle = "rgba(255, 255, 0, 1)";
      context.lineWidth = 2;
      const ratio = window.devicePixelRatio * SCALE;
      context.rect(
        INDEX_TO_X(index) * ratio,
        INDEX_TO_Y(index) * ratio,
        15,
        15
      );
      context.stroke();
    },
    [canvasRef]
  );

  /**
   * gets mouse position on the palette canvas
   * @param e MouseEvent
   */
  const getMousePos = (e: React.MouseEvent): MousePos => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return {
      x: -1,
      y: -1
    };
  };

  /**
   * handles mouse click event
   * selects the proper row on the palette
   * @param e MouseEvent
   */
  const handleClick = (e: React.MouseEvent): void => {
    onChangeSelectedColorIndex(MOUSE_POS_TO_INDEX(getMousePos(e)));
  };

  /**
   * Set up the canvas
   */
  useEffect(() => {
    console.log("Setting up palette canvas");
    const setupCanvasSize = (canvas: HTMLCanvasElement) => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      const context = canvas.getContext("2d");
      if (context) context.imageSmoothingEnabled = false;
    };
    if (canvasRef.current) {
      setupCanvasSize(canvasRef.current);
    }
  }, []);

  /**
   * Draw the palette every time something changes
   */
  useEffect(() => {
    drawPalette();
    drawGrid();
    drawSelectedColorHighlight(selectedColorIndex);
  }, [selectedColorIndex, drawPalette, drawGrid, drawSelectedColorHighlight]);

  return (
    <canvas ref={canvasRef} onClick={handleClick} className="palette-canvas" />
  );
}

export default PaletteDisplay;
