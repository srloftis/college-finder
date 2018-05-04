$(document).ready(function() { 
	$("#stateList").select2({
		placeholder: "Search by state",
		allowClear: true
	}); 
	$("#collegeList").select2({
		placeholder: "Search by college",
		allowClear: true
	}); 
});