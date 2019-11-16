import React from "react";
import "../styles/buttons.scss";

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
        // alert(`Successfully imported ${this.state.fileName}`);
      }
    }
  }

  renderLoaded = (imageTitle: string) => (
    <div className="import-loaded">
      Loaded <em>{imageTitle}</em>
    </div>
  );

  renderUnloaded = () => (
    <button className="button import-button">
      <label>
        Import Image
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          ref={this.fileInput}
          onChange={e => this.handleSubmit(e)}
        />
      </label>
    </button>
  );

  render() {
    // return <Button onClick={this.handleClick} message={"Import Image"} />;
    return this.state.hasLoadedImage
      ? this.renderLoaded(this.state.fileName)
      : this.renderUnloaded();
  }
}
