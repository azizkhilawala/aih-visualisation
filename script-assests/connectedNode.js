function createUserCard(d){
	// console.log(d)
	var temp=d3.select("#infoBoxSection")
	.append("div")
	.append("li")
	.classed("card card-block",true)
	.attr("id","card"+d.id)
	.attr("aria-hidden",true)
	.style("border-color","#333");

	temp.append("h4")
	.style("display","inline")
	.attr("data-toggle","collapse")
	.attr("id","cardTitle"+d.id);

	temp=temp.append("div")
	.classed("collapse",true)
	.attr("id","collapseUser"+d.id)
	.append("div")
	.classed("card card-block container",true);

	temp.append("div")
	.classed("row",true)
	.append("div")
	.classed("col-md-12 drop-down",true)
	.attr("data-toggle","collapse")
	.attr("data-target","#collapseTopics"+d.id)
	.attr("aria-controls","collapseTopics"+d.id)
	.append("h5").html("List of Topics")
	.append("i")
	.classed("fa fa-chevron-down drop-down",true)
	.attr("aria-expanded","false");

	temp.append("ul")
	.classed("collapse row list-unstyled",true)
	.attr("id","collapseTopics"+d.id);

}

function createTopicCard(d){
	// console.log(d)
	var temp=d3.select("#infoBoxSection")
	.append("div")
	.append("li")
	.classed("card card-block",true)
	.attr("id","card"+d.id)
	.attr("aria-hidden",true)
	.style("border-color","#333");

	temp.append("h4")
	.style("display","inline")
	.attr("data-toggle","collapse")
	.attr("id","cardTitle"+d.id);

	temp=temp.append("div")
	.classed("collapse",true)
	.attr("id","collapseTopic"+d.id)
	.append("div")
	.classed("card card-block container",true);

	temp.append("div")
	.classed("row",true)
	.append("div")
	.classed("col-md-12 drop-down",true)
	.attr("data-toggle","collapse")
	.attr("data-target","#collapseUser"+d.id)
	.attr("aria-controls","collapseUser"+d.id)
	.append("h5").html("List of Users "+"&nbsp;")
	.append("i")
	.classed("fa fa-chevron-down drop-down",true)
	.attr("aria-expanded","false");

	temp.append("ul")
	.classed("collapse row list-unstyled",true)
	.attr("id","collapseUser"+d.id);

	temp.append("div")
	.classed("row",true)
	.append("div")
	.classed("col-md-12 drop-down",true)
	.attr("data-toggle","collapse")
	.attr("data-target","#collapseKeywords"+d.id)
	.attr("aria-controls","collapseKeywords"+d.id)
	.append("h5").html("Topic Keywords "+"&nbsp;")
	.append("i")
	.classed("fa fa-chevron-down drop-down",true)
	.attr("aria-expanded","false");

	temp.append("ul")
	.classed("collapse row list-unstyled",true)
	.attr("id","collapseKeywords"+d.id);

}

function removeCard(){

}
