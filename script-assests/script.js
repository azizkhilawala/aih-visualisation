var users = {};
var topics = {};
var userTaskArrayObj = [];
var selectedList = [];
var selectedIndex = [];
var prev_opacity;

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
                    popularity: (record.PostsMade * 5 + record.CommentsReceived * 3 + record.CommentsMade),
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
                                popularity: record.UserPopularity,
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

                                    // console.log("topics object", topics);
                                    // console.log("users object", users);
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

                                    // console.log("nodeLinkObject", nodeLinkObject);

                                    // |----------------------------------------------------------------------------|
                                    //                           d3 node-link code begins
                                    // |----------------------------------------------------------------------------|

                                    var width = 580;
                                    var height = 600;

                                    var svg = d3.select("#nodeLinkSection").append('svg').attr("width", width).attr("height", height);

                                    var topicPopArr = [];
                                    var userPopArr = [];
                                    for (var topicPopObj in topics) {
                                        topicPopArr.push(topics[topicPopObj].popularity);
                                    }
                                    for (var userTopicPopObj in users) {
                                        userPopArr.push(users[userTopicPopObj].popularity);
                                    }

                                    function compareValues(a, b) {
                                        return a - b;
                                    }

                                    topicPopArr.sort(compareValues);
                                    userPopArr.sort(compareValues);
                                    var topicColor = d3.scaleQuantize().domain([0, topicPopArr[topicPopArr.length - 1]]).range(['#ccebc5', '#a8ddb5', '#7bccc4', '#43a2ca', '#0868ac']);
                                    var userColor = d3.scaleQuantize().domain([0, userPopArr[userPopArr.length - 1]]).range(['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026']);

                                    svg.append("g")
                                        .attr("class", "node")
                                        .append("path")
                                        .attr('transform', 'translate(' + (20) + ',' + (30) + ')')
                                        .attr('class', "path-node")
                                        .style('fill', function(d) {
                                            return topicColor(200);
                                        })
                                        .style('stroke', '#000')
                                        .style('stroke-width', 2)
                                        .attr('d', d3.symbol().type(function(d) {
                                            return d3.symbolStar;
                                        }).size(300));


                                    svg.append("g")
                                        .attr("class", "node")
                                        .append("path")
                                        .attr('transform', 'translate(' + (100) + ',' + (30) + ')')
                                        .attr('class', "path-node")
                                        .style('fill', function(d) {
                                            return "#fed976";
                                        })
                                        .style('stroke', '#000')
                                        .style('stroke-width', 2)
                                        .attr('d', d3.symbol().type(function(d) {
                                            return d3.symbolCircle;
                                        }).size(400));


                                    svg.append("text").attr('transform', 'translate(' + (45) + ',' + (35) + ')').html("Topics");
                                    svg.append("text").attr('transform', 'translate(' + (120) + ',' + (35) + ')').html("Users");

                                    var simulation = d3.forceSimulation()
                                        .force("link", d3.forceLink().id(function(d) {
                                            return d.id;
                                        }).distance(window.innerHeight / 8))
                                        .force("charge", d3.forceManyBody())
                                        .force("center", d3.forceCenter(width / 2, height / 2));

                                    var link = svg.append("g")
                                        .attr("class", "links")
                                        .selectAll("line")
                                        .data(nodeLinkObject.links)
                                        .enter().append("line")
                                        .attr('class', "link")
                                        .style('opacity',0.1)
                                        .attr("stroke-width", function(d) {
                                            return Math.sqrt(d.value / 1000);
                                        }).style('stroke', '#A9A9A9');

                                    // add the tooltip area to the webpage
                                    var tooltip = d3.select("body").append("div")
                                        .attr("class", "tooltip")
                                        .style("opacity", 0);

                                    var node = svg.selectAll(".node")
                                        .data(nodeLinkObject.nodes)
                                        .enter().append("g")
                                        .attr("class", "node")
                                        .append("path")
                                        .attr('class', "path-node")
                                        .style('fill', function(d) {
                                            if (d.group1) {
                                                return topicColor(Math.log(topics[d.id].popularity) * 40);
                                            } else {
                                                return "#fed976";
                                            }
                                        })
                                        .style('stroke', '#000')
                                        .style('stroke-width', function(d) {
                                            if (d.group1) {
                                              if(topics[d.id].popularity === 1){
                                                  return  1;
                                              }
                                                return Math.log(topics[d.id].popularity) * 0.5;
                                            } else {
                                                return Math.log(users[d.id].popularity) * 0.2;
                                            }
                                        })
                                        .attr('d', d3.symbol().type(function(d) {
                                            if (d.group1) {
                                                return d3.symbolStar;
                                            } else {
                                                return d3.symbolCircle;
                                            }
                                        }).size(function(d) {
                                            if (d.group1) {
                                              if(topics[d.id].popularity === 1){
                                                return  Math.pow(topics[d.id].popularity, 5) * 15;
                                              }
                                              else{
                                                    return Math.pow(Math.log(topics[d.id].popularity), 2) * 15;
                                              }
                                                // return 500;

                                            } else {
                                                return Math.pow(Math.log(users[d.id].popularity), 3);
                                            }
                                        }))

                                    .on('mouseover', function(d, i) {
                                            d3.select(this).style('opacity', 0.5);
                                            tooltip.style('opacity', 0.9);
                                            tooltip.html((d.id[0] == "T") ?
                                                    d.id + " |" +"&nbsp;" + topics[d.id].title +
                                                    "&nbsp;"+"( <i class='fa fa-trophy' aria-hidden='true'></i>&nbsp;" +
                                                    Math.abs(50 - topics[d.id].rank) +
                                                    "&nbsp;|&nbsp;<i class='fa fa-users' aria-hidden='true'></i>&nbsp;" + topics[d.id].popularity + " )" :
                                                    d.id + "&nbsp;( rank : " + users[d.id].popularity + " )")
                                                .style('left', (d3.event.pageX + 5) + "px")
                                                .style('top', (d3.event.pageY - 28) + "px");
                                        }).on('mouseout', function(d) {
                                            d3.select(this)
                                                .style('opacity', 1);
                                            tooltip.style('opacity', 0);
                                        })
                                        .on('click', connectedNodes)
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

                                        node.attr("transform", function(d) {
                                            return "translate(" + d.x + "," + d.y + ")";
                                        });
                                    }


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

                                    /**********************************************
                                     code to show details on click of any node ends
                                     /***********************************************/

                                    /**********************************************
                                    code to show highlighting begins
                                    /***********************************************/


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
                                        // console.log(a)
                                        return linkedByIndex[a + "," + b];
                                    }
                                    //connectedNodes function begins
                                    function connectedNodes() {
                                        d3.select(this).text(function(d) {
                                            if (d.id[0] === "T") {
                                                for (var topicObj in userTaskArrayObj[0]) {
                                                    if (topicObj === d.id) {
                                                        var contents = userTaskArrayObj[0][topicObj];
                                                        if (selectedList.indexOf(contents.topicid) == -1) {
                                                            selectedIndex.push(d.index);
                                                            selectedList.push(contents.topicid);
                                                            createTopicCard(d);
                                                        }
                                                        else {
                                                            selectedList.splice(selectedList.indexOf(contents.topicid), 1);
                                                            selectedIndex.splice(selectedIndex.indexOf(d.index), 1);
                                                            var $target = $("#card" + d.id);
                                                            $target.hide('slow', function() {
                                                                $target.remove();
                                                            });
                                                        }
                                                        d3.select("#cardTitle" + d.id)
                                                            .append("h5").html(contents.title + "&nbsp;( " + d.id + " )")
                                                            .append("span")
                                                            .style("float", "right")
                                                            .append("i")
                                                            .attr("id", "cls_btn")
                                                            .classed("fa fa-window-close close", true)
                                                            .attr("aria-hidden", "true")
                                                            .on('click', function() {
                                                                selectedList.splice(selectedList.indexOf(d.id), 1);
                                                                selectedIndex.splice(selectedIndex.indexOf(d.index), 1);
                                                                var $target = $(this).parents('li');
                                                                $target.hide('slow', function() {
                                                                    $target.remove();
                                                                });
                                                                draw();
                                                            });
                                                        var x = d3.select("#cardTitle" + d.id)
                                                            .append("h5");
                                                            x.append('i')
                                                            .attr("data-toggle",'tooltip')
                                                            .attr("data-placement","bottom")
                                                            .attr("title", "Rank")
                                                            .attr("id","info-rank"+d.id)
                                                            .attr("aria-hidden",true)
                                                            .classed("fa fa-trophy",true)
                                                            .on("mouseover",function(){
                                                              $("#info-rank"+d.id).tooltip('show');
                                                            })
                                                            .on("mouseout",function(){
                                                              $("#info-rank"+d.id).tooltip('hide');
                                                            });
                                                            x.append('strong').html("&emsp;"+Math.abs(50 - contents.rank)+"&emsp;"+"&emsp;");

                                                            x.append('i')
                                                            .attr("data-toggle",'tooltip')
                                                            .attr("data-placement","bottom")
                                                            .attr("title", "User popularity")
                                                            .attr("id","info-users"+d.id)
                                                            .classed("fa fa-users",true)
                                                            .attr("aria-hidden",true)
                                                            .on("mouseover",function(){
                                                              $("#info-users"+d.id).tooltip('show');
                                                            })
                                                            .on("mouseout",function(){
                                                              $("#info-users"+d.id).tooltip('hide');
                                                            });
                                                            x.append('strong').html("&emsp;"+contents.popularity+"&emsp;");

                                                            x.append("i")
                                                            .classed("fa fa-chevron-down drop-down", true)
                                                            .attr("data-toggle", "collapse")
                                                            .attr("data-target", "#collapseTopic" + d.id)
                                                            .attr("aria-controls", "collapseTopic" + d.id);

                                                        for (i = 0; i < contents.popularity; i++) {
                                                            for (j = i + 1; j < contents.popularity; j++) {
                                                                if (users[contents.user_conn[j]].popularity > users[contents.user_conn[i]].popularity) {
                                                                    var temp = contents.user_conn[i];
                                                                    contents.user_conn[i] = contents.user_conn[j];
                                                                    contents.user_conn[j] = temp;
                                                                }
                                                            }
                                                        }
                                                        var len = (contents.popularity > 10) ? 10 : contents.popularity;

                                                        for (i = 0; i < len; i++) {
                                                            var temp = d3.select("#collapseUser" + d.id)
                                                                .append("li").classed("col-md-3", true)
                                                                .append("div").classed("thumbnail", true)

                                                            var temp2 = contents.user_conn[i]
                                                            temp.append("div").classed("card card-block", true).attr("aria-hidden", "true").style("border-color", "#333")
                                                                .append("center").html(users[temp2].userid).on('click',function(d){
                                                                  var idValue = d3.select(this).text();
                                                                  var selectedIdValue = node.filter(function (d, i) {
                                                                    return d.id == idValue;
                                                                  });
                                                                  selectedIdValue.attr('d',connectedNodes);
                                                                  selectedIdValue.attr('d',d3.symbol().type(d3.symbolCircle).size(function(d) {
                                                                      if (d.group1) {
                                                                        if(topics[d.id].popularity === 1){
                                                                          return  Math.pow(topics[d.id].popularity, 5) * 15;
                                                                        }
                                                                        else{
                                                                              return Math.pow(Math.log(topics[d.id].popularity), 2) * 15;
                                                                        }
                                                                      } else {
                                                                          return Math.pow(Math.log(users[d.id].popularity), 3);
                                                                      }
                                                                  }));
                                                                  draw();
                                                                });
                                                                // });
                                                        }
                                                        for (i = 0; i < contents.keywords.length; i++) {
                                                            var temp = d3.select("#collapseKeywords" + d.id)
                                                                .append("li").classed("col-md-3", true)
                                                                .append("div").classed("thumbnail", true)
                                                                .append("center").html(contents.keywords[i]);
                                                        }
                                                        // console.log(contents)
                                                    }
                                                }
                                            } else {
                                                for (var userObj in userTaskArrayObj[1]) {
                                                    if (userObj === d.id) {

                                                        var contents2 = userTaskArrayObj[1][userObj];

                                                        if (selectedList.indexOf(contents2.userid) == -1) {
                                                            selectedIndex.push(d.index)
                                                            selectedList.push(contents2.userid)
                                                            createUserCard(d)
                                                        } else {
                                                            selectedList.splice(selectedList.indexOf(contents2.userid), 1)
                                                            selectedIndex.splice(selectedIndex.indexOf(d.index), 1)
                                                            var $target = $("#card" + d.id)
                                                            $target.hide('slow', function() {
                                                                $target.remove();
                                                            })
                                                        }
                                                        // console.log(contents2)
                                                        d3.select("#cardTitle" + d.id)
                                                            .append("h5").html("User&nbsp;(" + d.id + ")")
                                                            .append("span")
                                                            .style("float", "right")
                                                            .append("i")
                                                            .attr("id", "cls_btn")
                                                            .classed("fa fa-window-close close", true)
                                                            .attr("aria-hidden", "true")
                                                            .on('click', function() {
                                                                selectedList.splice(selectedList.indexOf(d.id), 1)
                                                                selectedIndex.splice(selectedIndex.indexOf(d.index), 1)
                                                                var $target = $(this).parents('li');
                                                                $target.hide('slow', function() {
                                                                    $target.remove();
                                                                });
                                                                draw();
                                                            });
                                                        // console.log(contents2)
                                                      var y = d3.select("#cardTitle" + d.id).append("h5")
                                                      y.append("i")
                                                      .attr("data-toggle",'tooltip')
                                                      .attr("data-placement","bottom")
                                                      .attr("title", "Rank")
                                                      .attr("id","info-rankU"+d.id)
                                                      .attr("aria-hidden",true)
                                                      .classed("fa fa-trophy",true)
                                                      .on("mouseover",function(){
                                                        $("#info-rankU"+d.id).tooltip('show');
                                                      })
                                                      .on("mouseout",function(){
                                                        $("#info-rankU"+d.id).tooltip('hide');
                                                      });y.append('strong').html("&emsp;"+contents2.popularity+"&emsp;"+"&emsp;");

                                                      y.append("i")
                                                      .attr("data-toggle",'tooltip')
                                                      .attr("data-placement","bottom")
                                                      .attr("title", "Posts Made")
                                                      .attr("id","info-posts"+d.id)
                                                      .attr("aria-hidden",true)
                                                      .classed("fa fa-pencil-square-o",true)
                                                      .on("mouseover",function(){
                                                        $("#info-posts"+d.id).tooltip('show');
                                                      })
                                                      .on("mouseout",function(){
                                                        $("#info-posts"+d.id).tooltip('hide');
                                                      });y.append('strong').html("&emsp;"+contents2.posts_made+"&emsp;"+"&emsp;");

                                                      y.append("i")
                                                      .attr("data-toggle",'tooltip')
                                                      .attr("data-placement","bottom")
                                                      .attr("title", "Comments Received")
                                                      .attr("id","info-CommentsReceived"+d.id)
                                                      .attr("aria-hidden",true)
                                                      .classed("fa fa-download",true)
                                                      .on("mouseover",function(){
                                                        $("#info-CommentsReceived"+d.id).tooltip('show');
                                                      })
                                                      .on("mouseout",function(){
                                                        $("#info-CommentsReceived"+d.id).tooltip('hide');
                                                      });y.append('strong').html("&emsp;"+contents2.com_rec+"&emsp;"+"&emsp;");

                                                      y.append("i")
                                                      .attr("data-toggle",'tooltip')
                                                      .attr("data-placement","bottom")
                                                      .attr("title", "Comments Made")
                                                      .attr("id","info-commentsMade"+d.id)
                                                      .attr("aria-hidden",true)
                                                      .classed("fa fa-upload",true)
                                                      .on("mouseover",function(){
                                                        $("#info-commentsMade"+d.id).tooltip('show');
                                                      })
                                                      .on("mouseout",function(){
                                                        $("#info-commentsMade"+d.id).tooltip('hide');
                                                      });y.append('strong').html("&emsp;"+contents2.com_made+"&emsp;"+"&emsp;");

                                                            y.append("i")
                                                            .classed("fa fa-chevron-down drop-down", true)
                                                            .attr("data-toggle", "collapse")
                                                            .attr("data-target", "#collapseUser" + d.id)
                                                            .attr("aria-controls", "collapseUser" + d.id);

                                                        for (var prop in contents2.topic_conn) {
                                                            var temp = d3.select("#collapseTopics" + d.id)
                                                                .append("li").classed("col-md-12", true)
                                                                .append("div").classed("thumbnail", true)

                                                            var temp2 = contents2.topic_conn[prop]
                                                            temp.append("div").classed("card card-block", true).attr("aria-hidden", "true").style("border-color", "#333")
                                                                .append("center").html(topics[temp2].title + "&nbsp;( " + topics[temp2].topicid + " )").on('click',function(d){
                                                                  var topicText = d3.select(this).text();
                                                                    var topicTextArray = topicText.split(" ");
                                                                    var topicText2=topicTextArray[topicTextArray.length - 2];
                                                                    var selectedIdValue = node.filter(function (d, i) {
                                                                      return d.id == topicText2;
                                                                    });
                                                                    selectedIdValue.attr('d',connectedNodes);
                                                                    selectedIdValue.attr('d',d3.symbol().type(d3.symbolStar).size(function(d) {
                                                                        if (d.group1) {
                                                                          if(topics[d.id].popularity === 1){
                                                                            return  Math.pow(topics[d.id].popularity, 5) * 15;
                                                                          }
                                                                          else{
                                                                                return Math.pow(Math.log(topics[d.id].popularity), 2) * 15;
                                                                          }
                                                                        } else {
                                                                            return Math.pow(Math.log(users[d.id].popularity), 3);
                                                                        }
                                                                    }));
                                                                    draw();

                                                                });



                                                        }

                                                    }
                                                }
                                            }
                                        });
                                        node.on('mouseover', function(d, i) {
                                                prev_opacity = d3.select(this).style("opacity");
                                                d3.select(this).style('opacity', 0.9);
                                                tooltip.style('opacity', 0.9);
                                                tooltip.html((d.id[0] == "T") ?
                                                        topics[d.id].title +
                                                        "&nbsp;(<i class='fa fa-trophy' aria-hidden='true'></i>&nbsp;" +
                                                        Math.abs(50 - topics[d.id].rank) +
                                                        "&nbsp;|&nbsp;<i class='fa fa-users' aria-hidden='true'></i>&nbsp;" + topics[d.id].popularity + ")" :
                                                        d.id + "&nbsp;(rank:" + users[d.id].popularity + ")")
                                                    .style('left', (d3.event.pageX + 5) + "px")
                                                    .style('top', (d3.event.pageY - 28) + "px");
                                            })
                                            .on('mouseout', function(d) {
                                                if (selectedList.length > 0) {
                                                    if (selectedList.indexOf(d.id) == -1) {
                                                        d3.select(this).style("opacity", prev_opacity);
                                                    }
                                                }
                                                tooltip.style('opacity', 0);
                                            }); ///tooltip event created

                                        draw()

                                        function draw() {
                                            d = d3.select(this).node().__data__;
                                            node.style("opacity", 0.1);
                                            for (i = 0; i < selectedIndex.length; i++) {
                                                node.style("opacity", function(o) {
                                                    if (neighboring(selectedIndex[i], o.index) | neighboring(o.index, selectedIndex[i]))
                                                        return 1;
                                                    return true;
                                                });
                                            }


                                            link.style("opacity", 0.1);
                                            for (i = 0; i < selectedIndex.length; i++) {
                                                link.style("opacity", function(o) {
                                                    if (selectedIndex[i] == o.source.index | selectedIndex[i] == o.target.index)
                                                        return 1;
                                                    return true;
                                                }).style("stroke-width",1);
                                            }
                                            if (selectedList.length === 0) {
                                                link.style("stroke-width",0);
                                                node.style("opacity", 1);
                                            }

                                        }// close function draw

                                        d3.select("#collapseUser").selectAll("li").remove();
                                        d3.select("#collapseKeywords").selectAll("li").remove();

                                    } //end of connectedNodes function

                                    /**********************************************
                                        code to show highlighting ends
                                        /***********************************************/

                                    /**********************************************
                                        code for search autocomplete begins
                                        /***********************************************/

                                    var optArray = [];
                                    console.log(nodeLinkObject.nodes);
                                    console.log(topics);
                                    console.log(users);
                                    // for (var p = 0; p < nodeLinkObject.nodes.length; p++) {
                                    //     optArray.push(nodeLinkObject.nodes[p].id);
                                    // }
                                    for (var objIndex in topics){
                                      var searchName = topics[objIndex].title;
                                      var id =  topics[objIndex].topicid;
                                      var fullText = id + " - " + searchName;
                                      optArray.push(fullText);
                                    }
                                    for( var userObjIndex in users){
                                      optArray.push(users[userObjIndex].userid);
                                    }

                                    optArray = optArray.sort();

                                    $(function() {
                                        $("#search").autocomplete({
                                            source: optArray
                                        });
                                    });

                                    $('#searchButton').on('click', function() {

                                        //find the node
                                        var selectedValSearch = document.getElementById('search').value;
                                        var selectedValArray = selectedValSearch.split(" ");
                                        console.log(selectedValArray);
                                        var selectedVal = selectedValArray[0];
                                        var pathnode = svg.selectAll('.path-node');
                                        if (selectedVal === "") {

                                        } else {
                                            var selected = node.filter(function (d, i) {
                                              return d.id == selectedVal;
                                            });

                                            // var selectedInitial = selected.text();
                                            var firstChar = selectedVal.slice(0,1);

                                            if(firstChar === 'T'){
                                                selected.attr('d',connectedNodes);

                                                selected.attr('d',d3.symbol().type(d3.symbolStar).size(function(d) {
                                                    if (d.group1) {
                                                      if(topics[d.id].popularity === 1){
                                                        return  Math.pow(topics[d.id].popularity, 5) * 15;
                                                      }
                                                      else{
                                                            return Math.pow(Math.log(topics[d.id].popularity), 2) * 15;
                                                      }
                                                    } else {
                                                        return Math.pow(Math.log(users[d.id].popularity), 3);
                                                    }
                                                }));

                                                draw();
                                            }
                                            else if (firstChar === 'U') {

                                                selected.attr('d',connectedNodes);

                                                selected.attr('d',d3.symbol().type(d3.symbolCircle).size(function(d) {
                                                    if (d.group1) {
                                                      if(topics[d.id].popularity === 1){
                                                        return  Math.pow(topics[d.id].popularity, 5) * 15;
                                                      }
                                                      else{
                                                            return Math.pow(Math.log(topics[d.id].popularity), 2) * 15;
                                                      }
                                                    } else {
                                                        return Math.pow(Math.log(users[d.id].popularity), 3);
                                                    }
                                                }));

                                                draw();

                                            // d3.select(selected).text(function(d){
                                            //   console.log(d);
                                            // });
                                            // console.log(selected.style("fill"));
                                            // console.log($(selected).find('path'));
                                            // console.log(selected.;
                                            // selected.attr('d',d3.symbol().type(d3.symbolStar).size(700));
                                            // selected.style('fill','#fff');
                                            // var link = svg.selectAll(".link");
                                            // link.style("opacity", "0");
                                            // d3.selectAll(".link").transition()
                                            //     .duration(1500)
                                            //     .style("opacity", 0.1);
                                        }
                                      }
                                    });

                                } //end of complete usertopicedges.csv

                        }); //end of papaparse usertopicedges.csv

                    } //end of complete function of topicnodeproperties.csv

            }); //end of papaparse topicnodeproperties.csv

        } //end of complete function of usernodeproperties.csv

}); //end of PapaParse usernodeproperties.csv

