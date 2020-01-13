interface Dimensions {
  height: number;
  width: number;
}

export default class ImageObject {
  hiddenCanvas: HTMLCanvasElement;
  hiddenImage: HTMLImageElement;
  dimensions: Dimensions = {
    height: 32,
    width: 32
  };

  constructor() {
    this.hiddenImage = document.createElement("img");
    this.hiddenImage.height = this.dimensions.height;
    this.hiddenImage.width = this.dimensions.width;
    this.hiddenCanvas = this.createHiddenCanvas(this.dimensions);
  }

  async loadImage(imageFile: File) {
    this.hiddenImage = await this.loadHiddenImage(imageFile);
    this.setDimensions({
      height: this.hiddenImage.naturalHeight,
      width: this.hiddenImage.naturalWidth
    });
    this.hiddenCanvas = this.createHiddenCanvas(this.dimensions);
    console.log(this.dimensions);
  }

  private loadHiddenImage(imageFile: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.hidden = true;
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(imageFile);
    });
  }

  private createHiddenCanvas(d: Dimensions): HTMLCanvasElement {
    let hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.hidden = true;
    hiddenCanvas.setAttribute("height", this.dimensions.height + "px");
    hiddenCanvas.setAttribute("width", this.dimensions.width + "px");
    return hiddenCanvas;
  }

  setDimensions(d: Dimensions) {
    this.dimensions = d;
  }
}

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
