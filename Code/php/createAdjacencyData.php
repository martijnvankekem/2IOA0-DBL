<?php
/**
  * Convert CSV data for Adjacency Matrix visualization - DBL Visualization
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
  $formatting = json_decode($_POST["format"]);
  $formatting = convertFormatting($formatting);

  // Extract CSV data into arrays
  $csv = parseCSV($fileName);
  $nodes = getNodes($csv, $formatting);
  $links = getLinks($csv, $formatting);

  // Create JSON array
  $jsonArray = array(
    "format" => $formatting,
    "nodes" => $nodes,
    "links" => $links
  );
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
 * Convert the received object to a usable format.
 * @param  {Array} $formatting The received object.
 * @return {Array}             The converted array.
 */
function convertFormatting($formatting) {
  $currentAttribute = "nodeGroups";
  $currentIndex = 0;
  $format = array("nodeGroups" => array(), "linkAttributes" => array());

  // Get node groups
  foreach ($formatting as $item) {
    $row = get_object_vars($item);

    if (array_key_exists("headerContent", $row)) {
      // Start processing a new group
      if (preg_match("/((Source|Target)\snode\sattributes)/", $row["headerContent"])) {
        // Group of node attributes
        $currentAttribute = "nodeGroups";
        $currentIndex = sizeof($format[$currentAttribute]);
        $format[$currentAttribute][$currentIndex] = array();
        continue;
      } else if (preg_match("/(Link\sattributes)/", $row["headerContent"])) {
        // Group of link attributes
        $currentAttribute = "linkAttributes";
        continue;
      } else if (preg_match("/(Unused)/", $row["headerContent"])) {
        // Group of unused attributes, so exit loop
        break;
      }
    } else {
      // Row item
      if ($currentAttribute == "nodeGroups") {
        $newIndex = sizeof($format[$currentAttribute][$currentIndex]);
        $format[$currentAttribute][$currentIndex][$newIndex] = $row;  
      } else if ($currentAttribute == "linkAttributes") {
        $newIndex = sizeof($format[$currentAttribute]);
        $format[$currentAttribute][$newIndex] = $row;
      }
    }
  }

  return $format;
}

/**
 * Get an array of unique people from uploaded CSV
 * @param  Array $csv        Array with CSV contents
 * @param  Array $formatting The way the data must be formatted
 * @return Array             List of unique email-addresses and job titles
 */
function getNodes($csv, $formatting) {
  $sourceNodes = [];
  $targetNodes = [];
  $sourceNodesHandled = [];
  $targetNodesHandled = [];
  $mainNodeAttribute = $formatting["nodeGroups"][0][0]["attribute"];

  foreach ($csv as $row) {

    for ($i = 0; $i < sizeof($formatting["nodeGroups"]); $i++) {
      $nodeGroup = $formatting["nodeGroups"][$i];
      $node = array("kind" => ($i == 0) ? "source" : "target");

      foreach ($nodeGroup as $item) {
        if (!array_key_exists($item["name"], $row)) {
          continue 2; // attribute doesn't exist, so check next node group
        } else {
          $node[$item["attribute"]] = $row[$item["name"]];
        }
      }
      
      if (!in_array($node[$mainNodeAttribute], $sourceNodesHandled) && ($node["kind"] == "source")) {
        $sourceNodes[$node[$mainNodeAttribute]] = $node;
        $sourceNodesHandled[sizeof($sourceNodesHandled)] = $node[$mainNodeAttribute];
      } else if (!in_array($node[$mainNodeAttribute], $targetNodesHandled) && ($node["kind"] == "target")) {
        $targetNodes[$node[$mainNodeAttribute]] = $node;
        $targetNodesHandled[sizeof($targetNodesHandled)] = $node[$mainNodeAttribute];
      }
    }

  }
  // Reset the array index
  $sourceNodes = array_values($sourceNodes);
  $targetNodes = array_values($targetNodes);
  return array($sourceNodes, $targetNodes);
}

/**
 * Get an array of links between emailaddresses from uploaded CSV
 * @param  Array $csv     Array with CSV contents
 * @param  Array $emails  Array of unique emailaddresses
 * @return Array          Array of links between emails
 */
function getLinks($csv, $formatting) {
  $links = [];

  foreach ($csv as $row) {
    $link = array();
    foreach ($formatting["linkAttributes"] as $linkAttribute) {
      if (!array_key_exists($linkAttribute["name"], $row)) {
        continue 2; // attribute doesn't exist, so check next node group
      } else {
        $link[$linkAttribute["attribute"]] = $row[$linkAttribute["name"]];
      }
    }
    $link["source"] = $row[$formatting["nodeGroups"][0][0]["name"]];
    $link["target"] = $row[$formatting["nodeGroups"][1][0]["name"]];
    $links[sizeof($links)] = $link;
  }

  return $links;
}

// Execute the main function
header("Access-Control-Allow-Origin: *");
handleRequest();

?>
