import React from "react";
import ReactDOM from "react-dom";
import { Dimensions } from "../../util/interfaces";

const MIN_IMG_SIZE = 1;
const DEFAULT_IMG_SIZE = 32;

interface NewImageModalProps {
  onAccept: (fileName: string, dimensions: Dimensions) => void;
  onCancel: () => void;
  isShowing: boolean;
  hide: () => void;
}

const handleSubmit = (e: React.FormEvent) => {};

const NewImageModal = ({ isShowing, hide }: NewImageModalProps) =>
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
              <form onSubmit={handleSubmit}>
                <label htmlFor="filename">Enter file name</label>
                <input id="filename" name="filename" type="text" />
                <label htmlFor="height">Height</label>
                <input
                  id="height"
                  type="number"
                  min={MIN_IMG_SIZE}
                  value={DEFAULT_IMG_SIZE}
                ></input>
                <label htmlFor="width">Width</label>
                <input
                  id="width"
                  type="number"
                  min={MIN_IMG_SIZE}
                  value={DEFAULT_IMG_SIZE}
                ></input>
                <button>Create Image</button>
              </form>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;

export default NewImageModal;
