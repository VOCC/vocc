import {
  image2jpg,
  image2png,
  getGBAImageString,
  generateHFile,
  pal2Hex
} from "./exportUtils";
import { ModifiableImage } from "./interfaces";
import Palette from "../components/objects/Palette";

export const ImageExporter = {
  exportCFile: (image: ModifiableImage, pal: Palette) => exportCFile(image, pal),
  exportHFile: (image: ModifiableImage, pal: Palette) => exportHFile(image, pal),
  exportPalette: (pal: Palette) => exportPalette(pal),
  exportImage: (img: ModifiableImage, type: string) => exportImage(img, type)
};

export function exportCFile(image: ModifiableImage, pal: Palette): string {
  return getGBAImageString(image, pal);
}

export function exportHFile(image: ModifiableImage, pal: Palette): string {
  return generateHFile(image, pal);
}

export function exportPalette(pal: Palette): string {
  return pal2Hex(pal);
}

export function exportImage(img: ModifiableImage, type: string): Blob {
  switch(type) {
    case "JPG": return image2jpg(img);
    case "PNG": return image2png(img);
    default:
      return new Blob(["Invalid file type"]);
  }
}

