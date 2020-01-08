import React, { useEffect } from "react";

///////////// Type Definitions:
interface IProps {
  imageFile: File;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
}

function ImageCanvas({ imageFile, canvasRef, imageRef }: IProps): JSX.Element {
  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    image.onload = () => {
      canvas.setAttribute("width", image.width.toString() + "px");
      canvas.setAttribute("height", image.height.toString() + "px");
      canvas.width = 1000;
      canvas.height = 1000;
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [canvasRef, imageRef]);

  return (
    <div>
      <canvas ref={canvasRef} className="image-canvas" />
      <img
        ref={imageRef}
        src={window.URL.createObjectURL(imageFile)}
        alt="hidden"
        className="hidden"
      />
    </div>
  );
}

export default ImageCanvas;