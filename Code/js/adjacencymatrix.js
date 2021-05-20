/**
 * Adjacency Matrix visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

/**
 * Adjacency Matrix - Visualization Class
 */
class AdjacencyMatrix {
  /**
   * Constructor for AdjacencyMatrix.
   * @param {Array}  json              JSON array with data to visualize.
   * @param {Array}  format            The visualisation format.
   */
  constructor(json, format) {
    this.data = this.filterData(json);
    this.format = format;

    this.mainNodeAttribute = this.format.nodeGroups[0][0].attribute;
    this.mainLinkAttribute = this.format.linkAttributes[0].attribute;
    this.pairsData = [];

    this.sizeData = [0, 0, 0, 0];

    this.maxEmailCount = 1;
    this.minLinkAttr = 1;
    this.maxLinkAttr = -1;

    this.createControlWindow();
    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    this.matrix = this.createMatrixData(this.data.nodes);

    // Get all information about each sender-recipient pair
    this.pairsData = this.createPairsData(this.data);

    this.createMatrix(this.matrix, this.pairsData);
    this.setMatrixSize();
  }
  
  /**
   * Set the size of the matrix based on its contents
   */
  setMatrixSize() {
    this.svg = document.getElementById("vissvg");
    // Get the bounds of the SVG content
    let bbox = this.svg.getBBox();
    // Update the width and height using the size of the contents
    this.sizeData = [bbox.x + bbox.width + bbox.x, bbox.y + bbox.height + bbox.y];
    
    this.svg.setAttribute("width", this.sizeData[0]);
    this.svg.setAttribute("height", this.sizeData[1]);
    this.svg.setAttribute("viewBox", `0 0 ${this.sizeData[0]} ${this.sizeData[1]}`);
  }

  /**
   * Change the current zoom scale of the visualization
   * @param {Boolean} zoomIn Whether to zoom in or out (True = zoom in)
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
   * Create elements for control window
   */
  createControlWindow() {
    let controlWindow = document.getElementById("controlWindow");
    let zoomIn = document.getElementById("button_zoomIn");
    let zoomOut = document.getElementById("button_zoomOut");

    zoomIn.addEventListener("click", () => this.changeZoom(true));
    zoomOut.addEventListener("click", () => this.changeZoom(false));
    
    // Set control window to visible.
    controlWindow.style.display = "block";
  }

  /**
   * Create the visualisation itself.
   * @param {Array}      matrix     The matrix data to visualise.
   * @param {Dictionary} pairsData  Dictionary containing the data of each sender-recipient pair.
   */
  createMatrix(matrix, pairsData) {
    // Create grid
    d3.select("#vissvg").append("g")
      .attr("transform", "translate(160,160)")
      .attr("id", "adjacencyG")
      .selectAll("rect")
      .data(matrix)
      .enter()
      .append("rect")
      .attr("class", "grid")
      .attr("width", 10)
      .attr("height", 10)
      .attr("data-id", d => d.id)
      .attr("linkAttr", d => {
        if (pairsData[d.id].total > 0) {
          // This pair exists, so get the average sentiment
          return "" + pairsData[d.id].linkAttr;
        } else {
          // No pair exists, so return empty
          return "";
        }
      })
      .attr("total", d => pairsData[d.id].total)
      .attr("x", d => d.x * 10)
      .attr("y", d => d.y * 10)
      .style("fill", d => {
        if (pairsData[d.id].total > 0) {
          // This pair exists, so get the color by average sentiment
          return d3.scaleLinear()
            .domain([-0.01, 0.00, 0.01])
            .clamp(true)
            .range(["#f55442", "#f5ad42", "#5ec744"])(Number(pairsData[d.id].linkAttr));
        } else {
          // No pair exists, so show white square
          return "#fff";
        }

      })
      .style("fill-opacity", d => {
        if (pairsData[d.id].total > 0) {
          // This pair exists, so get the total number of e-mails
          return Number(pairsData[d.id].total).map(0, 50, 0.1, 1.0);
        } else {
          // No pair exists, so no e-mail traffic between users
          return 0;
        }
      });

    // Create text on x-axis
    d3.select("#vissvg")
      .append("g")
      .attr("transform", "translate(150,150)")
      .selectAll("text")
      .data(this.data.nodes)
      .enter()
      .append("text")
      .attr("y", (d, i) => i * 10 + 17.5)
      .attr("col", "x")
      .text(d => d[this.mainNodeAttribute])
      .style("text-anchor", "left")
      .style("transform", "rotate(-90deg)")
      .style("font-size", "10px");

    // Create text on y-axis
    d3.select("#vissvg")
      .append("g").attr("transform", "translate(150,150)")
      .selectAll("text")
      .data(this.data.nodes)
      .enter()
      .append("text")
      .attr("y", (d, i) => i * 10 + 17.5)
      .attr("col", "y")
      .text(d => d[this.mainNodeAttribute])
      .style("text-anchor", "end")
      .style("font-size", "10px");

    // Create interactive parts
    this.createGridHighlights();
    this.createHoverContainer();
  }

