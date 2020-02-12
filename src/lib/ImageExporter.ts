import {
  image2jpg,
  image2png,
  getGBAImageString,
  generateHFile
} from "./exportUtils";
import { ModifiableImage } from "./interfaces";

export const ImageExporter = {
  exportCFile: (image: ModifiableImage) => exportCFile(image),
  exportHFile: (image: ModifiableImage) => exportHFile(image),
  exportImage: (img: ModifiableImage, type: string) => exportImage(img, type)
};

export function exportCFile(image: ModifiableImage): string {
  return getGBAImageString(image);
}

export function exportHFile(image: ModifiableImage): string {
  return generateHFile(image);
}

export function exportImage(img: ModifiableImage, type: string): Blob {
  switch(type) {
    case "JPG": return image2jpg(img);
    case "PNG": return image2png(img);
    default:
      return new Blob(["Invalid file type"]);
  }
}
