import React, { useCallback, useState, useReducer } from "react";
import { exportImage, exportPalette } from "../lib/exportUtils";
import { EditorSettings } from "../lib/interfaces";
import { loadNewImage } from "../lib/imageLoadUtils";
import { quantize } from "../lib/quantize";
import { saveAs } from "file-saver";
import { Tool } from "../lib/consts";
import Bitmap from "./objects/Bitmap";
import Bitmap3 from "./objects/Bitmap3";
import DEFAULT_PALETTE from "../lib/defaultPalette";
import EditorCanvas from "./EditorCanvas";
import ExportButton from "./buttons/ExportButton";
import ImportButton from "./buttons/ImportButton";
import Palette from "./objects/Palette";
import PaletteDisplay from "./PaletteDisplay";
import QuantizeButton from "./buttons/QuantizeButton";
import ToolsPanel from "./ToolsPanel";

function scaleReducer(state: number, e: WheelEvent) {
  let direction = e.deltaY < 0 ? -1 : 1;
  let newScale = state + direction / 4;
  return newScale < 1 ? 1 : newScale;
}

function App(): JSX.Element {
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [image, setImage] = useState<Bitmap>();
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    grid: true,
    currentTool: Tool.PENCIL
  });
  const [scale, scaleDispatch] = useReducer(scaleReducer, 8);

  const handleMouseWheelEvent = useCallback(e => scaleDispatch(e), []);

  const handleImageLoad = async (imageFile: File | null) => {
    if (imageFile) {
      console.log("Loading image...");
      let image = await loadNewImage(imageFile);
      setImage(image);
    }
  };

  const handleToolChange = useCallback(
    (newTool: Tool) => {
      setEditorSettings({
        grid: editorSettings.grid,
        currentTool: newTool
      });
    },
    [editorSettings.grid]
  );

  const handleQuantize = (newColorDepth: number): void => {
    newColorDepth = Math.floor(newColorDepth); // just in case of a float
    if (!(image instanceof Bitmap3)) {
      alert("Requantization of paletted images currently not supported!");
    } else {
      let { palette, sprite } = quantize(image, newColorDepth);
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
        if (!palette) {
          alert("Can't export a non-existant palette!");
          return;
        } else {
          fileType = ".pal";
          blob = new Blob([exportPalette(palette)]);
          break;
        }
      case "BMP":
        //.bmp file
        fileType = ".bmp";
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

  const handleSettingsChange = useCallback(
    (newSettings: EditorSettings): void => setEditorSettings(newSettings),
    []
  );

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
        BMP ->
        <ExportButton startImageExport={handleImageExport.bind(null, "BMP")} />
      </div>
      <div className="workspace-container">
        <div className="left-panel">
          <div className="panel-label">Tools</div>
          <div className="tools-container">
            {image ? <div> Scale: {scale.toFixed(2)}x </div> : null}
            <ToolsPanel
              settings={editorSettings}
              onSettingsChange={handleSettingsChange}
              onToolChange={handleToolChange}
            ></ToolsPanel>
          </div>
        </div>
        <div className="image-container">
          {image ? (
            <EditorCanvas
              image={image}
              settings={editorSettings}
              palette={palette}
              selectedPaletteIndex={selectedColorIndex}
              scale={scale}
              onMouseWheel={handleMouseWheelEvent}
            />
          ) : (
            <div className="start-message">
              <em>Import an image to get started</em>
            </div>
          )}
        </div>
        <div className="right-panel">
          <div className="panel-label">Color Palette</div>
          <div className="palette-container">
            <PaletteDisplay
              palette={palette}
              selectedColorIndex={selectedColorIndex}
              onChangeSelectedColorIndex={setSelectedColorIndex}
            />
          </div>
          <QuantizeButton handleQuantize={handleQuantize} />
        </div>
      </div>
    </div>
  );
}

export default App;
