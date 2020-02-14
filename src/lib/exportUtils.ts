import { ImageInterface, Color } from "./interfaces";
import Palette from "../components/objects/Palette";

// export const ImageExporter = {
//   getGBAImageString: (image: ModifiableImage, pal: Palette) => getGBAImageString(image, pal),
//   generateHFile: (image: ModifiableImage, pal: Palette) => generateHFile(image, pal),
//   pal2Hex: (pal: Palette) => pal2Hex(pal),
//   image2png: (image: ModifiableImage) => image2png(image),
//   image2jpg: (image: ModifiableImage) => image2jpg(image),
//   exportCFile: (image: ModifiableImage, pal: Palette) => exportCFile(image, pal),
//   exportHFile: (image: ModifiableImage, pal: Palette) => exportHFile(image, pal),
//   exportPalette: (pal: Palette) => exportPalette(pal),
//   exportImage: (img: ModifiableImage, type: string) => exportImage(img, type)
// };

/*
  getGBAImageString

  take in ImageObject and Palette
  get the image array from image2GBA
  get the palette array from pal2GBA
  returns the combination of them into one string
*/
export function getGBAImageString(image: ImageInterface, pal: Palette): string {
  const imageData = image.getImageData();
  const imageName = image.fileName;
  return image2GBA(imageData, imageName) + "\n\n" + pal2GBA(pal);
}

/*
  image2GBA

  take in imageData and imageName
  adds a declaration for the image array in C
  iterates and converts each pixel
  returns declaration of array + hex values
*/
function image2GBA(data: Uint8ClampedArray, imageName: string): string {
  let image_asHex =
    "const unsigned short " +
    imageName.slice(0, imageName.lastIndexOf(".")) +
    "Bitmap[256] __attribute__((aligned(4)))=\n{\n\t";
  let pixelCount = 0;
  for (var i = 0, j = data.length; i < j; i += 4) {
    let bgr = [data[i + 2], data[i + 1], data[i]]; // bgr for little endian
    let hexcode = pixel2hex(bgr);
    image_asHex += hexcode + ",";
    pixelCount++;
    if (pixelCount % 8 === 0 && pixelCount < 256) {
      image_asHex += "\n";
      if (pixelCount % 64 === 0) {
        image_asHex += "\n\t";
      } else {
        image_asHex += "\t";
      }
    }
  }
  return image_asHex + "\n};";
}

/*
  pixel2hex

  takes in a number array [b: number, g: number, r: number]
  convert each pixel to GBA compatible bgr hex format
  return hex value of pixel
*/
function pixel2hex(bgr: number[]): string {
  // convert to 16-bit binary format: 0bbbbbgggggrrrrr
  let binary_value = "0";
  bgr.forEach(element => {
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

function color2hex(color: Color): string {
  let bgr = [color.b, color.g, color.r];
  return pixel2hex(bgr);
}

/*
  generateHFile

  takes an image and palette
  formats a string to replicate the header file created by usenti
  returns the string
*/
export function generateHFile(img: ImageInterface, pal: Palette): string {
  const imageName = img.fileName.slice(0, img.fileName.lastIndexOf("."));
  const imageArea = img.dimensions.height * img.dimensions.width;
  const palArea = pal.dimensions.height * pal.dimensions.width;
  let toReturn = "#ifndef " + imageName.toUpperCase() + "_H\n";
  toReturn += "#define " + imageName.toUpperCase() + "_H\n\n";
  toReturn += "#define " + imageName + "TilesLen " + imageArea + "\n";
  toReturn +=
    "extern const unsigned short " +
    imageName +
    "Tiles[" +
    imageArea / 2 +
    "];\n\n";
  toReturn += "#define " + imageName + "PalLen " + palArea * 2 + "\n";
  toReturn +=
    "extern const unsigned short " + imageName + "Pal[" + palArea + "];\n\n";
  toReturn += "#endif";

  return toReturn;
}

/*
  pal2Hex
  
  takes in a Palette and converts rgb into hex values 0x00rrggbb
  outputs string of the converted Palette colorArray
*/
export function pal2Hex(pal: Palette): string {
  const colorArray = pal.getColorArray();
  let palFile = "";
  let count = 1;
  const alignment = 4; //this number can change depending on how we want to format
  colorArray.forEach(element => {
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
function pal2GBA(pal: Palette): string {
  const palArea = pal.dimensions.height * pal.dimensions.width;
  const colorArray = pal.getColorArray();
  const colAlignment = 8; //these numbers can change depending depending on how we want to format
  const rowAlignment = 8; //

  let palC =
    "const unsigned short powPal[" +
    palArea +
    "] __attribute__((aligned(4)))=\n{\n";

  for (let i = 1; i <= colorArray.length; i++) {
    const element = colorArray[i - 1];
    palC += color2hex(element) + ",";

    if (i % colAlignment === 0) {
      palC += "\n";
    }
    if (i % (colAlignment * rowAlignment) === 0) {
      palC += "\n";
    }
  }

  return palC + "};";
}

export async function exportImage(
  img: ImageInterface,
  type: string
): Promise<Blob | null> {
  switch (type) {
    case "JPG":
    case "PNG":
      return await img.getImageFileBlob();
    default:
      return new Blob(["Invalid file type"]);
  }
}

export function exportCFile(image: ImageInterface, pal: Palette): string {
  return getGBAImageString(image, pal);
}

export function exportHFile(image: ImageInterface, pal: Palette): string {
  return generateHFile(image, pal);
}

export function exportPalette(pal: Palette): string {
  return pal2Hex(pal);
}
