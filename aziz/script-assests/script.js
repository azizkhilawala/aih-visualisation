var users={};
var topics={};

Papa.parse('./csv-assests/usernodeproperties.csv', {
      	download: true,
       	header: true,
       	dynamicTyping: true,
       	complete: function(results)
       	{
			for (var row=0; row < results.data.length-1; row++)
			{
				var record = results.data[row];
			var user = {
				userid: record.UID,
				com_made: record.CommentsMade,
				posts_made: record.PostsMade,
				com_rec: record.CommentsReceived,
				adj_top: record.AdjTopicPopularity,
				topic_conn: {
					TA: record.TA,
					TB: record.TB,
					TC: record.TC,
					TD: record.TD,
					TE: record.TE
				}
			};
			users[record.UID] = user;
		}

    Papa.parse('./csv-assests/topicnodeproperties.csv', {
          	download: true,
           	header: true,
           	dynamicTyping: true,
           	complete: function(results)
           	{
    			for (var row=0; row < results.data.length-1; row++)
    			{
    				var record = results.data[row];

    			var topic = {
    				topicid: record.TID,
    				user_pop: record.UserPopularity,
    				rank: record.Rank,
    				title: record.TopicTitle,
    				keywords: record.Keywords.split(" "),
    				user_conn: []
    			};
          //remove extra blank string
    			topic.keywords.pop();
    			topics[record.TID] = topic;
    		}
        Papa.parse('./csv-assests/usertopicedges.csv', {
              	download: true,
               	header: true,
               	dynamicTyping: true,
               	complete: function(results)
               	{
        			for (var row=0; row < results.data.length-1; row++)
        			{
        				var record = results.data[row];
        				topics[record.TID].user_conn.push(record.UID);
        		}

            console.log("topics object",topics);
            console.log("users object",users);

            var sum=0;
            var nodeLinkObject={
              "nodes": [],
              "links": []
            }

            var userCounter = 0;

            for(var user in users){
                var nodesObject = {};
                nodesObject["id"] = user;
                nodesObject["group"] = ++userCounter;
                nodeLinkObject.nodes.push(nodesObject);
            }

            var lengthOfUsersObject = Object.keys(users).length;
            var lengthOfTopicsObject = Object.keys(topics).length;

            var topicIds = Object.keys(topics);
            // console.log(topicIds);

            var topicCounter = userCounter;

            for(var topic in topics){

                var nodesObject = {};
                nodesObject["id"] = topic;
                nodesObject["group1"] = ++topicCounter;
                nodeLinkObject.nodes.push(nodesObject);

                var mainCounter = 0;
                var topicId = topic;

                for(var i=0; i<topicIds.length; i++){

                  if(topicIds[i] == topicId){

                  var userConnArray = topics[topicIds[i]]['user_conn'];

                  for(var j=0;j<userConnArray.length;j++){

                    var linksObject = {};
                    linksObject["source"] = topicId;
                    linksObject["target"] = userConnArray[j];

                    if(nodesObject["id"] == topicId){
                        linksObject["value"] = nodesObject["group1"];
                    }
                    // nodeLinkObject['nodes'].forEach(function(index) {
                    //     // console.log(index);
                    // });



                    // for(var k=0;k<nodeLinkObject.nodes.length;k++){
                    //
                    // }

                    nodeLinkObject.links.push(linksObject);

                  }// end of j loop

                }//end of if

              }//end of i loop

            }//end of topics loop

            console.log("nodeLinkObject",nodeLinkObject);

// |----------------------------------------------------------------------------|
//                           d3 node-link code begins
// |----------------------------------------------------------------------------|

  console.log(nodeLinkObject.links);

  var width = 1020;
  var height = 600;

  var svg = d3.select("body").append('svg').attr("width",width).attr("height",height);


  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(nodeLinkObject.links)
    .enter().append("line")
    .attr('stroke','red')
    .attr("fill","green")
    // .attr("stroke-width","1px");
    .attr("stroke-width", function(d) { return Math.sqrt(d.value / 10000); });

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
var flag=0;
  var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodeLinkObject.nodes)
      .enter().append("circle")
      .attr("r", 5)
      //.attr("fill","blue")
      .attr("fill", function(d) { return color(d.group1); })
      .on('mouseover', function(d, i) {
        if(flag==0){
          d3.select(this)
          .style('opacity', .5);
          tooltip.style('opacity', 0.9)
          tooltip.html(d.id)
              .style('left', (d3.event.pageX + 5) + "px")
              .style('top', (d3.event.pageY - 28) + "px")
      }
    }).on('mouseout', function(d) {
      if(flag==0){
        d3.select(this)
          .style('opacity', 1)
          tooltip.style('opacity', 0)
        }
  })
  .on('click', connectedNodes) //Added code
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))


        node.append("text")
                .html(function(d){
                      return d.id;
                })
                .attr("fill","#000")
                .attr("x", "-10px")
                .attr("y", "-10px")
                .attr("width", "20px")
                .attr("height", "20px");

  node.append("title")
      .text(function(d) { return d.id; });

  simulation.nodes(nodeLinkObject.nodes)
            .on("tick", ticked);

  simulation.force("link")
      .links(nodeLinkObject.links);

  function ticked() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

// });

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

/**********************************************
    copied code to show highlighting
/***********************************************/

    //Toggle stores whether the highlighting is on
    var toggle = 0;
    //Create an array logging what is connected to what
    var linkedByIndex = {};
    for (i = 0; i < nodeLinkObject.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };
    nodeLinkObject.links.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });
    //This function looks up whether a pair are neighbours
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }
    function connectedNodes() {
        if (toggle == 0) {
          flag=1;
            //Reduce the opacity of all but the neighbouring nodes
            // d = d3.select(this).node().__data__;
            d = d3.select(this).node().__data__;
            // console.log("d",d);
            node.style("opacity", function (o) {
                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
            });

            node.on('mouseover', function(d, i) {
              // if(flag==0){
                // d3.select(this)
                // .style('opacity', .5);
                tooltip.style('opacity', 0.9)
                tooltip.html(d.id)
                    .style('left', (d3.event.pageX + 5) + "px")
                    .style('top', (d3.event.pageY - 28) + "px")
            // }
          }).on('mouseout', function(d) {
            // if(flag==0){
              // d3.select(this)
                // d.style('opacity', 1)
                tooltip.style('opacity', 0)
              // }
        });///tooltip event created

            link.style("opacity", function (o) {
                return d.index == o.source.index | d.index == o.target.index ? 1 : 0.1;
            });
            //Reduce the op
            toggle = 1;
        } else {
          flag=0;
            //Put them back to opacity=1
            node.style("opacity", 1);
            link.style("opacity", 1);
            toggle = 0;
        }
    }

    /**********************************************
        copied code to show highlighting ends
    /***********************************************/




// |----------------------------------------------------------------------------|
//                           d3 node-link code ends
// |----------------------------------------------------------------------------|

          }//end of complete usertopicedges.csv

        }); //end of papaparse usertopicedges.csv

      }//end of complete function of topicnodeproperties.csv

    });//end of papaparse topicnodeproperties.csv

	}//end of complete function of usernodeproperties.csv

});//end of PapaParse usernodeproperties.csv


