
const IMAGES_SIZE = 20;
const OTA_DEMO_API_URL = "https://ota-demo.integration.nbg1-c01-stag.hcloud.trustyou.net"

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
