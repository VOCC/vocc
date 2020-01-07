import React, { useState, useRef } from "react";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import ImageCanvas from "./ImageCanvas";
import "../styles/app.scss";
import { image2hex } from "../lib/converter";
import { saveAs } from "file-saver";

///////////// Type Definitions:
type ImageFile = File | null;

function App(): JSX.Element {
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageChange = async (imageFile: ImageFile) => {
    setImageFile(imageFile);
  }

  const handleImageExport = (): void => {
    const alertMsg = () => alert("Please import an image first!");
    if (!imageFile) {
      alertMsg();
    } else {
      let canvas = canvasRef.current;
      let image = imageRef.current;

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
      let hexData = image2hex(imageData.data, imageFile.name);
      let fileName = imageFile.name;
      let fileType = ".c";
      let fullFileName =
        fileName.slice(0, fileName.lastIndexOf(".")) + fileType;
      let blob = new Blob([hexData], { type: "text/plain" });
      console.log(imageData.data);
      console.log(hexData);
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
        <ImportButton
          onImageChange={handleImageChange}
        />
        <ExportButton startImageExport={handleImageExport} />
      </div>
      <div className="workspace-container">
        <div className="left-panel">
          <div className="panel-label">Tools</div>
        </div>
        <div className="image-container">
          {imageFile ? (
            <ImageCanvas
              imageFile={imageFile}
              canvasRef={canvasRef}
              imageRef={imageRef}
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