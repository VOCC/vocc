class Color {
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

  public static Color(r: number, g: number, b: number) {
    return new Color(r, g, b, 1);
  }

  public toHexString(): string {
    return "";
  }

  /**
   * By default, use CSS colors.
   */
  public toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  public isEqual(other: Object): boolean {
    if (other === this) {
      return true;
    }
    if (!(other instanceof Color)) {
      return false;
    }
    const that: Color = other as Color;
    return (
      this.r === that.r &&
      this.g === that.g &&
      this.b === that.b &&
      this.a === that.a
    );
  }
}

export default Color;
