import React from "react";
import { EditorSettings, DropdownMenu } from "../lib/interfaces";
import Bitmap from "./objects/Bitmap";
import Palette from "./objects/Palette";


type DropdownProps = {
  type: DropdownMenu;
  onTypeChange: (newType: DropdownMenu) => void;
  
  image?: Bitmap;
  palette?: Palette;

  settings?: EditorSettings;
  onSettingsChange?: (newSettings: EditorSettings) => void;

};

export default function Dropdown({
  type,
  onTypeChange
}: DropdownProps) {
  console.log("Dropdown Menu Type: " + type)

  switch(type) {
    case DropdownMenu.Import: 
      return (
      <div className="App">
          <div className="container">
          <button className="button" onClick={() => onTypeChange(DropdownMenu.None)}>
              Import
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Export)}>
              Export
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Settings)}>
              Settings
            </button>
          </div>
        </div>
      );
    case DropdownMenu.Export:
      return (
        <div className="App">
          <div className="container">
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Import)}>
              Import
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.None)}>
              Export
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Settings)}>
              Settings
            </button>
          </div>
        </div>
      );
    case DropdownMenu.Settings:
      return (
        <div className="App">
          <div className="container">
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Import)}>
              Import
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Export)}>
              Export
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.None)}>
              Settings
            </button>
          </div>
        </div>
      );
    default:
      return (
        <div className="App">
          <div className="container">
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Import)}>
              Import
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Export)}>
              Export
            </button>
            <button className="button" onClick={() => onTypeChange(DropdownMenu.Settings)}>
              Settings
            </button>
          </div>
        </div>
      );
  }
}

