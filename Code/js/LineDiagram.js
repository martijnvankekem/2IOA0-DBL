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

    this.parseTime = d3.timeParse("%d-%b-%y");

    this.jsonData = JSON.parse(JSON.stringify(json));
    this.data = json;
    this.format = format;

    // TODO: remove this after debugging
    console.log(this.data);

    this.margin = {top: 20, right: 40, bottom: 30, left: 50};
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;


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
      this.dates.push(this.item.date);
      this.counts.push(this.item.count);
      for (let attribute of Object.keys(this.item)) {

        if (attribute != "date") {
          this.item[attribute] = Number(this.item[attribute]);
        }
      }
    }

    this.dates2 = [];
    for (let row of Object.keys(this.item.date)){
      this.dates2.push(this.parseTime(Object.keys(this.item)))
    }

    console.log(this.dates2);

    this.x = d3.scaleTime()
      .domain(d3.extent(this.dates, function(d) { return d.date}))
      .range([0,this.width]);
    this.y0 = d3.scaleLinear().range([this.height, 0]);
    //var y1 = d3.scaleLinear().range([height, 0]);


    let valueline = d3.line()
        //.x(function(d) { return x(d.this.links.date); })
        //.y(function(d) { return y0(d.this.links.count); });


    this.setDiagramSize();

    this.createDiagram(valueline);


  }

  createDiagram(valueline){
    // Scale the range of the data
    this.scale_x = d3.scaleTime()
      .domain([new Date("1998-12-11 00:00:00"), new Date("2002-06-20 00:00:00")])
      .range([0, width - this.margin.right]);

    this.y0.domain([0, 200]); //might change later to iterable scale




    // Add the valueline path.
    this.svg.append("path")
      .data([this.counts])
      .attr("class", "line")
      .attr("d", valueline);



    // Add the X Axis



    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.scale_x));


    // Add the Y0 Axis
    this.svg.append("g")
      .attr("class", "axisSteelBlue")
      .call(d3.axisLeft(this.y0));



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
