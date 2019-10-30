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

    var text = document.getElementById('test');
    text.innerHTML = data.toString();
};