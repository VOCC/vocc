import React from "react";
import "../styles/buttons.scss";

export default class ExportButton extends React.Component {
  render() {
    return (
      <button
        className="button export-button"
        onClick={() => this.handleClick()}
      >
        Export
      </button>
    );
  }

  handleClick() {
    console.log("exporting image");
  }
}
