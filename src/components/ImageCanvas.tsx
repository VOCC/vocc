import React from "react";

interface ImageCanvasProps {
  imageFile: File;
}

class ImageCanvas extends React.Component<ImageCanvasProps> {
  canvas: React.RefObject<HTMLCanvasElement>;
  image: React.RefObject<HTMLImageElement>;
  state: {
    imageFile: File;
  };

  constructor(props: ImageCanvasProps) {
    super(props);
    this.canvas = React.createRef();
    this.image = React.createRef();
    this.state = {
      imageFile: props.imageFile
    };
  }

  componentDidMount() {
    const image = this.image.current;
    const canvas = this.canvas.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    image.onload = () => {
      canvas.setAttribute("width", image.width.toString() + "px");
      canvas.setAttribute("height", image.height.toString() + "px");

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    console.log("hello");
  }

  render = () => (
    <div>
      <canvas ref={this.canvas} className="image-canvas" />
      <img
        ref={this.image}
        src={window.URL.createObjectURL(this.state.imageFile)}
        className="hidden"
      />
    </div>
  );
}

export default ImageCanvas;