$('div').on('click', 'a.close', function() {
    var $target = $(this).parents('li');
    $target.hide('slow', function() {
        $target.remove();
    });
});

$(document).ready(function(){

    $("#matrixSectionContainer").hide();
    $('#documentationRow').hide();
    $('#helpContainer').hide();
    $('#memberModal').modal('show');

    $("#matrixNav").on('click',function(){
      $('#nodeLinkBigContainer').hide();
      $("#matrixSectionContainer").show();
      $("#nodeLinkNav").children().removeClass('active');
      $("#matrixNav").children().addClass('active');
      $('#documentationNav').children().removeClass('active');
      $('#documentationRow').hide();
      $('#helpContainer').hide();
      $('#helpNav').children().removeClass('active');
    });

    $("#nodeLinkNav").on('click',function(){
      $('#nodeLinkBigContainer').show();
      $("#nodeLinkNav").children().addClass('active');
      $("#matrixNav").children().removeClass('active');
      $("#matrixSectionContainer").hide();
      $('#documentationNav').children().removeClass('active');
      $('#documentationRow').hide();
      $('#helpContainer').hide();
      $('#helpNav').children().removeClass('active');
    });

    $("#documentationNav").on('click',function(){
      $('#documentationRow').show();
      $(this).children().addClass('active');
      $("#matrixNav").children().removeClass('active');
      $("#matrixSectionContainer").hide();
      $("#nodeLinkNav").children().removeClass('active');
      $('#nodeLinkBigContainer').hide();
      $('#helpContainer').hide();
      $('#helpNav').children().removeClass('active');
    });

    $("#helpNav").on('click',function(){
      $('#helpContainer').show();
      $(this).children().addClass('active');
      $("#matrixNav").children().removeClass('active');
      $("#matrixSectionContainer").hide();
      $("#nodeLinkNav").children().removeClass('active');
      $('#nodeLinkBigContainer').hide();
      $('#documentationNav').children().removeClass('active');
      $('#documentationRow').hide();
    });


});


