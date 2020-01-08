import React, { useState, useRef } from "react";
import "../styles/buttons.scss";
import { file } from "@babel/types";

///////////// Type Definitions:
type ImageFile = File | null;
interface IProps {
  handleImageChange: (imageFile: ImageFile) => void;
};
interface IState {
  fileName: string
  hasLoadedImage: boolean
}

function ImportButton({handleImageChange}: IProps): JSX.Element {
  const [file, setImageFile] = useState<IState>({
    fileName: "No file name",
    hasLoadedImage: false
  });
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (fileInput.current) {
      if (fileInput.current.files) {
        setImageFile({
          fileName: fileInput.current.files[0].name,
          hasLoadedImage: true
        });
        // alert(`Successfully imported ${this.state.fileName}`);
        handleImageChange(fileInput.current.files[0]);
      }
    }
  }

  const renderLoaded = (imageTitle: string): JSX.Element => (
    <div className="import-loaded">
      Loaded <em>{imageTitle}</em>
    </div>
  );

  const renderUnloaded = (): JSX.Element => (
    <button className="button import-button">
      <label>
        Import Image
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          ref={fileInput}
          onChange={handleSubmit}
        />
      </label>
    </button>
  );

  // return <Button onClick={this.handleClick} message={"Import Image"} />;
  return file.hasLoadedImage
    ? renderLoaded(file.fileName)
    : renderUnloaded();
}

export default ImportButton;