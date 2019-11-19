import React from "react";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import ImageCanvas from "./ImageCanvas";
import "../styles/app.scss";

class App extends React.Component {
  // imageFile: File | null
  state: {
    imageFile: File | null;
  };

  constructor(props: {}) {
    super(props);
    this.state = {
      imageFile: null
    };
  }

  handleImageChange = async (imageFile: any) => {
    this.setState({
      imageFile: imageFile
    });
    // console.log(this.state.imageFile);
  };

  render() {
    return (
      <div className="app-container">
        <div className="navbar">
          <span className="title">VOCC</span>
          <span className="subtitle">
            Game Boy Advance Image Editor and Converter
          </span>
          <ImportButton
            onImageChange={(imageFile: File) =>
              this.handleImageChange(imageFile)
            }
          />
          <ExportButton />
        </div>
        <div className="workspace-container">
          <div className="left-panel">
            <div className="panel-label">Tools</div>
          </div>
          <div className="image-container">
            {this.state.imageFile ? (
              <ImageCanvas imageFile={this.state.imageFile} />
            ) : null}
          </div>
          <div className="right-panel">
            <div className="panel-label">Color Palette</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
