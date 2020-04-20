import Color from "../models/Color";
import Bitmap3 from "../models/Bitmap3";
import Palette from "../models/Palette";
import { PALETTE_LENGTH } from "./consts";
import { Dimensions, ImageInterface, Mode } from "./types";

export enum exportType {
  GBA,
  PAL,
  BMP,
  PNG,
  BG,
}

/*
  getGBAImageString

  take in ImageObject and Palette
  get the image array from image2GBA
  get the palette array from pal2GBA
  returns the combination of them into one string
*/
export function generateCSourceFileString(
  image: ImageInterface,
  mode: Mode,
  palette?: Palette
): string {
  switch (mode) {
    case 3:
      return generateMode3CSourceFileString(image);
    case 4:
      return generateMode4CSourceFileString(image, palette);
    default:
      return generateMode3CSourceFileString(image);
  }
}

/**
 * "Poor man's" background export function. Exports the entire source code for
 * a background generated using mode 3 bitmap data.
 * @param image the mode 3 bitmap to export as a background
 */
//TODO :Rename
export function mode3BitmapAsTiledBackgroundSource(image: Bitmap3): string {
  return "have fun!";
}

/**
 * "Poor man's" background header export function. Exports the header file data
 * for a background generated using mode 3 bitmap data.
 * @param image the mode 3 bitmap to export as a background
 */
export function mode3BitmapAsBackgroundHeader(image: Bitmap3): string {
  return "";
}

function generateMode3CSourceFileString(image: ImageInterface): string {
  const { fileName, dimensions, imageData } = image.imageDataStore;

  const variableName = fileName.slice(0, fileName.lastIndexOf("."));
  const bitmapLength = dimensions.height * dimensions.width;
  const imageDefinitionString = `const unsigned short ${variableName}Bitmap[${
    bitmapLength / 2
  }]__attribute__((aligned(4)))=\n{\n\t`;

  let imageDataHexString = ``;

  let pixelCount = 0;
  for (var i = 0, j = imageData.length; i < j; i += 4) {
    let bgr = [imageData[i + 2], imageData[i + 1], imageData[i]]; // bgr for little endian
    let hexcode = pixelToHex(bgr);
    imageDataHexString += hexcode + ",";
    pixelCount++;
    if (pixelCount % 8 === 0) {
      imageDataHexString += "\n";
      if (pixelCount % 64 === 0) {
        imageDataHexString += "\n\t";
      } else {
        imageDataHexString += "\t";
      }
    }
  }

  const imageDefinitionEnd = `\n};\n`;

  return imageDefinitionString + imageDataHexString + imageDefinitionEnd;
}

function generateMode4CSourceFileString(
  image: ImageInterface,
  palette?: Palette
): string {
  if (!palette) {
    console.error(
      "Tried to generate mode 4 header string with no palette! Falling back to mode 3..."
    );
    return generateMode3CSourceFileString(image);
  }

  const { fileName, dimensions, imageData } = image.imageDataStore;

  // Note: we compress the length of the bitmap by 2 because we can fit 2 chars
  // into a short
  const variableName = fileName.slice(0, fileName.lastIndexOf("."));
  const bitmapLength = dimensions.height * dimensions.width;
  const imageDefinitionString = `const unsigned short ${variableName}Bitmap[${
    bitmapLength / 2
  }]__attribute__((aligned(4)))=\n{\n`;

  let imageDataHexString = "";
  for (let i = 0; i < imageData.length; i += 2) {
    imageDataHexString += paletteIndicesToHex(imageData[i], imageData[i + 1]);
    if ((i / 2 + 1) % 8 === 0) imageDataHexString += `\n`;
  }
  const imageDefinitionEnd = `};\n\n`;

  // Palette length is uncompressed
  const paletteCSourceString = PaletteToGBA(palette);

  const CSourceString =
    imageDefinitionString +
    imageDataHexString +
    imageDefinitionEnd +
    paletteCSourceString;

  return CSourceString;
}

interface headerFileParams {
  fileName: string;
  imageDimensions: Dimensions;
  palette?: Palette;
}

export function generateHeaderString(
  params: headerFileParams,
  mode: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
): string {
  switch (mode) {
    case 3:
      return generateMode3HeaderString(params);
    case 4:
      return generateMode4HeaderString(params);
    default:
      console.warn(
        `Attempting to generate header file for mode ${mode}, but it's unsupported for now. Defaulting to mode 3.`
      );
      return generateMode3HeaderString(params);
  }
}

export function generateMode3HeaderString({
  fileName,
  imageDimensions,
  palette,
}: headerFileParams): string {
  const variableName = fileName.slice(0, fileName.lastIndexOf("."));
  const bitmapLength = imageDimensions.height * imageDimensions.width;
  const bitmapSize = bitmapLength * 2;
  // TODO: Find out how to compute the size vs. the length of the bitmap
  const bitmapSizeDefinition = `#define ${variableName.toUpperCase()}_SIZE ${bitmapSize}\n`;
  const bitmapLengthDefinition = `#define ${variableName.toUpperCase()}_LENGTH ${bitmapLength}\n`;
  const imageHeightDefinition = `#define ${variableName.toUpperCase()}_HEIGHT ${
    imageDimensions.height
  }\n`;
  const imageWidthDefinition = `#define ${variableName.toUpperCase()}_WIDTH ${
    imageDimensions.width
  }\n`;
  const imageDefinitionString = `extern const unsigned short ${variableName}Bitmap[${bitmapLength}];\n\n`;

  const headerString =
    bitmapLengthDefinition +
    bitmapSizeDefinition +
    imageHeightDefinition +
    imageWidthDefinition +
    `\n` +
    imageDefinitionString +
    `\n`;

  return headerString;
}

