import React, { useCallback, useState, useReducer } from "react";
import { exportImage, exportPalette } from "../lib/exportUtils";
import { EditorSettings, EditorMode } from "../lib/interfaces";
import { loadNewImage, loadNewPalette } from "../lib/fileLoadUtils";
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
import Dropdown from "./Dropdown";

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
    currentTool: Tool.PENCIL,
    mode: 3,
    editorMode: EditorMode.Bitmap
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
        currentTool: newTool,
        mode: editorSettings.mode,
        editorMode: editorSettings.editorMode
      });
    },
    [editorSettings]
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

  const handlePaletteLoad = async (palFile: File | null) => {
    if (palFile) {
      console.log("Loading palette...");
      let palette = await loadNewPalette(palFile);
      if (palette) setPalette(palette);
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
        <Dropdown label="New">
          <div className="dd-content-header">Bitmap</div>
            <div>Mode 3</div>
            <div>Mode 4</div>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Spritesheet</div>
            <div>4 bpp</div>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Background</div>
            <div>Mode 0</div>
        </Dropdown>
        <Dropdown label="Edit">
          <div>Undo</div>
          <div>Redo</div>
          <div className="dd-divider"></div>
          <div>Clear All</div>
        </Dropdown>
        <Dropdown label="Import">
          <div className="dd-content-header">Image</div>
            <div>PNG Image (*.png)</div>
            <div>Bitmap (*.bmp)</div>
          <div className="dd-divider"></div>
          <div>Color Palette (*.pal)</div>
        </Dropdown>
        <Dropdown label="Export">
          <div className="dd-content-header">Image</div>
            <div>PNG Image (*.png)</div>
            <div>Bitmap (*.bmp)</div>
          <div className="dd-divider"></div>
          <div className="dd-content-header">GBA</div>
            <div>C Source Code (*.c/.h)</div>
          <div className="dd-divider"></div>
          <div>Color Palette (*.pal)</div>
        </Dropdown>
        <Dropdown label="Help">
          <div>Documentation</div>
          <div>GBA Graphics 101</div>
          <div className="dd-divider"></div>
          <div>About VOCC</div>
          <div className="dd-divider"></div>
          <div>View on GitHub</div>
        </Dropdown>
        IMG ->
        <ImportButton onFileChange={handleImageLoad} />
        PAL ->
        <ImportButton onFileChange={handlePaletteLoad} />
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
          <div className="panel-label">Palette</div>
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
