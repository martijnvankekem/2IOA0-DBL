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
    this.mapJSONData();

    console.log(this.data);
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    const adjacencyMatrix = d3.adjacencyMatrixLayout();
    const matrixData = this.createMatrixData(adjacencyMatrix, this.data);
    // Node colors
    let colors = d3.scaleOrdinal()
      .range(d3.schemeCategory10);


    this.createMatrix(adjacencyMatrix, matrixData, colors);
  }

  /**
   * Create the visualisation itself.
   * @param  {AdjacencyMatrixLayout} matrix     The matrix layout to visualise.
   * @param  {AdjacencyMatrix}       matrixData The matrix data to visualise.
   * @param  {d3.scaleOrdinal}       colors     The color scheme to use.
   */
  createMatrix(matrix, matrixData, colors) {
    d3.select('svg')
      .append('g')
        .attr('transform', 'translate(150,150)')
        .attr('id', 'adjacencyG')
        .selectAll('rect')
        .data(matrixData)
        .enter()
        .append('rect')
          .attr('width', d => d.width)
          .attr('height', d => d.height)
          .attr('x', d => d.x)
          .attr('y', d => d.y)
          .style('stroke', 'black')
          .style('stroke-width', '1px')
          .style('stroke-opacity', .1)
          .style('fill', d => colors(d.source.jobtitle))
          .style('fill-opacity', d => Number(d.sentiment).map(-1, 1, 0, 1));

    d3.select('#adjacencyG')
    .call(matrix.xAxis);

    d3.select('#adjacencyG')
      .call(matrix.yAxis);
  }

  /**
   * Create a AdjacencyMatrix object
   * @param  {AdjacencyMatrixLayout} matrix    The matrix layout to visualise.
   * @param  {Array}                 data      The JSON array data to visualise.
   * @return {AdjacencyMatrix}                 The matrix data of the object created.
   */
  createMatrixData(matrix, data) {
    matrix
      .size([1700, 1700])
      .nodes(data.nodes)
      .links(data.links)
      .directed(false)
      .nodeID(d => d.email);

    return matrix();
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
Number.prototype.map=function(a,b,c,d){return c+(d-c)*((this-a)/(b-a))};
