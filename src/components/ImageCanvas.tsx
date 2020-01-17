import React, { useState, useRef } from "react";
import ImageObject from "./ImageObject";

type Coordinate = {
  x: number;
  y: number;
};

interface ImageCanvasProps {
  imageObject: ImageObject;
}

function ImageCanvas({ imageObject }: ImageCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useState<Coordinate | undefined>(undefined);

  return <canvas ref={canvasRef} className="image-canvas" />;
}

export default ImageCanvas;
