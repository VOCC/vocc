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
  constructor(colorArray?: Color[]) {
    this.dimensions = {
      height: 16,
      width: 16
    }

    this.colorArray = new Array(this.dimensions.width * this.dimensions.height);
    if (colorArray === undefined) {
      this.colorArray.fill(BLACK);
    } else {
      if (colorArray.length > 256) {
        console.warn(
          "why would you ever try to make a palette bigger than 16x16 -_-");
        this.colorArray = colorArray.slice(0, 255);
      } else {
        this.colorArray = colorArray;
      }
    }
  }

  private setColor(index: number, color: Color) {
    this.colorArray[index] = color;
  }

  private swapIndices(index1: number, index2: number) {
    const size = this.dimensions.width * this.dimensions.height;
    if (index1 >= size || index2 >= size) {
      console.error("cannot swip indices: input out of bounds");
    } else {
      const temp = this.colorArray[index1];
      this.setColor(index1, this.colorArray[index2]);
      this.setColor(index2, temp);
    }
  }

  private groupSwap(start1: number, start2: number, len: number) {
    for(let i = 0; i < len; i++) {
      this.swapIndices(start1 + i, start2 + i);
    }
  }

  public swapRows(row1: number, row2: number) {
    if (row1 >= this.dimensions.height || row2 >= this.dimensions.height) {
      console.error("cannot swap rows: input out of bounds");
    } else {
      console.log("swapping rows...");
      const start1 = row1 * this.dimensions.height
      const start2 = row2 * this.dimensions.height
      this.groupSwap(start1, start2, this.dimensions.width);
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