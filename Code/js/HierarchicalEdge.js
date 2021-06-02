/**
 * Hierarchical Edge Diagram visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

let hierarchicalEdge = null;

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
    this.filters = [];

    this.dateRange = this.jsonData["date"];
    this.dateFilter = [this.dateRange[0], this.dateRange[1]];

    this.data = this.parseLinks(this.filterData(json));
    this.format = format;

    this.colornone = "#ccc";
    this.colorout = "#f00";
    this.colorin = "#00f";

    this.mainNodeAttribute = this.format.nodeGroups[0][0].attribute;

    this.prepareFilters();

    this.sizeData = [0, 0];
    this.diameter = width - 800;
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

    // Check if a valid min/max date was received.
    if (this.dateRange[0] != false && this.dateRange[1] != false &&
      dateRangePicker == null) {
      // Get date range object
      dateRangePicker = document.getElementById("dateRangePicker");

      // Create date range picker
      $(dateRangePicker).daterangepicker({
        startDate: this.dateFilter[0],
        minDate: this.dateRange[0],
        endDate: this.dateFilter[1],
        maxDate: this.dateRange[1],
        alwaysShowCalendars: true,
        showCustomRangeLabel: true,
        linkedCalendars: false,
        showDropdowns: true,
        ranges: {
          'All dates': [this.dateRange[0], this.dateRange[1]]
        }
      }, dateFilterChanged);
    }

    // Set control window to visible.
    controlWindow.style.display = "block";
  }

  /**
   * Redraw the visualization
   */
  redraw() {
    this.data = this.parseLinks(this.filterData(this.jsonData));
    this.mapJSONData();
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
   * Setup the filters with the correct values.
   */
  prepareFilters() {
    this.attributeValues = this.getAttributeValues(this.jsonData);

    if (filterPrepared) return;

    let filterContainer = document.getElementById("filterContainer");

    // Do for every filterable attribute
    for (let attribute of Object.keys(this.attributeValues)) {
      // Create a container
      let newContainer = document.createElement("div");
      newContainer.classList.add("filter");

      // Create a label
      let newLabel = document.createElement("label");
      newLabel.setAttribute("for", "select_" + attribute);
      newLabel.innerHTML = attribute;

      // Create a dropdown box
      let newSelect = document.createElement("select");
      newSelect.setAttribute("id", "select_" + attribute);
      newSelect.setAttribute("data-attribute", attribute);
      newSelect.setAttribute("multiple", "");
      newSelect.setAttribute("size", 0);

      // Create dropdown items
      for (let item of this.attributeValues[attribute]) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", item);
        newOption.innerHTML = item;
        newSelect.appendChild(newOption);
      }

      // Add label and dropdown to container
      newContainer.appendChild(newLabel);
      newContainer.appendChild(newSelect);

      // Add container to page
      filterContainer.appendChild(newContainer);

      // Add checkboxes to dropdown box
      let selectBox = new vanillaSelectBox("#select_" + attribute);
      selectBox.setValue('all');

      // Add on-click handler
      newSelect.addEventListener("change", (event) => {
        filterChanged(attribute);
      });
    }

    filterPrepared = true;
  }

  /**
   * Update the filters
   * @param {String} attribute The attribute name to change the filter for.
   */
  updateFilter(attribute) {
    let selected = [];

    // Get selected items
    let collection = document.querySelectorAll("#select_" + attribute + " option");
    collection.forEach(function (x) {
      if (x.selected) {
        selected.push(x.value);
      }
    });

    // Update filter
    for (let filter of this.filters) {
      if (filter.attribute != attribute) continue;
      filter.values = selected;
      break;
    }

    // Redraw visualization
    this.redraw();
  }

  /**
 * Filter out invalid data from the dataset
 * @param  {Array} json The array of json data.
 * @return {Array}       The filtered array of nodes.
 */
  filterData(json) {
    // Make a clone of the array
    let data = JSON.parse(JSON.stringify(json));

    // Remove nodes that don't match the filter.
    for (let nodeGroup = 0; nodeGroup < data.nodes.length; nodeGroup++) {
      let group = data.nodes[nodeGroup];
      // Do for both source as target
      for (let i = Object.keys(group).length - 1; i >= 0; i--) {
        let nodeName = Object.keys(group)[i];
        let node = group[nodeName];

        // Node is null, so remove it and continue.
        if (node == null) {
          delete group[nodeName];
          continue;
        }

        // Check if node matches the filter.
        for (let filter of this.filters) {
          // If filter is not meant for this node kind, skip.
          if (nodeGroup == 0 && filter.kind == "target") continue;
          if (nodeGroup == 1 && filter.kind == "source") continue;

          if (!filter.checkMatch(node[filter.attribute])) {
            delete data.nodes[nodeGroup][nodeName];
          }
        }
      }
    }
    return data;
  }

  /**
   * Get the unique values to enable filtering.
   * @param   {Array} json The data array to retrieve the values from.
   * @returns {Array}      The array of unique values to filter by.
   */
  getAttributeValues(json) {
    let values = {};
    let attributeIndex = {};

    // Create dictionary with empty arrays
    for (let group of this.format.nodeGroups) {
      for (let row of group) {
        values[row.attribute] = [];
      }
    }

    // Create filters
    for (let attribute of Object.keys(values)) {
      let inSource = false;
      let inTarget = false;

      // Check if attribute is in source
      for (let item of this.format.nodeGroups[0]) {
        if (item.attribute == attribute) {
          inSource = true;
          break;
        }
      }

      // Check if attribute is in target
      for (let item of this.format.nodeGroups[1]) {
        if (item.attribute == attribute) {
          inTarget = true;
          break;
        }
      }

      let kind = "";
      if (inSource && !inTarget) kind = "source";
      else if (!inSource && inTarget) kind = "target";
      else if (inSource && inTarget) kind = "both";

      attributeIndex[attribute] = this.filters.length;
      this.filters.push(new Filter(attribute, [], kind));
    }


    // Fill arrays with possible values
    for (let nodeGroup of json.nodes) {
      for (let nodeName of Object.keys(nodeGroup)) {
        let node = nodeGroup[nodeName];
        for (let attribute of Object.keys(values)) {
          // Skip if attribute doesn't exist in dictionary
          if (!Object.keys(values).includes(attribute)) continue;
          // If the current value of this attribute doesn't exist
          if (!values[attribute].includes(node[attribute])) {
            // Add possible value to dropdown
            values[attribute].push(node[attribute]);
            // Add possible value to filter
            this.filters[attributeIndex[attribute]].values.push(node[attribute]);
          }
        }
      }
    }


    return values;
  }

  /**
   * Set the size of the matrix based on its contents
   */
  setVisSize() {
    this.svg = document.getElementById("vis_hierarchical");

    // Update the width and height using the size of the contents
    this.sizeData = [width, width];

    this.svg.setAttribute("width", this.sizeData[0]);
    this.svg.setAttribute("height", this.sizeData[1]);

    if (visType == combinedVisType) this.changeZoom(false, 0.5);
  }

  /**
   * Change the current zoom scale of the visualization
   * @param {Boolean} zoomIn     Whether to zoom in or out (true = zoom in, false = zoom out)
   * @param {Float}   zoomFactor The factor to zoom in or out with (default: 0.95)
   */
  changeZoom(zoomIn, zoomFactor = 0.95) {
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
    this.root = tree(this.bilink(d3.hierarchy(data)
      .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

    const svg = d3.select("#vis_hierarchical")
      .attr("viewBox", [-this.width / 2, -this.width / 2, this.width, this.width]);

    // Create the links between each node.
    this.link = svg.append("g")
      .attr("stroke", this.colornone)
      .attr("fill", "none")
      .selectAll("path")
      .data(this.root.leaves().flatMap(leaf => leaf.outgoing))
      .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function (d) { d.path = this; });

    // Create the nodes.
    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("class", "nodes")
      .attr("font-size", 16)
      .selectAll("g")
      .data(this.root.leaves())
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.name)
      .attr("data-id", d => d.data.name)
      .each(function (d) { d.text = this; })
      .on("mouseover", (event, d) => this.overed(event.target, d))
      .on("mouseout", (event, d) => this.outed(event.target, d))
      .attr("data-outgoing", d => d.outgoing.length)
      .attr("data-incoming", d => d.incoming.length);

    this.createHoverContainer();

    return svg.node();
  }

  /**
     * Callback when a node is overed.
     * @param {Array}   target         The target element that is overed.
     * @param {Array}   d              The slot that is overed. 
     * @param {Boolean} fromOtherClass Whether the request came from another class (default: false).
     */
  overed(target, d, fromOtherClass = false) {
    this.link.style("mix-blend-mode", null);
    d3.select(target).attr("font-weight", "bold");
    // Highlight all related links and nodes.
    d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", this.colorin).raise();
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", this.colorin).attr("font-weight", "bold");
    d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", this.colorout).raise();
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", this.colorout).attr("font-weight", "bold");

    // Dual visualization
    if (visType == combinedVisType && !fromOtherClass) {
      if (adjacencyMatrix == null) return;
      let source = target.getAttribute("data-id");
      let nodeElement = document.querySelectorAll("rect.grid[data-source=\""+source+"\"]")[0];

      adjacencyMatrix.moved(nodeElement, true);
    }
  }

  /**
 * Callback when a node is outed.
 * @param {Array}   target         The target element that is overed.
 * @param {Array}   d              The slot that is outed. 
 * @param {Boolean} fromOtherClass Whether the request came from another class (default: false).
 */
  outed(target, d, fromOtherClass = false) {
    this.link.style("mix-blend-mode", "multiply");
    d3.select(target).attr("font-weight", null);
    // Remove highlights from all related links and nodes.
    d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
    d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);

    // Dual visualization
    if (visType == combinedVisType && !fromOtherClass) {
      if (adjacencyMatrix == null) return;
      adjacencyMatrix.outed(null, null, true);
    }
  }

  /**
   * Create and fill information container on hover.
   */
  createHoverContainer() {
    d3.selectAll(".nodes g").on("mouseover", d => {
      // Show hover container at mouse position
      let hoverContainer = document.getElementById("hoverContainer_hierarchy");
      hoverContainer.style.display = "block";

      // // Set labels to correct values
      let id = d.target.getAttribute("data-id");
      let outgoing = d.target.getAttribute("data-outgoing");
      let incoming = d.target.getAttribute("data-incoming");
      this.createInfoList(id, outgoing, incoming);

      // let linkAttr = d.target.getAttribute("linkAttr");
      let linkAttr = "";
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

      // Move container to left/top of cursor if we reach the end of the screen.
      let xOffset = (d.x + hoverContainer.offsetWidth > width) ? (-hoverContainer.offsetWidth - 20) : 20;
      let yOffset = (d.y + hoverContainer.offsetHeight > height) ? (-hoverContainer.offsetHeight - 20) : 20;
      hoverContainer.style.left = d.x + xOffset + "px";
      hoverContainer.style.top = d.y + yOffset + "px";
    });

    d3.selectAll(".nodes g").on("mouseleave", d => {
      // Hide hover container when mouse leaves visualization.
      document.getElementById("hoverContainer_hierarchy").style.display = "none";
    })
  }

  /**
   * Fill the info box with data on hover
   * @param {Integer} id The index of the item in the matrix.
   * @param {Integer} d  The target object that has been hovered.
   */
  createInfoList(id, outgoingCount, incomingCount) {
    let sourceList = document.getElementById("sourceList_hierarchy");
    sourceList.innerHTML = "";

    for (let item of this.format.nodeGroups[0]) {
      let attribute = item["attribute"];

      // Find node in either source or target node list.
      let nodeGroup = 0;
      if (typeof this.jsonData.nodes[0][id] != "undefined") {
        nodeGroup = 0;
      } else if (typeof this.jsonData.nodes[1][id] != "undefined") {
        nodeGroup = 1
      }

      // Add attribute to source list
      if (typeof this.jsonData.nodes[nodeGroup][id][attribute] != "undefined") {
        let sourceItem = document.createElement("li");
        sourceItem.innerText = attribute + ": " + this.jsonData.nodes[nodeGroup][id][attribute];
        sourceList.appendChild(sourceItem);
      }
    }

    document.getElementById("targetList_hierarchy_outgoing").innerHTML = outgoingCount;
    document.getElementById("targetList_hierarchy_incoming").innerHTML = incomingCount;
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
    for (let nodeGroup of data) {
      nodeGroup.forEach(function find(nodeGroup) {
        const { name } = nodeGroup;
        if (map.has(name)) return map.get(name);
        // Get the node name (part after last delimiter)
        const i = name.lastIndexOf(delimiter);
        map.set(name, nodeGroup);
        // Push each group to the root.
        if (i >= 0) {
          find({ name: name.substring(0, i), children: [] }).children.push(nodeGroup);
          nodeGroup.name = name.substring(i + 1);
        } else {
          root = nodeGroup;
        }
        return nodeGroup;
      });
    }

    return root;
  }

  /**
   * Add the links to the nodes
   * @param   {Array} json The array of json data.
   * @returns {Array}      The nodes with the links together.
   */
  parseLinks(json) {
    let data = JSON.parse(JSON.stringify(json));

    // Start/end range for date filter
    let start = Math.floor(new Date(this.dateFilter[0]).getTime() / 1000);
    let end = Math.floor(new Date(this.dateFilter[1]).getTime() / 1000);

    for (let link of data.links) {
      // Skip link if outside the date range
      let dateMillis = Number(link["date"]);
      if (dateMillis > end || dateMillis < start) continue;

      // Get source and target
      let source = link["source"];
      let target = link["target"];

      // Skip link if node doesn't exist because of filter
      if (typeof data.nodes[0][source] == "undefined" ||
        typeof data.nodes[1][target] == "undefined") {
        continue;
      }

      // If link not in array, add it
      if (!data.nodes[0][source]["imports"].includes(data.nodes[1][target]["name"])) {
        data.nodes[0][source]["imports"].push(data.nodes[1][target]["name"]);
      }
    }
    // Reset index and return
    data.nodes[0] = Object.keys(data.nodes[0]).map(e => data.nodes[0][e]);
    data.nodes[1] = Object.keys(data.nodes[1]).map(e => data.nodes[1][e]);

    return data;
  }

}

/**
 * Create an hierarchical edge visualization from an array.
 * @param {Array}  data              JSON array with the data to visualize.
 * @param {Array}  format            The visualization format.
 */
function createHierarchicalEdge(data, format) {
  hierarchicalEdge = new HierarchicalEdge(data, format);
}