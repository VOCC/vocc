import React from "react";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import "../styles/app.scss";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="navbar">
        <span className="title">VOCC</span>
        <span className="subtitle">
          Game Boy Advance Image Editor and Converter
        </span>
        <ImportButton />
        <ExportButton />
      </div>
      <div className="workspace-container">
        <div className="left-panel">
          <div className="panel-label">Tools</div>
        </div>
        <div className="image-container"></div>
        <div className="right-panel">
          <div className="panel-label">Color Palette</div>
        </div>
      </div>
    </div>
  );
};

export default App;
