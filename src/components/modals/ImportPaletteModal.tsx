import React, { useState } from "react";
import ReactDOM from "react-dom";
import ImportButton from "../buttons/ImportButton";
import Palette from "../../models/Palette";
import DEFAULT_PALETTE from "../../util/defaultPalette";
import { loadNewPalette } from "../../util/fileLoadUtils";

interface ImportPaletteModalProps {
  onAccept: (pal: Palette, oldStartRow: number, newStartRow: number, numRows: number) => void;
  isShowing: boolean;
  hide: () => void;
  oldPal: Palette;
}

interface ImportPaletteFormProps {
  onAccept: (pal: Palette, oldStartRow: number, newStartRow: number, numRows: number) => void;
  oldPal: Palette;
}

const ImportPaletteModal = ({ onAccept, isShowing, hide, oldPal }: ImportPaletteModalProps) =>
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
              <div className="modal-header">Import a New Palette</div>
              <ImportPaletteForm
                onAccept={(pal, oldStartRow, newStartRow, numRows) => {
                  onAccept(pal, oldStartRow, newStartRow, numRows);
                  hide();
                }}
                oldPal={oldPal}
              ></ImportPaletteForm>
              <div className="modal-button-right">
                <button onClick={hide} className="modal-button">Cancel</button>
              </div>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;

const ImportPaletteForm = ({ onAccept, oldPal }: ImportPaletteFormProps) => {
  const [pal, setPal] = useState<Palette>(DEFAULT_PALETTE);
  const [oldStartRow, setOldStartRow] = useState<number>(0);
  const [newStartRow, setNewStartRow] = useState<number>(0);
  const [numRows, setNumRows] = useState<number>(16);

  const handleFileInputChange = (
    element: HTMLInputElement | null,
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();
    if (!element || !element.files) return;
    handlePaletteLoad(element.files[0]);
  };

  const handlePaletteLoad = async (palFile: File | null) => {
    if (palFile) {
      console.log("Loading palette from file...");
      let newPalette = await loadNewPalette(palFile);
      if (newPalette) {
        setPal(newPalette);
      }
    }
  };


  const handleOldStartRowChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setOldStartRow(parseInt(e.target.value));

  const handleNewStartRowChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewStartRow(parseInt(e.target.value));
  
  const handleNumRowsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNumRows(parseInt(e.target.value));

  /**
   * On submit, we combine the palettes and pass back the updated palette
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    combinePals(oldPal, pal, oldStartRow, newStartRow, numRows);
    onAccept(oldPal, oldStartRow, newStartRow, numRows);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-input-text">
      <ImportButton
            onFileInputChange={handleFileInputChange}
            buttonLabel="Color Palette (*.pal)"
          />
      </div>      
      <br />
      <label className="modal-label">Palette Rows (0-15)</label>
      <div className="modal-input-num">
        <label htmlFor="startRow" className="modal-label-num">Current Palette Starting Row:</label>
        <input
          id="start"
          type="number"
          min={0}
          max={16}
          value={oldStartRow}
          onChange={handleOldStartRowChange}
        />
        <br />
        <label htmlFor="startRow" className="modal-label-num">Imported Palette Starting Row:</label>
        <input
          id="start"
          type="number"
          min={0}
          max={16}
          value={newStartRow}
          onChange={handleNewStartRowChange}
        />
        <br />
        <label htmlFor="numRows" className="modal-label-num">Number of Rows:</label>
        <input
          id="width"
          type="number"
          min={0}
          max={16}          
          value={numRows}
          onChange={handleNumRowsChange}
        />
      </div>
      <br />
      <div className="modal-button-left">
      <button className="modal-button">OK</button>
      </div>
    </form>
  );
};

/**
 * Function for combining two palettes
 * @param oldPal old Palette
 * @param newPal new Palette
 * @param oldStartRow start row of old Palette
 * @param newStartRow start row of new Palette
 * @param numRows number of rows to replace
 * This function overwrites a given number of rows on 
 * the old Palette with rows from the new Palette
 */
const combinePals = (
  oldPal: Palette, 
  newPal: Palette, 
  oldStartRow: number,
  newStartRow: number, 
  numRows: number
): void => {
   for(let i = 0; i < numRows * 16; i++) {
      oldPal[i + oldStartRow * 16] = newPal[i + newStartRow * 16];
   }
}

export default ImportPaletteModal;
