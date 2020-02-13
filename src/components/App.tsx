import React, { useState } from "react";
import { ModifiableImage, EditorSettings } from "../lib/interfaces";
import { ImageExporter } from "../lib/ImageExporter";
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
  const [image, setImage] = useState<ModifiableImage>(new ImageObject("img", true));
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

  const handleImageExport = (type: string): void => {                             //will eventually add param in here to handle jpg/png/gba
    const alertMsg = () => alert("Please import an image first!");
    if (image.isBlankImage()) {
      alertMsg();
    } else {
      let fileName = image.fileName.slice(0, image.fileName.lastIndexOf("."));
      let fileType = "";
      let blob = new Blob();
      switch(type) {
        case "GBA":
          //.c file 
          fileType = ".c";
          blob = new Blob([ImageExporter.exportCFile(image, palette)]);
          saveAs(blob, fileName + fileType);
          //.h file
          fileType = ".h";
          blob = new Blob ([ImageExporter.exportHFile(image, palette)]);
          saveAs(blob, fileName + fileType);
          break;
        case "PAL": 
          //.pal file
          fileType = ".pal";
          blob = new Blob([ImageExporter.exportPalette(palette)]);
          saveAs(blob, fileName + fileType);
         break;
        case "JPG": 
          //.jpeg file
          fileType = ".jpeg";
          blob = ImageExporter.exportImage(image, type);
          saveAs(blob, fileName + fileType);
        break;
        case "PNG": 
          //.png file
          fileType = ".png";
          blob = ImageExporter.exportImage(image, type);
          saveAs(blob, fileName + fileType);
          break;
        default:
          //default as .txt if unrecognized type is selected
          fileType = ".txt";
          blob = ImageExporter.exportImage(image, type);
          saveAs(blob, fileName + fileType);
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
