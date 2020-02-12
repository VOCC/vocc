import { Color, Dimensions } from "../../lib/interfaces";
import ImageObject from "./ImageObject";

const BLACK: Color = {
  r: 0,
  g: 0,
  b: 0,
  a: 1
}

const RED: Color = {
  r: 255,
  g: 0,
  b: 0,
  a: 1
}

const GREEN: Color = {
  r: 0,
  g: 255,
  b: 0,
  a: 1
}

const BLUE: Color = {
  r: 0,
  g: 0,
  b: 255,
  a: 1
}

export default class Palette {
  private dimensions: Dimensions;
  private colorArray: Color[];

  // constructor input will be the inputs needed for generatePalette() function
  constructor(image?: ImageObject, colorArray?: Color[], dimensions?: Dimensions) { // currently only fills palette with black
    if (dimensions === undefined) {
      if (image === undefined) {
        this.dimensions = {
          height: 16,
          width: 16
        }
      } else {
        this.dimensions = image.getImageDimensions();
      }
    } else {
      this.dimensions = dimensions;
    }
    this.colorArray = new Array(this.dimensions.height * this.dimensions.width);
    if (colorArray !== undefined) {
      this.colorArray = colorArray;
      return;
    }

    if (image === undefined) {
      this.colorArray.fill(BLACK);
    } else {
      ///////// replace this with generatePalette() function
      for (var i = 0; i < 256; i++) {
        if (i % 4 === 0) {
          this.colorArray[i] = RED;
        }
        if (i % 4 === 1) {
          this.colorArray[i] = GREEN;
        }if (i % 4 === 2) {
          this.colorArray[i] = BLUE;
        }if (i % 4 === 3) {
          this.colorArray[i] = BLACK;
        }
      }
      //////////////////////////////////////////////////////
    }
  }

  public getColorArray() {
    return this.colorArray;
  }

  public getDimensions() {
    return this.dimensions;
  }

  // public setColorArray(colorArray: Color[]) {
  //   this.colorArray = colorArray;
  // }
  
  // function edits array, do not mutate state, return new palette
}