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
   * @param {Array}  json   JSON array with data to visualize.
   * @param {String} mainNodeAttribute The main attribute for the nodes.
   * @param {String} mainLinkAttribute The main attribute for the links.
   */
  constructor(json, mainNodeAttribute, mainLinkAttribute) {
    this.data = json;

    this.mainNodeAttribute = mainNodeAttribute;
    this.mainLinkAttribute = mainLinkAttribute;

    this.maxEmailCount = 1;
    this.minSentiment = 1;
    this.maxSentiment = -1;
    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    let matrix = this.createMatrixData(this.data.nodes);

    // Get all information about each sender-recipient pair
    let pairsData = this.createPairsData(this.data);

    this.createMatrix(matrix, pairsData);
    this.setMatrixSize();
  }
  
  /**
   * Set the size of the matrix based on its contents
   */
  setMatrixSize() {
    let svg = document.getElementById("vissvg");
    // Get the bounds of the SVG content
    let bbox = svg.getBBox();
    // Update the width and height using the size of the contents
    svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
    svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
  }

  /**
   * Create the visualisation itself.
   * @param {Array}      matrix     The matrix data to visualise.
   * @param {Dictionary} pairsData  Dictionary containing the data of each sender-recipient pair.
   */
  createMatrix(matrix, pairsData) {
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
      .attr("sentiment", d => {
        if (typeof pairsData[d.id] != "undefined") {
          // This pair exists, so get the average sentiment
          return "" + pairsData[d.id][0];
        } else {
          // No pair exists, so return empty
          return "";
        }
      })
      .attr("total", d => {
        if (typeof pairsData[d.id] != "undefined") {
          // This pair exists, so get the total number of e-mails
          return "" + pairsData[d.id][1];
        } else {
          // No pair exists, so return empty
          return "";
        }
      })
      .attr("x", d => d.x * 10)
      .attr("y", d => d.y * 10)
      .style("fill", d => {
        if (typeof pairsData[d.id] != "undefined") {
          // This pair exists, so get the color by average sentiment
          const mappedNumber = Number(pairsData[d.id][0]).map(-0.1, 0.1, 0, 1);
          return d3.interpolatePlasma(mappedNumber);
        } else {
          // No pair exists, so show white square
          return "#fff";
        }

      })
      .style("fill-opacity", d => {
        if (typeof pairsData[d.id] != "undefined") {
          // This pair exists, so get the total number of e-mails
          return Number(pairsData[d.id][1]).map(0, 50, 0.1, 1.0);
        } else {
          // No pair exists, so no e-mail traffic between users
          return 0;
        }
      });

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
      .text(d => d[this.mainNodeAttribute])
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
      document.getElementById("senderLabel").innerText = d.target.getAttribute("source");
      document.getElementById("recipientLabel").innerText = d.target.getAttribute("target");

      let sentiment = d.target.getAttribute("sentiment");
      if (sentiment == "") {
        // No e-mail traffic between sender-recipient pair, show message
        document.getElementById("hover_notraffic").style.display = "block";
        document.getElementById("hover_hastraffic").style.display = "none";
      } else {
        // E-mail traffic exists, show avg sentiment and total e-mails.
        document.getElementById("hover_notraffic").style.display = "none";
        document.getElementById("hover_hastraffic").style.display = "block";
        document.getElementById("sentimentLabel").innerText = sentiment;
        document.getElementById("totalLabel").innerText = d.target.getAttribute("total");
      }

    });

    d3.selectAll("#adjacencyG").on("mouseleave", d => {
      // Hide hover container when mouse leaves visualisation.
      document.getElementById("hoverContainer").style.display = "none";
    })
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
    let dict = {};

    for (let link of data.links) {
      let key = link.source + "-" + link.target;
      if (!(key in dict)) {
        // Create sender-recipient pair and set current sentiment and total amount.
        dict[key] = [Number(link[this.mainLinkAttribute]), 1];
      } else {
        // Add curent sentiment to total and increase the amount of links
        dict[key] = [dict[key][0] + Number(link[this.mainLinkAttribute]), dict[key][1] + 1];

        // Save extreme value value
        if (this.maxEmailCount < dict[key][1]) {
          this.maxEmailCount = dict[key][1];
        }
      }
    }

    // Calculate average sentiment for each sender-recipient pair.
    for (let key in dict) {
      dict[key][0] = dict[key][0] / dict[key][1];

      if (this.minSentiment > dict[key][0]) {
        this.minSentiment = dict[key][0];
      }
      if (this.maxSentiment < dict[key][0]) {
        this.maxSentiment = dict[key][0];
      }
    }

    return dict;
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
        let grid = {
          id: source[this.mainNodeAttribute] + "-" + target[this.mainNodeAttribute],
          x: b,
          y: a,
        };
        matrix.push(grid);
      });
    });

    return matrix;
  }
}

/**
 * Create an adjacency matrix visualization from an array.
 * @param {Array} data              JSON array with the data to visualize.
 * @param {String} mainNodeAttribute The main attribute for the nodes.
 * @param {String} mainLinkAttribute The main attribute for the links.
 */
function createAdjacencyMatrix(data, mainNodeAttribute, mainLinkAttribute) {
  new AdjacencyMatrix(data, mainNodeAttribute, mainLinkAttribute);
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
