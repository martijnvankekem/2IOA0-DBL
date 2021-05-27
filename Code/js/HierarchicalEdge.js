/**
 * Hierarchical Edge Diagram visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let test;

/**
 * Hierarchical Edge Diagram - Visualization Class
 */
class HierarchicalEdge {
  /**
   * Constructor for HierarcicalEdge.
   * @param {Array}  json              JSON array with data to visualize.
   * @param {Array}  format            The visualization format.
   */
  constructor(json, format) {    
    this.jsonData = JSON.parse(JSON.stringify(json));
    this.data = json;

    console.log(this.data);

    this.format = format;
    this.colornone = "#ccc";
    this.colorout = "#f00";
    this.colorin = "#00f";

    this.mainNodeAttribute = this.format.nodeGroups[0][0].attribute;

    this.sizeData = [0, 0];
    this.diameter = width - 500;
    this.radius = this.diameter / 2
    this.innerRadius = this.radius;
    this.width = width - 300;

    this.createControlWindow();
    this.mapJSONData();
  }

  /**
   * Create elements for control window
   */
   createControlWindow() {
    let controlWindow = document.getElementById("controlWindow");
    let zoomIn = document.getElementById("button_zoomIn");
    let zoomOut = document.getElementById("button_zoomOut");

    zoomIn.addEventListener("click", () => this.changeZoom(true));
    zoomOut.addEventListener("click", () => this.changeZoom(false));

    // Hide filter window for Hierarchical edge
    document.getElementById("controlWindow_filter").style.display = "none";
    
    // Set control window to visible.
    controlWindow.style.display = "block";
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    document.getElementById("vis_hierarchical").innerHTML = ""; // Clear SVG data

    let data = this.hierarchy(this.data.nodes);

    let tree = d3.cluster()
      .size([2 * Math.PI, this.radius - 100])

    let line = d3.lineRadial()
      .curve(d3.curveBundle.beta(0.85))
      .radius(d => d.y)
      .angle(d => d.x)

    this.createVisualization(data, tree, line);
    this.setVisSize();
  }

  /**
   * Set the size of the matrix based on its contents
   */
   setVisSize() {
    this.svg = document.getElementById("vis_hierarchical");

    // Get the bounds of the SVG content
    let bbox = this.svg.getBBox();
    // Update the width and height using the size of the contents
    this.sizeData = [this.width, this.width];

    this.svg.setAttribute("width", this.sizeData[0]);
    this.svg.setAttribute("height", this.sizeData[1]);
  }

  /**
   * Change the current zoom scale of the visualization
   * @param {Boolean} zoomIn Whether to zoom in or out (true = zoom in, false = zoom out)
   */
  changeZoom(zoomIn) {
    const zoomFactor = 0.95;

    // Divide x and y by the zoom factor
    if (zoomIn) {
      this.sizeData[0] /= zoomFactor;
      this.sizeData[1] /= zoomFactor;
    } else {
      this.sizeData[0] *= zoomFactor;
      this.sizeData[1] *= zoomFactor;
    }

    this.svg.setAttribute("width", this.sizeData[0]);
    this.svg.setAttribute("height", this.sizeData[1]);
  }

  /**
   * Create the visualization
   * @param   {Array}         data The data to visualize.
   * @param   {d3.cluster}    tree The d3 tree object.
   * @param   {d3.lineRadial} line The d3 line radial object.
   * @returns {svg.node}           The created node.
   */
  createVisualization(data, tree, line) {
    const root = tree(this.bilink(d3.hierarchy(data)
      .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

    const svg = d3.select("#vis_hierarchical")
      .attr("viewBox", [-this.width / 2, -this.width / 2, this.width, this.width]);

    // Create the nodes.
    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 14)
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.name)
      .each(function (d) { d.text = this; })
      .on("mouseover", overed)
      .on("mouseout", outed)
      .call(text => text.append("title").text(d => `${this.id(d)}
              ${d.outgoing.length} outgoing
              ${d.incoming.length} incoming`));

    // Create the links between each node.
    const link = svg.append("g")
      .attr("stroke", this.colornone)
      .attr("fill", "none")
      .selectAll("path")
      .data(root.leaves().flatMap(leaf => leaf.outgoing))
      .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function (d) { d.path = this; });

    // Save class context for use in callback functions.
    let self = this;
    /**
     * Callback when a node is overed.
     * @param {Event} event The action event that is called.
     * @param {Array} d     The node that is overed. 
     */
    function overed(event, d) {
      link.style("mix-blend-mode", null);
      d3.select(this).attr("font-weight", "bold");
      // Highlight all related links and nodes.
      d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", self.colorin).raise();
      d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", self.colorin).attr("font-weight", "bold");
      d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", self.colorout).raise();
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", self.colorout).attr("font-weight", "bold");
    }

    /**
     * Callback when a node is outed.
     * @param {Event} event The action event that is called.
     * @param {Array} d     The node that is outed. 
     */
    function outed(event, d) {
      link.style("mix-blend-mode", "multiply");
      d3.select(this).attr("font-weight", null);
      // Remove highlights from all related links and nodes.
      d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
      d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
    }

    return svg.node();
  }

  /**
   * Create a bilink between nodes
   * @param {Array} root The root element.
   * @returns            The root element with bilinks.
   */
  bilink(root) {
    const map = new Map(root.leaves().map(d => [this.id(d), d]));
    for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
    for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
    return root;
  }

  /**
   * Get the node ID.
   * @param   {Array}  node The node to retrieve the ID from.
   * @returns {String}      The node ID.
   */
  id(node) {
    return `${node.parent ? this.id(node.parent) + "/" : ""}${node.data.name}`;
  }

  /**
   * Create the hierarchy from the given data.
   * @param   {Array}  data      The data to use.
   * @param   {String} delimiter The delimiter to seperate the groups (default: /)
   * @returns {Array}            The created hierarchy.
   */
  hierarchy(data, delimiter = "/") {
    let root;
    const map = new Map;
    // Do for each node
    data.forEach(function find(data) {
      const { name } = data;
      if (map.has(name)) return map.get(name);
      // Get the node name (part after last delimiter)
      const i = name.lastIndexOf(delimiter);
      map.set(name, data);
      // Push each group to the root.
      if (i >= 0) {
        find({ name: name.substring(0, i), children: [] }).children.push(data);
        data.name = name.substring(i + 1);
      } else {
        root = data;
      }
      return data;
    });

    return root;
  }

}

/**
 * Create an hierarchical edge visualization from an array.
 * @param {Array}  data              JSON array with the data to visualize.
 * @param {Array}  format            The visualization format.
 */
function createHierarchicalEdge(data, format) {
  test = new HierarchicalEdge(data, format);
}