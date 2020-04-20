import React, { useRef } from "react";

type ImportFile = File | null;

interface IProps {
  buttonLabel: string;
  onFileInputChange: (
    element: HTMLInputElement | null,
    event: React.FormEvent<HTMLInputElement>
  ) => void;
}

function ImportButton({ onFileInputChange, buttonLabel }: IProps): JSX.Element {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <label>{buttonLabel}
        <input
          type="file"
          accept=".png, .jpg, .jpeg, .bmp, .pal"
          ref={fileInput}
          onChange={e => onFileInputChange(fileInput.current, e)}
        />
      </label>
    </>
  );
}

export default ImportButton;
