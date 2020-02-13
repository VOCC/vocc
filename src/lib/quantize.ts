import ImageObject from "../components/objects/ImageObject";
import Sprite from "../components/objects/Sprite";
import Palette from "../components/objects/Palette";
import { Color } from "./interfaces";

const BLACK: Color = {
  r: 0,
  g: 0,
  b: 0,
  a: 1
};

export function quantize(image: ImageObject, depth: number) {
  let centroids: number[][];
  let imageArr = imageToArr(image);
  let colors = depth;
  const MaxPalSize = 256;

  //start by checking that there are at least 'depth' unique colors in image
  // console.log("find colors")
  let uniqueColors = [];
  let uniqueColorsString: String[] = [];
  for (let i = 0; i < imageArr.length; i++) {
    let check = imageArr[i];
    if (!uniqueColorsString.includes(JSON.stringify(check))) {
      uniqueColors.push(check);
      uniqueColorsString.push(JSON.stringify(check));
    }
  }

  //pick unique colors for centroids using binary search to find points with
  //largest average distance
  if (colors == 1 || uniqueColors.length < colors) {
    centroids = uniqueColors;
    colors = uniqueColors.length;
  } else {
    let {pickedCentroids} = findCentroids(uniqueColors, colors);
    console.log(pickedCentroids)
    centroids = JSON.parse(JSON.stringify(pickedCentroids));
  }

  // use K-means to fit all colors in image to 'colors' clusters
  let { groups, centers } = kmeans(
    JSON.parse(JSON.stringify(imageArr)),
    JSON.parse(JSON.stringify(centroids)),
    colors
  );

  // console.log("kmeans output:")
  // console.log(groups[0][0]);
  // console.log(centers);

  let clusters: number[][][] = [];
  //group centers and points in cluster for sorting
  for (let i = 0; i < centers.length; i++) {
    let newCluster: number[][] = [[], []];
    newCluster[0] = centers[i];
    for (var j = 0; j < groups[i].length; j++) {
      newCluster[j + 1] = groups[i][j];
    }
    clusters.push(newCluster);
  }
  // sort clusters from largest to smallest
  clusters.sort(function(a, b) {
    return b.length - a.length;
  });

  console.log(clusters)

  let spriteIndexArrayLength = image.dimensions.height * image.dimensions.width;

  // generate out sprite and palette based on k-means clusters
  let spriteIndexArray: number[] = new Array(spriteIndexArrayLength);
  spriteIndexArray.fill(0, 0, spriteIndexArrayLength);

  let paletteColorArray: Color[] = new Array(256);

  //clusters: [center[r,g,b]], [point 1[r,g,b]], ...]
  let i = 0;
  for (i; i < clusters.length && i < MaxPalSize; i++) {
    let center: Color = {
      r: Math.round(Math.min(Math.max(clusters[i][0][0], 0), 255)),
      g: Math.round(Math.min(Math.max(clusters[i][0][1], 0), 255)),
      b: Math.round(Math.min(Math.max(clusters[i][0][2], 0), 255)),
      a: 1
    };
    paletteColorArray[i] = center;
    for (let j = 1; j < clusters[i].length; j++) {
      let imageIndex = getColorIndex(imageArr, clusters[i][j]);
      // console.log(imageIndex);
      if (imageIndex !== -1) {
        spriteIndexArray[imageIndex] = i;
      }
    }
  }

  for (i; i < MaxPalSize; i++) {
    paletteColorArray[i] = BLACK;
  }

  let palette = new Palette(paletteColorArray);
  let sprite = new Sprite(
    image.fileName,
    spriteIndexArray,
    palette,
    image.dimensions
  );
  return { sprite: sprite, palette: palette };
}

// Used to find index of colors for building sprite colorArray
// This kills the imageArr (imageArr is destroyed by this function)
function getColorIndex(imageArr: number[][], colorArr: number[]): number {
  for (let i = 0; i < imageArr.length; i++) {
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
  let imageArr = [];
  for (let y = 0; y < image.dimensions.height; y++) {
    for (let x = 0; x < image.dimensions.width; x++) {
      let color = image.getPixelColorAt({ x, y });
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
): { groups: number[][][]; centers: number[][] } {
  let Groups: any[] = [];
  let iterations = 0;
  let tempdistance = 0;
  let oldcentroids: number[][] = JSON.parse(JSON.stringify(centroids));
  let changed = false;

  do {
    for (let reset = 0; reset < clusters; reset++) {
      Groups[reset] = [];
    }

    for (let i = 0; i < arrayToProcess.length; i++) {
      let minDist = -1;
      let minCluster = 0;

      for (
        let clusterIterate = 0;
        clusterIterate < clusters;
        clusterIterate++
      ) {
        let dist = 0;

        for (let j = 0; j < arrayToProcess[i].length; j++) {
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

    for (let clusterIterate = 0; clusterIterate < clusters; clusterIterate++) {
      let totalGroups = Groups[clusterIterate].length;
      for (let i = 0; i < totalGroups; i++) {
        let totalGroupsSize = Groups[clusterIterate][i].length;
        for (let j = 0; j < totalGroupsSize; j++) {
          centroids[clusterIterate][j] += Groups[clusterIterate][i][j];
        }
      }

      for (let i = 0; i < centroids[clusterIterate].length; i++) {
        centroids[clusterIterate][i] = Math.round(
          Math.min(
            Math.max(
              centroids[clusterIterate][i] /
                (Groups[clusterIterate].length <= 0
                  ? 1
                  : Groups[clusterIterate].length),
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
  console.log(iterations);
  // console.log(Groups.length);
  // console.log(Groups);
  // console.log("..........")

  // let ret = [Groups, centroids];
  // console.log(ret);
  // return ret;

  return { groups: Groups, centers: centroids };
}

//function to determine if there exists a group of centroids with specific 
//average distance between them
//points: list of points to search
//midDist: desired average distance
//numCentroids: number of points to find
//
//returns: 
//possible (boolean)
//centers (list of points with desired distance)
function centroidPossible
(points: number[][], midDist: number, numCentroids: number): 
{possible: boolean, centers: number[][]} {
  
  let centroids = 1;
  let currColor: number[] = points[0];
  let possible = false;
  let centers: number[][] = [];

  centers.push(currColor);

  for (let i = 0; i < points.length; i++) {
    let dist = 0;

    for (let j = 0; j < points[i].length; j++) {
      dist += Math.pow(Math.abs(points[i][j] - currColor[j]), 2);
    }
    dist = Math.sqrt(dist)

    if (dist >= midDist) {
      centroids++
      currColor = points[i];
      centers.push(points[i]);

      if (centroids >= numCentroids) {
        possible = true;
        return {possible, centers}
      }
    }
  }
  return {possible, centers};
}

//binary search to find centroids, reutrn list of centroids with 
// average largest distance between them
function findCentroids(uniqueColors: number[][], depth: number):{pickedCentroids: number[][]} {
  let maxDist = 442;
  let minDist = 0;
  let midDist = ((maxDist + minDist) / 2);

  let dist = 0;

  let pickedCentroids: number[][] = [];

  while (minDist <= maxDist) {
    midDist = ((maxDist + minDist) / 2);
    let {possible, centers} = centroidPossible(uniqueColors, midDist, depth);
    
    if (!possible) {
      maxDist = midDist - 1;
    } else {
      if (dist < midDist) {
        pickedCentroids = JSON.parse(JSON.stringify(centers));
        dist = midDist;
      }
      minDist = midDist + 1;
    }
  }
  return {pickedCentroids}
}