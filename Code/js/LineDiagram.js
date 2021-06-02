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
    let data = JSON.parse(JSON.stringify(json));
    console.log(data);
    this.filters = [];

    this.jsonData = json;
    console.log(json);
    this.data = this.filterData(json);
    this.format = format;

    this.dateRange = this.jsonData["json[0]"];


    this.width=600;
    this.height=270;


    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {

    this.x = d3.scaleTime().domain([0, width]);
    console.log(this.x);
    this.y0 = d3.scaleLinear().domain([height, 0]);
    //var y1 = d3.scaleLinear().range([height, 0]);

    this.xAxis = d3.axisBottom(this.x).ticks(5);

    this.yAxisLeft = d3.axisLeft(this.y0).ticks(5);

    //var yAxisRight = d3.axisRight(y1).ticks(5);

    this.valueline = d3.line()
      .x(function(d) {
        return this.x(d.date);
      })
      .y(function(d) {
        return this.y0(d.close);
      });

      this.setDiagramSize();

      this.createDiagram();


  }

  createDiagram(){
    d3.select("#vis_linediagram").append("path")
      .attr("d", this.valueline(this.data))
    d3.select("#vis_linediagram")
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(this.xAxis);
    d3.select("#vis_linediagram")
      .append("g")
      .attr("class", "y axis")
      .style("fill", "steelblue")
      .call(this.yAxisLeft);
  }

  setDiagramSize(){
    this.svg = document.getElementById("vis_linediagram");

    // Get the bounds of the SVG content
    let bbox = this.svg.getBBox();
    // Update the width and height using the size of the contents
    this.sizeData = [width, height];



    this.svg.setAttribute("width", this.sizeData[0]);
    this.svg.setAttribute("height", this.sizeData[1]);

    if (visType == combinedVisType) this.changeZoom(false, 0.5);
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
