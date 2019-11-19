import React from "react";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import ImageCanvas from "./ImageCanvas";
import "../styles/app.scss";
import { image2hex } from "../lib/converter";
import { saveAs } from "file-saver";

class App extends React.Component {
  // imageFile: File | null
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  state: {
    imageFile: File | null;
  };

  constructor(props: {}) {
    super(props);
    this.canvasRef = React.createRef();
    this.imageRef = React.createRef();
    this.state = {
      imageFile: null
    };
  }

  handleImageChange = async (imageFile: any) => {
    this.setState({
      imageFile: imageFile
    });
    // console.log(this.state.imageFile);
  };

  handleImageExport = () => {
    const alertMsg = () => alert("Please import an image first!");
    if (!this.state.imageFile) {
      alertMsg();
    } else {
      let canvas = this.canvasRef.current;
      let image = this.imageRef.current;

      if (!canvas || !image) {
        alertMsg();
        return;
      }

      let context = canvas.getContext("2d");

      if (!context) {
        alertMsg();
        return;
      }

      let imageData = context.getImageData(0, 0, image.width, image.height);
      let hexData = image2hex(imageData.data, this.state.imageFile.name);
      let fileName = this.state.imageFile.name;
      let fileType = ".c";
      let fullFileName =
        fileName.slice(0, fileName.lastIndexOf(".")) + fileType;
      let blob = new Blob([hexData], { type: "text/plain" });
      console.log(imageData.data);
      console.log(hexData);
      saveAs(blob, fullFileName);
    }
  };

  render() {
    return (
      <div className="app-container">
        <div className="navbar">
          <span className="title">VOCC</span>
          <span className="subtitle">
            Game Boy Advance Image Editor and Converter
          </span>
          <ImportButton
            onImageChange={(imageFile: File) =>
              this.handleImageChange(imageFile)
            }
          />
          <ExportButton startImageExport={() => this.handleImageExport()} />
        </div>
        <div className="workspace-container">
          <div className="left-panel">
            <div className="panel-label">Tools</div>
          </div>
          <div className="image-container">
            {this.state.imageFile ? (
              <ImageCanvas
                imageFile={this.state.imageFile}
                canvasRef={this.canvasRef}
                imageRef={this.imageRef}
              />
            ) : null}
          </div>
          <div className="right-panel">
            <div className="panel-label">Color Palette</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
