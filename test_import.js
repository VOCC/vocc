var input_image = document.getElementById('select-image');
var imageContainer = document.getElementById('imgContainer');

input_image.addEventListener('change', importImage);

function importImage() {
    // remove current contents
    while (imageContainer.childElementCount !== 0) {
        imageContainer.removeChild(imageContainer.firstChild);
    }

    // add new (selected) contents
    var selectedFiles = input_image.files;
    if (selectedFiles === 0) {
        let text = document.createElement('P');
        text.innerHTML = 'No files were selected.';
        imageContainer.appendChild(text);
    } else {
        let image = document.createElement('IMG');
        // image.src = input_image.value;
        image.src = window.URL.createObjectURL(selectedFiles[0]);
        imageContainer.appendChild(image);
    }
};