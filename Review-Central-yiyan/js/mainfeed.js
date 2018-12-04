'use strict';
console.log("mainfeed.js");

const fileInput = document.querySelector('#pic');

const check = () => {
    if(!fileInput.isEmpty){
        document.querySelector('#ButtonSend').removeAttribute('disabled');
    }
};