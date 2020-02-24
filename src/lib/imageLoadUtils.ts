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
): Uint8ClampedArray => {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D; // unsafe
  return context.getImageData(0, 0, dimensions.width, dimensions.height).data;
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
  hiddenCanvas.getContext("2d")?.drawImage(hiddenImage, 0, 0);
  let imageData = loadImageDataFromCanvas(hiddenCanvas, dimensions);
  return new ImageObject(imageFile.name, imageData, dimensions);
};

export const offset = (pos: ImageCoordinates, d: Dimensions) =>
  4 * (pos.y * d.width + pos.x);
