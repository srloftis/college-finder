$(function() {
	d3.csv("data_clean.csv", function(data) {
		data.forEach(function(d){
			d.LATITUDE = +d.LATITUDE;
			d.LONGITUDE = +d.LONGITUDE;
			d.ACTCMMID = +d.ACTCMMID;
			d.SAT_AVG = +d.SAT_AVG;
			d.TUITIONFEE_IN = +d.TUITIONFEE_IN;
			d.TUITIONFEE_OUT = +d.TUITIONFEE_OUT;
			d.ADM_RATE = +d.ADM_RATE;
		});
		console.log(data);
		
		var width = 960,
		height = 500;
		
		var svg = d3.select("#map")
			.append("svg")
				.attr("width", width)
				.attr("height", height);
		
		// Append Div for tooltip to SVG
		var div = d3.select("#map")
		    .append("div")   
    		.attr("class", "tooltip")               
    		.style("opacity", 0);
				
		var projection = d3.geo.albersUsa();
			
		var path = d3.geo.path().projection(projection);	
		
		d3.queue()
			.defer(d3_request.json, "states.json")
			.await(ready);
			
		function ready(error, u, c) {

			  // store the values so we can use them later
			   states = u
			   centroid = c

			// draw the states
			svg.append("path")
			  .attr("class", "states")
			  .datum(topojson.feature(states, states.objects.usStates))
			  .attr("d", path);
			
			var info = document.getElementById("info");
			
			var points = svg.selectAll(".pin")
				.data(data)
				.enter().append("circle", ".pin")
				.attr("r", 3)
				.style("fill", "#102E24")
				.attr("cx", function(d) {
					return projection([d.LONGITUDE, d.LATITUDE])[0];
				})
				.attr("cy", function(d) {
					return projection([d.LONGITUDE, d.LATITUDE])[1];
				})
				 .on("mouseover", function(d) {		
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html(d.INSTNM)	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY - 28) + "px");	
					d3.select(this).attr("r", 6).style("fill", "#D76035");
				})					
				.on("mouseout", function(d) {		
					div.transition()		
						.duration(500)		
						.style("opacity", 0);	
					d3.select(this).attr("r", 3).style("fill", "#102E24");
				})
				.on("click", function(d) {
					info.innerHTML = d.INSTNM;
				});

			
			var actSlider = document.getElementById("actSlider");
			var satSlider = document.getElementById("satSlider");
			var actOutput = document.getElementById("actOutput");
			var satOutput = document.getElementById("satOutput");
			var stateList = document.getElementById("stateList");
			var collegeList = document.getElementById("collegeList");
			
			actOutput.innerHTML = actSlider.value + " or lower"; // Display the default slider value
			satOutput.innerHTML = satSlider.value + " or lower"; // Display the default slider value

			clear.onclick = function(){
				points.attr("visibility", "visible");
				actSlider.value = 36;
				satSlider.value = 1600;
				stateList.value = "";
				collegeList.value = "";
				info.innerHTML = "Click on a university to view additional information.";
				
			}
			
			actSlider.oninput = function() {
				slider(actSlider, actOutput);
			}
			
			satSlider.oninput = function() {
				slider(satSlider, satOutput);
			}
			
			stateList.onchange = function() {
				slider(stateList, "")
			}
			
			collegeList.onchange = function() {
				slider(collegeList, "")
			}
			
			function slider(slider, output){
				if (output != ""){
					output.innerHTML = slider.value + " or lower";
				}
				points.attr("visibility", function(d) {
					if (stateList.value == "" && collegeList.value == ""){
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value ? "visible" : "hidden";
					}
					else if (collegeList.value == ""){
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value && d.STABBR == stateList.value ? "visible" : "hidden";
					}
					else if (stateList.value == ""){
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value && d.INSTNM == collegeList.value ? "visible" : "hidden";
					}
					else {
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value && d.INSTNM == collegeList.value && d.STABBR == stateList.value ? "visible" : "hidden";
					}
				});
			}
		}
				
	});

});




