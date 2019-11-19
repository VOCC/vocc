import React from "react";

interface ImageCanvasProps {
  imageFile: File;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
}

class ImageCanvas extends React.Component<ImageCanvasProps> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  imageFile: File;

  constructor(props: ImageCanvasProps) {
    super(props);
    this.canvasRef = this.props.canvasRef;
    this.imageRef = this.props.imageRef;
    this.imageFile = props.imageFile;
  }

  componentDidMount() {
    const image = this.imageRef.current;
    const canvas = this.canvasRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    image.onload = () => {
      canvas.setAttribute("width", image.width.toString() + "px");
      canvas.setAttribute("height", image.height.toString() + "px");
      canvas.width = 1000;
      canvas.height = 1000;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }

  render = () => (
    <div>
      <canvas ref={this.canvasRef} className="image-canvas" />
      <img
        ref={this.imageRef}
        src={window.URL.createObjectURL(this.imageFile)}
        className="hidden"
      />
    </div>
  );
}

export default ImageCanvas;
