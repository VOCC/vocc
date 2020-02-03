import ImageObject from "../components/ImageObject";
import {
  image2hex,
  image2jpg,
  image2png
} from "./converter";

export const ImageExporter = {
  exportGBAImage: (image: ImageObject, type: string) => exportGBAImage(image, type)
};

export function exportGBAImage(image: ImageObject, type: string): string {
  switch(type) {
    case "GBA": return image2hex(image);
    case "JPG": return image2jpg(image);
    case "PNG": return image2png(image);
    default:
      return "Invalid file type";
  }
}


// export function getGBAImageString(image: ImageObject): string {
//   let imageData = image.getImageData();
//   let imageName = image.getFileName();
//   return image2hex(image);
// }
//
// function image2hex(data: Uint8ClampedArray, imageName: string): string {
//   let image_asHex =
//     "const unsigned short " +
//     imageName +
//     "Bitmap[256] __attribute__((aligned(4)))=\n{\n\t";
//   let pixelCount = 0;
//   for (var i = 0, j = data.length; i < j; i += 4) {
//     let bgr = [data[i + 2], data[i + 1], data[i]]; // bgr for little endian
//     let hexcode = pixel2hex(bgr);
//     image_asHex += hexcode + ",";
//     pixelCount++;
//     if (pixelCount % 8 === 0 && pixelCount < 256) {
//       image_asHex += "\n";
//       if (pixelCount % 64 === 0) {
//         image_asHex += "\n\t";
//       } else {
//         image_asHex += "\t";
//       }
//     }
//   }
//   return image_asHex + "\n};";
// }

// function pixel2hex(bgr: number[]): string {
//   // convert to 16-bit binary format: 0bbbbbgggggrrrrr
//   let binary_value = "0";
//   bgr.forEach(element => {
//     element = Math.floor((element * 32) / 256);
//     let elementString = element.toString(2); // convert to binary
//     while (elementString.length < 5) {
//       elementString = "0" + elementString;
//     }
//     binary_value += elementString;
//   });
//   // convert to hex
//   let hex_value = parseInt(binary_value, 2).toString(16);
//   while (hex_value.length < 4) {
//     hex_value = "0" + hex_value;
//   }
//   hex_value = hex_value.toUpperCase();
//   return "0x" + hex_value;
// }
