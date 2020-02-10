import ImageObject from "../components/objects/ImageObject";
import { image2hex } from "./exportUtils";

export const ImageExporter = {
  getGBAImageString: (image: ImageObject) => getGBAImageString(image)
};

export function getGBAImageString(image: ImageObject): string {
  let imageData = image.getImageData();
  let imageName = image.fileName;
  return image2hex(imageData, imageName);
}
