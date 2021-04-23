<?php
/**
  * File upload script - DBL Visualization
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

  $csv = parseCSV($fileName);
  $emails = getEmailList($csv);
  $links = getLinksList($csv, $emails);

  var_dump($links);
}

/**
 * Check if the received request was valid
 * @param  FileObject $fileObj object containing the uploaded file.
 * @return Boolean             whether the request was valid.
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
 * Parse the CSV file into an array
 * @param  String $fileName the CSV file to parse
 * @return Array            an array containing the CSV data.
 */
function parseCSV($fileName) {
  if (!file_exists($fileName)) {
    return [];
  }

  $csv = array_map('str_getcsv', file($fileName));
  array_walk($csv, function(&$a) use ($csv) {
    $a = array_combine($csv[0], $a);
  });
  array_shift($csv);

  return $csv;
}

/**
 * Get an array of unique email-addresses from uploaded CSV
 * @param  Array $csv array with CSV contents
 * @return Array      list of unique email-addresses
 */
function getEmailList($csv) {
  $emails = [];

  foreach ($csv as $row) {
    // Check if this row has a fromEmail attribute.
    if (array_key_exists("fromEmail", $row)) {
      $email = $row['fromEmail'];
      // Check whether this emailaddress is already in the array.
      if (!in_array($email, $emails)) {
        // Add the e-mailaddress to the array.
        $emails[sizeof($emails)] = $email;
      }
    }

    // Check if this row has a toEmail attribute.
    if (array_key_exists("toEmail", $row)) {
      $email = $row['toEmail'];
      // Check whether this emailaddress is already in the array.
      if (!in_array($email, $emails)) {
        // Add the e-mailaddress to the array.
        $emails[sizeof($emails)] = $email;
      }
    }
  }

  return $emails;
}

/**
 * Get an array of links between emailaddresses from uploaded CSV
 * @param  Array $csv     array with CSV contents
 * @param  Array $emails  array of unique emailaddresses
 * @return Array          array of links between emails
 */
function getLinksList($csv, $emails) {

}

handleRequest();

?>
