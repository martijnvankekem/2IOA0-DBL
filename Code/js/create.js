/**
 * Create a new visualisation - DBL Visualisation
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let formElement;
let visualisationData = null;

let visType = 0;
let formData;
let uploadTable;

// Dimensions
const margins = {
  left: 70,
  right: 150,
  bottom: 150
};
let width = document.documentElement.clientWidth - margins.left - margins.right;
let height = document.documentElement.clientHeight - margins.bottom;

/**
 * User submits the upload form.
 * @param {Event} e Object for the submit event.
 */
function formSubmit(e) {
  // Prevent automatic form submission and show spinner
  e.preventDefault();
  document.getElementById("spinner").style.display = "block";

  // Get the uploaded file to send to server
  let file = $("#csvFile")[0].files[0];
  formData = new FormData();
  formData.append('csvFile', file, file.name);

  sendUploadRequest('php/getColumnsFromCSV.php', 0, formData);
}

/**
 * Send the upload request to the backend script
 * @param {String}   url        The URL of the backend script
 * @param {Integer}  uploadType The type of upload (0 = column upload, 1 = visualise request).
 * @param {FormData} formData   The data to POST to the script.
 */
function sendUploadRequest(url, uploadType, formData) {
  // Send upload request to server.
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.onload = function () {
    if (xhr.status == 200) {
      uploadCallbackSuccess(xhr, uploadType);
    } else {
      uploadCallbackError(xhr, uploadType);
    }
  };

  // Send the data.
  xhr.send(formData);
}

/**
 * Callback when the file upload has succesfully fininshed.
 * @param {XMLHttpRequest} data       The submit request object.
 * @param {Integer}        uploadType The type of upload (0 = column upload, 1 = visualise request).
 */
function uploadCallbackSuccess(data, uploadType) {
  let jsonString = data.response;
  responseData = JSON.parse(jsonString);

  if (uploadType == 0) {
    populateTable(responseData);
  } else if (uploadType == 1) {
    console.log(responseData);
    document.getElementById("dataFormatter").style.display = "none";

    if (visType == 0) {
      createAdjacencyMatrix(responseData, responseData["format"]);
    } else if (visType == 1) {
      createHierarchicalEdge(responseData, responseData["format"]);
    }
  }

  // Hide the spinner and upload container
  document.getElementById("uploadContainer").style.display = "none";
  document.getElementById("spinner").style.display = "none";
}

/**
 * Populate the table with the data received.
 * @param {Array} data The array with JSON data.
 */
function populateTable(data) {
  let moveEl;

  // Set default location for enron dataset.
  for (let row of data) {
    switch (row["name"]) {
      case "fromEmail":
        row["attribute"] = "email";
        row["useas"] = "Source node attributes";
        break;
      case "fromJobtitle":
        row["attribute"] = "jobtitle";
        row["useas"] = "Source node attributes";
        break;
      case "toEmail":
        row["attribute"] = "email";
        row["useas"] = "Target node attributes";
        break;
      case "toJobtitle":
        row["attribute"] = "jobtitle";
        row["useas"] = "Target node attributes";
        break;
      case "sentiment":
        row["useas"] = "Link attributes";
        break;
      case "messageType":
        row["useas"] = "Link attributes";
        moveEl = row;
        break;
    }
  }

  // Move message type to end so sentiment is primary.
  data.push(data.splice(data.indexOf(moveEl), 1)[0]);
  uploadTable.setData(data);
}

/**
 * Callback when the file upload has fininshed with an error.
 * @param {XMLHttpRequest} data The submit request object.
 */
function uploadCallbackError(data) {
  console.log("Error: ", data.response);

  // Hide the spinner
  document.getElementById("spinner").style.display = "none";
}

/**
 * Visualise the attributes chosen
 */
function visualise() {
  // Show spinner
  document.getElementById("spinner").style.display = "block";
  // Convert table to JSON
  let groupData = uploadTable.getGroupedData();
  let jsonString = JSON.stringify(groupData);
  formData.append("format", jsonString);
  // Send data to the backend
  let scriptURL = (visType == 0) ? 'php/createAdjacencyData.php' : 'php/createHierarchicalEdgeData.php';
  sendUploadRequest(scriptURL, 1, formData);
}

/**
 * Handler for the cancel button click
 * @param {Integer} cancelType The type of cancel button to handle (0 = back to home, 1 = reshow vis type)
 */
function cancelClick(cancelType) {
  if (cancelType == 0) {
    // Go to previous page in history.
    window.history.back();
  } else if (cancelType == 1) {
    // Re-show visualization type window.
    document.getElementById("fileUpload").classList.remove("visible");
    document.getElementById("visSelect").classList.remove("hidden");  
  }
}

/**
 * Handle visualisation type button click
 * @param {Integer} visType_ The type of visualisation to generate.
 */
function selectVis(visType_) {
  visType = visType_;
  document.getElementById("fileUpload").classList.add("visible");
  document.getElementById("visSelect").classList.add("hidden");
}

/**
 * When the DOM content is loaded.
 */
function onWindowLoaded() {
  // Initialize upload form
  formElement = document.getElementById("uploadForm");
  formElement.onsubmit = formSubmit;

  // Initialize uploaded data table
  uploadTable = new Tabulator("#dataTable", {
    layout: "fitColumns",
    movableRows: true,
    groupBy: "useas",
    headerSort: false,
    groupValues: [["Source node attributes", "Target node attributes", "Link attributes", "Unused"]],
    columns: [
      { title: "Name", field: "name", width: 200 },
      { title: "Attribute", field: "attribute", editor: "input" },
      { title: "Use as", field: "useas" }
    ]
  });
}

// Register onLoad function handler
window.onload = onWindowLoaded;
