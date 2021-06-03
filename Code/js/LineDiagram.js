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
    this.parseTime= d3.timeParse("%d-%b-%y");

    this.filters = [];

    this.jsonData = JSON.parse(JSON.stringify(json));
    this.data = this.filterData(json);
    console.log(this.data);
    this.format = format;

    this.dateRange = this.jsonData["json[0]"];

    this.margin= {top:20,right:40,bottom:30,left:50},
      this.width=960-this.margin.left-this.margin.right,
      this.height=500-this.margin.top-this.margin.bottom;


    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {

    // Convert data to numbers
    for (let row of Object.keys(this.data.links)) {
      this.item = this.data.links[row];
      this.item.date = row;
      for (let attribute of Object.keys(this.item)) {
        if (attribute != "date") {
          this.item[attribute] = Number(this.item[attribute]);
        }
      }
    }

    this.x = d3.scaleTime().range([0,this.width]);
    this.y0 = d3.scaleLinear().range([this.height, 0]);
    //var y1 = d3.scaleLinear().range([height, 0]);


    let valueline = d3.line()
        .x(function(d) { return x(d.this.links.date); })
        .y(function(d) { return y0(d.this.links.count); });

    this.setDiagramSize();

    this.createDiagram(valueline);


  }

  createDiagram(valueline){
    // Scale the range of the data
    //this.x.domain([this.data.date[0], this.data.date[1]]);
    this.scale_x = d3.scaleTime()
      .domain([this.data.date[0], this.data.date[1]])
      .range([0, this.width]);
    console.log(this.data.date[0], this.data.date[1]);
    this.y0.domain([0, 200]); //might change later to iterable scale



    // Add the valueline path.
    this.svg.append("path")
        .data([this.jsonData])
        .attr("class", "line")
        .attr("d", valueline);
        console.log("test1");


    // Add the X Axis
    this.x_axis= d3.axisBottom(this.x)
      .scale(this.scale_x);

    this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.x_axis);
        console.log("test2");

    // Add the Y0 Axis
    this.svg.append("g")
        .attr("class", "axisSteelBlue")
        .call(d3.axisLeft(this.y0));
        console.log("test3");


  }

  setDiagramSize(){
    this.svg = document.getElementById("vis_linediagram");
    this.svg = d3.select("body").append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");

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
