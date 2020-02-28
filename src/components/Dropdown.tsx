import React from "react";
import { EditorSettings, DropdownMenu } from "../lib/interfaces";
import { settings } from "cluster";
import ReactDOM from "react-dom";


// https://www.codementor.io/@chrisharrington/create-a-dropdown-using-react-js--font-awesome-and-less-css-du1087rsx
// https://reactjs.org/docs/web-components.html
// how to implement dropdown

type DropdownProps = {
  type: DropdownMenu;
  settings?: EditorSettings;
  onSettingsChange?: (newSettings: EditorSettings) => void;

};

export default function Dropdown({
  type,
  settings,
  onSettingsChange
}: DropdownProps) {
  
  return (
    <div className="App">
      <div className="container">
        <button type="button">
          {type}
        </button>
      </div>
    </div>
  );
}

class Xsearch extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('span');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    const name = this.getAttribute('name');
    const url = 'https://www.google.com/search?q=' + name;
    ReactDOM.render(<a href={url}>{name}</a>, mountPoint);
  }
}


customElements.define("x-search", Xsearch);