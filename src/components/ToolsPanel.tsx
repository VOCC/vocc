import React from "react";
import { EditorSettings } from "../util/types";
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
import { Tool } from "../util/consts";
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
      <span title="Draw Tool">
        <Toggle
          state={settings.currentTool === Tool.PENCIL}
          onClick={() => onToolChange(Tool.PENCIL)}
        >
          <FontAwesomeIcon icon={faPen} />
        </Toggle>
      </span>
      <span title="Color Fill">
        <Toggle
          state={settings.currentTool === Tool.BUCKET}
          onClick={() => onToolChange(Tool.BUCKET)}
        >
          <FontAwesomeIcon icon={faFillDrip} />
        </Toggle>
      </span>
    <span title="Draw Rectangle">
      <Toggle
        state={settings.currentTool === Tool.SQUARE}
        onClick={() => onToolChange(Tool.SQUARE)}
      >
        <FontAwesomeIcon icon={faSquare} />
        </Toggle>
      </span>
      <span title="Draw Ellipse">
        <Toggle
          state={settings.currentTool === Tool.ELLIPSE}
          onClick={() => onToolChange(Tool.ELLIPSE)}
        >
          <FontAwesomeIcon icon={faCircle} />
        </Toggle>
      </span>
      <span title="Zoom Tool">
        <Toggle
          state={settings.currentTool === Tool.ZOOM}
          onClick={() => onToolChange(Tool.ZOOM)}
        >
          <FontAwesomeIcon icon={faSearchPlus} />
        </Toggle>
      </span>
      <span title="Pan Tool">
        <Toggle
          state={settings.currentTool === Tool.PAN}
          onClick={() => onToolChange(Tool.PAN)}
        >
          <FontAwesomeIcon icon={faHandPaper} />
        </Toggle>
      </span>
      <span title="Color Picker">
        <Toggle
          state={settings.currentTool === Tool.DROPPER}
          onClick={() => onToolChange(Tool.DROPPER)}
        >
          <FontAwesomeIcon icon={faEyeDropper} />
        </Toggle>
      </span>
      <span title="New Layer">
        <Toggle
          state={settings.currentTool === Tool.LAYER}
          onClick={() => onToolChange(Tool.LAYER)}
        >
          <FontAwesomeIcon icon={faPlusSquare} />
        </Toggle>
      </span>
      <div className="panel-header">View</div>
      <span title="Gridlines">
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
      </span>
      <span title="Layers">
        <Toggle state={false} onClick={() => null}>
          <FontAwesomeIcon icon={faLayerGroup} />
        </Toggle>
      </span>
      <span title="Image Preview">
        <Toggle state={false} onClick={() => null}>
          <FontAwesomeIcon icon={faFileImage} />
        </Toggle>
      </span>
      <span title="Code Panel">
        <Toggle state={false} onClick={() => null}>
          <FontAwesomeIcon icon={faCode} />
        </Toggle>
      </span>
    </div>
  );
}
