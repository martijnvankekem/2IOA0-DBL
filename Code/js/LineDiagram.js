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
   * @param {Array}    json     JSON array with data to visualize.
   * @param {Array}    format   The visualization format.
   * @param {Function} callback The function to execute after drawing the visualization.
   */
  constructor(json, format, callback) {

    this.parseTime = d3.timeParse("%Y-%m-%d");
    this.data = json;

    this.jsonData = JSON.parse(JSON.stringify(json));

    this.format = format;

    this.margin = {top: 20, right: 60, bottom: 30, left: 50};
    this.width = width - 100;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.mainLinkAttribute = this.format.linkAttributes[0].attribute;

    this.hoverDistance = 5; // The amount of elements to the left/right of the hovered data point

    this.mapJSONData(callback);
  }


  /**
   * Parse JSON and map data.
   * @param {Function} callback The function to execute after drawing the visualization.
   */
  mapJSONData(callback) {
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
      .y(function(d) { return self.yRight(d[self.mainLinkAttribute]); });

    // format the data
    this.data.links.forEach(function(d) {
      d.date = parseTime(d.date);
      d.count = +d.count;
      d[self.mainLinkAttribute] = +d[self.mainLinkAttribute];
    });

    // Scale the range of the data
    this.x.domain(d3.extent(this.data.links, function(d) { return d.date; }));
    this.yLeft.domain([0, d3.max(this.data.links, d => d.count)]);
    this.yRight.domain([d3.min(this.data.links, d => d[self.mainLinkAttribute]), d3.max(this.data.links, d => d[self.mainLinkAttribute])]);
      
    // Set diagram size
    this.setDiagramSize();

    //plot diagram
    this.createDiagram(valueline, valueline2, callback);
  }

  /**
   * Start drawing the visualization
   * @param {d3.line}  valueline  The valueline for the left axis.
   * @param {d3.line}  valueline2 The valueline for the right axis.
   * @param {Function} callback  The function to execute after drawing the visualization.
   */
  createDiagram(valueline, valueline2, callback){
    // Show adjacency container
    document.getElementById("container_line").classList.add("visible");

    let self = this;

    // Draw the lines for the left axis
    this.svg.append("path")
      .data([this.data.links])
      .attr("class", "line")
      .style("opacity", "0.5")
      .attr("d", valueline);

    // Draw the lines for the right axis.
    this.svg.append("path")
      .data([this.data.links])
      .attr("class", "line")
      .style("opacity", "0.5")
      .style("stroke", "red")
      .attr("d", valueline2);

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

    // Add the left Y-axis label
    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .attr("class", "axisLeft")
      .style("text-anchor", "middle")
      .text("count");  

    // Add the right Y-axis label
    this.svg.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", -this.width-this.margin.right)
      .attr("x", (this.height / 2))
      .attr("dy", "1em")
      .attr("class", "axisRight")
      .style("text-anchor", "middle")
      .text(this.mainLinkAttribute);  

    // Add the bottom X-axis label
    this.svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height + this.margin.bottom)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("date");  

    // Draw the hover rectangle for mouse interactions.
    this.svg.append("rect")
      .attr("class", "mouseEventRect")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("mousemove", (event) => this.mousemove(self, event))
      .on("mouseleave", (event) => this.mouseleave(self, event))
      .on("click", (event) => this.mouseclick(self, event));

      if (typeof callback != "undefined") callback();
  }

  /**
   * Event when the visualization has been clicked.
   * @param   {LineDiagram} self  The current class context.
   * @param   {Event}       event The event that was fired.
   */
  mouseclick(self, event) {
    // Only allow mouse click for all vis combined
    if (visType < combinedVisType || !adjacencyMatrix || !hierarchicalEdge) return;

    let [closestIndex, leftIndex, rightIndex] = self.getBoundsByMousePos(self, event);

    const leftElement = self.data.links[leftIndex];
    const rightElement = self.data.links[rightIndex];

    // TODO: set date filter with left/right bounds.
    let picker = $(dateRangePicker).data('daterangepicker');
    picker.setStartDate(leftElement.date);
    picker.setEndDate(rightElement.date);
    dateFilterChanged(picker.startDate, picker.endDate);
  }

  /**
   * Event when the mouse has moved over the visualization.
   * @param   {LineDiagram} self  The current class context.
   * @param   {Event}       event The event that was fired.
   */
  mousemove(self, event) {
    let [closestIndex, leftIndex, rightIndex] = self.getBoundsByMousePos(self, event);

    const leftElement = self.data.links[leftIndex];
    const rightElement = self.data.links[rightIndex];

    let dateFormat = d3.timeFormat("%Y-%m-%d");

    // Show hover container and put at mouse position
    let hoverContainer = document.getElementById("hoverContainer_linediagram");
    hoverContainer.style.display = "block";

    let xOffset = (event.x + hoverContainer.offsetWidth > width) ? (-hoverContainer.offsetWidth - 20) : 20;
    let yOffset = (event.y + hoverContainer.offsetHeight > height) ? (-hoverContainer.offsetHeight - 20) : 20;
    hoverContainer.style.left = event.x + xOffset + "px";
    hoverContainer.style.top = event.y + yOffset + "px";

    // Fill hover container with data
    document.getElementById("hover_linediagram_closest").innerHTML = dateFormat(self.data.links[closestIndex].date);
    document.getElementById("hover_linediagram_left").innerHTML = dateFormat(self.data.links[leftIndex].date);
    document.getElementById("hover_linediagram_right").innerHTML = dateFormat(self.data.links[rightIndex].date);
    
    let linkList = document.getElementById("linklist_linediagram");
    linkList.innerHTML = "";
    for (let attribute of Object.keys(this.data.links[closestIndex])) {
      if (attribute == "date") continue;

      let newItem = document.createElement("li");
      newItem.innerHTML = attribute + ": " + this.data.links[closestIndex][attribute];
      linkList.appendChild(newItem);
    }

    // Remove previous drawn lines
    this.svg.selectAll("line.hoverLineLeft").remove();
    this.svg.selectAll("line.hoverLineRight").remove();

    // Draw left line
    this.svg.append("line")
      .attr("class", "hoverLineLeft")
      .style("stroke", "black")
      .attr("x1", self.x(leftElement.date))
      .attr("y1", 0)
      .attr("x2", self.x(leftElement.date))
      .attr("y2", this.height);

    // Draw right line
    this.svg.append("line")
    .attr("class", "hoverLineRight")
      .style("stroke", "black")
      .attr("x1", self.x(rightElement.date))
      .attr("y1", 0)
      .attr("x2", self.x(rightElement.date))
      .attr("y2", this.height);
  }

  /**
   * Event when the mouse has left the visualization.
   * @param {Event} event The event that was fired.
   */
  mouseleave(event) {
    // Remove left/right lines
    this.svg.selectAll("line.hoverLineLeft").remove();
    this.svg.selectAll("line.hoverLineRight").remove();
    document.getElementById("hoverContainer_linediagram").style.display = "none";
  }

  /**
   * Get the closest index + left and right bounds from the mouse position.
   * @param   {LineDiagram} self  The current class context.
   * @param   {Event}       event The event that was fired.
   * @returns {Array}             The index closest to the mouse, plus the left and right bounds' index. 
   */
  getBoundsByMousePos(self, event) {
    const mousePos = d3.pointer(event);
    const hoveredDate = self.x.invert(mousePos[0]);

    const getDistanceFromHoveredDate = (d) => Math.abs(d.date - hoveredDate);
    const closestIndex = d3.scan(self.data.links, (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b));
    
    const leftIndex = (closestIndex - self.hoverDistance >= 0) ? (closestIndex - self.hoverDistance) : 0;
    const rightIndex = (closestIndex + self.hoverDistance < self.data.links.length) ? (closestIndex + self.hoverDistance) : (self.data.links.length - 1);

    return [closestIndex, leftIndex, rightIndex];
  }

  /**
   * Set the size of the visualization
   */
  setDiagramSize(){
    this.svg = d3.select("#vis_linediagram")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom + this.margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")");
  }

}

/**
 * Create an line diagram visualization from an array.
 * @param {Array}    data     JSON array with the data to visualize.
 * @param {Array}    format   The visualization format.
 * @param {Function} callback The function to execute after drawing the visualization.
 * 
 */
function createLineDiagram(data, format, callback) {
  lineDiagram = new LineDiagram(data, format, callback);
}
