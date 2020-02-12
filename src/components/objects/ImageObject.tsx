import {
  Color,
  Dimensions,
  ModifiableImage,
  ImageCoordinates
} from "../../lib/interfaces";

export default class ImageObject implements ModifiableImage {
  public fileName: string;
  public dimensions: Dimensions = {
    height: 32,
    width: 32
  };

  private hiddenCanvas: HTMLCanvasElement;
  private hiddenImage: HTMLImageElement;
  private imageData: Uint8ClampedArray;

  private imageFileBlob: Blob;
  private blankImage: boolean;

  constructor(
    fileName: string,
    blankImage: boolean,
    imageData?: Uint8ClampedArray,
    dimensions?: Dimensions,
    imageFileBlob?: Blob
  ) {
    this.fileName = fileName;
    this.blankImage = blankImage;
    this.imageFileBlob = imageFileBlob? imageFileBlob : new Blob();
    this.hiddenImage = document.createElement("img");
    this.hiddenImage.height = this.dimensions.height;
    this.hiddenImage.width = this.dimensions.width;
    this.hiddenCanvas = createHiddenCanvas(this.dimensions);

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
        r: this.imageData[offset(pos, this.dimensions)],
        g: this.imageData[offset(pos, this.dimensions) + 1],
        b: this.imageData[offset(pos, this.dimensions) + 2],
        a: this.imageData[offset(pos, this.dimensions) + 3]
      };
    }
  }

  public setPixelColor(pos: ImageCoordinates, paletteIndex: number) {
    console.warn(
      "Method setPixelColor in ImageObject not implemented yet. " +
        "Returning the current image."
    );
    return this;
  }

  public getImageFileBlob(): Blob {
    return this.imageFileBlob;
  }

  public isBlankImage(): boolean {
    return this.blankImage;
  }
}

export const loadNewImage = async (imageFile: File): Promise<ImageObject> => {
  let hiddenImage = await loadHiddenImage(imageFile);
  let dimensions = {
    height: hiddenImage.naturalHeight,
    width: hiddenImage.naturalWidth
  };
  let imageFileBlob = new Blob([imageFile]);
  let hiddenCanvas = createHiddenCanvas(dimensions);
  const context = hiddenCanvas.getContext("2d");
  if (context != null) {
    context.drawImage(hiddenImage, 0, 0);
    let imageData = loadImageDataFromCanvas(hiddenCanvas, dimensions);
    if (imageData) {
      return new ImageObject(imageFile.name, false, imageData, dimensions, imageFileBlob);
    }
  }
  console.warn("Couldn't load image - loaded blank image instead.");
  return new ImageObject("img", true);
};

export const createHiddenCanvas = (d: Dimensions): HTMLCanvasElement => {
  let hiddenCanvas = document.createElement("canvas");
  hiddenCanvas.hidden = true;
  hiddenCanvas.setAttribute("height", d.height + "px");
  hiddenCanvas.setAttribute("width", d.width + "px");
  return hiddenCanvas;
};

export const loadImageDataFromCanvas = (
  canvas: HTMLCanvasElement,
  dimensions: Dimensions
): Uint8ClampedArray | void => {
  const context = canvas.getContext("2d");
  if (context == null) return;
  const _data = context.getImageData(0, 0, dimensions.width, dimensions.height);
  return _data.data;
};

// is async necessary here???? I don't think it is
export const loadHiddenImage = (imagefile: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.hidden = true;

    image.onload = () => {
      resolve(image);
    };

    image.onerror = reject;
    image.src = URL.createObjectURL(imagefile);
  });
};

const offset = (pos: ImageCoordinates, d: Dimensions) =>
  4 * (pos.y * d.width + pos.x);
