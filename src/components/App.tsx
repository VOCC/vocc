import React from "react";
import "../styles/App.css";

const App: React.FC = () => {
  return (
    <div>
      <ImportButton />
      <ExportButton />
    </div>
  );
};

type ButtonProps = {
  message: string;
};

const Button = ({ message: message }: ButtonProps) => (
  <button>{message}</button>
);

class ImportButton extends React.Component {
  render() {
    return <Button message={"Import Image"} />;
  }
}

class ExportButton extends React.Component {
  render() {
    return <Button message={"Export as .c"} />;
  }
}

export default App;
