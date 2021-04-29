/**
  * Main application - DBL Visualisation
  * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let formElement;
let visualisationData = null;
let canvas;

// Dimensions
const margins = {left: 70, right: 150, bottom: 150};
const textRotation = 45; // Rotation in degrees
let width = document.documentElement.clientWidth - margins.left - margins.right;
let height = document.documentElement.clientHeight - margins.bottom;

/**
 * User submits the upload form
 * @param {Event} e Object for the submit event.
 */
function formSubmit(e) {
  // Prevent automatic form submission and show spinner
  e.preventDefault();
  document.getElementById("spinner").style.display = "block";

  // Get the uploaded file to send to server
  let file = $("#csvFile")[0].files[0];
  let formData = new FormData();
  formData.append('csvFile', file, file.name);

  // Send upload request to server.
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'php/uploadFile.php', true);

  xhr.onload = function () {
    if (xhr.status == 200) {
      uploadCallbackSuccess(xhr);
    } else {
      uploadCallbackError(xhr);
    }
  };

  // Send the data.
  xhr.send(formData);
}

/**
 * Callback when the file upload has succesfully fininshed
 * @param {XMLHttpRequest} data The submit request object
 */
function uploadCallbackSuccess(data) {
  let jsonString = data.response;
  visualisationData = JSON.parse(jsonString);

  createAdjacencyMatrix(canvas, visualisationData);

  // Hide the spinner and upload container
  document.getElementById("uploadContainer").style.display = "none";
  document.getElementById("spinner").style.display = "none";
}

/**
 * Callback when the file upload has fininshed with an error
 * @param {XMLHttpRequest} data The submit request object
 */
function uploadCallbackError(data) {
  console.log("Error: ", data.response);

  // Hide the spinner
   document.getElementById("spinner").style.display = "none";
}

/**
 * When the window has been resized
 */
function onWindowResized() {
  // Save the new dimensions
  canvas.width  = document.documentElement.clientWidth;
  width = document.documentElement.clientWidth - margins.left - margins.right;
  canvas.height = document.documentElement.clientHeight;
  height = document.documentElement.clientHeight - margins.bottom;

  // Redraw the image if it is already drawn
  if (visualisationData != null) {
    createAdjacencyMatrix(canvas, visualisationData);
  }
}

/**
 * When the DOM content is loaded.
 */
function onWindowLoaded() {
  // Initialize upload form
  formElement = document.getElementById("uploadForm");
  formElement.onsubmit = formSubmit;

  // Set initial canvas size
  canvas = document.getElementById("canvas");
  onWindowResized();

  // Register onResize function handler
  window.onresize = onWindowResized;
}

// Register onLoad function handler
window.onload = onWindowLoaded;
