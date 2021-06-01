<?php
/**
  * Get columns from CSV file - DBL Visualization
  * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

/**
 * Begin handling the request
 */
function handleRequest() {
  if (!checkValidRequest($_FILES['csvFile'])) {
    http_response_code(400);
    die("Invalid request");
  }

  $fileName = $_FILES['csvFile']['tmp_name'];

  $columns = getCSVColumns($fileName);
  $jsonData = formatData($columns);

  // Create JSON array
  $json = json_encode($jsonData, JSON_PRETTY_PRINT);

  echo $json;
}

/**
 * Check if the received request was valid
 * @param  FileObject $fileObj Object containing the uploaded file.
 * @return Boolean             Whether the request was valid.
 */
function checkValidRequest($fileObj) {
  // Check if file exists.
  if (!file_exists($fileObj['tmp_name']) ||
      !is_uploaded_file($fileObj['tmp_name'])) {
    return false;
  }

  // Check if file is a CSV file.
  $fileType = strtolower(pathinfo($fileObj['name'], PATHINFO_EXTENSION));
  if ($fileType != "csv") {
    return false;
  }

  // No errors, so return true.
  return true;
}

/**
 * Parse the CSV columns into an array
 * @param  String $fileName The CSV file to parse
 * @return Array            An array containing the CSV columns.
 */
function getCSVColumns($fileName) {
  if (!file_exists($fileName)) {
    return [];
  }

  // Get first column as array
  $csv = array_map('str_getcsv', file($fileName));
  return $csv[0];
}

/**
 * Format the columns into a table-accepted format.
 * @param  Array $columns The columns from the CSV file.
 * @return Array          The array in the correct format.
 */
function formatData($columns) {
  $output = array();
  foreach ($columns as $col) {
    $output[sizeof($output)] = array("name" => $col, "useas" => "Unused", "attribute" => $col);
  }
  return $output;
}

// Execute the main function
header("Access-Control-Allow-Origin: *");
handleRequest();

?>
