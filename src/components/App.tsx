import React, { useState } from "react";
import { ModifiableImage, EditorSettings } from "../lib/interfaces";
import {
  exportCFile,
  exportHFile,
  exportImage,
  exportPalette
} from "../lib/exportUtils";
import { saveAs } from "file-saver";
import { Tools } from "../lib/consts";
import ExportButton from "./buttons/ExportButton";
import ImageCanvas from "./ImageCanvas";
import ImageObject, * as Loader from "./objects/ImageObject";
import ImportButton from "./buttons/ImportButton";
import ToolsPanel from "./ToolsPanel";
import "../styles/app.scss";
import "../styles/toolbar.scss";
import Palette from "./objects/Palette";
import PaletteDisplay from "./PaletteDisplay";
import { quantize } from "../lib/quantize";

///////////// Type Definitions:
type ImageFile = File | null;

function App(): JSX.Element {
  const [palette, setPalette] = useState<Palette>(new Palette());
  const [image, setImage] = useState<ModifiableImage>(new ImageObject("img"));
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    grid: true,
    startingScale: 8,
    currentTool: Tools.PENCIL
  });
  const [scale, setScale] = useState<number>(editorSettings.startingScale);

  const handleImageLoad = async (imageFile: ImageFile) => {
    if (imageFile) {
      console.log("Loading image...");
      let image = await Loader.loadNewImage(imageFile);
      let { palette, sprite } = quantize(image, 16);
      setImage(sprite);
      setPalette(palette);
    }
  };

  const handleImageExport = async (type: string) => {
    let fileName = image.fileName.slice(0, image.fileName.lastIndexOf("."));
    let fileType = "";
    let blob: Blob | null;

    const exportFailAlert = () =>
      alert("Failed to export image! Check console for more information.");

    switch (type) {
      case "GBA":
        //.c file
        fileType = ".c";
        let cBlob = new Blob([exportCFile(image, palette)]);
        saveAs(cBlob, fileName + fileType);
        //.h file
        fileType = ".h";
        let hBlob = new Blob([exportHFile(image, palette)]);
        saveAs(hBlob, fileName + fileType);
        return;
      case "PAL":
        //.pal file
        fileType = ".pal";
        blob = new Blob([exportPalette(palette)]);
        break;
      case "JPG":
        //.jpeg file
        fileType = ".jpg";
        blob = await exportImage(image, type);
        break;
      case "PNG":
        //.png file
        fileType = ".png";
        blob = await exportImage(image, type);
        break;
      default:
        //default as .txt if unrecognized type is selected
        fileType = ".txt";
        blob = await exportImage(image, type);
    }
    if (!blob) {
      exportFailAlert();
    } else {
      saveAs(blob, fileName + fileType);
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
        Pal ->
        <ExportButton startImageExport={handleImageExport.bind(null, "PAL")} />
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
          <PaletteDisplay palette={palette} />
        </div>
      </div>
    </div>
  );
}

export default App;
