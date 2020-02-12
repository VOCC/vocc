import React, { useState } from "react";
import { ModifiableImage, EditorSettings } from "../lib/interfaces";
import { getGBAImageString } from "../lib/exportUtils";
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
      let image = await Loader.loadNewImage(imageFile);
      console.log("handleImageLoad");

      var { palette, sprite } = quantize(image, 16);

      console.log("Palette:", palette);
      console.log("Sprite:", sprite);

      setImage(sprite);
      setPalette(palette);
    }
  };

  const handleImageExport = (): void => {
    const alertMsg = () => alert("Please import an image first!");
    if (!image) {
      alertMsg();
    } else {
      let fileName = image.fileName;
      let fileType = ".c";
      let fullFileName =
        fileName.slice(0, fileName.lastIndexOf(".")) + fileType;
      let blob = new Blob([getGBAImageString(image)], {
        type: "text/plain"
      });
      saveAs(blob, fullFileName);
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
        <ExportButton startImageExport={handleImageExport} />
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
