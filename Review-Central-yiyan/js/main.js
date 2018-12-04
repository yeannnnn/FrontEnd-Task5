'use strict';
console.log("main.js");
const list = document.querySelector('#users');

const getUsers = () => {
    fetch('/users').then((response) => {
      return response.json();
    }).then((json) => {
        list.innerHTML = '';
      json.forEach((user) => {
        console.log(user.username);
      });
    });
  };


  getUsers();