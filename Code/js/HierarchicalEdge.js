/**
 * Hierarchical Edge Diagram visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

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
    this.data = json;
    this.format = format;

    this.mainNodeAttribute = this.format.nodeGroups[0][0].attribute;

    this.diameter = 960;
    this.radius = this.diameter / 2
    this.innerRadius = this.radius - 120;

    this.mapJSONData();
  }

  /**
   * Parse JSON and map data.
   */
  mapJSONData() {
    let cluster = d3.cluster()
      .size([360, this.innerRadius]);
      
    this.createMatrix(cluster);
  }

  createMatrix(cluster) {
    let line = d3.lineRadial()
      .curve(d3.curveBundle.beta(0.85))
      .radius(d => d.y)
      .angle(d => (d.x / 180 * Math.PI));

    let svg = d3.select("svg")
      .attr("width", this.diameter)
      .attr("height", this.diameter)
      .append("g")
      .attr("transform", "translate(" + this.radius + "," + this.radius + ")");
      
    let link = svg.append("g").selectAll(".link");
    let node = svg.append("g").selectAll(".node");

    // let nodes = cluster.nodes(this.packageHierarchy(this.data.nodes));
    // let links = this.packageImports(nodes);

    // link = link
    //   .data(bundle(links))
    //   .enter().append("path")
    //   .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
    //   .attr("class", "link")
    //   .attr("d", line);

    node = node
      .data(this.data.nodes)
      .enter().append("text")
        .attr("class", "node")
        .attr("dy", ".31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return d.key; });
  }

  packageHierarchy(classes) {
    let map = {};
  
    function find(name, data) {
      let node = map[name], i;
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
          node.parent.children.push(node);
          node.key = name.substring(i + 1);
        }
      }
      return node;
    }
  
    for (let item in classes) {
      console.log(item);
      find(item[this.mainNodeAttribute], item);
    }

    return map[""];
  }

  packageImports(nodes) {
    let map = {};
    let links = [];
  
    // Compute a map from name to node.
    nodes.forEach(function(d) {
      map[d[mainNodeAttribute]] = d;
    });
  
    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.links) d.links.forEach(function(i) {
        links.push({source: map[d[mainNodeAttribute]], target: map[i]});
      });
    });
  
    return links;
  }
}

/**
 * Create an hierarchical edge visualization from an array.
 * @param {Array}  data              JSON array with the data to visualize.
 * @param {Array}  format            The visualization format.
 */
 function createHierarchicalEdge(data, format) {
  console.log("Creating hierarchical with data ", data);
  new HierarchicalEdge(data, format);
}
