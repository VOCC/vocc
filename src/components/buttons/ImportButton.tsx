import React, { useState, useRef } from "react";

type ImportFile = File | null;

interface IProps {
  onFileChange: (imageFile: ImportFile) => void;
}

interface IFile {
  fileName: string;
  hasLoadedFile: boolean;
}

function ImportButton({ onFileChange }: IProps): JSX.Element {
  const [file, setFile] = useState<IFile>({
    fileName: "No file name",
    hasLoadedFile: false
  });
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (fileInput.current) {
      if (fileInput.current.files) {
        setFile({
          fileName: fileInput.current.files[0].name,
          hasLoadedFile: true
        });
        onFileChange(fileInput.current.files[0]);
      }
    }
  };

  const renderLoaded = (fileTitle: string): JSX.Element => (
    <div className="import-loaded">
      Loaded <em>{fileTitle}</em>
    </div>
  );

  const renderUnloaded = (): JSX.Element => (
    <button className="button import-button">
      <label>
        Import
        <input
          type="file"
          accept=".png, .jpg, .jpeg, .bmp, .pal"
          ref={fileInput}
          onChange={handleSubmit}
        />
      </label>
    </button>
  );

  return file.hasLoadedFile ? renderLoaded(file.fileName) : renderUnloaded();
}

export default ImportButton;
