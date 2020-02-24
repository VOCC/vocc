import { Dimensions, ImageCoordinates } from "./interfaces";
import ImageObject from "../components/objects/Bitmap3";

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

export const loadNewImage = async (imageFile: File): Promise<ImageObject> => {
  console.log("Loading new image from file...");
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
      return new ImageObject(imageFile.name, imageData, dimensions);
    }
  }
  console.warn("Couldn't load image - loaded blank image instead.");
  return new ImageObject("img");
};

export const offset = (pos: ImageCoordinates, d: Dimensions) =>
  4 * (pos.y * d.width + pos.x);
