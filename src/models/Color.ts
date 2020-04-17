interface IColor {
  r: number; g: number; b: number; a: number;
}

export default class Color implements IColor {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number, g: number, b: number, a?: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a ? a : 1;
  }

  public toHexString(): string {
    return "";
  }

  public toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  public isEqual(other: IColor): boolean {
    if (other === this) {
      return true;
    }
    return (
      this.r === other.r &&
      this.g === other.g &&
      this.b === other.b &&
      this.a === other.a
    );
  }
}