  /**
   * Create and fill information container on hover.
   */
  createHoverContainer() {
    d3.selectAll("rect.grid").on("mouseover", d => {
      // Show hover container at mouse position
      let hoverContainer = document.getElementById("hoverContainer");
      hoverContainer.style.display = "block";
      // Move container to left/top of cursor if we reach the end of the screen.
      let xOffset = (d.x + hoverContainer.offsetWidth > width) ? (-hoverContainer.offsetWidth - 20) : 20;
      let yOffset = (d.y + hoverContainer.offsetHeight > height) ? (-hoverContainer.offsetHeight - 20) : 20;
      hoverContainer.style.left = d.x + xOffset + "px";
      hoverContainer.style.top = d.y + yOffset + "px";

      // Set labels to correct values
      let id = this.pairsData[d.target.getAttribute("data-id")].id;
      this.createInfoList(id);

      let linkAttr = d.target.getAttribute("linkAttr");
      if (linkAttr == "") {
        // No e-mail traffic between sender-recipient pair, show message
        document.getElementById("hover_notraffic").style.display = "block";
        document.getElementById("hover_hastraffic").style.display = "none";
      } else {
        // E-mail traffic exists, show avg sentiment and total e-mails.
        document.getElementById("hover_notraffic").style.display = "none";
        document.getElementById("hover_hastraffic").style.display = "block";
        document.getElementById("linkAttrLabel").innerText = linkAttr;
        document.getElementById("totalLabel").innerText = d.target.getAttribute("total");
      }

    });

    d3.selectAll("#adjacencyG").on("mouseleave", d => {
      // Hide hover container when mouse leaves visualisation.
      document.getElementById("hoverContainer").style.display = "none";
    })
  }

  /**
   * Fill the info box with data on hover
   * @param {Integer} id The index of the item in the matrix.
   */
  createInfoList(id) {
    let sourceList = document.getElementById("sourceList");
    let targetList = document.getElementById("targetList");
    sourceList.innerHTML = "";
    targetList.innerHTML = "";
    
    for (let item of Object.keys(this.matrix[id].attributes)) {
      // Add attribute to source list
      if (typeof this.matrix[id].attributes[item].source != "undefined") {
        let sourceItem = document.createElement("li");
        sourceItem.innerText = item + ": " + this.matrix[id].attributes[item].source;
        sourceList.appendChild(sourceItem);  
      }
      // Add attribute to target list
      if (typeof this.matrix[id].attributes[item].target != "undefined") {
        let targetItem = document.createElement("li");
        targetItem.innerText = item + ": " + this.matrix[id].attributes[item].target;
        targetList.appendChild(targetItem);
      }
    }
  }

  /**
   * Highlight grid and labels on hover.
   */
  createGridHighlights() {
    d3.selectAll("rect.grid").on("mousemove", d => {
      d3.selectAll("rect").style("stroke-width", function(p) {
        return (p.x * 10 == d.target.x.animVal.value || p.y * 10 == d.target.y.animVal.value) ? "3px" : "1px";
      });
    });
  }

