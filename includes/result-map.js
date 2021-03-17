var map = L.map('search-map').setView([48.1019351, 11.53698539037037], 11);
var markers = [];

function getIcon(scoreDescription) {
    const iconClass = scoreDescription.toLowerCase().replaceAll(" ", "");

    return L.divIcon({
        className: "trustyou-marker",
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [-6, -30],
        html: `<span class="map-marker marker-${iconClass}" />`
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

function cleanMarker(ty_id) {
    if (map && markers && markers.hasOwnProperty(ty_id)) {
        // remove the marker
        map.removeLayer(markers[ty_id]);
    }
}
