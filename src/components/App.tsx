import React, { useCallback, useState, useReducer } from "react";
import { exportImage, exportPalette } from "../lib/exportUtils";
import { EditorSettings, EditorMode, Mode, Color } from "../lib/interfaces";
import { loadNewImage, loadNewPalette } from "../lib/fileLoadUtils";
import { quantize } from "../lib/quantize";
import { saveAs } from "file-saver";
import { Tool } from "../lib/consts";
import Bitmap from "./objects/Bitmap";
import Bitmap3 from "./objects/Bitmap3";
import Bitmap4 from "./objects/Bitmap4";
import DEFAULT_PALETTE from "../lib/defaultPalette";
import EditorCanvas from "./EditorCanvas";
import ExportButton from "./buttons/ExportButton";
import ImportButton from "./buttons/ImportButton";
import Palette from "./objects/Palette";
import PalettePanel from "./PalettePanel";
import ToolsPanel from "./ToolsPanel";
import Dropdown from "./Dropdown";

function scaleReducer(state: number, e: WheelEvent) {
  const direction = e.deltaY < 0 ? -1 : 1;
  if (direction === 1) {
    return state * 1.1;
  } else {
    return state / 1.1;
  }
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

  const handleEditorChange = useCallback(
    (editorMode: EditorMode, mode: Mode) => {
      setEditorSettings({
        grid: editorSettings.grid,
        currentTool: editorSettings.currentTool,
        mode: mode,
        editorMode: editorMode
      });
    },
    [editorSettings]
  );

  const handleQuantize = (newColorDepth: number): void => {
    newColorDepth = Math.floor(newColorDepth); // just in case of a float
    if (!(image instanceof Bitmap3)) {
      alert("Requantization of paletted images currently not supported!");
    } else {
      let ok = window.confirm(
        "(Don't panic!) Quantizing a bitmap will change it from mode 3 to mode 4. Is this okay?"
      );
      if (ok) {
        let { palette, sprite } = quantize(image, newColorDepth);
        setImage(sprite);
        setPalette(palette);
      }
    }
  };

  const handlePaletteLoad = async (palFile: File | null) => {
    if (palFile) {
      console.log("Loading palette...");
      let newPalette = await loadNewPalette(palFile);
      if (newPalette) {
        if (image instanceof Bitmap4) {
          image.updatePalette(newPalette);
        }
        setPalette(newPalette);
      }
    }
  };

  const handleChangeSelectedColor = (newIndex: number) => {
    setSelectedColorIndex(newIndex);
    if (image instanceof Bitmap4) {
      image.setPaletteIndex(newIndex);
    }
  };

  const handleColorChange = (newColor: Color): void => {
    const newPalette = palette.slice();
    newPalette[selectedColorIndex] = newColor;
    if (image instanceof Bitmap4) {
      image.updatePalette(newPalette);
    }
    setPalette(newPalette);
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
          <button onClick={() => handleEditorChange(EditorMode.Bitmap, 3)}>
            Mode 3
          </button>
          <button onClick={() => handleEditorChange(EditorMode.Bitmap, 4)}>
            Mode 4
          </button>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Spritesheet</div>
          <button onClick={() => handleEditorChange(EditorMode.Spritesheet, 4)}>
            4 bpp
          </button>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Background</div>
          <button onClick={() => handleEditorChange(EditorMode.Background, 0)}>
            Mode 0
          </button>
        </Dropdown>
        <Dropdown label="Edit">
          <button onClick={() => null}>Undo</button>
          <button onClick={() => null}>Redo</button>
          <div className="dd-divider"></div>
          <button onClick={() => null}>Clear All</button>
        </Dropdown>
        <Dropdown label="Import">
          <div className="dd-content-header">Image</div>
          <ImportButton
            onFileChange={handleImageLoad}
            buttonLabel="Image (*.png, *.bmp, *.jpg)"
          />
          <div className="dd-divider"></div>
          <ImportButton
            onFileChange={handlePaletteLoad}
            buttonLabel="Palette (*.pal)"
          />
        </Dropdown>
        <Dropdown label="Export">
          <div className="dd-content-header">Image</div>
          <ExportButton
            startImageExport={handleImageExport.bind(null, "PNG")}
            buttonLabel="PNG Image (*.png)"
          />
          <ExportButton
            startImageExport={handleImageExport.bind(null, "BMP")}
            buttonLabel="Bitmap (*.bmp)"
          />
          <div className="dd-divider"></div>
          <div className="dd-content-header">GBA</div>
          <ExportButton
            startImageExport={handleImageExport.bind(null, "GBA")}
            buttonLabel="C Source Code (*.c/.h)"
          />
          <div className="dd-divider"></div>
          <ExportButton
            startImageExport={handleImageExport.bind(null, "PAL")}
            buttonLabel="Color Palette (*.pal)"
          />
        </Dropdown>
        <Dropdown label="Help">
          <form>
            <button type="submit" formAction="" formTarget="">
              Documentation
            </button>
          </form>
          <form>
            <button
              type="submit"
              formAction="https://www.coranac.com/tonc/text/"
              formTarget="_blank"
            >
              GBA Graphics 101
            </button>
          </form>
          <div className="dd-divider"></div>
          <form>
            <button type="submit" formAction="" formTarget="">
              About VOCC
            </button>
          </form>
          <div className="dd-divider"></div>
          <form>
            <button
              type="submit"
              formAction="https://github.com/lbussell/vocc"
              formTarget="_blank"
            >
              View on GitHub
            </button>
          </form>
        </Dropdown>
      </div>
      <div className="workspace-container">
        <div className="left-panel">
          <div className="tools-container">
            {/* {image ? <div> Scale: {scale.toFixed(2)}x </div> : null} */}
            <ToolsPanel
              settings={editorSettings}
              onSettingsChange={handleSettingsChange}
              onToolChange={handleToolChange}
            ></ToolsPanel>
          </div>
          {image ? <div> Scale: {scale.toFixed(2)}x </div> : null}
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
          <PalettePanel
            palette={palette}
            updatePalette={setPalette}
            selectedColorIndex={selectedColorIndex}
            onChangeSelectedColorIndex={handleChangeSelectedColor}
            onChangeColor={handleColorChange}
            handleQuantize={handleQuantize}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
