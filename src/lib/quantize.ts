import ImageObject from "../components/objects/ImageObject";
import Sprite from "../components/objects/Sprite";
import Palette from "../components/objects/Palette";
import { Color } from "./interfaces";

const BLACK: Color = {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  }

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

    if (uniqueColors.length < colors) {
        colors = uniqueColors.length;
    }
    // pick "depth" number of centroids randomly
    centroids = new Array();
    for (i = 0; i < colors; i ++) {
        centroids[i] = (uniqueColors[i]);
    }

    //////////////////////////////////////// Hard delcaration of centroids and depth to test kmeans
    // colors = 3;
    // centroids = [[255,0,0], [0,255,0], [0,0,255]];
    ////////////////////////////////////////

    var clusters = kmeans(imageArr, centroids, colors);

    for (i = 0; i < clusters[0].length; i++) {
        clusters[1][i].push(clusters[0][i]);
    }

    clusters = clusters[1]

    clusters.sort(function(a,b) {
        return b[3].length - a[3].length;
    });

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

    for (i; i < imageArr.length; i++) {
        paletteColorArray[i] = BLACK;
    }

    var sprite = new Sprite();
    sprite.setIndexArray(spriteIndexArray);
    sprite.setDimensions(image.getImageDimensions());

    var palette = new Palette(image, paletteColorArray, image.getImageDimensions());
    return palette;
}

function getColorIndex(imageArr: number[][], colorArr: number[]): number {
    for (var i = 0; i < imageArr.length; i++) {
        if (imageArr[i][0] === colorArr[0] && imageArr[i][1] === colorArr[1] && imageArr[i][2] === colorArr[2]) {
            imageArr[i] = []
            return i;
        }
    }
    return -1;
}

function imageToArr(image: ImageObject):number[][]  {
    var imageArr = [];
    for (let x = 0; x < image.dimensions.height; x++) {
        for (let y = 0; y < image.dimensions.width; y++) {
            var color = image.getPixelColorAt({x, y})
            imageArr.push([Math.round(Math.min(Math.max(color.r, 0), 255)), 
                           Math.round(Math.min(Math.max(color.g, 0), 255)), 
                           Math.round(Math.min(Math.max(color.b, 0), 255))]);
        }
    }
    return imageArr
}

function kmeans(arrayToProcess: number[][], centroids: number[][], clusters: number){	
	
	var Groups=[];
	var iterations=0;
	var tempdistance=0;
	var oldcentroids:number[][]=JSON.parse(JSON.stringify(centroids));
	
	do {	
        var changed = false;
		for(var reset=0; reset < clusters; reset++ ){
			Groups[reset]= new Array();
		}

		for(var i=0; i < arrayToProcess.length; i++){	
			var minDist=-1;
			var minCluster=0;	

			for(var clusterIterate=0; clusterIterate < clusters; clusterIterate++ ){	    
				var dist=0;	  

				for(var j=0;  j < arrayToProcess[i].length; j++ ){
					dist+=Math.pow(Math.abs(arrayToProcess[i][j] - centroids[clusterIterate][j] ), 2);
				}
				tempdistance=Math.sqrt( dist );

				if ( minDist===-1  || tempdistance <= minDist){
					minDist=tempdistance;
					minCluster=clusterIterate;
				}
			}
			Groups[minCluster].push(arrayToProcess[i].slice());  
		}

		for(clusterIterate=0; clusterIterate < clusters; clusterIterate++){
            var totalGroups=Groups[clusterIterate].length
			for(i=0; i < totalGroups; i++ ){
                var totalGroupsSize=Groups[clusterIterate][i].length
				for(j=0; j < totalGroupsSize; j++){
					centroids[clusterIterate][j]+=Groups[clusterIterate][i][j]
				}
					
			}

			for(i=0; i < centroids[clusterIterate].length; i++){
				centroids[clusterIterate][i]=(centroids[clusterIterate][i]/Groups[clusterIterate].length);

				if (centroids[clusterIterate][i]!==oldcentroids[clusterIterate][i]){
					changed=true;
					oldcentroids=[];
					oldcentroids = JSON.parse(JSON.stringify(centroids));
				}
			}
		}
		iterations++;
	}while(changed===true && iterations < 1000);

    // console.log("kmeans output:")
    // console.log(iterations);
    // console.log(Groups.length);
    // console.log(Groups);
    // console.log("..........")

    var ret = [Groups, centroids];
    // console.log(ret);
	return ret;
}