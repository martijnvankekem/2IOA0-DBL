/**
 * Create a new visualization - DBL visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

const urlPrefix = "https://projects.vankekem.com/dbl/";
const combinedVisType = 3; // Vis type for all visualizations combined.
const scriptURL = {
  0: urlPrefix + 'php/createAdjacencyData.php',
  1: urlPrefix + 'php/createHierarchicalEdgeData.php',
  2: urlPrefix + 'php/createLineDiagramData.php'
}

let formElement;
let visualizationData = null;

let visType = 0;
let formData;
let uploadTable;

let dateRangePicker = null;
let filterPrepared = false;

let width = document.documentElement.clientWidth - 100; // 50 px margin on both sides
let height = document.documentElement.clientHeight;

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

  sendUploadRequest(urlPrefix + 'php/getColumnsFromCSV.php', 0, visType, formData);
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
    populateTable(responseData);
  } else if (uploadType == 1) {
    // Visualization request, so start visualizing
    // Hide column pick table
    document.getElementById("dataFormatter").style.display = "none";

    if (visType_ == 0) {
      createAdjacencyMatrix(responseData, responseData["format"]);
    } else if (visType_ == 1) {
      createHierarchicalEdge(responseData, responseData["format"]);
    } else if (visType_ == 2) {
      createLineDiagram(responseData, responseData["format"]);
    }
  }

  // Hide the spinner and upload container
  document.getElementById("uploadContainer").style.display = "none";
  document.getElementById("spinner").style.display = "none";
}

/**
 * Populate the table with the data received.
 * @param {Array}   data     The array with JSON data.
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
        row["useas"] = "Target node attributes"
        break;
      case "date":
        row["useas"] = "Date attribute";
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
  if (visType < combinedVisType) {
    // Single visualization
    sendUploadRequest(scriptURL[visType], 1, visType, formData);
  } else {
    // Multiple visualizations together
    for (let visID of Object.keys(scriptURL)) {
      let url = scriptURL[visID]
      sendUploadRequest(url, 1, visID, formData);
    }
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
 * Callback when the date filter has been changed by the user
 * @param {Object} start The new start date
 * @param {Object} end   The new end date
 */
function dateFilterChanged(start, end) {
  if (visType == combinedVisType) {
    // Two visualizations
    adjacencyMatrix.dateFilter = [start.format("MM/DD/YYYY"), end.format("MM/DD/YYYY")];
    hierarchicalEdge.dateFilter = [start.format("MM/DD/YYYY"), end.format("MM/DD/YYYY")];

    adjacencyMatrix.redraw();
    hierarchicalEdge.redraw();
  } else if (visType == 0) {
    // Adjacency only
    adjacencyMatrix.dateFilter = [start.format("MM/DD/YYYY"), end.format("MM/DD/YYYY")];
    adjacencyMatrix.redraw();
  } else if (visType == 1) {
    // Hierarchical edge only
    hierarchicalEdge.dateFilter = [start.format("MM/DD/YYYY"), end.format("MM/DD/YYYY")];
    hierarchicalEdge.redraw();
  }
}

function filterChanged(attribute) {
  if (visType == combinedVisType) {
    // Two visualizations
    adjacencyMatrix.updateFilter(attribute);
    hierarchicalEdge.updateFilter(attribute);
  } else if (visType == 0) {
    // Adjacency only
    adjacencyMatrix.updateFilter(attribute);
  } else if (visType == 1) {
    // Hierarchical edge only
    hierarchicalEdge.updateFilter(attribute);
  }
}

/**
 * Handle visualization type button click
 * @param {Integer} visType_ The type of visualization to generate.
 */
function selectVis(visType_) {
  visType = visType_;

  if (visType == combinedVisType) {
    document.body.classList.add("dualVis");
  } else {
    document.body.classList.remove("dualVis");
  }

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
    groupValues: [["Source node attributes", "Target node attributes", "Link attributes", "Date attribute", "Unused"]],
    columns: [
      { title: "Name", field: "name", width: 200 },
      { title: "Attribute", field: "attribute", editor: "input" },
      { title: "Use as", field: "useas" }
    ]
  });
}

// Register onLoad function handler
window.onload = onWindowLoaded;