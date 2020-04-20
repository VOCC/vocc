import { saveAs } from "file-saver";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import Bitmap3 from "../models/Bitmap3";
import Bitmap4 from "../models/Bitmap4";
import Color from "../models/Color";
import Palette, { paletteIndexToCol } from "../models/Palette";
import Spritesheet4 from "../models/Spritesheet4";
import { DEFAULT_SETTINGS, STORAGE, Tool } from "../util/consts";
import { DEFAULT_PALETTE, SPRITESHEET_PALETTE } from "../util/defaultPalette";
import { exportImage, exportPalette, exportType } from "../util/exportUtils";
import { loadNewImage } from "../util/fileLoadUtils";
import { quantize } from "../util/quantize";
import {
  Dimensions,
  EditorMode,
  EditorSettings,
  ImageCoordinates,
  ImageDataStore,
  ImageInterface,
  Mode,
  SpriteDimensions,
  SpritesheetDataStore,
} from "../util/types";
import ExportButton from "./buttons/ExportButton";
import ImportButton from "./buttons/ImportButton";
import Dropdown from "./Dropdown";
import EditorCanvas from "./EditorCanvas";
import useModal from "./hooks/useModal";
import ImportPaletteModal from "./modals/ImportPaletteModal";
import NewImageModal from "./modals/NewImageModal";
import PalettePanel from "./PalettePanel";
import SpritePanel from "./SpritePanel";
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
  const [image, setImage] = useState<ImageInterface>();
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    grid: true,
    currentTool: Tool.PENCIL,
    imageMode: 3,
    editorMode: EditorMode.Bitmap,
  });

  const [, updateState] = React.useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  /**
   * The undo stack will hold stringified ImageDataStore objects ONLY. They will
   * be decoded on undo.
   */
  const [undoStack, setUndoStack] = useState<Array<string>>([]);
  const [undoPointer, setUndoPointer] = useState<number>(-1);

  const {
    isShowing: isMode3BitmapModalShowing,
    toggle: toggleMode3BitmpModal,
  } = useModal();
  const {
    isShowing: isMode4BitmapModalShowing,
    toggle: toggleMode4BitmpModal,
  } = useModal();
  const {
    isShowing: isPaletteModalShowing,
    toggle: togglePaletteModal,
  } = useModal();

  const [scale, scaleDispatch] = useReducer(scaleReducer, 8);
  const handleMouseWheelEvent = useCallback((e) => scaleDispatch(e), []);

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
      // case "Palette":
      //   handlePaletteLoad(element.files[0]);
      //   break;
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

  const handleImageChange = (newImage: ImageInterface) => {
    let store: string;
    if (newImage instanceof Spritesheet4) {
      store = JSON.stringify(newImage.spritesheetDataStore);
    } else {
      store = JSON.stringify(newImage.imageDataStore);
    }
    window.localStorage.setItem(STORAGE.imageData, store);
    pushUndoStack(store);
    setImage(newImage);
  };

  const handleAddSprite = (
    position: ImageCoordinates,
    dimensions: SpriteDimensions,
    paletteRow = 0
  ) => {
    let spritesheet = image as Spritesheet4;
    spritesheet.addSprite(position, dimensions);
    handleImageChange(spritesheet);
    forceUpdate();
    console.log("Adding sprite");
  };

  const handleRemoveSprite = (image: ImageInterface | undefined, i: number) => {
    if (image && image instanceof Spritesheet4) {
      (image as Spritesheet4).removeSprite(i);
    }
    forceUpdate();
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
      if (image instanceof Spritesheet4) {
      } else {
      }
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
    if (image && undoPointer + 1 < undoStack.length) {
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

  // const handlePaletteLoad = async (palFile: File | null) => {
  //   if (palFile) {
  //     console.log("Loading palette from file...");
  //     let newPalette = await loadNewPalette(palFile);
  //     if (newPalette) {
  //       if (image instanceof Bitmap4) {
  //         image.updatePalette(newPalette);
  //       }
  //       handlePaletteChange(newPalette);
  //     }
  //   }
  // };

  const handlePaletteImport = (pal: Palette) => {
    if (image instanceof Bitmap4) {
      image.updatePalette(pal);
    }
    handlePaletteChange(pal.slice());
  };

  const handleToolChange = useCallback(
    (newTool: Tool) => {
      handleSettingsChange({
        grid: editorSettings.grid,
        currentTool: newTool,
        imageMode: editorSettings.imageMode,
        editorMode: editorSettings.editorMode,
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
  const handleNewImage = (
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
            return;
          case 4: // Set up the editor for working on a mode 4 paletted bitmap
            editorSettings.editorMode = EditorMode.Bitmap;
            editorSettings.imageMode = 4;
            handleSettingsChange(editorSettings);
            handleImageChange(new Bitmap4(fileName, palette, dimensions));
            handlePaletteChange(palette);
            return;
          default:
            alert("Unsupported image mode!");
            return;
        }
      case EditorMode.Spritesheet:
        editorSettings.editorMode = EditorMode.Spritesheet;
        editorSettings.imageMode = 0;
        handleSettingsChange(editorSettings);
        handleImageChange(
          new Spritesheet4(
            "untitled",
            SPRITESHEET_PALETTE,
            paletteIndexToCol(selectedColorIndex)
          )
        );
        handlePaletteChange(SPRITESHEET_PALETTE);
        return;
      case EditorMode.Background:
      default:
        alert("Unsupported editing mode!");
        return;
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
    if (image instanceof Bitmap4 || image instanceof Spritesheet4) {
      image.setPaletteIndex(newIndex);
    }
  };

  const handleColorChange = (newColor: Color): void => {
    const newPalette = palette.slice();
    newPalette[selectedColorIndex] = newColor;
    if (selectedColorIndex % 16 === 0 && image instanceof Spritesheet4) {
      for (let i = 0; i < 16; i++) {
        let index = i * 16;
        newPalette[index] = newColor;
      }
      image.setBackgroundColor(newColor);
    }
    if (image instanceof Bitmap4 || image instanceof Spritesheet4) {
      image.updatePalette(newPalette);
    }
    handlePaletteChange(newPalette);
  };

  const handleImageExport = async (kind: exportType) => {
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

    switch (kind) {
      case exportType.GBA:
        if (!image) {
          alert("No image to export! Try importing one first.");
          return;
        }
        //.c file
        fileType = ".c";
        let cBlob = new Blob([image.cSourceData]);
        saveAs(cBlob, fileName + fileType);
        //.h file
        fileType = ".h";
        let hBlob = new Blob([image.headerData]);
        saveAs(hBlob, fileName + fileType);
        return;
      case exportType.BG:
        blob = null;
        console.log("Trying to export as background!");
        break;
      case exportType.PAL:
        //.pal file
        if (!palette) {
          alert("Can't export a non-existant palette!");
          return;
        } else {
          fileType = ".pal";
          blob = new Blob([exportPalette(palette)]);
          break;
        }
      case exportType.BMP:
        if (!image) {
          alert("No image to export! Try importing one first.");
          return;
        }
        //.bmp file
        fileType = ".bmp";
        blob = await exportImage(image, kind);
        break;
      case exportType.PNG:
        if (!image) {
          alert("No image to export! Try importing one first.");
          return;
        }
        //.png file
        fileType = ".png";
        blob = await exportImage(image, kind);
        break;
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

      const parsedImageMode: Mode = parseInt(loadedImageMode) as Mode;
      const parsedImageType: EditorMode = loadedImageType as EditorMode;

      const buildPalette = (paletteString: string): Palette => {
        interface IColor {
          r: number;
          g: number;
          b: number;
          a: number;
        }
        // The following cast is definitely unsafe.
        let parsedPalette = JSON.parse(paletteString) as IColor[];
        let newPalette = parsedPalette.map(
          (c) => new Color(c.r, c.g, c.b, c.a)
        );
        return newPalette;
      };

      switch (parsedImageMode) {
        case 0:
          if (!loadedPalette) {
            alertBadFormatting();
            return;
          } else {
            const newPalette = buildPalette(loadedPalette);
            console.log(newPalette);
            const parsedImage = JSON.parse(loadedImage) as SpritesheetDataStore;
            setPalette(newPalette);
            setImage(Spritesheet4.fromDataStore(parsedImage, newPalette, 0));
            let newEditorSettings = DEFAULT_SETTINGS;
            newEditorSettings.imageMode = parsedImageMode;
            newEditorSettings.editorMode = parsedImageType;
            setEditorSettings(newEditorSettings);
          }
          break;
        case 3:
          const parsedImage = JSON.parse(loadedImage) as ImageDataStore;
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
            const parsedImage = JSON.parse(loadedImage) as ImageDataStore;
            const newPalette = buildPalette(loadedPalette);
            setImage(Bitmap4.fromDataStore(parsedImage, newPalette));
            setPalette(newPalette);
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
            onAccept={handleNewImage.bind(null, EditorMode.Bitmap, 3)}
          ></NewImageModal>
          <button onClick={toggleMode4BitmpModal}>Mode 4</button>
          <NewImageModal
            isShowing={isMode4BitmapModalShowing}
            hide={toggleMode4BitmpModal}
            onAccept={handleNewImage.bind(null, EditorMode.Bitmap, 4)}
          ></NewImageModal>
          <div className="dd-divider"></div>
          <div className="dd-content-header">Spritesheet</div>
          <button
            onClick={() =>
              handleNewImage(EditorMode.Spritesheet, 0, "untitled", {
                height: 256,
                width: 256,
              })
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
          {/* <ImportButton
            onFileInputChange={handleFileInputChange.bind(null, "Palette")}
            buttonLabel="Color Palette (*.pal)"
          /> */}

          <button onClick={togglePaletteModal}>Palette</button>
          <ImportPaletteModal
            isShowing={isPaletteModalShowing}
            hide={togglePaletteModal}
            onAccept={handlePaletteImport}
            oldPal={palette}
          ></ImportPaletteModal>
        </Dropdown>
        <Dropdown label="Export">
          <div className="dd-content-header">Image</div>
          <ExportButton
            startImageExport={handleImageExport.bind(null, exportType.PNG)}
            buttonLabel="PNG Image (*.png)"
          />
          <ExportButton
            startImageExport={handleImageExport.bind(null, exportType.BMP)}
            buttonLabel="Bitmap (*.bmp)"
          />
          <div className="dd-divider"></div>
          <div className="dd-content-header">GBA</div>
          <ExportButton
            startImageExport={handleImageExport.bind(null, exportType.GBA)}
            buttonLabel="C Source Code (*.c/.h)"
          />
          <div className="dd-divider"></div>
          <ExportButton
            startImageExport={handleImageExport.bind(null, exportType.PAL)}
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
            <div className="scale-container">
              {image ? <div> Scale: {scale.toFixed(2)}x </div> : null}
            </div>
          </div>
          {/* <div className="scale-container">
            {image ? <div> Scale: {scale.toFixed(2)}x </div> : null}
          </div> */}
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
              onChangeColor={handleColorChange}
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
          {editorSettings.editorMode === EditorMode.Spritesheet ? (
            <SpritePanel
              onAddSprite={handleAddSprite}
              onRemoveSprite={(i) => handleRemoveSprite(image, i)}
              onUpdatePaletteRow={forceUpdate}
              sprites={(image as Spritesheet4).sprites}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
