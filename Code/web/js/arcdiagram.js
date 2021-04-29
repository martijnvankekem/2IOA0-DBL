/**
  * Arc diagram visualization - DBL Visualization
  * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

/**
 * Visualization - Arc Diagram
 */
class ArcDiagram {
  /**
   * Constructor for ArcDiagram
   * @param {Canvas} canvas The canvas to draw to
   * @param {Array}  json   JSON array with data to visualize
   */
  constructor(canvas, json) {
    this.data = json;
    this.canvas = canvas;
    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    // let svg = this.createSVG();
    let canvas = this.canvas.getContext('2d');
    // Initialize all data
    let allNodes = this.data.nodes.map(d => d.email);
    let allGroups = this.data.nodes.map(d => d.jobtitle);
    // Remove duplicate groups
    allGroups = allGroups.filter((value, index, array) => array.indexOf(value) == index);
    // Node colors
    let colors = d3.scaleOrdinal()
      .domain(allGroups)
      .range(d3.schemeSet3);
    // Node size (linear scale)
    let size = d3.scaleLinear()
      .domain([0, 9])
      .range([1, 5]);
    // X-axis scale
    let xscale = d3.scalePoint()
      .range([margins.left, width+margins.left])
      .domain(allNodes)

    this.createLinks(canvas, xscale, this.data);
    this.createNodes(canvas, xscale, size, colors, this.data);
    this.createLabels(canvas, xscale, this.data);
  }

  /**
   * Create links between nodes
   * @param  {Canvas.context} canvas Canvas to visualise to
   * @param  {d3.scalePoint}  x      X-axis scale object from D3
   * @param  {Array}          data   The JSON data of the visualization
   */
  createLinks(canvas, x, data) {
    for (let link of data.links) {
      let start = x(link.source);
      let end = x(link.target);

      // Radius is |start-end|/2, so start-x is start + |start-end|/2
      canvas.beginPath();
      let startPoint = (start-end > 0) ? end : start;
      canvas.arc(startPoint + (Math.abs(start-end) / 2), height - margins.bottom, Math.abs(start - end) / 2, Math.PI, 0);
      canvas.strokeStyle = "gray";
      canvas.lineWidth = "0.5"
      canvas.stroke();
    }
  }

  /**
   * Create node objects
   * @param  {Canvas.context}  canvas Canvas to visualise to
   * @param  {d3.scalePoint}   x      X-axis scale object from D3
   * @param  {d3.scaleLinear}  size   Node size object from D3
   * @param  {d3.scaleOrdinal} color  Color pallette object from D3
   * @param  {Array}           data   The JSON data of the visualization
   */
  createNodes(canvas, x, size, color, data) {
    for (let node of data.nodes) {
      let nodeX = x(node.email);
      let nodeSize = size(node.size);
      let nodeCol = color(node.jobtitle);

      canvas.beginPath();
      canvas.arc(nodeX, height - margins.bottom, nodeSize, 0, 2 * Math.PI);
      canvas.fillStyle = nodeCol;
      canvas.fill();
    }
  }

  /**
   * Create labels for all nodes
   * @param  {Canvas.context} canvas Canvas to visualise to
   * @param  {d3.scalePoint}  x      X-axis scale object from D3
   * @param  {Array}          data   The JSON data of the visualization
   */
  createLabels(canvas, x, data) {
    for (let node of data.nodes) {
      let nodeX = x(node.email);
      canvas.save();
      canvas.translate(nodeX, height - margins.bottom + 10);
      canvas.rotate(-(Math.PI/180)*textRotation);
      canvas.font = "8px Arial";
      canvas.textAlign = "right";
      canvas.fillText(node.email, 0, 0);
      canvas.restore();
    }
  }
}

/**
 * Create an arc diagram visualization from an array
 * @param {Canvas} canvas The canvas to draw to
 * @param {Array}  data   JSON array with the data to visualize
 */
function createArcDiagram(canvas, data) {
  new ArcDiagram(canvas, data);
}
