var input_image = document.getElementById('select-image');
var export_image = document.getElementById('export-image');
var imageContainer = document.getElementById('imgContainer');

input_image.addEventListener('change', importImage);
export_image.addEventListener('click', function() {
    let text = 'some text';
    let filename = 'filename';
    exportImage(filename, text);
}, false);

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

    var hexData = image2hex(data, imageWidth);
    var hexText = document.getElementById('hex');
    hexText.innerHTML = hexData;

    //adjust image size
    context.drawImage(imageObj, imageX, imageY, canvas.width, canvas.height);
};

function image2hex(data, w) {
    let image_asHex = "";
    let pixelCount = 0;
    for (var i = 0, j = data.length; i < j; i += 4) {
        let rgb = [data[i], data[i+1], data[i+2]];
        hexcode = pixel2hex(rgb);
        image_asHex += hexcode + ' ';
        pixelCount++;
        if ((pixelCount % w) == 0) {
            image_asHex += '<br>';
        }
    }
    return image_asHex;
};

function pixel2hex(rgb) {
    let hexcode = '#';
    rgb.forEach(element => {
        hexcode += toHex(element);
    });
    return hexcode.toUpperCase();
};

function toHex(num) {
    let hexNum = '';
    if (num < 16) {
        hexNum += '0'
    }
    hexNum += num.toString(16);
    return hexNum;
};

function exportImage(filename, text) {
    // create file url
    filename += '.c';
    let file = new File([text], filename, { type: 'text/plain' });
    let url = URL.createObjectURL(file);

    // download file "offline"
    let element = document.createElement('A');
    element.style.display = 'none';
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};