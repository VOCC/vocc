import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Dimensions } from "../../util/types";

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
              <div className="modal-header">Create a New Image</div>
              <NewImageForm
                onAccept={(fileName, dimensions) => {
                  onAccept(fileName, dimensions);
                  hide();
                }}
              ></NewImageForm>
              <div className="modal-button-right">
                <button onClick={hide} className="modal-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;

const NewImageForm = ({ onAccept }: NewImageFormProps) => {
  const [fileName, setFileName] = useState<string>("untitled");
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
      <div className="modal-input-text">
        <label htmlFor="filename" className="modal-label">
          Name:
        </label>
        <input
          id="filename"
          name="filename"
          type="text"
          value={fileName}
          onChange={handleFileNameChange}
        />
      </div>
      <br />
      <label className="modal-label">Image Size</label>
      <div className="modal-input-num">
        <label htmlFor="height" className="modal-label-num">
          Height:
        </label>
        <input
          id="height"
          type="number"
          min={MIN_IMG_SIZE}
          value={height}
          onChange={handleHeightChange}
        />
        <label>&nbsp;px</label>
        <br />
        <label htmlFor="width" className="modal-label-num">
          Width:
        </label>
        <input
          id="width"
          type="number"
          min={MIN_IMG_SIZE}
          value={width}
          onChange={handleWidthChange}
        />
        <label>&nbsp;px</label>
      </div>
      <br />
      <div className="modal-button-left">
        <button className="modal-button">OK</button>
      </div>
    </form>
  );
};

export default NewImageModal;