  /**
   * Create a dictionary of all node combinations with the corresponding count.
   * @param  {Array}      data The retrieven JSON data.
   * @return {Dictionary}      The array with all nodes and their count.
   */
  createPairsData(data) {
    for (let link of data.links) {
      let key = link.source + "-" + link.target;
      if (!(key in this.pairsData)) continue;
      // Add curent sentiment to total and increase the amount of links
      this.pairsData[key].linkAttr += Number(link[this.mainLinkAttribute])
      this.pairsData[key].total += 1;

      // Save extreme value value
      if (this.maxEmailCount < this.pairsData[key].linkAttr) {
        this.maxEmailCount = this.pairsData[key].linkAttr;
      }
    }

    // Calculate average sentiment for each sender-recipient pair.
    for (let key in this.pairsData) {
      // Skip if there are no links between nodes
      if (this.pairsData[key].total == 0) continue;

      this.pairsData[key].linkAttr = this.pairsData[key].linkAttr / this.pairsData[key].total;

      if (this.minLinkAttr > this.pairsData[key].linkAttr) {
        this.minLinkAttr = this.pairsData[key].linkAttr;
      }
      if (this.maxLinkAttr < this.pairsData[key].linkAttr) {
        this.maxLinkAttr = this.pairsData[key].linkAttr;
      }
    }

    return this.pairsData;
  }

  /**
   * Filter out invalid data from the dataset
   * @param  {Array} nodes The array of nodes.
   * @return {Array}       The filtered array of nodes.
   */
  filterData(data) {
    for (let node of data.nodes) {
      if (node == null) {
        data.nodes.splice(data.nodes.indexOf(node), 1);
      }
    }

    return data;
  }

  /**
   * Format the nodes into a matrix.
   * @param  {Array} nodes Array containing the nodes.
   * @return {Array}       The array with formatted matrix data.
   */
  createMatrixData(nodes) {
    let matrix = [];
    nodes.forEach((source, a) => {
      nodes.forEach((target, b) => {
        let gridID = source[this.mainNodeAttribute] + "-" + target[this.mainNodeAttribute];
        let grid = {
          id: gridID,
          source: source[this.mainNodeAttribute],
          target: target[this.mainNodeAttribute],
          attributes: [],
          x: b,
          y: a,
        };
        // Insert source attributes intro matrix
        for (let item of this.format.nodeGroups[0]) {
          if (typeof grid.attributes[item.attribute] != "undefined") {
            grid.attributes[item.attribute].source = source[item.attribute];
          } else {
            grid.attributes[item.attribute] = {source: source[item.attribute]};
          }
        }
        // Insert target attributes intro matrix
        for (let item of this.format.nodeGroups[1]) {
          if (typeof grid.attributes[item.attribute] != "undefined") {
            grid.attributes[item.attribute].target = target[item.attribute];
          } else {
            grid.attributes[item.attribute] = {target: target[item.attribute]};
          }
        }
        // Add grid item to matrix
        let insertID = matrix.length;
        matrix[insertID] = grid;
        this.pairsData[gridID] = {id: insertID, linkAttr: 0, total: 0};
      });
    });

    return matrix;
  }
}

/**
 * Create an adjacency matrix visualization from an array.
 * @param {Array}  data              JSON array with the data to visualize.
 * @param {Array}  format            The visualisation format.
 */
function createAdjacencyMatrix(data, format) {
  new AdjacencyMatrix(data, format);
}

/**
 * Map a number in between a range to another range.
 * @param  {Number} a Start range minimum.
 * @param  {Number} b Start range maximum.
 * @param  {Number} c End range minimum.
 * @param  {Number} d End range maximum.
 * @return {Number}   A number ranged between c and d.
 */
Number.prototype.map = function(a, b, c, d) {
  return c + (d - c) * ((this - a) / (b - a))
};
