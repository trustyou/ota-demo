(function($, Mustache, i18n, lang) {
	"use strict";

	/*
	This is the list of hotels that this example is based on. It is
	hardcoded here, while in all real-life applications these IDs and names
	would be the result of a query.

	Actually, the correct way to get the data for this live example would be to
	crawl all hotels from Berlin. We can't do that here as it would take
	too long. Hence, we're demonstrating the functionality with selected
	top hotels of each hotel type category.

	We have a sophisticated algorithm in place which ranks hotels per city.
	The outcome of the ranking is reflected in the "popularity" score of each
	entry of the "badge_list" object. Hence, with our data it is really
	easy to grab that ranking information and present a ranking for hotel types
	per city on a web page.
	*/
	var hotels = [
		{tyId: "359e1e4b-569a-4f97-aaa1-357f241a851b", name: "Das Stue", image: "img/Das_Stue.jpg"},
		{tyId: "288aded7-66e3-4aec-b1e3-a71706da76a9", name: "Gorki Apartments Berlin", image: "img/Gorki_Apartments_Berlin.jpg"},
		{tyId: "652088f5-fcfa-4e46-b44f-85200355acfa", name: "Hotel de Rome", image: "img/Hotel_de_Rome.jpg"},
		{tyId: "89a03e12-d311-46f4-8b73-479fe54834a0", name: "Hotel Zoo Berlin", image: "img/Hotel_Zoo_Berlin.jpg"},
		{tyId: "1bda9c97-ce40-45de-9f36-ead7f02aca5c", name: "Soho House Berlin", image: "img/Soho_House_Berlin.jpg"},
		{tyId: "5b76178c-f9ba-4b6d-8a45-b13111840200", name: "Riverside Am Tegel See", image: "img/Riverside_Am_Tegel_See.jpg"},
		{tyId: "5785b7de-5de2-4013-8051-c9ca3d536d72", name: "TopDomizil Panorama Apartments Friedrichstraße", image: "img/TopDomizil_Panorama_Apartments_Friedrichstrasse.jpg"},
		{tyId: "5ca46e2a-0750-41a1-b449-d388a25e8936", name: "25hours Hotel Bikini Berlin", image: "img/25hours_Hotel_Bikini_Berlin.jpg"},
		{tyId: "8d20c1b3-0c60-40ac-bcee-f3eecf42be2d", name: "Eastern Comfort Hostel Boat", image: "img/Eastern_Comfort_Hostel_Boat.jpg"},
		{tyId: "6772fde1-d7fc-4d91-a09a-c2846b09a754", name: "Panorama am Adenauerplatz", image: "img/Panorama_am_Adenauerplatz.jpg"},
		{tyId: "9f3f4a1a-982b-4db2-aae8-a43abe786ecf", name: "Centrovital Berlin", image: "img/Centrovital_Berlin.jpg"},
		{tyId: "ec905bcc-2b05-4913-ba2c-9b92e004e690", name: "Holiday at Alexanderplatz Apartments", image: "img/Holiday_at_Alexanderplatz_Apartments.jpg"},
		{tyId: "d379a319-1265-4b80-8842-c76ff829cd2b", name: "Aspria Berlin Hotel", image: "img/Aspria_Berlin_Hotel.jpg"},
		{tyId: "61949683-0948-4a13-9511-9616d54f43bc", name: "Hotel Zarenhof", image: "img/Hotel_Zarenhof.jpg"},
		{tyId: "f867408c-d038-4dc0-9a21-bb1038770718", name: "ibis Styles Hotel Berlin Mitte", image: "img/ibis_Styles_Hotel_Berlin_Mitte.jpg"},
		{tyId: "2d220326-d2aa-41f6-b185-0472c696dcfa", name: "B&B Hotel Berlin-Potsdamer Platz", image: "img/B&B_Hotel_Berlin-Potsdamer_Platz.jpg"},
		{tyId: "af14f75a-240a-4e0a-88ac-68e133f99d40", name: "EastSeven Berlin Hostel", image: "img/EastSeven_Berlin_Hostel.jpg"},
		{tyId: "8c74efcb-7de9-45e7-ac90-20662e86db7a", name: "Pension Brinn", image: "img/Pension_Brinn.jpg"},
		{tyId: "edf878e2-c96a-4e64-b265-124da1a1d290", name: "Hotel Seifert Berlin", image: "img/Hotel_Seifert_Berlin.jpg"},
		{tyId: "3c16db7a-d808-45c0-95bd-8bcfc5b28ca7", name: "Holi", image: "img/Holi.jpg"},
		{tyId: "3ac42a7e-11c5-4561-a3af-a8f85b5cb6cf", name: "Hotel Alexander beim Kurfürstendamm", image: "img/Hotel_Alexander_beim_Kurfurstendamm.jpg"},
		{tyId: "88d73ba7-ed12-4b8b-99d5-289fb6df3973", name: "Motel One Berlin-Ku'damm", image: "img/Motel_One_Berlin-Ku'damm.jpg"},
		{tyId: "85f03408-2feb-4371-adbe-07d6c1db250b", name: "Hotel Adelante", image: "img/Hotel_Adelante.jpg"},
		{tyId: "43a1c6e9-e87f-4072-a402-e6db3231c014", name: "Abba Berlin", image: "img/Abba_Berlin.jpg"},
		{tyId: "ae0d280e-330d-4b4a-bfa6-c6eb3bfdfcaa", name: "Hecker's Hotel Kurfürstendamm", image: "img/Hecker's_Hotel_Kurfurstendamm.jpg"},
		{tyId: "41ac1a11-e49b-4697-b159-00479078c4af", name: "Hotel Sachsenhof", image: "img/Hotel_Sachsenhof.jpg"},
		{tyId: "f973b6a5-fa5e-4141-8a9f-0c5bba9c41b3", name: "Hotel Lindenufer", image: "img/Hotel_Lindenufer.jpg"},
		{tyId: "9f5e6d10-9a02-4e29-9a89-0ade225407f9", name: "Goodman's Living", image: "img/Goodman's_Living.jpg"},
		{tyId: "43661d19-e45d-4669-8ada-98e9b742eebf", name: "Hotel Brandies", image: "img/Hotel_Brandies.jpg"},
		{tyId: "33a54ee6-1ddc-44ae-825e-390479fe3716", name: "Motel One Berlin-Mitte", image: "img/Motel_One_Berlin-Mitte.jpg"},
		{tyId: "8f3ad65d-9ae3-4e9e-b79d-80ee2b37d332", name: "ADAPT APARTMENTS Berlin", image: "img/ADAPT_APARTMENTS_Berlin.jpg"},
		{tyId: "759630e9-5a8a-4e62-963b-83d5b03d4e43", name: "Motel One Berlin-Spittelmarkt", image: "img/Motel_One_Berlin-Spittelmarkt.jpg"},
		{tyId: "f59cf46b-bb80-4b0c-b49d-3862211002bc", name: "Jetpak Alternative", image: "img/Jetpak_Alternative.jpg"},
		{tyId: "f51229a9-3ad7-4a43-acb4-00b1fc879835", name: "Hotel Indigo Alexanderplatz", image: "img/Hotel_Indigo_Alexanderplatz.jpg"},
		{tyId: "51fa5415-45d4-4bff-a104-e2098931ccdd", name: "Louisa's Place", image: "img/Louisa's_Place.jpg"},
		{tyId: "ae6db065-86a4-4d27-9d59-fcfe9e14c9c7", name: "Pullman Berlin Schweizerhof", image: "img/Pullman_Berlin_Schweizerhof.jpg"},
		{tyId: "4bed91db-3376-45ea-bcf2-45fc8ff89547", name: "InterContinental Berlin", image: "img/InterContinental_Berlin.jpg"},
		{tyId: "05620b88-073f-4d1e-abb5-1577133f8a99", name: "Grand Hyatt Berlin", image: "img/Grand_Hyatt_Berlin.jpg"},
		{tyId: "0a2d4738-ea83-46ea-96a1-598b6fa1471f", name: "Novum Select Hotel Berlin The Wall", image: "img/Novum_Select_Hotel_Berlin_The_Wall.jpg"},
		{tyId: "38476f88-fd4c-476f-a0f0-b84ebd63f72b", name: "Scandic Hotel Berlin Potsdamer Platz", image: "img/Scandic_Hotel_Berlin_Potsdamer_Platz.jpg"},
		{tyId: "f186e8f8-1eca-4c58-822a-a7092db0c2a4", name: "andel's by Vienna House Berlin", image: "img/andel's_by_Vienna_House_Berlin.jpg"},
		{tyId: "5cf1c636-d379-4af5-8407-47a0d66d193f", name: "H'Otello K'80 Berlin", image: "img/H'Otello_K'80_Berlin.jpg"},
		{tyId: "387d25e2-4321-4b45-a02a-e548a460383a", name: "Adina Apartment Hotel Berlin Hackescher Markt", image: "img/Adina_Apartment_Hotel_Berlin_Hackescher_Markt.jpg"},
		{tyId: "286a1eef-c31f-4d3d-91f5-88aa958592d4", name: "Hotel Park Consul", image: "img/Hotel_Park_Consul.jpg"},
		{tyId: "eed0de04-42b4-4aae-b47c-1c912a7e9e4d", name: "Mercure Airport Hotel Berlin Tegel", image: "img/Mercure_Airport_Hotel_Berlin_Tegel.jpg"},
		{tyId: "b69d6ca2-84bb-4645-a775-a5a0117a33bb", name: "BEST WESTERN Hotel am Borsigturm", image: "img/BEST_WESTERN_Hotel_am_Borsigturm.jpg"},
		{tyId: "ae6a2e98-6c44-42e0-ad77-8a0a1d41df89", name: "Days Inn Berlin West", image: "img/Days_Inn_Berlin_West.jpg"},
		{tyId: "07a403a9-cb62-4a20-a134-139b2eab7fdb", name: "Regent Berlin", image: "img/Regent_Berlin.jpg"},
		{tyId: "c58ebadb-6307-4ef3-8c35-09a89ca62d44", name: "Sofitel Berlin Kurfurstendamm", image: "img/Sofitel_Berlin_Kurfurstendamm.jpg"},
		{tyId: "b0d12ee6-0139-4d88-bb16-9a4fa1bc9c9a", name: "Vannis Haus", image: "img/Vannis_Haus.jpg"},
		{tyId: "1a20e70a-40ff-4f83-ad1d-10916f5352c9", name: "Mercure Hotel & Residenz Berlin Checkpoint Charlie", image: "img/Mercure_Hotel_&_Residenz_Berlin_Checkpoint_Charlie.jpg"},
		{tyId: "9e4244b3-81ad-426a-b7ee-6cec170c71a9", name: "ABACUS Tierpark Hotel", image: "img/ABACUS_Tierpark_Hotel.jpg"},
		{tyId: "60fd56b6-8f61-4672-a1d3-d76ec6bcf540", name: "Hotel Adlon Kempinski", image: "img/Hotel_Adlon_Kempinski.jpg"},
		{tyId: "4d3137f4-cdec-4050-9026-fcfe453e30a7", name: "Radisson Blu Hotel", image: "img/Radisson_Blu_Hotel.jpg"},
		{tyId: "e3ad7a26-12e2-46e4-bcc1-eb34e2899486", name: "Apartments Am Brandenburger Tor", image: "img/Apartments_Am_Brandenburger_Tor.jpg"},
		{tyId: "76dd617c-4ed8-4abd-9d54-a3ac15cb4dd3", name: "ApartHotel Residenz am Deutschen Theater", image: "img/ApartHotel_Residenz_am_Deutschen_Theater.jpg"},
		{tyId: "77bfa97b-bd89-44c0-b42d-3a823fed1707", name: "Flower´s Boardinghouse Mitte", image: "img/Flower's_Boardinghouse_Mitte.jpg"},
		{tyId: "99a73cb7-41a4-4fb5-bc22-a55d4bc5a803", name: "Old Town Apartments", image: "img/Old_Town_Apartments.jpg"},
		{tyId: "c15984a6-8e30-4bc9-9529-a7c8c5f7a84f", name: "HSH Hotel Apartments Mitte", image: "img/HSH_Hotel_Apartments_Mitte.jpg"},
		{tyId: "843a8c92-2a08-46cb-803a-1a120a645318", name: "Stars Guesthouse Berlin", image: "img/Stars_Guesthouse_Berlin.jpg"},
	];

	// render container div with selected language
	var containerTemplate = $("#tmpl-container").html();
	$("body").html(Mustache.render(containerTemplate, {i18n: i18n[lang]}));

	/*
	Prepare the request to the TrustYou API. We will make use of the Bulk
	API to launch several requests at once. Note how the language and
	version need to be passed with each individual request, but the
	mandatory API key need only be put once in the bulk request.
	*/
	var requestList = [];
	hotels.forEach(function(hotel) {
		// We specify the version as a parameter to make sure that
		// future updates of our api won't break the code.
		requestList.push("/hotels/" + hotel.tyId + "/meta_review.json?" + $.param({lang: lang, v: "5.39", show_filters: false}));
	});
	// JSON-encode the request list
	requestList = JSON.stringify(requestList);

	var bulkRequest = $.ajax({
		url: "https://api.trustyou.com/bulk",
		data: {
			request_list: requestList,
			/*
			This is a demo API key, do not reuse it!
			Contact TrustYou to receive your own.
			*/
			key: "a06294d3-4d58-45c8-97a1-5c905922e03a"
		},
		// Usage of JSONP is not required for server-side calls
		dataType: "jsonp"
	}).fail(function() {
		throw "Bulk request failed!";
	});

	// when the DOM is ready for rendering, process the API response
	$(function() {
		bulkRequest.done(processApiResponse);

		// when a tab change occurs
		$(document).on('shown.bs.tab', 'a[data-toggle="tab"]',function (e) {
			// if tab is activated from the "Show similar hotels"link
			if ($(this).hasClass('show-similar-hotels')){
				// remove active class from all tiles/dropdown menus
				$('#summary-filters a[data-toggle="tab"]').parent('li').removeClass('active');
				// activate newly selected tab
				$('#summary-filters a[href="' + $(this).attr('href') + '"]').parents('li, .tile').addClass('active');
			}

		});
	});

	/**
	Render a result list hotel.

	@param hotelData - Data for this hotel from your database, e.g. its name
	@param reviewSummary - TrustYou Review Summary API response
	@param badge - Badge that we're filtering by
	@param bestMix - True if we're in the "Best Mix" view
	*/
	function renderHotel(hotelData, reviewSummary, badge, bestMix) {
		// load the HTML template
		var hotelTemplate = $("#tmpl-hotel").html();
		// prepare the data to be passed to the template
		var templateData = {
			// hotel details
			name: hotelData.name,
			hotelId: hotelData.tyId,
			image: hotelData.image,
			// data from meta-review
			reviewsCount: reviewSummary.reviews_count,
			trustScore: reviewSummary.summary.score,
			scoreDescription: reviewSummary.summary.score_description,
			badge: badge,
			highlights: badge.highlight_list,
			// information about active filter
			categoryId: badge.badge_data.category_id,
			showAll: bestMix,
			// internationalized labels
			lang: lang,
			i18n: i18n[lang],
			// this data will be filled in by the code below
			summarySentence: "",
			additionalBadges: []
		};

		/*
		Build a nice summary sentence for this hotel.

		Rather than taking the pre-built sentence in the "text" property,
		we're going to build one to fit our needs. We'll show whatever is
		available in the "location_nearby", "location" and "summary_sentence_list"
		properties.
		*/
		var summarySentence = [reviewSummary.summary.location_nearby, reviewSummary.summary.location].concat(reviewSummary.summary.summary_sentence_list)
		.filter(function(component) {
			// filter out a component in case there's no data for it
			return component != null;
		})
		.map(function(component) {
			return component.text;
		})
		.join(" ");
		templateData.summarySentence = summarySentence;

		/*
		Show up to 2 hotel type and 2 category badges, in addition to
		the badge we're filtering by.
		*/
		var additionalBadges = [];
		var badgeTypeCounts = { "hotel_type": 2, "category": 2 };
		reviewSummary.badge_list.forEach(function(badge) {
			// don't repeat the badge we're filtering by
			if (badge.badge_data.category_id == badge.badge_data.categoryId) {
				return;
			}
			if (badgeTypeCounts.hasOwnProperty(badge.badge_type) && badgeTypeCounts[badge.badge_type] > 0) {
				additionalBadges.push(badge);
				badgeTypeCounts[badge.badge_type] -= 1;
			}
		});

		templateData.additionalBadges = additionalBadges;

		// render the template, and display the hotel
		var hotelRendered = Mustache.render(hotelTemplate, templateData);
		var identifier = bestMix ? "all" : badge.badge_data.category_id;
		$("#search-results-" + identifier).append(hotelRendered);
	}

	/**
	Process a response from the TrustYou Bulk API.
	*/
	function processApiResponse(data) {
		// hide spinner
		$("#spinner").hide();

		// check whether the bulk request was successful
		if (data.meta.code !== 200) {
			throw "Bulk request failed!";
		}
		var responses = data.response.response_list;
		var hotelsByCategory = {};
		responses.forEach(function(response, index) {
			// check whether the individual request was successful
			if (response.meta.code !== 200) {
				throw "Request failed!";
			}
			// skip hotels which have no data available
			if (response.response.summary === null) {
			  return;
			}
			/*
			Responses are guaranteed to be in the same order as the
			request_list we passed earlier. Therefore, we can merge the
			response with our data by their index and add some context.
			*/
			var hotelData = hotels[index];
			/*
			Loop through the badge list, put the hotel into a list of
			badges for every badge it has.
			*/
			response.response.badge_list.forEach(function(badge) {
				if (badge.badge_type == "category" || badge.badge_type == "hotel_type") {
					if (!hotelsByCategory.hasOwnProperty(badge.badge_data.category_id)) {
						hotelsByCategory[badge.badge_data.category_id] = [];
					}
					hotelsByCategory[badge.badge_data.category_id].push({
						hotelData: hotelData,
						reviewSummary: response.response,
						badge: badge,
					});
				}
			});
		});

		/*
		Now go through all hotel types, sort them by popularity and keep
		only the top 5. Then render them!
		*/
		for (var categoryId in hotelsByCategory) {

			hotelsByCategory[categoryId] = hotelsByCategory[categoryId]
			// sort by descending popularity
			.sort(function(a, b) {
				return a.badge.badge_data.popularity - b.badge.badge_data.popularity;
			})
			// take top 5
			.slice(0, 5);

			// Now render each hotel!
			hotelsByCategory[categoryId].forEach(function(hotel) {
				renderHotel(hotel.hotelData, hotel.reviewSummary, hotel.badge, false);
			});
		}

		/*
		Render the "Best Mix" page. Take the top hotel from pre-defined
		lists of categories and hotel types.
		*/
		["16h", "16c", "16d", "16b", "111", "11e", "14c", "24", "201", "171", "131"].forEach(function(categoryId) {
			// pick the correct filter from the merged list
			if (hotelsByCategory[categoryId].length > 0) {
				// as we sorted the hotels above, we just take the first one here
				var hotel = hotelsByCategory[categoryId][0];
				renderHotel(hotel.hotelData, hotel.reviewSummary, hotel.badge, true);
			}
		});
	}
})($, Mustache, i18n, lang);
