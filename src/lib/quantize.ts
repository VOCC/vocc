import ImageObject from "../components/objects/ImageObject";
import Sprite from "../components/objects/Sprite";
import Palette from "../components/objects/Palette";

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
    console.log(uniqueColors.length);
    console.log(uniqueColors);
    //pick "depth" number of centroids randomly
    // centroids = new Array();
    // for (i = 0; i < colors; i ++) {
    //     console.log(uniqueColors[i]);
    //     centroids[i] = (uniqueColors[i]);
    // }

    //////////////////////////////////////// Hard delcaration of centroids and depth to test kmeans
    colors = 3;
    centroids = [[255,0,0], [0,255,0], [0,0,255]];
    ////////////////////////////////////////

    kmeans(imageArr, centroids, colors);

    //ToDo: sort clusters from largest to smallest
    //ToDo: generate sprite & palette (maybe create helper functions?)
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

    console.log("kmeans output:")
    console.log(iterations);
    console.log(Groups.length);
    console.log(Groups);
    console.log("..........")

    var ret = [Groups, centroids];
    console.log(ret);
	return ret;
}