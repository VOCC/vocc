import { Color, Dimensions, ImageCoordinates } from "../lib/interfaces";
import ImageObject from "./ImageObject";

const BLACK: Color = {
  r: 0,
  g: 0,
  b: 0,
  a: 0
}

export default class Palette {
  private dimensions: Dimensions = {
    height: 16,
    width: 16
  }
  private colorArray: Color[];

  constructor() { // currently only fills palette with black
    this.colorArray = new Array(this.dimensions.height * this.dimensions.width);
    this.colorArray.fill(BLACK);
  }

  public getColorArray() {
    return this.colorArray;
  }

  // function edits array, do not mutate state, return new palette
}