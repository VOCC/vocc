function toHex(num) {
    return num.toString(16);
};

function pixel2hex(img_data) {
    let hexcode = '#';
    for (i = 0; i < 3; i++) {
        hexcode += toHex(img_data[i]);
    }
    return hexcode.toUpperCase();
};

var testObj = document.getElementById('test');

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

    testObj.innerHTML = data.toString();
}
var imageObj = new Image();
imageObj.crossOrigin = 'anonymous';
imageObj.src = './pogo_stick.png';
imageObj.onload = function() {
    drawImage(this);
};