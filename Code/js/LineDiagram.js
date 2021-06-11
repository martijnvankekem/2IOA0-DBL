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

    this.parseTime = d3.timeParse("%Y-%m-%d");
    this.data = json;

    this.jsonData = JSON.parse(JSON.stringify(json));

    console.log(this.data);
    this.format = format;

    this.margin = {top: 20, right: 40, bottom: 30, left: 50};
    this.width = width;
    this.height = 500 - this.margin.top - this.margin.bottom;


    // TODO: remove this after debugging

    this.mapJSONData();
  }


  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    let self = this;
    let parseTime = d3.timeParse("%Y-%m-%d");

    // set the ranges
    this.x = d3.scaleTime().range([0, this.width]);
    this.yLeft = d3.scaleLinear().range([this.height, 0]);
    this.yRight = d3.scaleLinear().range([this.height, 0]);

    // define the 1st line
    var valueline = d3.line()
      .x(function(d) { return self.x(d.date); })
      .y(function(d) { return self.yLeft(d.count); });

    // define the 2nd line
    var valueline2 = d3.line()
      .x(function(d) { return self.x(d.date); })
      .y(function(d) { return self.yRight(d.sentiment); });

    // format the data
    this.data.links.forEach(function(d) {
      d.date = parseTime(d.date);
      d.count = +d.count;
      d.sentiment = +d.sentiment;
    });

    // Scale the range of the data
    this.x.domain(d3.extent(this.data.links, function(d) { return d.date; }));
    this.yLeft.domain([0, d3.max(this.data.links, d => d.count)]);
    this.yRight.domain([d3.min(this.data.links, d => d.sentiment), d3.max(this.data.links, d => d.sentiment)]);
      
    // Set diagram size
    this.setDiagramSize();

    //plot diagram
    this.createDiagram(valueline, valueline2);
  }

  createDiagram(valueline, valueline2){
    let self = this;

    this.svg.append("path")
      .data([this.data.links])
      .attr("class", "line")
      .style("opacity", "0.5")
      .attr("d", valueline);

    // Add the valueline2 path.
    this.svg.append("path")
      .data([this.data.links])
      .attr("class", "line")
      .style("opacity", "0.5")
      .style("stroke", "red")
      .attr("d", valueline2)
      .on("mouseover", d => {
        // d3.select(d.target).style("fill", "#000");
      });

    // Add the X Axis
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x));

    // Add the Y Axis on the left
    this.svg.append("g")
      .attr("class", "axisLeft")
      .call(d3.axisLeft(this.yLeft));

    // Add the Y Axis on the left
    this.svg.append("g")
      .attr("transform", "translate(" + this.width + ", 0)")
      .attr("class", "axisRight")
      .call(d3.axisRight(this.yRight));
  }

  setDiagramSize(){

    this.svg = d3.select("#vis_linediagram")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")");

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
