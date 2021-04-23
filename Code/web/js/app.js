/**
  * Main application - DBL Visualization
  * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let formElement;

/**
 * Callback when the file upload has succesfully fininshed
 * @param {XMLHttpRequest} data The submit request object
 */
function uploadCallbackSuccess(data) {
  document.body.innerHTML += data.response;
}

/**
 * Callback when the file upload has fininshed with an error
 * @param {XMLHttpRequest} data The submit request object
 */
function uploadCallbackError(data) {
  console.log("Error: ", data.response);
}

/**
 * User submits the upload form
 * @param {Event} e Object for the submit event.
 */
function formSubmit(e) {
  e.preventDefault(); // Prevent automatic form submission

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
 * When the DOM content is loaded.
 */
function onWindowLoaded() {
  // Initialize upload form
  formElement = document.getElementById("uploadForm");
  formElement.onsubmit = formSubmit;

}

// Register onLoad function handler
window.onload = onWindowLoaded;
