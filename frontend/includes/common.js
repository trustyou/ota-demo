
function capitalize(str) {
  if (!str) {
    return str
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getLocationSearchInUrl() {
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
