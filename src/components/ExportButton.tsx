import React from "react";
import "../styles/buttons.scss";

interface ExportButtonProps {
  startImageExport: () => void;
}

class ExportButton extends React.Component<ExportButtonProps> {
  render() {
    return (
      <button
        className="button export-button"
        onClick={this.props.startImageExport}
      >
        Export
      </button>
    );
  }
}

export default ExportButton;
