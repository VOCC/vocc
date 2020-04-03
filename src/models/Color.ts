export default class Color {
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
    // // convert to 16-bit binary format: 0bbbbbgggggrrrrr
    // let binary_value = "0";
    // bgr.forEach(element => {
    //   element = Math.floor((element * 32) / 256);
    //   let elementString = element.toString(2); // convert to binary
    //   while (elementString.length < 5) {
    //     elementString = "0" + elementString;
    //   }
    //   binary_value += elementString;
    // });
    // // convert to hex
    // let hex_value = parseInt(binary_value, 2).toString(16);
    // while (hex_value.length < 4) {
    //   hex_value = "0" + hex_value;
    // }
    // hex_value = hex_value.toUpperCase();
    // return "0x" + hex_value;
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
