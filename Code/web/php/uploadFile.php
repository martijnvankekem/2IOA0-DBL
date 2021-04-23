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
  $people = getPeopleList($csv);
  $links = getLinksList($csv, $people);

  $jsonArray = array("nodes" => $people, "links" => $links);
  $json = json_encode($jsonArray, JSON_PRETTY_PRINT);

  echo $json;
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
 * Get an array of unique people from uploaded CSV
 * @param  Array $csv array with CSV contents
 * @return Array      list of unique email-addresses and job titles
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
 * @param  Array $csv     array with CSV contents
 * @param  Array $emails  array of unique emailaddresses
 * @return Array          array of links between emails
 */
function getLinksList($csv, $people) {
  $links = [];

  foreach ($csv as $row) {
    // Skip this link if it doesn't contain all the attributes we need.
    if (!array_key_exists("fromEmail", $row) ||
        !array_key_exists("toEmail", $row) ||
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
    $messageType = $row["messageType"];

    // Add link to array
    $links[sizeof($links)] = array(
      "source" => $fromPersonIndex,
      "target" => $toPersonIndex,
      "messageType" => $messageType
    );
  }

  return $links;
}

handleRequest();

?>
