var input_image = document.getElementById('select-image');
var imageContainer = document.getElementById('imgContainer');
// var canvas = document.getElementById('myCanvas');
// var ctx = canvas.getContext('2d');

input_image.addEventListener('change', importImage);

function importImage() {
    // remove current contents
    while (imageContainer.childElementCount !== 0) {
        imageContainer.removeChild(imageContainer.firstChild);
    }

    // add new (selected) contents
    var selectedFiles = input_image.files;
    if (selectedFiles.length === 0) {
        let text = document.createElement('P');
        text.innerHTML = 'No files currently selected.';
        imageContainer.appendChild(text);
    } else {
        var imageObj = new Image();
        imageObj.crossOrigin = 'anonymous';
        imageObj.src = window.URL.createObjectURL(selectedFiles[0]);
        imageObj.onload = function() {
            drawImage(this);
        };
    }
};

function drawImage(imageObj) {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    
    var imageX = 0;
    var imageY = 0;
    var imageWidth = imageObj.width;
    var imageHeight = imageObj.height;

    context.drawImage(imageObj, imageX, imageY);

    var imageData = context.getImageData(imageX, imageY, imageWidth, imageHeight);
    var data = imageData.data;
    //testing
    var rgbText = document.getElementById('rgb');
    rgbText.innerHTML = data.toString();

    var hexData = image2hex(data);
    var hexText = document.getElementById('hex');
    hexText.innerHTML = hexData;

    //fix image size
    context.drawImage(imageObj, imageX, imageY, canvas.width, canvas.height);
};

function image2hex(data) {
    let image_asHex = "";
    for (var i = 0, j = data.length; i < j; i += 4) {
        let rgb = [data[i], data[i+1], data[i+2]];
        hexcode = pixel2hex(rgb);
        image_asHex += hexcode + ' ';
    }
    return image_asHex;
}

function pixel2hex(rgb) {
    let hexcode = '#';
    rgb.forEach(element => {
        hexcode += toHex(element);
    });
    return hexcode.toUpperCase();
};

function toHex(num) {
    return num.toString(16);
};