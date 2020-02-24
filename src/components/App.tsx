import React, { useCallback, useState, useReducer } from "react";
import { ImageInterface, EditorSettings } from "../lib/interfaces";
import { exportImage, exportPalette } from "../lib/exportUtils";
import { loadNewImage } from "../lib/imageLoadUtils";
import { saveAs } from "file-saver";
import { Tools } from "../lib/consts";
import ExportButton from "./buttons/ExportButton";
import EditorCanvas from "./EditorCanvas";
import ImageObject from "./objects/ImageObject";
import ImportButton from "./buttons/ImportButton";
import ToolsPanel from "./ToolsPanel";
import "../styles/app.scss";
import "../styles/toolbar.scss";
import Palette from "./objects/Palette";
import PaletteDisplay from "./PaletteDisplay";
import { quantize } from "../lib/quantize";

function scaleReducer(state: number, e: WheelEvent) {
  let direction = e.deltaY < 0 ? -1 : 1;
  let newScale = state + direction / 4;
  return newScale < 1 ? 1 : newScale;
}

function App(): JSX.Element {
  const [palette, setPalette] = useState<Palette>(new Palette());
  const [image, setImage] = useState<ImageInterface>();
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    grid: true,
    currentTool: Tools.PENCIL
  });
  const [scale, scaleDispatch] = useReducer(scaleReducer, 8);

  const handleMouseWheelEvent = useCallback(e => scaleDispatch(e), []);

  const handleImageLoad = async (imageFile: File | null) => {
    if (imageFile) {
      console.log("Loading image...");
      let image = await loadNewImage(imageFile);
      let { palette, sprite } = quantize(image, 16);
      setImage(sprite);
      setPalette(palette);
    }
  };

  const handleImageExport = async (type: string) => {
    if (!image) {
      alert("No image to export! Try importing one first.");
      return;
    }
    let fileName = image.fileName.slice(0, image.fileName.lastIndexOf("."));
    let fileType = "";
    let blob: Blob | null;

    const exportFailAlert = () =>
      alert("Failed to export image! Check console for more information.");

    switch (type) {
      case "GBA":
        //.c file
        fileType = ".c";
        let cBlob = new Blob([image.getCSourceData()]);
        saveAs(cBlob, fileName + fileType);
        //.h file
        fileType = ".h";
        let hBlob = new Blob([image.getHeaderData()]);
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
            {image ? <div> Scale: {scale.toFixed(2)}x </div> : null}
            <ToolsPanel
              settings={editorSettings}
              onSettingsChange={ns => handleSettingsChange(ns)}
            ></ToolsPanel>
          </div>
        </div>
        <div className="image-container">
          <EditorCanvas
            image={image}
            settings={editorSettings}
            scale={scale}
            onMouseWheel={handleMouseWheelEvent}
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
