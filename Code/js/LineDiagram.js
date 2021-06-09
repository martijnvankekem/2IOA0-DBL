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
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;


    // TODO: remove this after debugging

    this.mapJSONData();
  }


  /**
   * Parse JSON and map data.
   */
  mapJSONData() {

    this.dates = []
    this.counts = []

    // Convert data to numbers
    for (let row of Object.keys(this.data.links)) {
      this.item = this.data.links[row];
      this.item.date = row;
      this.item.date = this.parseTime(this.item.date);
      this.dates.push(this.item.date);
      this.counts.push(this.item.count);

      for (let attribute of Object.keys(this.item)) {
        if (attribute != "date") {
          this.item[attribute] = Number(this.item[attribute]);
        }
      }
    }
    this.getdata = function() {
      this.dataset = [];
      for (let i = 0; i < 20; i++) {
        const datecount = {"date": this.dates[i], "counts": this.counts[i]};
        this.dataset.push(datecount);
      }
      console.log(this.dataset);
      return this.dataset
    }

    this.arrdata = this.getdata();

    //scale X axis

    var domain = d3.extent(this.dates);

    this.scale_x = d3.scaleTime()
      .domain(domain)
      .range([0,this.width]);

    // Scale Y0 axis
    this.y0 = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 200]);

    // Scale Y1 axis
    this.y1 = d3.scaleLinear()
      .range([this.height, 0])
      .domain([-1,1]);

    // Set diagram size
    this.setDiagramSize();

    //plot diagram
    this.createDiagram();
  }

  createDiagram(){

    this.arrdata.forEach(function(d){
      d.count = +d.count;
      d.new = +this.arrdata.counts;
    });
    console.log(this.arrdata);

    //Define first line (count and date)
    var valueline = d3.line()
      .x(function(d) { return scale_x(d.x); })
      .y(function(d) { return y0(d.y); });

      this.svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(this.data));

      // Add the X axis
      this.svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(this.scale_x));

        // Add the Y0 Axis
      this.svg.append("g")
          .attr("class", "axisSteelBlue")
          .call(d3.axisLeft(this.y0));

        // Add the Y1 axis
      this.svg.append("g")
        .attr("class", "axisRed")
        .attr("transform", "translate( " + this.width + ", 0 )")
        .call(d3.axisRight(this.y1));
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
