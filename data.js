var request = require('request');
var querystring = require('querystring');

document.getElementById("myInput2")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      console.log("enter pressed");
      var input, value;
      input = document.getElementById('myInput2');
      value = input.value;
      location.href = "/search/"+value;
    }
});
