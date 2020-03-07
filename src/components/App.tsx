import { saveAs } from "file-saver";
import React, { useCallback, useReducer, useState } from "react";
import { Tool } from "../lib/consts";
import DEFAULT_PALETTE from "../lib/defaultPalette";
import { exportImage, exportPalette } from "../lib/exportUtils";
import { loadNewImage, loadNewPalette } from "../lib/fileLoadUtils";
import {
  Color,
  Dimensions,
  EditorMode,
  EditorSettings,
  Mode
} from "../lib/interfaces";
import { quantize } from "../lib/quantize";
import Bitmap from "../models/Bitmap";
import Bitmap3 from "../models/Bitmap3";
import Bitmap4 from "../models/Bitmap4";
import Palette from "../models/Palette";
import ExportButton from "./buttons/ExportButton";
import ImportButton from "./buttons/ImportButton";
import Dropdown from "./Dropdown";
import EditorCanvas from "./EditorCanvas";
import PalettePanel from "./PalettePanel";
import ToolsPanel from "./ToolsPanel";

function scaleReducer(state: number, e: WheelEvent) {
  const direction = e.deltaY < 0 ? -1 : 1;
  if (direction === 1) {
    return state * 1.1;
  } else {
    return state / 1.1;
  }
}

function App(): JSX.Element {
  const [image, setImage] = useState<Bitmap>();
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    grid: true,
    currentTool: Tool.PENCIL,
    imageMode: 3,
    editorMode: EditorMode.Bitmap
  });

  const [scale, scaleDispatch] = useReducer(scaleReducer, 8);

  const handleMouseWheelEvent = useCallback(e => scaleDispatch(e), []);

  const handleFileInputChange = (
    type: "Image" | "Palette",
    element: HTMLInputElement | null,
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();
    if (!element || !element.files) return;
    switch (type) {
      case "Image":
        handleImageLoad(element.files[0]);
        break;
      case "Palette":
        handlePaletteLoad(element.files[0]);
        break;
    }
  };

  const handleImageLoad = async (imageFile: File | null) => {
    if (imageFile) {
      console.log("Loading image...");
      let image = await loadNewImage(imageFile);
      setImage(image);
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

  const handleToolChange = useCallback(
    (newTool: Tool) => {
      setEditorSettings({
        grid: editorSettings.grid,
        currentTool: newTool,
        imageMode: editorSettings.imageMode,
        editorMode: editorSettings.editorMode
      });
    },
    [editorSettings]
  );

  /**
   * Call this function when initializing a new "project" or whatever you want
   * to call it. You will be greeted with a blank image to work on.
   *
   * @param editorMode The mode to set up the editor in. Can be either bitmap,
   * spritesheet, or background.
   * @param imageMode The image mode to edit in. Can be any of the GBA Modes,
   * although only 0, 3, and 4 are supported.
   */
  const handleNew = (editorMode: EditorMode, imageMode: Mode) => {
    if (image) {
      let accept = window.confirm(
        "Are you sure you want to create a new image? You will lose all unsaved work."
      );
      if (!accept) return;
    }
    switch (editorMode) {
      case EditorMode.Bitmap:
        // Open a modal dialog to query for image filename and dimensions
        const dimensions: Dimensions = { width: 32, height: 32 };
        const fileName: string = "img";
        switch (imageMode) {
          case 3: // Set up the editor for working on a mode 3 bitmap
            setImage(new Bitmap3(fileName, dimensions));
            break;
          case 4: // Set up the editor for working on a mode 4 paletted bitmap
            setImage(new Bitmap4(fileName, palette, dimensions));
            break;
          default:
            alert("Unsupported image mode!");
            break;
        }
        break;
      case EditorMode.Spritesheet:
      case EditorMode.Background:
      default:
        alert("Unsupported editing mode!");
        break;
    }
  };

  const handleEditorChange = useCallback(
    (editorMode: EditorMode, mode: Mode) => {
      setEditorSettings({
        grid: editorSettings.grid,
        currentTool: editorSettings.currentTool,
        imageMode: mode,
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
    let fileName;
    let fileType = "";
    let blob: Blob | null;

    if (image) {
      fileName = image.fileName.slice(0, image.fileName.lastIndexOf("."));
    } else {
      fileName = "default";
    }

    const exportFailAlert = () =>
      alert("Failed to export image! Check console for more information.");

    switch (type) {
      case "GBA":
        if (!image) {
          alert("No image to export! Try importing one first.");
          return;
        }
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
        if (!image) {
          alert("No image to export! Try importing one first.");
          return;
        }
        //.bmp file
        fileType = ".bmp";
        blob = await exportImage(image, type);
        break;
      case "PNG":
        if (!image) {
          alert("No image to export! Try importing one first.");
          return;
        }
        //.png file
        fileType = ".png";
        blob = await exportImage(image, type);
        break;
      default:
        if (!image) {
          alert("No image to export! Try importing one first.");
          return;
        }
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
          <button onClick={() => handleNew(EditorMode.Bitmap, 3)}>
            Mode 3
          </button>
          <button onClick={() => handleNew(EditorMode.Bitmap, 4)}>
            Mode 4
          </button>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Spritesheet</div>
          <button onClick={() => handleNew(EditorMode.Spritesheet, 4)}>
            4 bpp
          </button>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Background</div>
          <button onClick={() => handleNew(EditorMode.Background, 0)}>
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
            onFileInputChange={handleFileInputChange.bind(null, "Image")}
            buttonLabel="Image (*.png, *.bmp, *.jpg)"
          />
          <div className="dd-divider"></div>
          <ImportButton
            onFileInputChange={handleFileInputChange.bind(null, "Palette")}
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
