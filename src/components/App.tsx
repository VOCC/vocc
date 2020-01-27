import React, { useState } from "react";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import ImageCanvas from "./ImageCanvas";
import ImageObject, * as Loader from "./ImageObject";
import "../styles/app.scss";
import * as Exporter from "../lib/ImageExporter";
import { saveAs } from "file-saver";

///////////// Type Definitions:
type ImageFile = File | null;

function App(): JSX.Element {
  const [image, setImage] = useState<ImageObject>(new ImageObject("img"));

  const handleImageLoad = async (imageFile: ImageFile) => {
    if (imageFile) {
      let image = await Loader.loadNewImage(imageFile);
      setImage(image);
    }
  };

  const handleImageExport = (): void => {
    const alertMsg = () => alert("Please import an image first!");
    if (!image) {
      alertMsg();
    } else {
      let fileName = image.getFileName();
      let fileType = ".c";
      let fullFileName =
        fileName.slice(0, fileName.lastIndexOf(".")) + fileType;
      let blob = new Blob([Exporter.getGBAImageString(image)], {
        type: "text/plain"
      });
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
        <ImportButton onImageChange={handleImageLoad} />
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