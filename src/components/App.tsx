import React from "react";
import "../styles/App.css";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";

const App: React.FC = () => {
  return (
    <div>
      <ImportButton />
      <ExportButton />
    </div>
  );
};

export default App;
