

$(document).ready(function(){

	$searchLocation = (location.search.split(name + '=')[1] || '').split('&')[0];
	$(document).find('#search-location').html($searchLocation);

});