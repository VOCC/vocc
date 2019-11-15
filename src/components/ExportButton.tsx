import React from "react";
import { Button } from "./Button";

export default class ExportButton extends React.Component {
  render() {
    return <Button onClick={this.handleClick} message={"Export as .c"} />;
  }
  handleClick() {
    console.log("exporting image");
  }
}
