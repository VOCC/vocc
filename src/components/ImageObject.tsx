import { Color, Dimensions, ImageCoordinates } from "../lib/interfaces";

export default class ImageObject {
  public fileName: string;
  public dimensions: Dimensions = {
    height: 32,
    width: 32
  };

  private hiddenCanvas: HTMLCanvasElement;
  private hiddenImage: HTMLImageElement;
  private imageData: Uint8ClampedArray;

  constructor(imageData?: Uint8ClampedArray, dimensions?: Dimensions) {
    this.fileName = "img";
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
}

export const loadNewImage = async (imageFile: File): Promise<ImageObject> => {
  let hiddenImage = await loadHiddenImage(imageFile);
  let dimensions = {
    height: hiddenImage.naturalHeight,
    width: hiddenImage.naturalWidth
  };

  let hiddenCanvas = createHiddenCanvas(dimensions);
  const context = hiddenCanvas.getContext("2d");
  if (context != null) {
    context.drawImage(hiddenImage, 0, 0);
    let imageData = loadImageDataFromCanvas(hiddenCanvas, dimensions);
    if (imageData) {
      return new ImageObject(imageData, dimensions);
    }
  }
  console.warn("Couldn't load image - loaded blank image instead.");
  return new ImageObject();
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

export const loadHiddenImage = async (
  imagefile: File
): Promise<HTMLImageElement> => {
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
