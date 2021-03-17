var map = L.map('search-map').setView([48.1019351, 11.53698539037037], 11);
var markers = [];

function getIcon(scoreDescription) {
    const idx = scoreDescription.toLowerCase().replaceAll(" ", "");

    const icons = {
        excellent: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        verygood: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
        fair: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
        good: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        poor: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    }
    var icon = icons[idx];
    if (!icon) {
        icon = icons[fair];
    }

    return new L.Icon({
        iconUrl: icon,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

function buildMap(lat, lon) {
    if (map) {
        map.remove();
    }
    map = L.map('search-map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function addMarker(tyId, scoreDescription, lat, lon, popupText) {
    if (!map) {
        return;
    }
    cleanMarker(tyId);
    markers[tyId] = L.marker([lon, lat], {icon: getIcon(scoreDescription)}).bindPopup(popupText).addTo(map);
}

function cleanMarkers() {
    if (map && markers) {
        Object.entries(markers).map(([ty_id, _]) => cleanMarker(ty_id));
    }
}

function cleanMarker(ty_id) {
    if (map && markers && markers.hasOwnProperty(ty_id)) {
        // remove the marker
        map.removeLayer(markers[ty_id]);
    }
}
