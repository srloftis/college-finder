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
		//console.log(data);
		
		var width = 960,
		height = 500;
		
		var svg = d3.select("#map")
			.append("svg")
				.attr("width", width)
				.attr("height", height);
		
		// Append div for tooltip to SVG
		var div = d3.select("#map")
		    .append("div")   
    		.attr("class", "tooltip")               
    		.style("opacity", 0);
				
		var projection = d3.geo.albersUsa();
			
		var path = d3.geo.path().projection(projection);	
		
		// queue and ready function follows example from d3 lab 2
		d3.queue()
			.defer(d3_request.json, "states.json")
			.await(ready);
		
		function ready(error, u) {

			states = u

			// draw the states
			svg.append("path")
			  .attr("class", "states")
			  .datum(topojson.feature(states, states.objects.usStates))
			  .attr("d", path);
			
			//additional info box
			var info = document.getElementById("info");
			
			//add college pins 
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
				 .on("mouseover", function(d) {		//tooltip
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
				.on("click", function(d) { //populate additional info box
					var website = "<a href=https://" + d.INSTURL + ">Website</a>"
					var calc = "<a href=https://" + d.NPCURL + ">Net price calculator</a>"
					info.innerHTML = d.INSTNM.bold() + "<br />" 
					+ d.CITY + ", " + d.STABBR + "<br />" 
					+ "Admission rate: " + (Math.round(d.ADM_RATE * 1000) / 10).toFixed(1) + "%" + "<br />" 
					+ "In-state tuition: $" + d.TUITIONFEE_IN + "<br />"
					+ "Out-of-state tuition: $" + d.TUITIONFEE_OUT + "<br />"
					+ "Average ACT score: " + d.ACTCMMID + "<br />"
					+ "Average SAT score: " + d.SAT_AVG + "<br />"
					+ "<br />"
					+ website + "<br />"
					+ calc  + "<br />";
				});

			
			var actSlider = document.getElementById("actSlider");
			var satSlider = document.getElementById("satSlider");
			var inSlider = document.getElementById("inSlider");
			var actOutput = document.getElementById("actOutput");
			var satOutput = document.getElementById("satOutput");
			var inOutput = document.getElementById("inOutput");
			var outOutput = document.getElementById("outOutput");
			var stateList = document.getElementById("stateList");
			var collegeList = document.getElementById("collegeList");
			
			// Display the default slider values
			actOutput.innerHTML = actSlider.value + " or lower"; 
			satOutput.innerHTML = satSlider.value + " or lower";
			inOutput.innerHTML = "$" + inSlider.value + " or lower"; 
			outOutput.innerHTML = "$" + outSlider.value + " or lower"; 

			clear.onclick = function(){ //reset all sliders and values
				points.attr("visibility", "visible");
				actSlider.value = 36;
				satSlider.value = 1600;
				inSlider.value = 55000;
				outSlider.value = 55000;
				stateList.value = "";
				collegeList.value = "";
				actOutput.innerHTML = actSlider.value + " or lower"; 
				satOutput.innerHTML = satSlider.value + " or lower";
				inOutput.innerHTML = "$" + inSlider.value + " or lower"; 
				outOutput.innerHTML = "$" + outSlider.value + " or lower"; 
				info.innerHTML = "Click on a university to view additional information.";	
			}
			
			actSlider.oninput = function() {
				slider(actSlider, actOutput, "");
			}
			
			satSlider.oninput = function() {
				slider(satSlider, satOutput, "");
			}
			
			inSlider.oninput = function() {
				slider(inSlider, inOutput, "tuition");
			}
			
			outSlider.oninput = function() {
				slider(outSlider, outOutput, "tuition");
			}
			
			stateList.onchange = function() {
				slider(stateList, "", "")
			}
			
			collegeList.onchange = function() {
				slider(collegeList, "", "")
			}
			
			//base function for responding to user input
			function slider(slider, output, type){
				if (output != ""){
					output.innerHTML = slider.value + " or lower";
				}
				if (type == "tuition"){
					output.innerHTML = "$" + slider.value + " or lower";
				}
				points.attr("visibility", function(d) {
					if (stateList.value == "" && collegeList.value == ""){
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value && d.TUITIONFEE_IN <= inSlider.value && d.TUITIONFEE_OUT <= outSlider.value ? "visible" : "hidden";
					}
					else if (collegeList.value == ""){
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value && d.TUITIONFEE_IN <= inSlider.value && d.TUITIONFEE_OUT <= outSlider.value && d.STABBR == stateList.value ? "visible" : "hidden";
					}
					else if (stateList.value == ""){
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value && d.TUITIONFEE_IN <= inSlider.value && d.TUITIONFEE_OUT <= outSlider.value && d.INSTNM == collegeList.value ? "visible" : "hidden";
					}
					else {
						return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value && d.TUITIONFEE_IN <= inSlider.value && d.TUITIONFEE_OUT <= outSlider.value && d.INSTNM == collegeList.value && d.STABBR == stateList.value ? "visible" : "hidden";
					}
				});
			}
		}
				
	});

});




