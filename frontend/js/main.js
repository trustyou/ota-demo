$(document).ready(function(){

	// Ger search location from URL, submitted via search field
	$searchLocation = (location.search.split(name + '=')[1] || '').split('&')[0];
	$('#search-location').html($searchLocation);

	$searchPreferences = $('#search-preferences');
	$searchToggle = $('#search-toggle');

	// Expand/collapse search prefences panel
    $searchToggle.on('click', function(event) {
		$searchPreferences.toggleClass('is-open');

		if($searchPreferences.hasClass('is-open')) {
			$searchToggle.find('span').text('Close search preferences');
			$searchToggle.find('.ty-icon').attr('class', 'ty-icon ty-icon-chevron-up');
		}
		else {
			$searchToggle.find('span').text('Adjust search preferences');
			$searchToggle.find('.ty-icon').attr('class', 'ty-icon ty-icon-chevron-down');
		}
	})

});