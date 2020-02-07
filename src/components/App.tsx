import React, { useState } from "react";
import ImportButton from "./buttons/ImportButton";
import ExportButton from "./buttons/ExportButton";
import ImageCanvas from "./ImageCanvas";
import ImageObject, * as Loader from "./ImageObject";
import ToolsPanel from "./ToolsPanel";
import * as Exporter from "../lib/ImageExporter";
import { saveAs } from "file-saver";
import { EditorSettings } from "../lib/interfaces";
import "../styles/app.scss";
import "../styles/toolbar.scss";

///////////// Type Definitions:
type ImageFile = File | null;

function App(): JSX.Element {
  const [image, setImage] = useState<ImageObject>(new ImageObject("img", true));
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    grid: true,
    startingScale: 8
  });
  const [scale, setScale] = useState<number>(editorSettings.startingScale);

  const handleImageLoad = async (imageFile: ImageFile) => {
    if (imageFile) {
      let image = await Loader.loadNewImage(imageFile);
      setImage(image);
    }
  };

  const handleImageExport = (type: string): void => {                             //will eventually add param in here to handle jpg/png/gba
    const alertMsg = () => alert("Please import an image first!");
    if (image.isBlankImage()) {
      alertMsg();
    } else {
      let gba = false;
      let fileType = "";
      switch(type) {
        case "GBA": 
          fileType = ".c";
          gba = true;
          break;
        case "JPG": 
          fileType = ".jpeg";
          break;
        case "PNG": 
          fileType = ".png";
          break;
        default:
          fileType = ".txt";
      }
      let fileName = image.getFileName();
      let fullFileName =
        fileName.slice(0, fileName.lastIndexOf(".")) + fileType;
      
      if (gba) {
        let blob = new Blob([Exporter.exportGBAFile(image)]);
        saveAs(blob, fullFileName);
      }
      else {
        let data = Exporter.exportImage(image, type);
        saveAs(data, fullFileName);
      }
    }
  };

  const handleSettingsChange = (newSettings: EditorSettings): void => {
    setEditorSettings(newSettings);
  };

  return (
    <div className="app-container">
      <div className="navbar">
        <span className="title">VOCC</span>
        <span className="subtitle">
          Game Boy Advance Image Editor and Converter
        </span>
        <ImportButton onImageChange={handleImageLoad} />
        GBA -> 
        <ExportButton startImageExport={handleImageExport.bind(null, "GBA")} />
        PNG ->
        <ExportButton startImageExport={handleImageExport.bind(null, "PNG")} />
        JPG ->
        <ExportButton startImageExport={handleImageExport.bind(null, "JPG")} />
      </div>
      <div className="workspace-container">
        <div className="left-panel">
          <div className="panel-label">Tools</div>
          <div className="tools-container">
            <div> Scale: {scale.toFixed(2)}x </div>
            <ToolsPanel
              settings={editorSettings}
              onSettingsChange={ns => handleSettingsChange(ns)}
            ></ToolsPanel>
          </div>
        </div>
        <div className="image-container">
          <ImageCanvas
            imageObject={image}
            settings={editorSettings}
            onChangeScale={(newScale: number) => setScale(newScale)}
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
