/**
 * Adjacency Matrix visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

/**
 * Visualization - Adjacency Matrix
 */
class AdjacencyMatrix {
  /**
   * Constructor for AdjacencyMatrix
   * @param {Canvas} canvas The canvas to draw to
   * @param {Array}  json   JSON array with data to visualize
   */
  constructor(canvas, json) {
    this.data = json;
    this.canvas = canvas;
    this.maxEmailCount = 1;
    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    let matrix = this.createMatrixData(this.data.nodes, this.data.links);
    let svg = d3.select("svg");

    // Get all sent emails count
    let emailCount = this.createEmailCountArray(this.data);

    // Node colors
    let colors = d3.scaleOrdinal()
      .range(d3.schemeCategory10);

    this.createMatrix(svg, matrix, emailCount, colors);
  }

  /**
   * Create the visualisation itself.
   * @param {SVG}        svg        The SVG containing the visualisation
   * @param {Array}      matrix     The matrix data to visualise.
   * @param {Dictionary} emailCount Dictionary containing the amount of emails between users
   */
  createMatrix(svg, matrix, emailCount) {
    // Create grid
    d3.select("svg").append("g")
      .attr("transform", "translate(160,160)")
      .attr("id", "adjacencyG")
      .selectAll("rect")
      .data(matrix)
      .enter()
      .append("rect")
      .attr("class", "grid")
      .attr("width", 10)
      .attr("height", 10)
      .attr("source", d => d.id.split("-")[0])
      .attr("target", d => d.id.split("-")[1])
      .attr("x", d => d.x * 10)
      .attr("y", d => d.y * 10)
      .style("fill-opacity", d => Number(emailCount[d.id]).map(0, 50, 0.1, 1.0));

    // Create text on x-axis
    d3.select("svg")
      .append("g")
      .attr("transform", "translate(150,150)")
      .selectAll("text")
      .data(this.data.nodes)
      .enter()
      .append("text")
      .attr("y", (d, i) => i * 10 + 17.5)
      .attr("col", "x")
      .text(d => d.email)
      .style("text-anchor", "left")
      .style("transform", "rotate(-90deg)")
      .style("font-size", "10px");

    // Create text on y-axis
    d3.select("svg")
      .append("g").attr("transform", "translate(150,150)")
      .selectAll("text")
      .data(this.data.nodes)
      .enter()
      .append("text")
      .attr("y", (d, i) => i * 10 + 17.5)
      .attr("col", "y")
      .text(d => d.email)
      .style("text-anchor", "end")
      .style("font-size", "10px");

    // Create interactive parts
    this.createGridHighlights();
  }

  /**
   * Highlight grid and labels on hover
   */
  createGridHighlights() {
    d3.selectAll("rect.grid").on("mousemove", d => {
      d3.selectAll("rect").style("stroke-width", function(p) {
        return (p.x * 10 == d.target.x.animVal.value || p.y * 10 == d.target.y.animVal.value) ? "3px" : "1px";
      });
      d3.selectAll("text[col=\"x\"]").style("fill", function(p) {
        return (p.email == d.target.getAttribute("target")) ? "#ff0000" : "#000";
      });
      d3.selectAll("text[col=\"y\"]").style("fill", function(p) {
        return (p.email == d.target.getAttribute("source")) ? "#ff0000" : "#000";
      });
    });
  }

  /**
   * Create a dictionary of all node combinations with the corresponding count
   * @param  {Array}      data The retrieven JSON data
   * @return {Dictionary}      The array with all nodes and their count
   */
  createEmailCountArray(data) {
    let dict = {};

    for (let link of data.links) {
      let key = link.source + "-" + link.target;
      if (!(key in dict)) {
        // Create sender-recipient pair and set count to one.
        dict[key] = 1;
      } else {
        // Increase existing sender-recipient pair by one.
        dict[key] += 1;

        // Save the highest value
        if (this.maxEmailCount < dict[key]) {
          this.maxEmailCount = dict[key];
        }
      }
    }

    return dict;
  }

  /**
   * Format the data to create a matrix
   * @param  {Array} nodes Array containing the nodes.
   * @param  {Array} edges Array containing the edges.
   * @return {Array}       The array with formatted matrix data.
   */
  createMatrixData(nodes, edges) {
    let edgeHash = {};
    edges.forEach(edge => {
      let id = edge.source + "-" + edge.target;
      edgeHash[id] = edge;
    });

    let matrix = [];
    nodes.forEach((source, a) => {
      nodes.forEach((target, b) => {
        let grid = {
          id: source.email + "-" + target.email,
          x: b,
          y: a,
          weight: 0
        };
        if (edgeHash[grid.id]) {
          grid.weight = edgeHash[grid.id].sentiment;
        }
        matrix.push(grid);
      });
    });

    return matrix;
  }
}

/**
 * Create an adjacency matrix visualization from an array
 * @param {Canvas} canvas The canvas to draw to
 * @param {Array}  data   JSON array with the data to visualize
 */
function createAdjacencyMatrix(canvas, data) {
  new AdjacencyMatrix(canvas, data);
}

/**
 * Map a number in between a range to another range
 * @param  {Number} a Start range minimum.
 * @param  {Number} b Start range maximum.
 * @param  {Number} c End range minimum.
 * @param  {Number} d End range maximum.
 * @return {Number}   A number ranged between c and d.
 */
Number.prototype.map = function(a, b, c, d) {
  return c + (d - c) * ((this - a) / (b - a))
};
