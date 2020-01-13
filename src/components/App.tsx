import React, { useState } from "react";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import ImageCanvas from "./ImageCanvas";
import ImageObject from "./Image";
import "../styles/app.scss";
import { image2hex } from "../lib/converter";
import { saveAs } from "file-saver";

///////////// Type Definitions:
type ImageFile = File | null;

function App(): JSX.Element {
  const [imageObject, setImageObject] = useState<ImageObject>(
    new ImageObject()
  );
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const [exportCode, setExportCode] = useState<string>("Nothing to display");

  const handleImageChange = async (imageFile: ImageFile) => {
    setImageFile(imageFile);
    let imageObj = new ImageObject();
    if (imageFile) {
      imageObj.loadImage(imageFile);
    }
    setImageObject(imageObj);
  };

  const handleImageLoad = (
    context: CanvasRenderingContext2D,
    image: HTMLImageElement
  ): void => {
    const alertMsg = () => alert("Please import an image first!");
    if (!imageFile) {
      alertMsg();
    } else {
      let imageData = context.getImageData(0, 0, image.width, image.height);
      setExportCode(image2hex(imageData.data, imageFile.name));
    }
  };

  const handleImageExport = (): void => {
    const alertMsg = () => alert("Please import an image first!");
    if (!imageFile) {
      alertMsg();
    } else {
      let fileName = imageFile.name;
      let fileType = ".c";
      let fullFileName =
        fileName.slice(0, fileName.lastIndexOf(".")) + fileType;
      let blob = new Blob([exportCode], { type: "text/plain" });
      saveAs(blob, fullFileName);
    }
  }

  return (
    <div className="app-container">
      <div className="navbar">
        <span className="title">VOCC</span>
        <span className="subtitle">
          Game Boy Advance Image Editor and Converter
        </span>
        <ImportButton onImageChange={handleImageChange} />
        <ExportButton startImageExport={handleImageExport} />
      </div>
      <div className="workspace-container">
        <div className="left-panel">
          <div className="panel-label">Tools</div>
        </div>
        <div className="image-container">
          <ImageCanvas
            imageFile={imageFile}
            // canvasRef={canvasRef}
            // imageRef={imageRef}
            onImageLoad={handleImageLoad}
          />
        </div>
        <div className="right-panel">
          <div className="panel-label">Color Palette</div>
        </div>
      </div>
      </div>
  );
}

export default App;