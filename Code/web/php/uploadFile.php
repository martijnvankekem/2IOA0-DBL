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

  // Extract CSV data into arrays
  $csv = parseCSV($fileName);
  $people = getPeopleList($csv);
  $links = getLinksList($csv, $people);

  // Create JSON array
  $jsonArray = array("nodes" => $people, "links" => $links);
  $json = json_encode($jsonArray, JSON_PRETTY_PRINT);

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
 * Parse the CSV file into an array
 * @param  String $fileName The CSV file to parse
 * @return Array            An array containing the CSV data.
 */
function parseCSV($fileName) {
  if (!file_exists($fileName)) {
    return [];
  }

  // Convert CSV data to array
  $csv = array_map('str_getcsv', file($fileName));
  // Set the first row with column names as array keys
  array_walk($csv, function(&$a) use ($csv) {
    $a = array_combine($csv[0], $a);
  });
  // Remove the first column row from the array
  array_shift($csv);

  return $csv;
}

/**
 * Get an array of unique people from uploaded CSV
 * @param  Array $csv Array with CSV contents
 * @return Array      List of unique email-addresses and job titles
 */
function getPeopleList($csv) {
  $people = [];

  foreach ($csv as $row) {
    // Check if this row has a fromEmail attribute.
    if (array_key_exists("fromEmail", $row) && array_key_exists("fromJobtitle", $row)) {
      $person = array(
        "email" => $row['fromEmail'],
        "jobtitle" => $row['fromJobtitle']
      );
      // Check whether this emailaddress is already in the array.
      if (!in_array($person, $people)) {
        // Add the e-mailaddress to the array.
        $people[sizeof($people)] = $person;
      }
    }

    // Check if this row has a toEmail attribute.
    if (array_key_exists("toEmail", $row) && array_key_exists("toJobtitle", $row)) {
      $person = array(
        "email" => $row['toEmail'],
        "jobtitle" => $row['toJobtitle']
      );
      // Check whether this emailaddress is already in the array.
      if (!in_array($person, $people)) {
        // Add the e-mailaddress to the array.
        $people[sizeof($people)] = $person;
      }
    }
  }

  return $people;
}

/**
 * Get an array of links between emailaddresses from uploaded CSV
 * @param  Array $csv     Array with CSV contents
 * @param  Array $emails  Array of unique emailaddresses
 * @return Array          Array of links between emails
 */
function getLinksList($csv, $people) {
  $links = [];

  foreach ($csv as $row) {
    // Skip this link if it doesn't contain all the attributes we need.
    if (!array_key_exists("fromEmail", $row) ||
        !array_key_exists("fromJobtitle", $row) ||
        !array_key_exists("toEmail", $row) ||
        !array_key_exists("toJobtitle", $row) ||
        !array_key_exists("sentiment", $row) ||
        !array_key_exists("messageType", $row)) {
          continue;
    }

    $fromPerson = array(
      "email" => $row['fromEmail'],
      "jobtitle" => $row['fromJobtitle']
    );

    $toPerson = array(
      "email" => $row['toEmail'],
      "jobtitle" => $row['toJobtitle']
    );

    $fromPersonIndex = array_search($fromPerson, $people);
    $toPersonIndex = array_search($toPerson, $people);

    // Add link to array
    $links[sizeof($links)] = array(
      "source" => $fromPersonIndex,
      "target" => $toPersonIndex,
      "messageType" => $row["messageType"],
      "sentiment" => $row["sentiment"]
    );
  }

  return $links;
}

// Execute the main function
handleRequest();

?>
