import React from 'react';
import { Color, Dimensions, ImageCoordinates } from "../lib/interfaces";

export default class PaletteObject {
  private dimensions: Dimensions = {
    height: 16,
    width: 16
  }
  private colorArray: Color[];

  constructor() {
    this.colorArray = new Array(this.dimensions.height + this.dimensions.width);
  }

  // function edits array, do not mutate state, return new palette
}