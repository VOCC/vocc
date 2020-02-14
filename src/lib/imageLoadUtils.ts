import { Dimensions, ImageCoordinates } from "./interfaces";

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

export const offset = (pos: ImageCoordinates, d: Dimensions) =>
  4 * (pos.y * d.width + pos.x);
