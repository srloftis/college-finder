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
				
		var projection = d3.geo.albersUsa();
			//.translate([width/2, height/2])    
			//.scale([1000]);  
			
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
			
			
			var points = svg.selectAll(".pin")
				.data(data)
				.enter().append("circle", ".pin")
				.attr("r", 3)
				.attr("cx", function(d) {
					return projection([d.LONGITUDE, d.LATITUDE])[0];
				})
				.attr("cy", function(d) {
					return projection([d.LONGITUDE, d.LATITUDE])[1];
				});
			
			var actSlider = document.getElementById("actSlider");
			var satSlider = document.getElementById("satSlider");
			var output = document.getElementById("output");
			output.innerHTML = actSlider.value; // Display the default slider value

			/*
			// Update the current slider value (each time you drag the slider handle)
			actSlider.oninput = function() {
				output.innerHTML = actSlider.value;
				//points.style("fill", "red");
				
				points.attr("visibility", function(d) {
					return d.ACTCMMID >= actSlider.value ? "hidden" : "visible";

				});
				
			}
			
			// Update the current slider value (each time you drag the slider handle)
			satSlider.oninput = function() {
				points.attr("visibility", function(d) {
					return d.SAT_AVG <= satSlider.value ? "visible" : "hidden";
				});
				
			}
			
*/
			clear.onclick = function(){
				points.attr("visibility", "visible");
				actSlider.value = 36;
				satSlider.value = 1600;
			}
			
			actSlider.oninput = function() {
				slider(actSlider);
			}
			
			satSlider.oninput = function() {
				slider(satSlider);
			}
			
			function slider(sliderID){
				output.innerHTML = sliderID.value;
				points.attr("visibility", function(d) {
					return d.SAT_AVG <= satSlider.value && d.ACTCMMID <= actSlider.value ? "visible" : "hidden";
				});
			}
		}
				
	});

});




