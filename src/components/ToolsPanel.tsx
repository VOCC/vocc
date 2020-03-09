import React from "react";
import { EditorSettings } from "../lib/interfaces";
import {
  faBorderAll,
  faPen,
  faFillDrip,
  faSearchPlus,
  faEyeDropper,
  faLayerGroup,
  faCode,
  faPlusSquare,
  faFileImage
} from "@fortawesome/free-solid-svg-icons";
import {
  faCircle,
  faSquare,
  faHandPaper
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tool } from "../lib/consts";
import Toggle from "./buttons/Toggle";

type ToolsPanelProps = {
  settings: EditorSettings;
  onSettingsChange: (newSettings: EditorSettings) => void;
  onToolChange: (newTool: Tool) => void;
};

export default function ToolsPanel({
  settings,
  onSettingsChange,
  onToolChange
}: ToolsPanelProps) {
  return (
    <div>
      <div className="panel-header-top">Tools</div>
      <Toggle
        state={settings.currentTool === Tool.PENCIL}
        onClick={() => onToolChange(Tool.PENCIL)}
      >
        <FontAwesomeIcon icon={faPen} />
      </Toggle>
      <Toggle
        state={settings.currentTool === Tool.BUCKET}
        onClick={() => onToolChange(Tool.BUCKET)}
      >
        <FontAwesomeIcon icon={faFillDrip} />
      </Toggle>
      <Toggle
        state={settings.currentTool === Tool.SQUARE}
        onClick={() => onToolChange(Tool.SQUARE)}
      >
        <FontAwesomeIcon icon={faSquare} />
      </Toggle>
      <Toggle
        state={settings.currentTool === Tool.ELLIPSE}
        onClick={() => onToolChange(Tool.ELLIPSE)}
      >
        <FontAwesomeIcon icon={faCircle} />
      </Toggle>
      <Toggle
        state={settings.currentTool === Tool.ZOOM}
        onClick={() => onToolChange(Tool.ZOOM)}
      >
        <FontAwesomeIcon icon={faSearchPlus} />
      </Toggle>
      <Toggle
        state={settings.currentTool === Tool.PAN}
        onClick={() => onToolChange(Tool.PAN)}
      >
        <FontAwesomeIcon icon={faHandPaper} />
      </Toggle>
      <Toggle
        state={settings.currentTool === Tool.DROPPER}
        onClick={() => onToolChange(Tool.DROPPER)}
      >
        <FontAwesomeIcon icon={faEyeDropper} />
      </Toggle>
      <Toggle
        state={settings.currentTool === Tool.LAYER}
        onClick={() => onToolChange(Tool.LAYER)}
      >
        <FontAwesomeIcon icon={faPlusSquare} />
      </Toggle>
      <div className="panel-header">View</div>
      <Toggle
        state={settings.grid}
        onClick={() => {
          let newSettings = { ...settings };
          newSettings.grid = !settings.grid;
          onSettingsChange(newSettings);
        }}
      >
        <FontAwesomeIcon icon={faBorderAll} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faFileImage} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faCode} />
      </Toggle>
    </div>
  );
}