/*********************************************************************
    code for topic-topic similarity matrix trial matrix diagram begins
/**********************************************************************/


Papa.parse('./csv-assests/aih_topic_clustersc.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {

            var record = results.data;

            var arrayCluster = [];
            var bigObject = {
                "nodes": [],
                "links": []
            };

            var objectAlpha = {};
            for (var k = 0; k < record.length; k++) {
                var alpha = record[k].TCluster;
                objectAlpha[alpha] = [];
                for (var l = 0; l < record.length - 1; l++) {
                    if (alpha === record[l].TCluster) {
                        objectAlpha[alpha].push(record[l].TopicID);
                    }
                }
            }

            delete objectAlpha.undefined;
            var objectAlphaProp = Object.keys(objectAlpha);
            for (var obj in objectAlpha) {
                for (var m = 0; m < objectAlphaProp.length; m++) {
                    if (obj === objectAlphaProp[m]) {
                        for (var n = 0; n < objectAlpha[obj].length - 1; n++) {
                            for (var o = n + 1; o < objectAlpha[obj].length; o++) {
                                var linksObject = {};
                                linksObject.source = objectAlpha[obj][n].slice(5);
                                linksObject.target = objectAlpha[obj][o].slice(5);
                                linksObject.value = 10;
                                bigObject.links.push(linksObject);
                            }
                        }
                    }
                }
            }
            for (var len = 0; len < record.length - 1; len++) {
                var topicIdObj = {};
                topicIdObj.name = record[len].TopicID;
                var alphabet = record[len].TCluster;
                topicIdObj.ClusterAlpha = alphabet.substr(-1);
                topicIdObj.group = len;
                arrayCluster.push(topicIdObj);
            } // end of len for

            for (var i = 0; i < arrayCluster.length; i++) {
                var alpha = arrayCluster[i].ClusterAlpha;
                for (var j = 0; j < arrayCluster.length - 1; j++) {
                    if (alpha === arrayCluster[j + 1].ClusterAlpha) {
                        arrayCluster[j + 1].group = arrayCluster[i].group;
                    }
                }
            }

            bigObject.nodes = arrayCluster;

            var margin = {
                    top: 80,
                    right: 0,
                    bottom: 10,
                    left: 80
                },
                width = 570,
                height = 570;

            var x = d3.scaleBand().range([0, width]),
                z = d3.scaleLinear().domain([0, 4]).clamp(true),
                c = d3.scaleOrdinal(d3.schemeCategory20).domain(d3.range(20));

            var svg = d3.select("#matrixSection").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("margin-left", -margin.left + "px")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var matrix = [],
                nodes = bigObject.nodes,
                n = nodes.length;

            // Compute index per node.
            nodes.forEach(function(node, i) {
                node.index = i;
                node.count = 0;
                matrix[i] = d3.range(n).map(function(j) {
                    return {
                        x: j,
                        y: i,
                        z: 0
                    };
                });
            });

            // Convert links to matrix; count character occurrences.
            bigObject.links.forEach(function(link) {
                matrix[link.source][link.target].z += link.value;
                matrix[link.target][link.source].z += link.value;
                matrix[link.source][link.source].z += link.value;
                matrix[link.target][link.target].z += link.value;
                nodes[link.source].count += link.value;
                nodes[link.target].count += link.value;
            });

            // Precompute the orders.
            var orders = {
                name: d3.range(n).sort(function(a, b) {
                    return d3.ascending(nodes[a].name, nodes[b].name);
                }),
                count: d3.range(n).sort(function(a, b) {
                    return nodes[b].count - nodes[a].count;
                }),
                group: d3.range(n).sort(function(a, b) {
                    return nodes[b].group - nodes[a].group;
                })
            };

            // The default sort order.
            x.domain(orders.name);

            svg.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height);

            var row = svg.selectAll(".row")
                .data(matrix)
                .enter().append("g")
                .attr("class", "row")
                .attr("transform", function(d, i) {
                    return "translate(0," + x(i) + ")";
                })
                .each(row1);

            row.append("line")
                .attr("x2", width);

            row.append("text")
                .attr("x", -6)
                .attr("y", x.bandwidth() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .text(function(d, i) {
                    return nodes[i].name;
                });

            var column = svg.selectAll(".column")
                .data(matrix)
                .enter().append("g")
                .attr("class", "column")
                .attr("transform", function(d, i) {
                    return "translate(" + x(i) + ")rotate(-90)";
                });

            column.append("line")
                .attr("x1", -width);

            column.append("text")
                .attr("x", 6)
                .attr("y", x.bandwidth() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .text(function(d, i) {
                    return nodes[i].name;
                });

            function row1(row) {
                var cell = d3.select(this).selectAll(".cell")
                    .data(row.filter(function(d) {
                        return d.z;
                    }))
                    .enter().append("rect")
                    .attr("class", "cell")
                    .attr("x", function(d) {
                        return x(d.x);
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", x.bandwidth())
                    .style("fill-opacity", function(d) {
                        return z(d.z);
                    })
                    .style("fill", function(d) {

                        return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;
                    })
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout);
            }

            function mouseover(p) {
                d3.selectAll(".row text").classed("active", function(d, i) {
                    return i == p.y;
                });
                d3.selectAll(".column text").classed("active", function(d, i) {
                    return i == p.x;
                });
            }

            function mouseout() {
                d3.selectAll("text").classed("active", false);
            }

            d3.select("#order").on("change", function() {
                order(this.value);
            });

            function order(value) {
                x.domain(orders[value]);

                var t = svg.transition().duration(2500);

                t.selectAll(".row")
                    .delay(function(d, i) {
                        return x(i) * 4;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(0," + x(i) + ")";
                    })
                    .selectAll(".cell")
                    .delay(function(d) {
                        return x(d.x) * 4;
                    })
                    .attr("x", function(d) {
                        return x(d.x);
                    });

                t.selectAll(".column")
                    .delay(function(d, i) {
                        return x(i) * 4;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(" + x(i) + ")rotate(-90)";
                    });
            }
        } //end of complete
}); //end of papa parse

/*********************************************************************
    code for topic-topic similarity matrix trial matrix diagram ends
/**********************************************************************/
