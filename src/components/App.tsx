import React, { useState } from "react";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import ImageCanvas from "./ImageCanvas";
import ImageObject from "./ImageObject";
import "../styles/app.scss";
import { ImageExporter } from "../lib/ImageExporter";
import { saveAs } from "file-saver";

///////////// Type Definitions:
type ImageFile = File | null;

function App(): JSX.Element {
  const [image, setImage] = useState<ImageObject>(new ImageObject());

  const handleImageChange = (imageFile: ImageFile) => {
    let imageObj = new ImageObject();
    if (imageFile) {
      imageObj.loadImage(imageFile);
    }
    setImage(imageObj);
  };

  const handleImageExport = (): void => {
    const alertMsg = () => alert("Please import an image first!");
    if (!image) {
      alertMsg();
    } else {
      let fileName = image.fileName;
      let fileType = ".c";
      let fullFileName =
        fileName.slice(0, fileName.lastIndexOf(".")) + fileType;
      let blob = new Blob([ImageExporter.getGBAImageString(image)], {
        type: "text/plain"
      });
      saveAs(blob, fullFileName);
    }
  };

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
          <ImageCanvas imageObject={image} />
        </div>
        <div className="right-panel">
          <div className="panel-label">Color Palette</div>
        </div>
      </div>
    </div>
  );
}

export default App;
