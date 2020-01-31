import React, { useState } from "react";
import { EditorSettings } from "../lib/interfaces";
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
      <Toggle
        state={true}
        onClick={() => {
          let newSettings = { ...settings };
          newSettings.grid = !settings.grid;
          onSettingsChange(newSettings);
        }}
      >
        Grid
      </Toggle>
    </div>
  );
}
