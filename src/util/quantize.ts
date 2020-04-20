import Bitmap from "../models/Bitmap";
import Bitmap4 from "../models/Bitmap4";
import Color from "../models/Color";
import Palette from "../models/Palette";

const BLACK: Color = new Color(0, 0, 0, 1);

export function quantize(
  image: Bitmap,
  depth: number
): { sprite: Bitmap4; palette: Palette } {

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
  if (colors === 1 || uniqueColors.length < colors) {
    centroids = uniqueColors;
    colors = uniqueColors.length;
  } else {
    let { pickedCentroids } = findCentroids(uniqueColors, colors);
    // console.log(pickedCentroids)
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
  clusters.sort(function (a, b) {
    return b.length - a.length;
  });

  console.log(clusters);

  let spriteIndexArrayLength = image.dimensions.height * image.dimensions.width;

  // generate out sprite and palette based on k-means clusters
  let spriteIndexArray: number[] = new Array<number>(spriteIndexArrayLength);
  spriteIndexArray.fill(0);

  let palette: Color[] = new Array(256);

  //clusters: [center[r,g,b]], [point 1[r,g,b]], ...]
  let i = 0;
  for (i; i < clusters.length && i < MaxPalSize; i++) {
    let center: Color = new Color(
      clusters[i][0][0],
      clusters[i][0][1],
      clusters[i][0][2],
      1
    );
    palette[i] = center;
    for (let j = 1; j < clusters[i].length; j++) {
      let imageIndex = getColorIndex(imageArr, clusters[i][j]);
      // console.log(imageIndex);
      if (imageIndex !== -1) {
        spriteIndexArray[imageIndex] = i;
      }
    }
  }
  // console.log(paletteColorArray)
  for (i; i < MaxPalSize; i++) {
    palette[i] = BLACK;
  }

  let sprite = new Bitmap4(
    image.fileName,
    palette,
    image.dimensions,
    spriteIndexArray
  );
  return { sprite, palette };
}

/**
 * Used to find the index of colors for building Palette of
 * quantized image
 * NOTE: This function destroys imageArr
 * @param imageArr The image to quantize as a 2D array
 * @param colorArr List of unique colors in the image
 */
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

/**
 * converst image into array of RGB color values
 * @param image The image to convert to 2d array
 */
function imageToArr(image: Bitmap): number[][] {
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

/**
 * Used to find clusters of similar colors for image color quantization
 * @param arrayToProcess 2D array of RGB color values for the image to quantize
 * @param centroids List of center points for each color cluster
 *  2D array of RGB values
 * @param clusters 3D array of clusters for color quantization
 * Each centroid is associated with a cluster
 */
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

    changed = false;

    changed = false;

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
      for (let i = 0; i < Groups[clusterIterate].length; i++) {
        for (let j = 0; j < Groups[clusterIterate][i].length; j++) {
          centroids[clusterIterate][j] += Groups[clusterIterate][i][j];
        }
      }
      for (let i = 0; i < centroids[clusterIterate].length; i++) {
        centroids[clusterIterate][i] = Math.round(
          Math.min(
            Math.max(
              centroids[clusterIterate][i] /
              (Groups[clusterIterate].length <= 1
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

  console.log("kmeans output:");
  console.log(iterations);
  // console.log(Groups.length);
  // console.log(Groups);
  console.log("..........");

  // let ret = [Groups, centroids];
  // console.log(ret);
  // return ret;

  return { groups: Groups, centers: centroids };
}

/**
 * Used to determine if there exists a group of points with a at most 
 * minDist distance between them
 * @param points list of points to search
 * @param midDist average distance to check for
 * @param numCentroids number of points to find
 */
function centroidPossible(
  points: number[][],
  midDist: number,
  numCentroids: number
): { possible: boolean; centers: number[][] } {
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
    dist = Math.sqrt(dist);

    if (dist >= midDist) {
      centroids++;
      currColor = points[i];
      centers.push(points[i]);

      if (centroids >= numCentroids) {
        possible = true;
        return { possible, centers };
      }
    }
  }
  return { possible, centers };
}

//binary search to find centroids, reutrn list of centroids with
// average largest distance between them

/**
 * Used to find optimal centroids for kmeans
 * Uses binary search to find the group of centroids with min average distance
 * between them
 * @param uniqueColors 2D array of unique RGB color values
 * @param depth number of centroids to find
 */
function findCentroids(
  uniqueColors: number[][],
  depth: number
): { pickedCentroids: number[][] } {
  let maxDist = 442;
  let minDist = 0;
  let midDist = (maxDist + minDist) / 2;

  let dist = 0;

  let pickedCentroids: number[][] = [];

  while (minDist <= maxDist) {
    midDist = (maxDist + minDist) / 2;
    let { possible, centers } = centroidPossible(uniqueColors, midDist, depth);

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
  return { pickedCentroids };
}
