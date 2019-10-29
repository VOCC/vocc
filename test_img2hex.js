function toHex(num) {
    return num.toString(16);
}

function pixel2hex(img_data) {
    let hexcode = '#';
    for (i = 0; i < 3; i++) {
        hexcode += toHex(img_data[i]);
    }
    return hexcode.toUpperCase();
}

// var testArray = [55, 165, 20, 255];
// let para = document.createElement('P');
// para.innerHTML = pixel2hex(testArray);
// document.getElementById('imgContainer').appendChild(para);