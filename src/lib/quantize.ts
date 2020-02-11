import ImageObject from "../components/objects/ImageObject";
import Sprite from "../components/objects/Sprite";
import Palette from "../components/objects/Palette";

// function quantize(image: ImageObject, depth: number){sprite: Sprite, palette: Palette} {

// }

function imageToArr(image: ImageObject):number[][]  {
    var imageArr = [];
    for (let x = 0; x < image.getDimensions().height; x++) {
        for (let y = 0; y < image.getDimensions().width; y++) {
            var color = image.getPixelColorAt({x, y})
            imageArr.push([color.r, color.g, color.b]);
        }
    }
    return imageArr
}