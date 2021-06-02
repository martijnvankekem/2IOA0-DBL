/**
 * Line Diagram visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let lineDiagram = null;

/**
 * Line Diagram - Visualization Class
 */
class LineDiagram {
  /**
   * Constructor for LineDiagram.
   * @param {Array}  json              JSON array with data to visualize.
   * @param {Array}  format            The visualization format.
   */
  constructor(json, format) {
    console.log(json);
    this.jsonData = json;
    this.data = this.filterData(json);
    this.format = format;

    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    
  }

  /**
   * Filter out invalid data from the dataset
   * @param  {Array} json The array of json data.
   * @return {Array}       The filtered array of nodes.
   */
   filterData(json) {
    // Make a clone of the array
    let data = JSON.parse(JSON.stringify(json));

    // TODO: insert code to filter data.

    return data; 
   }
}

/**
* Create an line diagram visualization from an array.
* @param {Array}  data   JSON array with the data to visualize.
* @param {Array}  format The visualization format.
*/
function createLineDiagram(data, format) {
  lineDiagram = new LineDiagram(data, format);
}