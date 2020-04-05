import { saveAs } from "file-saver";
import React, { useCallback, useReducer, useState, useEffect } from "react";
import { Tool, STORAGE, DEFAULT_SETTINGS } from "../util/consts";
import DEFAULT_PALETTE from "../util/defaultPalette";
import { exportImage, exportPalette } from "../util/exportUtils";
import { loadNewImage, loadNewPalette } from "../util/fileLoadUtils";
import {
  Color,
  Dimensions,
  EditorMode,
  EditorSettings,
  Mode,
  ImageDataStore
} from "../util/interfaces";
import { quantize } from "../util/quantize";
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
import NewImageModal from "./modals/NewImageModal";
import useModal from "./hooks/useModal";

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

  /**
   * The undo stack will hold stringified ImageDataStore objects ONLY. They will
   * be decoded on undo.
   */
  const [undoStack, setUndoStack] = useState<Array<string>>([]);
  const [undoPointer, setUndoPointer] = useState<number>(-1);

  const {
    isShowing: isMode3BitmapModalShowing,
    toggle: toggleMode3BitmpModal
  } = useModal();
  const {
    isShowing: isMode4BitmapModalShowing,
    toggle: toggleMode4BitmpModal
  } = useModal();

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
      console.log("Loading image from file...");
      let image = await loadNewImage(imageFile);
      resetUndo();
      handleImageChange(image);
    }
  };

  const handleImageChange = (newImage: Bitmap) => {
    const store = JSON.stringify(newImage.getImageDataStore());
    window.localStorage.setItem(STORAGE.imageData, store);
    pushUndoStack(store);
    setImage(newImage);
  };

  const pushUndoStack = (imageDataStoreString: string) => {
    let newStack = undoStack.slice(0, undoPointer + 1);
    newStack.push(imageDataStoreString);
    setUndoStack(newStack);
    setUndoPointer(newStack.length - 1);
  };

  const handleUndo = useCallback(() => {
    console.log("trying to undo");
    if (image && undoPointer >= 1) {
      const newStoreString = undoStack[undoPointer - 1];
      const newStore = JSON.parse(newStoreString);
      window.localStorage.setItem(STORAGE.imageData, newStoreString);
      image.updateFromStore(newStore);
      setUndoPointer(undoPointer - 1);
      setImage(image);
    }
  }, [undoStack, undoPointer, image]);

  const handleRedo = useCallback(() => {
    console.log("trying to redo");
    if (image && undoPointer < undoStack.length) {
      image.updateFromStore(JSON.parse(undoStack[undoPointer + 1]));
      setUndoPointer(undoPointer + 1);
    }
  }, [image, undoPointer, undoStack]);

  const resetUndo = () => {
    setUndoStack([]);
    setUndoPointer(-1);
  };

  const handlePaletteChange = (newPalette: Palette) => {
    window.localStorage.setItem(STORAGE.palette, JSON.stringify(newPalette));
    setPalette(newPalette);
  };

  const handleSettingsChange = (newSettings: EditorSettings) => {
    window.localStorage.setItem(
      STORAGE.imageMode,
      newSettings.imageMode.toString()
    );
    window.localStorage.setItem(
      STORAGE.imageType,
      newSettings.editorMode.toString()
    );
    setEditorSettings(newSettings);
  };

  const handleClearLocalStorage = () => window.localStorage.clear();

  const handlePaletteLoad = async (palFile: File | null) => {
    if (palFile) {
      console.log("Loading palette from file...");
      let newPalette = await loadNewPalette(palFile);
      if (newPalette) {
        if (image instanceof Bitmap4) {
          image.updatePalette(newPalette);
        }
        handlePaletteChange(newPalette);
      }
    }
  };

  const handlePaletteImport = (
    oldPal: Palette,
    newPal: Palette,
    oldStartRow: number,
    newStartRow: number,
    numRows: number,
    overwrite: boolean
  ) => {};

  const handleToolChange = useCallback(
    (newTool: Tool) => {
      handleSettingsChange({
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
  const handleNewBitmap = (
    editorMode: EditorMode,
    imageMode: Mode,
    fileName: string,
    dimensions: Dimensions
  ) => {
    if (image) {
      let accept = window.confirm(
        "Are you sure you want to create a new image? You will lose all unsaved work."
      );
      if (!accept) return;
    }
    switch (editorMode) {
      case EditorMode.Bitmap:
        // Open a modal dialog to query for image filename and dimensions
        switch (imageMode) {
          case 3: // Set up the editor for working on a mode 3 bitmap
            editorSettings.editorMode = EditorMode.Bitmap;
            editorSettings.imageMode = 3;
            handleSettingsChange(editorSettings);
            handleImageChange(new Bitmap3(fileName, dimensions));
            handlePaletteChange(palette);
            break;
          case 4: // Set up the editor for working on a mode 4 paletted bitmap
            editorSettings.editorMode = EditorMode.Bitmap;
            editorSettings.imageMode = 4;
            handleSettingsChange(editorSettings);
            handleImageChange(new Bitmap4(fileName, palette, dimensions));
            handlePaletteChange(palette);
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

  const handleQuantize = (newColorDepth: number): void => {
    newColorDepth = Math.floor(newColorDepth); // just in case of a float
    if (!(image instanceof Bitmap3)) {
      alert("Requantization of paletted images currently not supported!");
    } else {
      let ok = window.confirm(
        "Quantizing a bitmap will change it from mode 3 to mode 4. Is this okay?"
      );
      if (ok) {
        let { palette, sprite } = quantize(image, newColorDepth);
        handleImageChange(sprite);
        handlePaletteChange(palette);
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
    handlePaletteChange(newPalette);
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

  /**
   * Set up listeners for undo and redo.
   */
  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 89 && e.ctrlKey) {
      } else if (e.keyCode === 90 && e.ctrlKey && e.shiftKey) {
        handleRedo();
      } else if (e.keyCode === 90 && e.ctrlKey) {
        handleUndo();
      }
    };
    document.addEventListener("keydown", keydownHandler);
    return () => document.removeEventListener("keydown", keydownHandler);
  }, [handleUndo, handleRedo]);

  /**
   * Load Images from local storage.
   */
  useEffect(() => {
    const alertBadFormatting = () =>
      alert("Image data incorrectly formatted. Aborting load operation.");
    const askLoadImage = () =>
      window.confirm(
        "Found automatically saved image data from your last session in storage. Would you like to load it? If not, it will be deleted."
      );

    const loadedImageMode = window.localStorage.getItem(STORAGE.imageMode);
    const loadedImageType = window.localStorage.getItem(STORAGE.imageType);
    const loadedPalette = window.localStorage.getItem(STORAGE.palette);
    const loadedImage = window.localStorage.getItem(STORAGE.imageData);

    if (loadedImageMode && loadedImageType && loadedImage) {
      let loadImage = askLoadImage();

      if (!loadImage) {
        window.localStorage.clear();
        return;
      }

      const parsedImage = JSON.parse(loadedImage) as ImageDataStore;
      const parsedImageMode: Mode = parseInt(loadedImageMode) as Mode;
      const parsedImageType: EditorMode = loadedImageType as EditorMode;

      switch (parsedImageMode) {
        case 3:
          setImage(Bitmap3.fromDataStore(parsedImage));
          let newEditorSettings = DEFAULT_SETTINGS;
          newEditorSettings.imageMode = parsedImageMode;
          newEditorSettings.editorMode = parsedImageType;
          setEditorSettings(newEditorSettings);
          break;
        case 4:
          if (!loadedPalette) {
            alertBadFormatting();
            return;
          } else {
            const parsedPalette = JSON.parse(loadedPalette) as Palette;
            setImage(Bitmap4.fromDataStore(parsedImage, parsedPalette));
            setPalette(parsedPalette);
            let newEditorSettings = DEFAULT_SETTINGS;
            newEditorSettings.imageMode = parsedImageMode;
            newEditorSettings.editorMode = parsedImageType;
            setEditorSettings(newEditorSettings);
          }
          break;
        default:
          alertBadFormatting();
      }
    }
  }, []);

  return (
    <div className="app-container">
      <div className="navbar">
        <span className="title">VOCC</span>
        <Dropdown label="New">
          <div className="dd-content-header">Bitmap</div>
          <button onClick={toggleMode3BitmpModal}>Mode 3</button>
          <NewImageModal
            isShowing={isMode3BitmapModalShowing}
            hide={toggleMode3BitmpModal}
            onAccept={handleNewBitmap.bind(null, EditorMode.Bitmap, 3)}
          ></NewImageModal>
          <button onClick={toggleMode4BitmpModal}>Mode 4</button>
          <NewImageModal
            isShowing={isMode4BitmapModalShowing}
            hide={toggleMode4BitmpModal}
            onAccept={handleNewBitmap.bind(null, EditorMode.Bitmap, 4)}
          ></NewImageModal>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Spritesheet</div>
          <button
            onClick={() =>
              alert("Spritesheet editing not currently supported.")
            }
          >
            4 bpp
          </button>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Background</div>
          <button
            onClick={() => alert("Background editing not currently supported.")}
          >
            Mode 0
          </button>
        </Dropdown>
        <Dropdown label="Edit">
          <button onClick={() => handleUndo()}>Undo</button>
          <button onClick={() => handleRedo()}>Redo</button>
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
            buttonLabel="Color Palette (*.pal)"
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
          <button onClick={handleClearLocalStorage}>Clear Local Storage</button>
        </Dropdown>
      </div>
      <div className="workspace-container">
        <div className="left-panel">
          <div className="tools-container">
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
              onChangeImage={handleImageChange}
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
            updatePalette={handlePaletteChange}
            selectedColorIndex={selectedColorIndex}
            onChangeSelectedColorIndex={handleChangeSelectedColor}
            onChangeColor={handleColorChange}
            handleQuantize={handleQuantize}
            settings={editorSettings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
