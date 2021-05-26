/**
 * Create a new visualization - DBL visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let formElement;
let visualizationData = null;

let visType = 0;
let formData;
let uploadTable;

// Dimensions
const margins = {
  left: 70,
  right: 150,
  bottom: 150
};
const width = document.documentElement.clientWidth - margins.left - margins.right;
const height = document.documentElement.clientHeight - margins.bottom;

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

  sendUploadRequest('php/getColumnsFromCSV.php', 0, visType, formData);
}

/**
 * Send the upload request to the backend script
 * @param {String}   url        The URL of the backend script
 * @param {Integer}  uploadType The type of upload (0 = column upload, 1 = visualize request).
 * @param {Integer}  visType    The type of visualization (0 = adjacency, 1 = hierarchical).
 * @param {FormData} formData   The data to POST to the script.
 */
function sendUploadRequest(url, uploadType, visType, formData) {
  // Send upload request to server.
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.onload = function () {
    if (xhr.status == 200) {
      uploadCallbackSuccess(xhr, uploadType, visType);
    } else {
      uploadCallbackError(xhr, uploadType, visType);
    }
  };

  // Send the data.
  xhr.send(formData);
}

/**
 * Callback when the file upload has succesfully fininshed.
 * @param {XMLHttpRequest} data       The submit request object.
 * @param {Integer}        uploadType The type of upload (0 = column upload, 1 = visualize request).
 * @param {Integer}        visType_   The type of visualization (0 = adjacency, 1 = hierarchical).
 */
function uploadCallbackSuccess(data, uploadType, visType_) {
  // Show spinner
  document.getElementById("spinner").style.display = "block";

  let jsonString = data.response;
  responseData = JSON.parse(jsonString);

  if (uploadType == 0) {
    // Retrieve column upload, so fill table
    populateTable(responseData, visType_);
  } else if (uploadType == 1) {
    // Visualization request, so start visualizing
    // Hide column pick table
    document.getElementById("dataFormatter").style.display = "none";

    if (visType_ == 0) {
      createAdjacencyMatrix(responseData, responseData["format"]);
    } else if (visType_ == 1) {
      createHierarchicalEdge(responseData, responseData["format"]);
    }
  }

  // Hide the spinner and upload container
  document.getElementById("uploadContainer").style.display = "none";
  document.getElementById("spinner").style.display = "none";
}

/**
 * Populate the table with the data received.
 * @param {Array}   data     The array with JSON data.
 * @param {Integer} visType_ The type of visualization (0 = adjacency, 1 = hierarchical).
 */
function populateTable(data, visType_) {
  let moveEl;

  // Set group names based on visualization type
  if (visType_ == 0) {
    uploadTable.setGroupValues([["Source node attributes", "Target node attributes", "Link attributes", "Unused"]]);
  } else {
    uploadTable.setGroupValues([["Node attributes", "Link attributes", "Unused"]]);
  }

  // Set default location for enron dataset.
  for (let row of data) {
    switch (row["name"]) {
      case "fromEmail":
        row["attribute"] = "email";
        row["useas"] = (visType_ == 0) ? "Source node attributes" : "Node attributes";
        break;
      case "fromJobtitle":
        row["attribute"] = "jobtitle";
        row["useas"] = (visType_ == 0) ? "Source node attributes" : "Node attributes";
        break;
      case "toEmail":
        row["attribute"] = "email";
        row["useas"] = (visType_ == 0) ? "Target node attributes" : "Node attributes";
        break;
      case "toJobtitle":
        row["attribute"] = "jobtitle";
        row["useas"] = (visType_ == 0) ? "Target node attributes" : "Node attributes";
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
 * Callback when the file upload has finished with an error
 * @param {XMLHttpRequest} data       The submit request object.
 * @param {Integer}        uploadType The type of upload (0 = column upload, 1 = visualize request).
 * @param {Integer}        visType_   The type of visualization (0 = adjacency, 1 = hierarchical).
 */
function uploadCallbackError(data, uploadType, visType_) {
  console.log("Error: ", data.response);

  // Hide the spinner
  document.getElementById("spinner").style.display = "none";
}

/**
 * Visualize the attributes chosen.
 */
function visualize() {
  // Show spinner
  document.getElementById("spinner").style.display = "block";
  // Convert table to JSON
  let groupData = uploadTable.getGroupedData();
  let jsonString = JSON.stringify(groupData);
  formData.append("format", jsonString);
  // Send data to the backend
  if (visType < 2) {
    // Single visualization
    let scriptURL = (visType == 0) ? 'php/createAdjacencyData.php' : 'php/createHierarchicalEdgeData.php';
    sendUploadRequest(scriptURL, 1, visType, formData);
  } else {
    // Multiple visualizations together
    sendUploadRequest('php/createAdjacencyData.php', 1, 0, formData);
    sendUploadRequest('php/createHierarchicalEdgeData.php', 1, 1, formData);
  }
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
 * Handle visualization type button click
 * @param {Integer} visType_ The type of visualization to generate.
 */
function selectVis(visType_) {
  visType = visType_;
  document.getElementById("fileUpload").classList.add("visible");
  document.getElementById("visSelect").classList.add("hidden");
}

/**
 * Handle an unexpected JavaScript error
 */
function onErrorOccurred() {
  document.getElementById("errorOverlay").style.display = "block";
}

/**
 * When the DOM content is loaded.
 */
function onWindowLoaded() {
  // Initialize upload form
  formElement = document.getElementById("uploadForm");
  formElement.onsubmit = formSubmit;

  // Handle unexpected errors
  window.addEventListener("error", onErrorOccurred);

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