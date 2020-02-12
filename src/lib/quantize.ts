import ImageObject from "../components/objects/ImageObject";
import Sprite from "../components/objects/Sprite";
import Palette from "../components/objects/Palette";
import { Color, Dimensions, ImageCoordinates } from "./interfaces";

const BLACK: Color = {
  r: 0,
  g: 0,
  b: 0,
  a: 1
};

export function quantize(image: ImageObject, depth: number) {
  var centroids: number[][];
  var imageArr = imageToArr(image);
  var colors = depth;

  //start by checking that there are at least 'depth' unique colors in image
  var uniqueColors = [];
  var uniqueColorsString: String[] = [];
  for (var i = 0; i < imageArr.length; i++) {
    var check = imageArr[i];
    if (!uniqueColorsString.includes(check.toString())) {
      uniqueColors.push(imageArr[i]);
      uniqueColorsString.push(JSON.stringify(imageArr[i]));
    }
  }

  //no point in trying to find more clusters than we have unique colors
  if (uniqueColors.length < colors) {
    colors = uniqueColors.length;
  }

  centroids = new Array();

  // pick first unique colors for centroids
  // for (i = 0; i < colors; i ++) {
  //     centroids[i] = (uniqueColors[i]);
  // }

  //pick random unique colors for centroids
  var picked: number[] = [];
  var random: number;
  var max = uniqueColors.length;
  for (i = 0; i < depth; i++) {
    do {
      random = Math.floor(Math.random() * max);
    } while (picked.includes(random));
    picked.push(random);
  }
  for (i = 0; i < picked.length; i++) {
    centroids[i] = uniqueColors[picked[i]];
  }

  // use K-means to fit all colors in image to 'colors' clusters
  var clusters = kmeans(
    JSON.parse(JSON.stringify(imageArr)),
    JSON.parse(JSON.stringify(centroids)),
    colors
  );

  //group centers and points in cluster for sorting
  for (i = 0; i < clusters[0].length; i++) {
    clusters[1][i].push(clusters[0][i]);
  }
  clusters = clusters[1];

  // sort clusters from largest to smallest
  clusters.sort(function(a, b) {
    return b[3].length - a[3].length;
  });

  // generate out sprite and palette based on k-means clusters
  var spriteIndexArray: number[] = [];
  var paletteColorArray: Color[] = [];

  for (i = 0; i < clusters.length; i++) {
    let center: Color = {
      r: Math.round(Number(clusters[i][0])),
      g: Math.round(Number(clusters[i][1])),
      b: Math.round(Number(clusters[i][2])),
      a: 1
    };
    paletteColorArray[i] = center;

    for (var j = 0; j < clusters[i][3].length; j++) {
      var imageIndex = getColorIndex(imageArr, clusters[i][3][j]);
      if (imageIndex !== -1) {
        spriteIndexArray[imageIndex] = i;
      }
    }
  }

  console.log("paletteColorArray");
  console.log(paletteColorArray);

  for (i; i < imageArr.length; i++) {
    paletteColorArray[i] = BLACK;
  }

  var palette = new Palette(
    image,
    paletteColorArray,
    image.getImageDimensions()
  );

  var sprite = new Sprite(
    image.fileName,
    unflattenArray(spriteIndexArray, image.dimensions),
    palette
  );
  return { palette: palette, sprite: sprite };
}

function unflattenArray<T>(array: T[], dimensions: Dimensions): T[][] {
  const reverseOffset = (
    i: number,
    d: Dimensions
  ): { row: number; col: number } => {
    let row = Math.floor(i / d.width);
    let col = i % d.width;
    return { row: row, col: col };
  };

  let newArray: T[][] = new Array(dimensions.height);

  for (let i = 0; i < newArray.length; i++) {
    newArray[i] = new Array(dimensions.width);
  }

  array.forEach((element, i) => {
    let { row, col } = reverseOffset(i, dimensions);
    newArray[row][col] = element;
  });

  return newArray;
}

// Used to find index of colors for building sprite colorArray
// This kills the imageArr (imageArr is destroyed by this function)
function getColorIndex(imageArr: number[][], colorArr: number[]): number {
  for (var i = 0; i < imageArr.length; i++) {
    if (
      imageArr[i][0] === colorArr[0] &&
      imageArr[i][1] === colorArr[1] &&
      imageArr[i][2] === colorArr[2]
    ) {
      imageArr[i] = [-1, -1, -1];
      return i;
    }
  }
  return -1;
}

//converts imageObject into array of colors for k-means
function imageToArr(image: ImageObject): number[][] {
  var imageArr = [];
  for (let x = 0; x < image.dimensions.height; x++) {
    for (let y = 0; y < image.dimensions.width; y++) {
      var color = image.getPixelColorAt({ x, y });
      imageArr.push([
        Math.round(Math.min(Math.max(color.r, 0), 255)),
        Math.round(Math.min(Math.max(color.g, 0), 255)),
        Math.round(Math.min(Math.max(color.b, 0), 255))
      ]);
    }
  }
  return imageArr;
}

//used to find clusters of similar points for image depth reduction (quantization)
//arrayToProcess: number array of colors; [[r, g, b], [r, g, b], ...]
//centroids: center point of clusters;
//clusters: number of clusters to generate
function kmeans(
  arrayToProcess: number[][],
  centroids: number[][],
  clusters: number
) {
  var Groups = [];
  var iterations = 0;
  var tempdistance = 0;
  var oldcentroids: number[][] = JSON.parse(JSON.stringify(centroids));

  do {
    var changed = false;
    for (var reset = 0; reset < clusters; reset++) {
      Groups[reset] = new Array();
    }

    for (var i = 0; i < arrayToProcess.length; i++) {
      var minDist = -1;
      var minCluster = 0;

      for (
        var clusterIterate = 0;
        clusterIterate < clusters;
        clusterIterate++
      ) {
        var dist = 0;

        for (var j = 0; j < arrayToProcess[i].length; j++) {
          dist += Math.pow(
            Math.abs(arrayToProcess[i][j] - centroids[clusterIterate][j]),
            2
          );
        }
        tempdistance = Math.sqrt(dist);

        if (minDist === -1 || tempdistance <= minDist) {
          minDist = tempdistance;
          minCluster = clusterIterate;
        }
      }
      Groups[minCluster].push(arrayToProcess[i].slice());
    }

    for (clusterIterate = 0; clusterIterate < clusters; clusterIterate++) {
      var totalGroups = Groups[clusterIterate].length;
      for (i = 0; i < totalGroups; i++) {
        var totalGroupsSize = Groups[clusterIterate][i].length;
        for (j = 0; j < totalGroupsSize; j++) {
          centroids[clusterIterate][j] += Groups[clusterIterate][i][j];
        }
      }

      for (i = 0; i < centroids[clusterIterate].length; i++) {
        centroids[clusterIterate][i] = Math.round(
          Math.min(
            Math.max(
              centroids[clusterIterate][i] / Groups[clusterIterate].length,
              0
            ),
            255
          )
        );

        if (centroids[clusterIterate][i] !== oldcentroids[clusterIterate][i]) {
          changed = true;
          oldcentroids = [];
          oldcentroids = JSON.parse(JSON.stringify(centroids));
        }
      }
    }
    iterations++;
  } while (changed === true && iterations < 1000);

  // console.log("kmeans output:")
  // console.log(iterations);
  // console.log(Groups.length);
  // console.log(Groups);
  // console.log("..........")

  var ret = [Groups, centroids];
  // console.log(ret);
  return ret;
}
