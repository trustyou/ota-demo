class MapContainer extends React.Component {
    componentDidUpdate(prevProps) {
        if (prevProps.lat !== this.props.lat || prevProps.lon !== this.props.lon
            || (prevProps.isStaleMap !== this.props.isStaleMap && this.props.isStaleMap)) {
            RESULT_MAP = buildMap(this.props.lat, this.props.lon);
            RESULT_MAP.on('zoomend', () => this.mapChanged());
            RESULT_MAP.on('dragend', () => this.mapChanged());
        }

        if (prevProps.newHotels !== this.props.newHotels) {
            this.props.newHotels.forEach(h => {
                const { ty_id, coordinates } = h;
                if (coordinates) {
                    addMarker(ty_id, h.match.match_score, coordinates[0], coordinates[1], this.getMarkerPopup(h));
                }
            });
        }

        // Change map center
        if (prevProps.centerLat !== this.props.centerLat || prevProps.centerLon !== this.props.centerLon) {
            // Open marker
            RESULT_MAP_MARKERS[this.props.selectedHotelId] && RESULT_MAP_MARKERS[this.props.selectedHotelId].openPopup();
            // Center map to hotel
            RESULT_MAP.panTo(new L.LatLng(this.props.centerLat, this.props.centerLon));
        }
    }

    mapChanged = () => {
        // TODO Trigger search
        var coordinates = {
            lat: RESULT_MAP.getCenter().lat,
            lon: RESULT_MAP.getCenter().lng,
            radis: 100,
            zoom: RESULT_MAP.getZoom(),
        }
    }

    getMarkerPopup(hotel) {
        const { name, score, score_description} = hotel;
        return `<b>${name}</b>
            <div class="trustscore score-marker">
            <div class="score">${score}</div>
            <div class="details">
              <div class="label">${score_description}</div>
            </div>
          </div>
        `;
    }

    render() {
        return (
            <div className={this.props.isMapFloating ? 'map-container-float' : 'map-container'}>
                <section className="search-map" id="search-map"></section>
                <div className="score-gradient">
                    <div className="preference-match">Preference match</div>
                    <img src="img/score-gradient.png" />
                    <div className="match-legend">
                        <span className="match-low">Low</span>
                        <span className="match-high">High</span>
                    </div>
                </div>
            </div>
        )
    }
}