// |----------------------------------------------------------------------------|
//                           node link code
// |----------------------------------------------------------------------------|

// var width = 960;
// var height = 600;
//
// var links = [
//   {source: 'Node 1', target: 'Node 2'},
//   {source: 'Node 2', target: 'Node 3'},
//   {source: 'Node 3', target: 'Node 1'},
// ];
//
// var nodes = {};
//
// //parse links to nodes
// links.forEach(function(link){
//   link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
//   link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
// });
//
// console.log(nodes);
//
// //add svg to the body
// var svg = d3.select('body').append('svg')
//                             .attr({
//                                 'width':width,
//                                 'height':height
//                               });
//
// var force = d3.layout.force()
//               .size([width,height])
//               .nodes(d3.values(nodes))
//               .links(links)
//               .on("tick",tick)
//               .linkDistance(300)
//               .start();
//
// var link = svg.selectAll('.link')
//               .data(links)
//               .enter().append('line')
//               .attr('class','link');
//
// var node = svg.selectAll('.node')
//               .data(force.nodes())
//               .enter().append('circle')
//               .attr('class','node')
//               .attr('r',width*0.03)
//               .on('click', function(d){
//                 console.log(d.name);
//               });
//
// function tick(e){
//   node.attr('cx',function(d){return d.x;})
//       .attr('cy',function(d){return d.y;})
//       .call(force.drag);
//
//   link.attr('x1',function(d){return d.source.x; })
//       .attr('y1',function(d){return d.source.y; })
//       .attr('x2',function(d){return d.target.x; })
//       .attr('y2',function(d){return d.target.y; });
// }
