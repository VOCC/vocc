import React, { useRef, useEffect } from "react";
import Palette from "./objects/Palette";

interface IProps {
  palette: Palette;
}

function PaletteDisplay({ palette }: IProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const scale = 8;
    let context: CanvasRenderingContext2D | null = null;
    if (canvasRef.current) {
      context = canvasRef.current.getContext("2d");
    }

    const drawGrid = () => {
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

    const fillPalette = () => {
      const colorArray = palette.getColorArray();
      console.log("filling palette ...");
      console.log(colorArray);
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

    if (context && canvasRef.current) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      fillPalette();
      drawGrid();
    }
  }, [palette]);

  return <canvas ref={canvasRef} className="palette-canvas" />;
}

export default PaletteDisplay;
