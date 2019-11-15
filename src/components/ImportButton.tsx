import React from "react";
import { Button } from "./Button";
// import { importImage } from "../lib/importExport";

export default class ImportButton extends React.Component {
  fileInput: React.RefObject<HTMLInputElement>;
  state: {
    fileName: string;
    hasLoadedImage: boolean;
  };

  constructor(props: {}) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
    this.state = {
      fileName: "No file name",
      hasLoadedImage: false
    };
  }

  handleSubmit(event: React.FormEvent<HTMLInputElement>) {
    event.preventDefault();
    if (this.fileInput.current) {
      if (this.fileInput.current.files) {
        this.setState({
          fileName: this.fileInput.current.files[0].name,
          hasLoadedImage: true
        });
        alert(`Successfully imported ${this.state.fileName}`);
      }
    }
  }

  renderLoaded = (imageTitle: string) => (
    <div>Successfully loaded {imageTitle}</div>
  );

  renderUnloaded = () => (
    <div>
      <label>Import Image</label>
      <input
        type="file"
        accept=".png, .jpg, .jpeg"
        ref={this.fileInput}
        onChange={e => this.handleSubmit(e)}
      />
    </div>
  );

  render() {
    // return <Button onClick={this.handleClick} message={"Import Image"} />;
    return this.state.hasLoadedImage
      ? this.renderLoaded(this.state.fileName)
      : this.renderUnloaded();
  }
}
