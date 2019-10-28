var importButton = document.getElementById('importButton');

var importImage = () => {
    var imageJS = document.getElementById('image');
    var image = "pogo_stick.png"

    imageJS.src = image;
}
importButton.addEventListener('click', importImage);