export function generateMode4HeaderString({
  fileName,
  imageDimensions,
  palette,
}: headerFileParams): string {
  if (!palette) {
    console.error(
      "Tried to generate mode 4 header string with no palette! Falling back to mode 3..."
    );
    return generateMode3HeaderString({
      fileName: fileName,
      imageDimensions: imageDimensions,
    });
  }

  // Note: we compress the length of the bitmap by 2 because we can fit 2 chars
  // into a short
  const variableName = fileName.slice(0, fileName.lastIndexOf("."));
  const bitmapLength = imageDimensions.height * imageDimensions.width;
  const bitmapLengthDefinition = `#define ${variableName.toUpperCase()}_SIZE ${bitmapLength}\n`;
  const imageHeightDefinition = `#define ${variableName.toUpperCase()}_HEIGHT ${
    imageDimensions.height
  }\n`;
  const imageWidthDefinition = `#define ${variableName.toUpperCase()}_WIDTH ${
    imageDimensions.width
  }\n`;
  const imageDefinitionString = `extern const unsigned short ${variableName}Bitmap[${
    bitmapLength / 2
  }];\n\n`;

  // Palette length is uncompressed
  const paletteLengthDefinition = `#define ${variableName.toUpperCase()}_PAL_SIZE ${
    PALETTE_LENGTH * 2
  }\n`;
  const paletteDefinitionString = `extern const unsigned short ${variableName}Palette[${PALETTE_LENGTH}];\n\n`;

  const headerString =
    bitmapLengthDefinition +
    imageHeightDefinition +
    imageWidthDefinition +
    imageDefinitionString +
    paletteLengthDefinition +
    paletteDefinitionString;

  return headerString;
}

export const PALETTE_HEADER = (varName: string, palLength = PALETTE_LENGTH) =>
  `#define ${varName}PalLen ${palLength * 2}\n` +
  `extern const unsigned short ${varName}Palette[${palLength}];\n\n`;

export const SS_TILES_HEADER = (
  varName: string,
  ssDimensions = { height: 256, width: 256 }
) => {
  const len = ssDimensions.height * ssDimensions.width;
  return (
    `#define ${varName}TilesLen ${len / 2}\n` +
    `extern const unsigned short ${varName}Tiles[${len / 4}];\n\n`
  );
};

function paletteIndicesToHex(index1: number, index2: number): string {
  if (index1 > 255 || index2 > 255) {
    console.error(
      `Tried to convert palette indices ${index1} and ${index2}, but at least one is out of range! Truncating bitwise...`
    );
  }

  index1 = index1 & 0xff; // Truncate in case the indices are too big
  index2 = index2 & 0xff;

  const combinedIndexString = (index2 | (index1 << 8))
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");

  return `0x${combinedIndexString}, `;
}

/*
  pixel2hex

  takes in a number array [b: number, g: number, r: number]
  convert each pixel to GBA compatible bgr hex format
  return hex value of pixel
*/
function pixelToHex(bgr: number[]): string {
  // convert to 16-bit binary format: 0bbbbbgggggrrrrr
  let binary_value = "0";
  bgr.forEach((element) => {
    element = Math.floor((element * 32) / 256);
    let elementString = element.toString(2); // convert to binary
    while (elementString.length < 5) {
      elementString = "0" + elementString;
    }
    binary_value += elementString;
  });
  // convert to hex
  let hex_value = parseInt(binary_value, 2).toString(16);
  while (hex_value.length < 4) {
    hex_value = "0" + hex_value;
  }
  hex_value = hex_value.toUpperCase();
  return "0x" + hex_value;
}

export function colorToHex(color: Color): string {
  let bgr = [color.b, color.g, color.r];
  return pixelToHex(bgr);
}

/*
  pal2Hex
  
  takes in a Palette and converts rgb into hex values 0x00rrggbb
  outputs string of the converted Palette colorArray
*/
export function paletteToHex(palette: Palette): string {
  let palFile = "";
  let count = 1;
  const alignment = 4; //this number can change depending on how we want to format
  palette.forEach((element) => {
    let hex = "0x00";
    hex +=
      element.r < 16 ? "0" + element.r.toString(16) : element.r.toString(16);
    hex +=
      element.g < 16 ? "0" + element.g.toString(16) : element.g.toString(16);
    hex +=
      element.b < 16 ? "0" + element.b.toString(16) : element.b.toString(16);
    palFile += hex + "\t";
    if (count === alignment) {
      palFile += "\n";
      count = 1;
    } else {
      count++;
    }
  });
  return palFile;
}

/*
  pal2GBA
  
  takes in a Palette and converts rgb into hex values (binary: 0bbbbbgggggrrrrr)
  adds a declaration for the palette array in C
  outputs string with the declaration and converted Palette colorArray
*/
export function PaletteToGBA(palette: Palette): string {
  const palArea = PALETTE_LENGTH;
  const colAlignment = 8; //these numbers can change depending depending on how we want to format
  const rowAlignment = 8; //

  let palC =
    "const unsigned short powPal[" +
    palArea +
    "] __attribute__((aligned(4)))=\n{\n\t";

  for (let i = 1; i <= palette.length; i++) {
    const element = palette[i - 1];
    palC += colorToHex(element) + ",";

    if (i % colAlignment === 0) {
      palC += "\n\t";
    }
    if (i % (colAlignment * rowAlignment) === 0) {
      palC += "\n\t";
    }
  }

  return palC + "};";
}

export function exportPalette(pal: Palette): string {
  return paletteToHex(pal);
}

export async function exportImage(
  img: ImageInterface,
  type: exportType
): Promise<Blob | null> {
  switch (type) {
    case exportType.BMP:
    case exportType.PNG:
      return await img.getImageFileBlob();
    default:
      return new Blob(["Invalid file type"]);
  }
}
