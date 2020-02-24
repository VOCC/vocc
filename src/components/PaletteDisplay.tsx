import React, { useRef, useEffect, useState, useCallback } from "react";
import Palette from "./objects/Palette";
import { PALETTE_SIZE } from "../lib/consts";

interface IProps {
  palette: Palette;
}

interface MousePos {
  x: number;
  y: number;
}

function PaletteDisplay({ palette }: IProps): JSX.Element {
  const [selected, setSelected] = useState<number>(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 8;

  /**
   * method to draw the palette grid
   */
  const drawGrid = useCallback(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    context.drawImage(palette.getPixelGridCanvas(), 0, 0);
  }, [palette]);

  /**
   * method to populate the palette with colors
   * fills palette index with proper color using palette colorArray
   */
  const fillPalette = useCallback(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    context.drawImage(
      palette.getPaletteCanvas(),
      0,
      0,
      PALETTE_SIZE.width * 8,
      PALETTE_SIZE.height * 8
    );
  }, [palette]);

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
    let mousePos = getMousePos(e);
    if (mousePos.y >= 0 && mousePos.y <= scale * palette.dimensions.width) {
      const row = Math.floor(mousePos.y / scale);
      setSelected(row);
    }
  };

  /**
   * refills palette when a new image is imported
   */
  useEffect(() => {
    console.log("new image, new palette ...");
    let context: CanvasRenderingContext2D | null = null;
    if (canvasRef.current) {
      context = canvasRef.current.getContext("2d");
    }

    if (context && canvasRef.current) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setSelected(-1);
    }
  }, [palette]);

  /**
   * fills palette on any change
   */

  useEffect(() => {
    /**
     * highlights the palette row with a transparent light blue color
     * @param row row of palette to select/highlight
     */
    const highlightRow = (row: number): void => {
      if (row < 0) return;
      if (!canvasRef.current) return;
      const context = canvasRef.current.getContext("2d");
      if (!context) return;
      let colorString = "rgba(125, 200, 255, 0.25)";
      context.fillStyle = colorString;
      context.fillRect(0, row * scale, scale * palette.dimensions.width, scale);
      context.globalAlpha = 1;
      context.fillStyle = "blue";
      context.strokeRect(
        0,
        row * scale,
        scale * palette.dimensions.width,
        scale
      );
    };

    console.log("filling palette ...");
    fillPalette();
    drawGrid();
    highlightRow(selected);
  }, [selected, fillPalette, drawGrid, palette.dimensions]);

  /**
   * initializes an empty palette
   */
  useEffect(() => {
    console.log("initializing palette ...");
    const setupCanvasSize = (canvas: HTMLCanvasElement) => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      const context = canvas.getContext("2d");
      if (context) context.imageSmoothingEnabled = false;
    };
    if (canvasRef.current) {
      setupCanvasSize(canvasRef.current);
      fillPalette();
      drawGrid();
    }
  }, [fillPalette, drawGrid]);

  return (
    <canvas ref={canvasRef} onClick={handleClick} className="palette-canvas" />
  );
}

export default PaletteDisplay;
