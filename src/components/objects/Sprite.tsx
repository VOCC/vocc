import ImageObject from "./ImageObject";
import { Dimensions } from "../../lib/interfaces";

export default class Sprite {
  private indexArray: number[];
  private dimensions: Dimensions;

  constructor(image?: ImageObject) {
    if (image === undefined) {
      this.dimensions = {
        height: 0,
        width: 0
      };
    } else {
      this.dimensions = {
        height: image.dimensions.height,
        width: image.dimensions.width
      };
    }
    this.indexArray = new Array(this.dimensions.height * this.dimensions.width);
  }

  public getIndexArray() {
    return this.indexArray;
  }

  public setIndexArray(indexArray: number[]) {
    this.indexArray = indexArray;
  }
}
