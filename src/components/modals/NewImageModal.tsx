import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Dimensions } from "../../util/interfaces";

const MIN_IMG_SIZE = 1;

interface NewImageModalProps {
  onAccept: (fileName: string, dimensions: Dimensions) => void;
  isShowing: boolean;
  hide: () => void;
}

interface NewImageFormProps {
  onAccept: (fileName: string, dimensions: Dimensions) => void;
}

const NewImageModal = ({ onAccept, isShowing, hide }: NewImageModalProps) =>
  isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <div className="modal-overlay" />
          <div
            className="modal-wrapper"
            aria-modal
            aria-hidden
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal">
              New Image
              <NewImageForm
                onAccept={(fileName, dimensions) => {
                  onAccept(fileName, dimensions);
                  hide();
                }}
              ></NewImageForm>
              <button onClick={hide}>Cancel</button>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;

const NewImageForm = ({ onAccept }: NewImageFormProps) => {
  const [fileName, setFileName] = useState<string>("img");
  const [height, setHeight] = useState<number>(32);
  const [width, setWidth] = useState<number>(32);

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFileName(e.target.value);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setHeight(parseInt(e.target.value));

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setWidth(parseInt(e.target.value));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAccept(fileName, { height, width });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="filename">Enter file name</label>
      <input
        id="filename"
        name="filename"
        type="text"
        value={fileName}
        onChange={handleFileNameChange}
      />
      <br />
      <label htmlFor="height">Height</label>
      <input
        id="height"
        type="number"
        min={MIN_IMG_SIZE}
        value={height}
        onChange={handleHeightChange}
      />
      <br />
      <label htmlFor="width">Width</label>
      <input
        id="width"
        type="number"
        min={MIN_IMG_SIZE}
        value={width}
        onChange={handleWidthChange}
      />
      <br />
      <button>Create Image</button>
    </form>
  );
};

export default NewImageModal;
