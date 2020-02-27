import { Dimensions } from "./interfaces";

export const COLORS = {
  black: { r: 0, g: 0, b: 0, a: 1 },
  red: { r: 255, g: 0, b: 0, a: 1 },
  blue: { r: 0, g: 255, b: 0, a: 1 },
  green: { r: 0, g: 0, b: 255, a: 1 },
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
