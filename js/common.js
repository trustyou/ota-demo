
const IMAGES_SIZE = 20;
const OTA_DEMO_API_URL = "https://ota-demo.integration.nbg1-c01-stag.hcloud.trustyou.net"

const ALL_OCCASIONS = [
  {
    id:  "honeymoon",
    name: "Honeymoon",
    icon: "tree-palm",
    categories: ["16b", "16d", "16r"]
  },
  {
    id:  "bachelor-party",
    name: "Bachelor party",
    icon: "glass-martini",
    categories: ["16i", "16ag", "16z"]
  },
  {
    id:  "wellness-relaxing",
    name: "Wellness & relaxing",
    icon: "lotus",
    categories: ["16e"]
  },
  {
    id:  "wintersports",
    name: "Wintersports",
    icon: "snowflake",
    categories: ["16s"]
  },
  {
    id:  "hiking-outdoors",
    name: "Hiking & outdoors",
    icon: "tree-pine",
    categories: ["16ab"]
  },
  {
    id:  "luxury",
    name: "Luxury",
    icon: "crown",
    categories: ["16b"]
  },
];
const ALL_OCCASIONS_INDEX = ALL_OCCASIONS.reduce((a, x) => ({...a, [x.id]: x}), {})

const ALL_TRIP_TYPES = [
  {
    id: "couple",
    name: "Couple",
    icon: "couple",
  },
  {
    id: "business",
    name: "Business",
    icon: "suitcase",
  },
  {
    id: "family",
    name: "Family",
    icon: "family",
  },
  {
    id: "solo",
    name: "Solo",
    icon: "single",
  },
];

const ALL_TRIPS_INDEX = ALL_TRIP_TYPES.reduce((a,x) => ({...a, [x.id]: x}), {})

/*
This is a demo API key, do not reuse it!
Contact TrustYou to receive your own.
*/
const TRUSTYOU_HOTEL_API_KEY = "a06294d3-4d58-45c8-97a1-5c905922e03a"

function capitalize(str) {
  if (!str) {
    return str
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getLocationSearchInUrl(name) {
  return decodeURI((location.search.split(name + '=')[1] || '').split('&')[0]);
}

function getParamsInUrl(name) {
  const parts = location.search.split(name + '=');
  return parts.slice(1).map(p => decodeURI((p || '').split('&')[0]));
}

function parseCityCountry(cityStr) {
  if (cityStr) {
    var cityCountry = cityStr.split('--')
    if (cityCountry.length < 2 || cityCountry[0].trim() == "" || cityCountry[1].trim() == "") {
      return null;
    }

    var city = decodeURI(cityCountry[0].trim()).toLowerCase();
    var country = decodeURI(cityCountry[1].trim()).toLowerCase();

    return [city, country]
  }
  return null;
}


function getRandomImageIndex() {
  // Random image Index
  var randomIndex = Math.floor(Math.random() * IMAGES_SIZE);
  return randomIndex + 1;
}

function scrollTo(tyId) {
  window.location.hash=`#${tyId}`;

  $(`#${tyId}`).addClass('hotel-highlight');
  setTimeout(function(){
    $(`#${tyId}`).removeClass('hotel-highlight');
  }, 1500);
}
