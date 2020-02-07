import React from "react";
import { EditorSettings } from "../lib/interfaces";
import Toggle from "./buttons/Toggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBorderAll } from "@fortawesome/free-solid-svg-icons";

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
    </div>
  );
}
