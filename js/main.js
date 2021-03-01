$(document).ready(function(){

	// Ger search location from URL, submitted via search field
	$searchLocation = (location.search.split(name + '=')[1] || '').split('&')[0];
	$(document).find('#search-location').html($searchLocation);

});