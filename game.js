jQuery(function() {
  console.log("Launching game…");
  jQuery.get('game_data.xml', function (xml_data) {
    console.log("Data loaded.");
    var g = new Julespill(jQuery(xml_data), jQuery("#game_area"));
    g.start();
  });
});

var Alternative = function(xml) {
  var node = jQuery(xml);
  this.leads_to_id = node.attr("leads-to");
  this.text = node.text();
}

Alternative.prototype.toButton = function(julespill) {
  var e = jQuery("<button></button>",
      { data: { action: "move-next", go_to: this.leads_to_id },
        class: 'action-button'});
  e.text(this.text);

  var toNode = julespill.getNode(this.leads_to_id);
  if (toNode != null) {
    e.click(function() { toNode.go(julespill) });
  } else {
    e.text("DEAD_END " + e.text());
  }

  return(e);
}

var Node = function(xml) {
  var node = jQuery(xml);
  this.id = node.attr("id");
  this.title=node.find("title").html();
  this.icon=node.find("icon").text();
  this.description=node.find("description").html();
  this.alternatives = new Array();

  var xml_alts = node.find("alternative");
  for(var i=0; i < xml_alts.length; i++) {
    this.alternatives.push(new Alternative(xml_alts[i]));
  }
}

Node.prototype.go = function (julespill) {
  julespill.area.html("");

  var div = jQuery("<div></div>");
  var desc = jQuery("<p></p>", { class: "description" } );
  if (this.icon) {
    div.append(jQuery("<span></span>", { class: "icon " + this.icon }));
  }
  if (this.title) {
    div.append(jQuery("<h3>" + this.title + "</h3>"));
  }
  desc.html(this.description);
  div.append(desc);

  for(var i=0; i < this.alternatives.length; i++) {
    div.append(this.alternatives[i].toButton(julespill));
  }

  julespill.area.append(div);

  var hash = "#" + this.id;
  if (history.pushState) {
    history.pushState(null, null, hash);
  } else {
    location.hash = hash;
  }
}

var Julespill = function(data, area) {
  this.area = area;
  this.nodes = new Array();

  var xml_nodes = data.find("node");
  for(var i=0; i < xml_nodes.length; i++) {
    this.nodes.push(new Node(xml_nodes[i]));
  }
};

Julespill.prototype.start = function() {
  var hash = window.location.hash.substring(1);
  var node = this.getNode(hash);
  if (node == null) {
    node = this.nodes[0];
  }
  node.go(this);
};

Julespill.prototype.getNode = function(id) {
  for(var i=0; i < this.nodes.length; i++) {
    if (this.nodes[i].id == id) {
      return this.nodes[i];
    }
  }
  console.log("Did not find node '" + id + "'.");
  return null;
}
