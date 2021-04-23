/**
  * Main application - DBL Visualization
  * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let formElement;

/**
 * When the DOM content is loaded.
 */
function onWindowLoaded() {
  // Initialize upload form
  formElement = document.getElementById("uploadForm");
  formElement.onsubmit = formSubmit;

}

/**
 * User submits the upload form
 * @param {Event} e Object for the submit event.
 */
function formSubmit(e) {
  e.preventDefault(); // Prevent automatic form submission
}

// Register onLoad function handler
window.onload = onWindowLoaded;
