// Init default map
var RESULT_MAP = L.map('search-map').setView([48.1019351, 11.53698539037037], 13);

var RESULT_MAP_MARKERS = [];

const SCORE_DESCRIPTIONS = {
    "score_0": "Excellent",
    "score_1": "Very Good",
    "score_2": "Good",
    "score_3": "Fair",
    "score_4": "Poor"
}

const SCORE_THRESHOLDS = [86.0, 80.0, 74.0, 68.0, 0.0];

function applyThreshold(score) {
    for (const [index, value] of SCORE_THRESHOLDS.entries()) {
        if (score > value) {
            return index;
        }
    }
}

function getIcon(matchScore) {
    const scoreIndex = applyThreshold(matchScore);
    const scoreDescription = SCORE_DESCRIPTIONS[`score_${scoreIndex}`];
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
    const mapConfig = {
        minZoom: 10,
        maxZoom: 16,
    }
    if (RESULT_MAP) {
        RESULT_MAP.remove();
        RESULT_MAP_MARKERS = [];
    }
    var map = L.map('search-map', mapConfig).setView([lat, lon], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    RESULT_MAP = map;

    return map;
}

function markerOnClickHandler(e) {
    scrollTo(e.target.tyId);
}

function addMarker(tyId, matchScore, lat, lon, popupText) {

    if (!RESULT_MAP) {
        return;
    }
    cleanMarker(tyId);

    var marker = L.marker([lat, lon], {icon: getIcon(matchScore)})
        .bindPopup(popupText);
    marker.tyId = tyId;

    RESULT_MAP_MARKERS[tyId] = marker
        .addTo(RESULT_MAP)
        .on('click', markerOnClickHandler);
}

function cleanMarker(ty_id) {
    if (RESULT_MAP && RESULT_MAP_MARKERS && RESULT_MAP_MARKERS.hasOwnProperty(ty_id)) {
        // remove the marker
        RESULT_MAP.removeLayer(RESULT_MAP_MARKERS[ty_id]);
    }
}
