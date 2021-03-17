var map = L.map('search-map').setView([48.1019351, 11.53698539037037], 11);
var markers = [];

var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'leaf-shadow.png',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});

function buildMap(lat, lon) {
    if (map) {
        map.remove();
    }
    map = L.map('search-map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function addMarker(ty_id, lat, lon, hotelName) {
    if (!map) {
        return;
    }
    cleanMarker(ty_id);
    markers[ty_id] = L.marker([lon, lat]).bindPopup(hotelName).addTo(map);
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
