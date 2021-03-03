$(document).ready(function(){

	// Ger search location from URL, submitted via search field
	$searchLocation = (location.search.split(name + '=')[1] || '').split('&')[0];
	$('#search-location-legend').text($searchLocation);
	$('#search-location').attr('value', $searchLocation);

	$searchPreferences = $('#search-preferences');
	$searchToggle = $('#search-toggle');

	// Expand/collapse search prefences panel
    $searchToggle.on('click', function(event) {
		$searchPreferences.toggleClass('is-open');

		if($searchPreferences.hasClass('is-open')) {
			$searchToggle.find('span').text('Hide preferences');
			$searchToggle.find('.ty-icon').attr('class', 'ty-icon ty-icon-chevron-up');
		}
		else {
			$searchToggle.find('span').text('Customize your search');
			$searchToggle.find('.ty-icon').attr('class', 'ty-icon ty-icon-chevron-down');
		}
	});

    // // Style items when checkboxed are selected
	// $searchPreferences.find(':checkbox').bind('change', function(){
    // 	if(this.checked) {
    // 		$(this).parent('label').addClass('is-selected');
    // 	}
    // 	else {
    // 		$(this).parent('label').removeClass('is-selected');
    // 	}
	// });

	// // Remove item styling when resetting form
	// $('#search-form').bind('reset', function(){
	// 	$searchPreferences.find('label').removeClass('is-selected');
	// });

});