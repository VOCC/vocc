import Bitmap from "../models/Bitmap";
import Bitmap3 from "../models/Bitmap3";
import Color from "../models/Color";
import Palette from "../models/Palette";
import { Dimensions, ImageCoordinates } from "./types";

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

export const loadNewImage = async (imageFile: File): Promise<Bitmap> => {
  let hiddenImage = await loadHiddenImage(imageFile);
  let dimensions = {
    height: hiddenImage.naturalHeight,
    width: hiddenImage.naturalWidth
  };
  let hiddenCanvas = createHiddenCanvas(dimensions);
  const context = hiddenCanvas.getContext("2d");
  if (context) context.drawImage(hiddenImage, 0, 0);
  let imageData = loadImageDataFromCanvas(hiddenCanvas, dimensions);
  return new Bitmap3(imageFile.name, dimensions, imageData);
};

export const offset = (pos: ImageCoordinates, d: Dimensions) =>
  4 * (pos.y * d.width + pos.x);

/**
 * loadNewPalette
 * @param paletteFile .pal file being imported
 * generates a Color[] by iterating through the File
 * returns initialized palette
 */
export const loadNewPalette = async (
  paletteFile: File
): Promise<Palette | null> => {
  let text = await new Response(paletteFile).text();
  let fileString = text
    .trim()
    .replace(/\t/g, "")
    .replace(/\n/g, "");
  let colors: Color[] = new Array(256);

  // checking to make sure string is properly formatted before iterating through it
  if (fileString.substr(0, 4) === "0x00") {
    console.log("Palette file is valid. Generating color array...");

    // string is in 0x00rrggbb format (length 10)
    for (let i = 0, j = 0; i < fileString.length; i += 10, j++) {
      let red = parseInt(fileString.substr(i + 4, 2), 16);
      let green = parseInt(fileString.substr(i + 6, 2), 16);
      let blue = parseInt(fileString.substr(i + 8, 2), 16);

      let color = new Color(red, green, blue, 1);
      colors[j] = color;
    }
    return colors;
  } else {
    console.log("Invalid palette. Palette unchanged.");
    return null;
  }
};
