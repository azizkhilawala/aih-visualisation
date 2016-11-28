var users = {};
var topics = {};
var userTaskArrayObj = [];
Papa.parse('./csv-assests/usernodeproperties.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
            for (var row = 0; row < results.data.length - 1; row++) {
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
                complete: function(results) {
                        for (var row = 0; row < results.data.length - 1; row++) {
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
                            complete: function(results) {
                                    for (var row = 0; row < results.data.length - 1; row++) {
                                        var record = results.data[row];
                                        topics[record.TID].user_conn.push(record.UID);
                                    }

                                    console.log("topics object", topics);
                                    console.log("users object", users);
                                    userTaskArrayObj.push(topics, users);
                                    var sum = 0;
                                    var nodeLinkObject = {
                                        "nodes": [],
                                        "links": []
                                    };

                                    var userCounter = 0;

                                    for (var user in users) {
                                        var nodesObject = {};
                                        nodesObject.id = user;
                                        nodesObject.group = ++userCounter;
                                        nodeLinkObject.nodes.push(nodesObject);
                                    }

                                    var lengthOfUsersObject = Object.keys(users).length;
                                    var lengthOfTopicsObject = Object.keys(topics).length;

                                    var topicIds = Object.keys(topics);

                                    var topicCounter = userCounter;

                                    for (var topic in topics) {

                                        var nodesObject2 = {};
                                        nodesObject2.id = topic;
                                        nodesObject2.group1 = ++topicCounter;
                                        nodeLinkObject.nodes.push(nodesObject2);

                                        var mainCounter = 0;
                                        var topicId = topic;

                                        for (var i = 0; i < topicIds.length; i++) {

                                            if (topicIds[i] == topicId) {

                                                var userConnArray = topics[topicIds[i]].user_conn;

                                                for (var j = 0; j < userConnArray.length; j++) {

                                                    var linksObject = {};
                                                    linksObject.source = topicId;
                                                    linksObject.target = userConnArray[j];

                                                    if (nodesObject2.id == topicId) {
                                                        linksObject.value = nodesObject2.group1;
                                                    }
                                                    nodeLinkObject.links.push(linksObject);

                                                } // end of j loop

                                            } //end of if

                                        } //end of i loop

                                    } //end of topics loop

                                    console.log("nodeLinkObject", nodeLinkObject);

                                    // |----------------------------------------------------------------------------|
                                    //                           d3 node-link code begins
                                    // |----------------------------------------------------------------------------|

                                    var width = 580;
                                    var height = 600;

                                    var svg = d3.select("#nodeLinkSection").append('svg').attr("width", width).attr("height", height);

                                    var color = d3.scaleOrdinal(d3.schemeCategory20c);

                                    var simulation = d3.forceSimulation()
                                        .force("link", d3.forceLink().id(function(d) {
                                            return d.id;
                                        }))
                                        .force("charge", d3.forceManyBody())
                                        .force("center", d3.forceCenter(width / 2, height / 2));

                                    var link = svg.append("g")
                                        .attr("class", "links")
                                        .selectAll("line")
                                        .data(nodeLinkObject.links)
                                        .enter().append("line")
                                        .attr('class', "link")
                                        .attr("stroke-width", function(d) {
                                            return Math.sqrt(d.value / 10000);
                                        });

                                    // add the tooltip area to the webpage
                                    var tooltip = d3.select("body").append("div")
                                        .attr("class", "tooltip")
                                        .style("opacity", 0);
                                    var flag = 0;
                                    var node = svg
                                        .append("g")
                                        .attr("class", "nodes")
                                        .selectAll("circle")
                                        .data(nodeLinkObject.nodes)
                                        .enter().append("circle")
                                        .attr('class', 'node')
                                        .attr("r", 5)
                                        .attr("fill", function(d) {
                                            return color(d.group1);
                                        })
                                        .on('mouseover', function(d, i) {
                                            if (flag === 0) {
                                                d3.select(this).style('opacity', 0.5);
                                                tooltip.style('opacity', 0.9);
                                                tooltip.html(d.id)
                                                    .style('left', (d3.event.pageX + 5) + "px")
                                                    .style('top', (d3.event.pageY - 28) + "px");
                                            }
                                        }).on('mouseout', function(d) {
                                            if (flag === 0) {
                                                d3.select(this)
                                                    .style('opacity', 1);
                                                tooltip.style('opacity', 0);
                                            }
                                        })
                                        .on('click', showDetails)
                                        .on('dblclick', connectedNodes) //Added code
                                        .call(d3.drag()
                                            .on("start", dragstarted)
                                            .on("drag", dragged)
                                            .on("end", dragended));


                                    node.append("text")
                                        .html(function(d) {
                                            return d.id;
                                        })
                                        .attr("fill", "#000")
                                        .attr("x", "-10px")
                                        .attr("y", "-10px")
                                        .attr("width", "20px")
                                        .attr("height", "20px");

                                    node.append("title")
                                        .text(function(d) {
                                            return d.id;
                                        });

                                    simulation.nodes(nodeLinkObject.nodes)
                                        .on("tick", ticked);

                                    simulation.force("link")
                                        .links(nodeLinkObject.links);

                                    function ticked() {
                                        link.attr("x1", function(d) {
                                                return d.source.x;
                                            })
                                            .attr("y1", function(d) {
                                                return d.source.y;
                                            })
                                            .attr("x2", function(d) {
                                                return d.target.x;
                                            })
                                            .attr("y2", function(d) {
                                                return d.target.y;
                                            });

                                        node.attr("cx", function(d) {
                                                return d.x;
                                            })
                                            .attr("cy", function(d) {
                                                return d.y;
                                            });
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
                                    code to show details on click of any node begins
                                    /***********************************************/
                                    function showDetails() {
                                        d3.select(this).text(function(d) {
                                            var id = d.id;
                                            var allChars = id.split("");
                                            var firstChar = allChars[0];
                                            if (firstChar === "T") {
                                                for (var topicObj in userTaskArrayObj[0]) {
                                                    if (topicObj === d.id) {
                                                        var contents = userTaskArrayObj[0][topicObj];
                                                        console.log(contents);
                                                    }
                                                }
                                            } else {
                                                for (var userObj in userTaskArrayObj[1]) {
                                                    if (userObj === d.id) {
                                                        // console.log(obj.keys());
                                                        var contents2 = userTaskArrayObj[1][userObj];
                                                        console.log(contents2);
                                                    }
                                                }
                                            }
                                            // console.log(id);
                                        });
                                    }
                                    /**********************************************
                                     code to show details on click of any node ends
                                    /***********************************************/

                                    /**********************************************
                                        code to show highlighting begins
                                    /***********************************************/

                                    //Toggle stores whether the highlighting is on
                                    var toggle = 0;
                                    //Create an array logging what is connected to what
                                    var linkedByIndex = {};
                                    for (var q = 0; q < nodeLinkObject.nodes.length; q++) {
                                        linkedByIndex[q + "," + q] = 1;
                                    }
                                    nodeLinkObject.links.forEach(function(d) {
                                        linkedByIndex[d.source.index + "," + d.target.index] = 1;
                                    });
                                    //This function looks up whether a pair are neighbours
                                    function neighboring(a, b) {
                                        return linkedByIndex[a.index + "," + b.index];
                                    }
                                    //connectedNodes function begins
                                    function connectedNodes() {
                                        if (toggle === 0) {
                                            flag = 1;
                                            //Reduce the opacity of all but the neighbouring nodes
                                            // d = d3.select(this).node().__data__;
                                            d = d3.select(this).node().__data__;
                                            // console.log("d",d);
                                            node.style("opacity", function(o) {
                                                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
                                            });

                                            node.on('mouseover', function(d, i) {
                                                // if(flag==0){
                                                // d3.select(this)
                                                // .style('opacity', .5);
                                                tooltip.style('opacity', 0.9);
                                                tooltip.html(d.id)
                                                    .style('left', (d3.event.pageX + 5) + "px")
                                                    .style('top', (d3.event.pageY - 28) + "px");
                                                // }
                                            }).on('mouseout', function(d) {
                                                // if(flag==0){
                                                // d3.select(this)
                                                // d.style('opacity', 1)
                                                tooltip.style('opacity', 0);
                                                // }
                                            }); ///tooltip event created

                                            link.style("opacity", function(o) {
                                                return d.index == o.source.index | d.index == o.target.index ? 1 : 0.1;
                                            });
                                            //Reduce the op
                                            toggle = 1;
                                        } else {
                                            flag = 0;
                                            //Put them back to opacity=1
                                            node.style("opacity", 1);
                                            link.style("opacity", 1);
                                            toggle = 0;
                                        }
                                    } //end of connectedNodes function

                                    /**********************************************
                                        code to show highlighting ends
                                    /***********************************************/

                                    /**********************************************
                                        code for search autocomplete begins
                                    /***********************************************/

                                    var optArray = [];
                                    for (var p = 0; p < nodeLinkObject.nodes.length; p++) {
                                        optArray.push(nodeLinkObject.nodes[p].id);
                                    }
                                    // console.log(optArray);
                                    optArray = optArray.sort();
                                    $(function() {
                                        $("#search").autocomplete({
                                            source: optArray
                                        });
                                    });

                                    $('#searchButton').on('click', function() {

                                        //find the node
                                        var selectedVal = document.getElementById('search').value;
                                        console.log(selectedVal);
                                        var node = svg.selectAll('.nodes').selectAll(".node");
                                        node.attr('r', 5);
                                        // console.log(node);
                                        if (selectedVal === "") {
                                            node.style("stroke", "white").style("stroke-width", "1");
                                        } else {
                                            // var d = nodeLinkObject.nodes;
                                            var selected = node.filter(function(d, i) {
                                                return d.id == selectedVal;
                                            });
                                            // console.log(selected);
                                            selected.style("opacity", "1").attr('r', 15);
                                            var link = svg.selectAll(".link");
                                            link.style("opacity", "0");
                                            d3.selectAll(".node, .link").transition()
                                                .duration(1500)
                                                .style("opacity", 1);
                                        }
                                    });

                                    /**********************************************
                                        code for search autocomplete ends
                                    /***********************************************/

                                    /**********************************************
                                        code for fisheye begins
                                    /***********************************************/

                                    // var fisheye = d3.fisheye.circular()
                                    //     .radius(120);
                                    // svg.on("mousemove", function() {
                                    //     simulation.stop();
                                    //     fisheye.focus(d3.mouse(this));
                                    //     d3.selectAll("circle").each(function(d) {
                                    //             d.fisheye = fisheye(d);
                                    //         })
                                    //         .attr("cx", function(d) {
                                    //             return d.fisheye.x;
                                    //         })
                                    //         .attr("cy", function(d) {
                                    //             return d.fisheye.y;
                                    //         })
                                    //         .attr("r", function(d) {
                                    //             return d.fisheye.z * 5;
                                    //         });
                                    //     link.attr("x1", function(d) {
                                    //             return d.source.fisheye.x;
                                    //         })
                                    //         .attr("y1", function(d) {
                                    //             return d.source.fisheye.y;
                                    //         })
                                    //         .attr("x2", function(d) {
                                    //             return d.target.fisheye.x;
                                    //         })
                                    //         .attr("y2", function(d) {
                                    //             return d.target.fisheye.y;
                                    //         });
                                    // });

                                    /**********************************************
                                        code for fisheye ends
                                    /***********************************************/

                                    // |----------------------------------------------------------------------------|
                                    //                           d3 node-link code ends
                                    // |----------------------------------------------------------------------------|

                                } //end of complete usertopicedges.csv

                        }); //end of papaparse usertopicedges.csv

                    } //end of complete function of topicnodeproperties.csv

            }); //end of papaparse topicnodeproperties.csv

        } //end of complete function of usernodeproperties.csv

}); //end of PapaParse usernodeproperties.csv


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
