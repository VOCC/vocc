import React from "react";
import { EditorSettings } from "../lib/interfaces";
import {
  faBorderAll,
  faPen,
  faFillDrip,
  faSearchPlus,
  faEyeDropper,
  faLayerGroup,
  faCode
} from "@fortawesome/free-solid-svg-icons";
import {
  faCircle,
  faSquare,
  faHandPaper
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toggle from "./buttons/Toggle";

type ToolsPanelProps = {
  settings: EditorSettings;
  onSettingsChange: (newSettings: EditorSettings) => void;
};

export default function ToolsPanel({
  settings,
  onSettingsChange
}: ToolsPanelProps) {
  return (
    <div>
      {/* Grid Toggle */}
      <Toggle state={true} onClick={() => null}>
        <FontAwesomeIcon icon={faPen} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faFillDrip} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faSquare} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faCircle} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faSearchPlus} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faHandPaper} />
      </Toggle>
      <Toggle state={false} onClick={() => null}>
        <FontAwesomeIcon icon={faEyeDropper} />
      </Toggle>
      <div>View</div>
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
        <FontAwesomeIcon icon={faCode} />
      </Toggle>
    </div>
  );
}
