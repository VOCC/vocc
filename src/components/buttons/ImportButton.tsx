import React, { useState, useRef } from "react";

type ImportFile = File | null;

interface IProps {
  buttonLabel: string;
  onFileChange: (imageFile: ImportFile) => void;
}

interface IFile {
  fileName: string;
  hasLoadedFile: boolean;
}

function ImportButton({ onFileChange, buttonLabel }: IProps): JSX.Element {
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

  // const renderLoaded = (fileTitle: string): JSX.Element => (
  //   <div>
  //     <button className="button import-button">
  //     <label>
  //       Import
  //       <input
  //         type="file"
  //         accept=".png, .jpg, .jpeg, .bmp, .pal"
  //         ref={fileInput}
  //         onChange={handleSubmit}
  //       />
  //     </label>
  //   </button>
  //     Loaded <em>{fileTitle}</em>
  //   </div>
  // );

  const render = (): JSX.Element => (
    <button className="button import-button">
      <label>
        {buttonLabel}
        <input
          type="file"
          accept=".png, .jpg, .jpeg, .bmp, .pal"
          ref={fileInput}
          onChange={handleSubmit}
        />
      </label>
    </button>
  );

  return render();
}

export default ImportButton;
