import React, { useEffect } from "react";

///////////// Type Definitions:
interface IProps {
  imageFile: File | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  onImageLoad: () => void;
}

function ImageCanvas({ imageFile, canvasRef, imageRef, onImageLoad }: IProps): JSX.Element {
  useEffect(() => {
    const image = imageRef.current as HTMLImageElement;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

      image.onload = () => {
        console.log("Loading Image to canvas ...");
        
        canvas.setAttribute("width", image.width.toString() + "px");
        canvas.setAttribute("height", image.height.toString() + "px");
        canvas.width = 1000;
        canvas.height = 1000;
        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        onImageLoad();
    };
  }, [imageFile]);

  return (
    <div>
      <canvas ref={canvasRef} className="image-canvas" id="image-canvas"/>
      <img
        ref={imageRef}
        src={imageFile ? 
              window.URL.createObjectURL(imageFile) :
              ""
            }
        alt="hidden"
        className="hidden"
      />
    </div>
  );
}

export default ImageCanvas;