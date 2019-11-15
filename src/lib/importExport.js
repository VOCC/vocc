var inputImage = document.getElementById("select-image");
var exportImage = document.getElementById("export-image");
var imageContainer = document.getElementById("imgContainer");
var hexText = document.getElementById("hex");
var imageName;

inputImage.addEventListener("change", importImage);
exportImage.addEventListener("click", exportImage);

function importImage() {
  // remove current contents
  while (imageContainer.childElementCount !== 0) {
    imageContainer.removeChild(imageContainer.firstChild);
  }

  // add new (selected) contents
  var selectedFile = inputImage.files[0];
  var sliceIndex = selectedFile.name.lastIndexOf(".");
  imageName = selectedFile.name.slice(0, sliceIndex);
  if (selectedFile.length === 0) {
    let text = document.createElement("P");
    text.innerHTML = "No files currently selected.";
    imageContainer.appendChild(text);
  } else {
    var imageObj = new Image();
    imageObj.crossOrigin = "anonymous";
    imageObj.src = window.URL.createObjectURL(selectedFile);
    imageObj.onload = function() {
      drawImage(this);
    };
  }
}

function drawImage(imageObj) {
  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");

  var imageX = 0;
  var imageY = 0;
  var imageWidth = imageObj.width;
  var imageHeight = imageObj.height;

  context.drawImage(imageObj, imageX, imageY);

  var imageData = context.getImageData(imageX, imageY, imageWidth, imageHeight);
  var data = imageData.data;
  //testing
  var rgbText = document.getElementById("rgb");
  rgbText.innerHTML = data.toString();

  var hexData = image2hex(data);
  hexText.innerHTML = hexData;

  //adjust image size
  context.drawImage(imageObj, imageX, imageY, canvas.width, canvas.height);
}

function image2hex(data) {
  let image_asHex =
    "const unsigned short " +
    imageName +
    "Bitmap[256] __attribute__((aligned(4)))=\n{\n\t";
  let pixelCount = 0;
  for (var i = 0, j = data.length; i < j; i += 4) {
    let bgr = [data[i + 2], data[i + 1], data[i]]; // bgr for little endian
    hexcode = pixel2hex(bgr);
    image_asHex += hexcode + ",";
    pixelCount++;
    if (pixelCount % 8 == 0 && pixelCount < 256) {
      image_asHex += "\n";
      if (pixelCount % 64 == 0) {
        image_asHex += "\n\t";
      } else {
        image_asHex += "\t";
      }
    }
  }
  return image_asHex + "\n};";
}

function pixel2hex(bgr) {
  // convert to 16-bit binary format: 0bbbbbgggggrrrrr
  let binary_value = "0";
  bgr.forEach(element => {
    element = Math.floor((element * 32) / 256);
    element = element.toString(2); // convert to binary
    while (element.length < 5) {
      element = "0" + element;
    }
    binary_value += element;
  });
  // convert to hex
  let hex_value = parseInt(binary_value, 2).toString(16);
  while (hex_value.length < 4) {
    hex_value = "0" + hex_value;
  }
  hex_value = hex_value.toUpperCase();
  return "0x" + hex_value;
}

function exportImage() {
  // check if any images to export
  // if (imageContainer.childElementCount == 0) { return; }
  // create file url
  let text = hexText.innerHTML;
  let filename = imageName;
  let filetype = ".c";
  filename += filetype;
  let blob = new Blob([text], { type: "text/plain" });
  saveAs(blob, filename);
}
