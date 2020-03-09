import { Dimensions, Color } from "./interfaces";

export const COLORS = {
  black: new Color(0, 0, 0, 1),
  red: new Color(255, 0, 0, 1),
  blue: new Color(0, 255, 0, 1),
  green: new Color(0, 0, 255, 1)
};

export const PALETTE_SIZE: Dimensions = { height: 16, width: 16 };
export const PALETTE_LENGTH = PALETTE_SIZE.height * PALETTE_SIZE.width;

export enum Tool {
  PENCIL,
  BUCKET,
  SQUARE,
  ELLIPSE,
  ZOOM,
  PAN,
  DROPPER
}

export const STORAGE = {
  image: "image",
  imageData: "imageData",
  palette: "palette",
  imageMode: "imageMode",
  editorSettings: "editorSettings"
};
