interface Dimensions {
  height: number;
  width: number;
}

interface PixelCoordinates {
  x: number;
  y: number;
}

const COLORS = {
  R: "r",
  G: "g",
  B: "b"
};

interface color {
  r: number;
  g: number;
  b: number;
}

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

  public getPixelColorAt(pos: PixelCoordinates) {
    const context = this.hiddenCanvas.getContext("2d");
    if (context == null) return `rgba(0, 0, 0, 1)`;
    const r = this.imageData[offset(pos, this.dimensions)];
    const g = this.imageData[offset(pos, this.dimensions) + 1];
    const b = this.imageData[offset(pos, this.dimensions) + 2];
    return `rgb(${r}, ${g}, ${b})`;
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

const offset = (pos: PixelCoordinates, d: Dimensions) =>
  3 * (pos.y * d.width + pos.x);

// function pixel8(image: File, x: number, y: number, w: number, h: number) {
//   "use strict";

//   // Defaults for x-offset, y-offset, width, and height values
//   if (typeof x !== "number") x = 0;
//   if (typeof y !== "number") y = 0;
//   if (typeof w !== "number") w = image.width;
//   if (typeof h !== "number") h = image.height;

//   // For our friend Internet Explorer, FlashCanvas is supported
//   // ExplorerCanvas does not support the getImageData function
//   var canvas = document.createElement("canvas");
//   if (canvas.getContext) var ctx = canvas.getContext("2d");
//   else return;

//   // Draw the image/canvas/video and return a CanvasPixelArray of pixel data
//   // Image must be from the same origin! Use a server-side proxy if you need cross-domain resources.
//   // Like this one: http://benalman.com/projects/php-simple-proxy/
//   // See https://developer.mozilla.org/en-US/docs/HTML/Canvas/Pixel_manipulation_with_canvas
//   // to find out how to get specific data from the array
//   // Or just use the pixel8-provided methods below
//   ctx.drawImage(image, x, y);
//   var _data = ctx.getImageData(0, 0, w, h);
//   var data = _data.data;
//   data.width = _data.width;
//   data.height = _data.height;

//   // Returns {red, green, blue, alpha} object of a single specified pixel
//   // or sets the specified pixel.
//   data.draw = function(ctx, x, y) {
//     ctx.putImageData(_data, x, y);
//   };

//   return data;
// }

// function pixelAt(x, y, set) {
//   var i = y * this.width * 4 + x * 4;

//   if (set) {
//     this[i] = set.red;
//     this[i + 1] = set.green;
//     this[i + 2] = set.blue;
//     this[i + 3] = set.alpha;
//   } else
//     return {
//       red: this[i],
//       green: this[i + 1],
//       blue: this[i + 2],
//       alpha: this[i + 3]
//     };
// }
