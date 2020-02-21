import React, { useRef, useEffect, useState } from "react";
import Palette from "./objects/Palette";

interface IProps {
  palette: Palette
}

interface MousePos {
  x: number,
  y: number
}

function PaletteDisplay({ palette }: IProps): JSX.Element {
  const [selected, setSelected] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 8;

  /**
   * method to draw the palette grid
   */
  const drawGrid = () => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    const { height, width } = palette.dimensions;
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

  /**
   * method to populate the palette with colors
   * fills palette index with proper color using palette colorArray
   */
  const fillPalette = () => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    const colorArray = palette.getColorArray();
    colorArray.forEach((color, index) => {
      if (!context) return;
      let colorString = `rgba(
        ${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      context.fillStyle = colorString;

      let x = index % palette.dimensions.width;
      let y = Math.floor(index / palette.dimensions.width);
      context.fillRect(x * scale, y * scale, scale, scale);
    });
  };

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
  }

  /**
   * highlights the palette row with a transparent light blue color
   * @param row row of palette to select/highlight
   */
  const highlightRow = (row: number): void => {
    if (row === -1) return;
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    let colorString = 'rgba(125, 200, 255, 0.25)';
    context.fillStyle = colorString;
    context.fillRect(0, row * scale, scale * palette.dimensions.width, scale);
    context.globalAlpha = 1;
    context.fillStyle = 'blue';
    context.strokeRect(0, row * scale, scale * palette.dimensions.width, scale);
  }

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
  }

  /**
   * fills palette on any change
  */ 
  useEffect(() => {
    fillPalette();
    drawGrid();
    highlightRow(selected);
  }, [selected]);

  /**
   * refills palette when a new image is imported
   */
  useEffect(() => {
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
   * initializes an empty palette
   */
  useEffect(() => {
    fillPalette();
    drawGrid();
  }, []);

  return <canvas
    ref={canvasRef}
    onClick={handleClick}
    className="palette-canvas"
  />;
}

export default PaletteDisplay;
