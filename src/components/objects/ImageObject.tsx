import {
  Color,
  Dimensions,
  ModifiableImage,
  ImageCoordinates
} from "../../lib/interfaces";
import * as Loader from "../../lib/imageLoadUtils";

export default class ImageObject implements ModifiableImage {
  public fileName: string;
  public dimensions: Dimensions = {
    height: 32,
    width: 32
  };

  private hiddenCanvas: HTMLCanvasElement;
  private hiddenImage: HTMLImageElement;
  private imageData: Uint8ClampedArray;

  constructor(
    fileName: string,
    imageData?: Uint8ClampedArray,
    dimensions?: Dimensions
  ) {
    this.fileName = fileName;
    this.hiddenImage = document.createElement("img");
    this.hiddenImage.height = this.dimensions.height;
    this.hiddenImage.width = this.dimensions.width;
    this.hiddenCanvas = Loader.createHiddenCanvas(this.dimensions);

    if (imageData) {
      this.imageData = imageData;
      if (dimensions) {
        this.dimensions = dimensions;
      }
    } else {
      this.imageData = new Uint8ClampedArray(
        this.dimensions.height * this.dimensions.width
      );
    }
  }

  public getImageData(): Uint8ClampedArray {
    return this.imageData;
  }

  public getImageDimensions() {
    return this.dimensions;
  }

  public getPixelColorAt(pos: ImageCoordinates): Color {
    const context = this.hiddenCanvas.getContext("2d");
    if (context == null) {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      };
    } else {
      return {
        r: this.imageData[Loader.offset(pos, this.dimensions)],
        g: this.imageData[Loader.offset(pos, this.dimensions) + 1],
        b: this.imageData[Loader.offset(pos, this.dimensions) + 2],
        a: this.imageData[Loader.offset(pos, this.dimensions) + 3]
      };
    }
  }

  public setPixelColor(
    pos: ImageCoordinates,
    paletteIndex: number
  ): ModifiableImage {
    console.warn(
      "Method setPixelColor in ImageObject not implemented yet. " +
        "Returning the current image."
    );
    return this;
  }

  public async getImageFileBlob(): Promise<Blob | null> {
    let blob = new Blob();
    for (let r = 0; r < this.dimensions.height; r++) {
      for (let c = 0; c < this.dimensions.height; c++) {}
    }
    return blob;
  }
}

export const loadNewImage = async (imageFile: File): Promise<ImageObject> => {
  let hiddenImage = await Loader.loadHiddenImage(imageFile);
  let dimensions = {
    height: hiddenImage.naturalHeight,
    width: hiddenImage.naturalWidth
  };
  let hiddenCanvas = Loader.createHiddenCanvas(dimensions);
  const context = hiddenCanvas.getContext("2d");
  if (context != null) {
    context.drawImage(hiddenImage, 0, 0);
    let imageData = Loader.loadImageDataFromCanvas(hiddenCanvas, dimensions);
    if (imageData) {
      return new ImageObject(imageFile.name, imageData, dimensions);
    }
  }
  console.warn("Couldn't load image - loaded blank image instead.");
  return new ImageObject("img");
};
