/**
 * Adjacency Matrix visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

/**
 *  -Hierarchical Edge Diagram - Visualization Class
 */
class hierarcicaledge {

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

     this.maxEmailCount = 1;
     this.minLinkAttr = 1;
     this.maxLinkAttr = -1;
     this.mapJSONData();
   }
   
  const root = tree(bilink(d3.hierarchy(data)
    .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

    const svg = d3.create("svg")
    .attr("viewBox", [-width / 2, -width / 2, width, width]);

    const node = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
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
    .each(function(d) { d.text = this; })
    .on("mouseover", overed)
    .on("mouseout", outed)
    .call(text => text.append("title").text(d => `${id(d)}
${d.outgoing.length} outgoing
${d.incoming.length} incoming`));

const link = svg.append("g")
    .attr("stroke", colornone)
    .attr("fill", "none")
  .selectAll("path")
  .data(root.leaves().flatMap(leaf => leaf.outgoing))
  .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", ([i, o]) => line(i.path(o)))
    .each(function(d) { d.path = this; });

function overed(event, d) {
  link.style("mix-blend-mode", null);
  d3.select(this).attr("font-weight", "bold");
  d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
  d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
  d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
  d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
}

function outed(event, d) {
  link.style("mix-blend-mode", "multiply");
  d3.select(this).attr("font-weight", null);
  d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
  d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
  d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
  d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
}

return svg.node();
}

data = Object {
  name: "flare"
  children: Array(10) [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object]
}

data = hierarchy(await FileAttachment("flare.json").json())

function hierarchy(data, delimiter = ".") {
  let root;
  const map = new Map;
  data.forEach(function find(data) {
    const {name} = data;
    if (map.has(name)) return map.get(name);
    const i = name.lastIndexOf(delimiter);
    map.set(name, data);
    if (i >= 0) {
      find({name: name.substring(0, i), children: []}).children.push(data);
      data.name = name.substring(i + 1);
    } else {
      root = data;
    }
    return data;
  });
  return root;
}

bilink = ƒ(root)

function bilink(root) {
  const map = new Map(root.leaves().map(d => [id(d), d]));
  for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
  for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
  return root;
}

id = ƒ(node)

function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}

colorin = "#00f"
colorout = "#f00"
colornone = "#ccc"
width = 954
radius = 477
radius = width / 2

line = ƒ(a)

line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x)

tree = ƒ(i)

tree = d3.cluster()
    .size([2 * Math.PI, radius - 100])

d3 = Object {format: ƒ(t), formatPrefix: ƒ(t, n), timeFormat: ƒ(t), timeParse: ƒ(t), utcFormat: ƒ(t), utcParse: ƒ(t), Adder: class, Delaunay: class, FormatSpecifier: ƒ(t), InternMap: class, InternSet: class, Voronoi: class, active: ƒ(t, n), arc: ƒ(), area: ƒ(t, n, e), areaRadial: ƒ(), ascending: ƒ(t, n), autoType: ƒ(t), axisBottom: ƒ(t), axisLeft: ƒ(t), …}

d3 = require("d3@6")
