import React from 'react';
import Collapsible from 'react-collapsible';

interface IProps {
  exportCode: string
}

function CodePreview( { exportCode }: IProps ): JSX.Element {
  

  return (
    <Collapsible trigger="Code Preview">
      <p>{exportCode}</p>
    </Collapsible>
  );
}

export default CodePreview;