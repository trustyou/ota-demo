
function NoResult({}) {
  return <div className="placeholder-box">
    <div className="placeholder-box-icon">
      <i className="ty-icon ty-icon-database-search"></i>
    </div>
    <div className="placeholder-box-title">No hotels found</div>
    <div className="placeholder-box-subtitle">This might be due to the selected location or because of invalid search parameters.</div>
  </div>
}

function ErrorMessage({}) {
  return <div className="placeholder-box">
    <div className="placeholder-box-icon">
      <i className="ty-icon ty-icon-database-search"></i>
    </div>
    <div className="placeholder-box-title">There is an error occurred</div>
    <div className="placeholder-box-subtitle">Please try again.</div>
  </div>
}

function RelevantNow({relevantNow}) {
  var scoreTrendItems = []
  var categoriesItems = []
  var relevantNowScoreTrendText = ''
  var relevantNowCategoriesText = ''

  if (relevantNow.overall_satisfaction && relevantNow.overall_satisfaction.score) {
    const recentRating = relevantNow.overall_satisfaction.score
    scoreTrendItems.push(`<span><b>Recent Rating</b>: Score <span class="pill">${recentRating}</span>`);
    if (relevantNow.overall_satisfaction.trend) {
      const recentTrend = relevantNow.overall_satisfaction.trend
      const recentTrendText = (recentTrend > 0) ? '+' + recentTrend : recentTrend
      const trendClassName = (recentTrend > 0) ? 'text-positive': 'text-negative'
      const arrowClassName = (recentTrend > 0) ? 'ty-icon-arrow-up': 'ty-icon-arrow-down'
      scoreTrendItems.push(`<span class=${trendClassName}><i class="ty-icon ${arrowClassName}"></i>${recentTrendText}</span>`)
    }

    relevantNowScoreTrendText = scoreTrendItems.join('')
  }

  if (relevantNow.relevant_topics) {
    for (var key in relevantNow.relevant_topics) {
      const val = relevantNow.relevant_topics[key];
      categoriesItems.push(`${val.name} <span class="pill">${val.score}</span>`)
    }

    relevantNowCategoriesText = categoriesItems.join(', ')
  }

  return <div>
    <div>
      {relevantNowScoreTrendText && <span dangerouslySetInnerHTML={{ __html: relevantNowScoreTrendText }}></span>}
    </div>
    <div>
      {relevantNowCategoriesText && <span dangerouslySetInnerHTML={{ __html: relevantNowCategoriesText }}></span>}
    </div>
  </div>
}

function SearchSummaryItem({kind, text, value, onClick}) {
  return <span key={`${kind}-${value}`} className="search-tag">{text}
    <i className="ty-icon ty-icon-remove" data-kind={kind} data-value={value} onClick={onClick}></i>
  </span>
}

function SearchSummary({onItemRemoved, selectedCategories, selectedTripTypes, selectedOccasions}) {
  var onClick = (e) => {
    onItemRemoved(
      e.target.attributes["data-kind"].value,
      e.target.attributes["data-value"].value
    );
  }

  if (selectedCategories.length === 0 && selectedTripTypes.length === 0 &&  selectedOccasions.length === 0) {
    return <></>
  }

  return <div className="search-summary">
    Your custom preferences:

    <>
    {selectedCategories.map(
      category => <SearchSummaryItem
        key={category}
        kind="category"
        text={JSON.parse(category).name}
        value={JSON.parse(category).category_id}
        onClick={onClick}
      />
    )}
    </>

    <>
    {selectedTripTypes.map(
      ({id, name}) => <SearchSummaryItem
        key={id}
        kind="tripType"
        text={name}
        value={id}
        onClick={onClick}
      />
    )}
    </>
    <>
    {selectedOccasions.map(
      ({id, name}) => <SearchSummaryItem
        key={id}
        kind="occasion"
        text={name}
        value={id}
        onClick={onClick}
      />
    )}
    </>
  </div>
}

class SearchHeader extends React.Component {
  state = {
    categories: [],
    location: '',
    city: '',
    country: '',
    tripTypes: [],
    occasions: [],
    isOpen: false,
  }

  applyFilter = () => {
    if (!this.props.isSearching) {
      this.props.onApplyChanges(this.state);
    }
  }

  applyCategoryChange = (categories) => {
    this.setState({
      categories
    })
  }

  applyTripsChange = (trips) => {
    this.setState({
      tripTypes: trips
    })
  }

  applyOccasionsChange = (occasions) => {
    this.setState({
      occasions
    })
  }

  applyLocationChange = (location) => {
    if (location !== this.state.location) {
      const locationFilter = parseCityCountry(location)
      this.setState({
        location,
        city: locationFilter[0],
        country: locationFilter[1],
      });
      this.props.onApplyLocationChange(location);
    }
  }

  onSearchSummaryItemRemoved = (kind, value) => {
    var newState = null;

    if (kind === "category") {
      const newCategories = this.state.categories.filter(x => JSON.parse(x).category_id !== value)
      newState = {
        categories: newCategories,
      };
    } else if (kind == "tripType") {
      const newTripTypes = this.state.tripTypes.filter(x => x.id !== value)
      newState = {
        tripTypes: newTripTypes,
      };
    } else if (kind == "occasion") {
      const newOccasions = this.state.occasions.filter(x => x.id !== value)
      newState = {
        occasions: newOccasions,
      };
    }
    // TODO Check isOpen == false?
    if (newState && !this.props.isSearching) {
      this.setState(newState, () => this.props.onApplyChanges(this.state));
    }
  }

  clearFilter = () => {
    this.setState({
      categories: [],
      tripTypes: [],
      occasions: [],
    });
  }

  componentDidUpdate(prevProps) {
    const newState = {};

    if (prevProps.isOpen !== this.props.isOpen) {
      newState["isOpen"] = this.props.isOpen;
    }

    if (prevProps.categories !== this.props.categories) {
      newState["categories"] = this.props.categories;
    }

    if (prevProps.occasions !== this.props.occasions) {
      newState["occasions"] = this.props.occasions;
    }

    if (prevProps.tripTypes !== this.props.tripTypes) {
      newState["tripTypes"] = this.props.tripTypes;
    }

    if (Object.keys(newState).length > 0) {
      this.setState(newState);
    }
  }

  componentDidMount() {
    const selectedLocation = getLocationSearchInUrl("location")
    const locationFilter = parseCityCountry(selectedLocation);

    const initState = {
      isOpen: this.props.isOpen,
    }

    if (locationFilter) {
      initState['location'] = selectedLocation;
      initState['city'] = locationFilter[0];
      initState['country'] = locationFilter[1];
    }
    this.setState(initState)
  }

  render() {
    return <header>
      <form className="search-form" id="search-form" action="results.html">
        <div className="search-container">
          <fieldset className="search-primary" id="search-primary">
            { (this.props.totalCount == null) && <legend> Searching... </legend> }
            { this.props.totalCount && <legend> You have {this.props.totalCount.toLocaleString()} results for <em
              id="search-location-legend">{capitalize(this.state.city)} - {capitalize(this.state.country)}</em>
              </legend>
            }
            <div className="search-box">
              <SearchLocation value={this.state.location} handleChange={this.applyLocationChange} placeholder="Try another destination?"/>
              <i className="ty-icon ty-icon-search"></i>
            </div>
            <SearchSummary
              selectedCategories={this.state.categories}
              selectedTripTypes={this.state.tripTypes}
              selectedOccasions={this.state.occasions}
              onItemRemoved={this.onSearchSummaryItemRemoved}
            />
          </fieldset>
          <fieldset className="search-secondary">
            <div className={`search-preferences ${this.state.isOpen ? 'is-open' : ''}`} id="search-preferences">
              <CategoryFilter onChange={this.applyCategoryChange} selected={this.state.categories} mrCategories={this.props.mrCategories}/>
              <TripsFilter onChange={this.applyTripsChange} selected={this.state.tripTypes}/>
              <OccasionsFilter onChange={this.applyOccasionsChange} selected={this.state.occasions}/>
              <input
                className="form-submit btn btn-positive btn-lg"
                type="button"
                value={this.props.isSearching ? 'Searching...' : 'Apply changes'}
                onClick={this.applyFilter}
              />
              <input className="form-reset" type="reset" value="Clear selection" onClick={this.clearFilter}/>
            </div>
            <div className="search-toggle" id="search-toggle" onClick={this.props.toggleSearch}>
              <span>{!this.state.isOpen ? 'Select your preferences' : 'Hide preferences' }</span>
              <i className={`ty-icon ty-icon-chevron-${this.state.isOpen ? 'up' : 'down'}`}></i>
            </div>
          </fieldset>
        </div>
      </form>
    </header>
  }
}

class TripsFilter extends React.Component {
  state = {
    selected: [],
  }

  allTrips = () => {
    // TODO API call?
    return ALL_TRIP_TYPES;
  }

  handleClick = (e) => {
    const { value } = e.target
    var selectedItems = this.state.selected

    const index = selectedItems.indexOf(value);

    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems = [value]
    }

    this.setState({
      selected: selectedItems,
    }, () => {
      this.props.onChange(this.allTrips().filter(t => selectedItems.includes(t.id)))
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.setState({
        selected: this.props.selected.map(a => a.id),
      });
    }
  }

  componentDidMount() {
    this.setState({
      selected: this.props.selected.map(a => a.id),
    })
  }

  render() {
    const { selected } = this.state;

    return <fieldset>
      <legend>What kind of trip did you have in mind?</legend>
      {
        this.allTrips().map(({id, name, icon}) => <label key={id} className={selected.includes(id) ? "is-selected" : ""}>
          <input
            type="checkbox"
            defaultChecked={selected.includes(id)}
            onClick={this.handleClick}
            name={name}
            value={id}
          />
            <i className={`ty-icon ty-icon-${icon}`}></i>
            {capitalize(name)}
        </label>)
      }
    </fieldset>
  }
}

class OccasionsFilter extends React.Component {
  state = {
    selected: [],
  }

  allOccasions = () => {
    return ALL_OCCASIONS;
  }

  handleClick = (e) => {
    const { value } = e.target
    var selectedItems = this.state.selected

    const index = selectedItems.indexOf(value);

    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems = [value]
    }

    this.setState({
      selected: selectedItems,
    }, () => {
      this.props.onChange(this.allOccasions().filter(t => selectedItems.includes(t.id)))
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.setState({
        selected: this.props.selected.map(i => i.id),
      })
    }
  }

  componentDidMount() {
    this.setState({
      selected: this.props.selected.map(i => i.id),
    })
  }

  render() {
    const { selected } = this.state;

    return <fieldset>
      <legend>Any special occasion for this trip?</legend>
      {
        this.allOccasions().map(
          ({id, name, icon}) =>
          <label key={id} className={selected.includes(id) ? "is-selected" : ""}>
            <input
              type="checkbox"
              defaultChecked={selected.includes(id)}
              onClick={this.handleClick}
              name={name}
              value={id}
            />
              <i className={`ty-icon ty-icon-${icon}`}></i>
              {name}
          </label>
        )
      }
    </fieldset>
  }
}

class CategoryFilter extends React.Component {
  state = {
    selected: null,
  }

  updateValue = (selected) => {
    this.setState({ selected });
    this.props.onChange(selected)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.setState({
        selected: this.props.selected,
      })
    }
  }

  componentDidMount() {
    this.setState({
      selected: this.props.selected,
    })
  }

  render() {
    const options = this.props.mrCategories.map(
      cat => <antd.Select.Option
          key={JSON.stringify({category_id: cat.category_id, name: cat.name})}>{cat.name}
        </antd.Select.Option>
    );
    const { selected } = this.state;

    return <fieldset>
      <legend>What is most relevant for your trip?</legend>
      <div className="search-categories">
        <antd.Select
          showArrow={false}
          mode="multiple"
          allowClear
          placeholder="e.g. cleanliness, breakfast, wifi"
          showSearch
          onChange={this.updateValue}
          value={selected}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {options}
        </antd.Select>
      </div>
    </fieldset>
  }
}

function Loader({itemCount}) {
  return <div id="spinner">
    {[...Array(itemCount).keys()].map(item => <article key={`spinner-${item}`} className="hotel">
        <div className="hotel-image"></div>
        <div className="hotel-details">
          <div className="placeholder-text"></div>
          <div className="placeholder-text"></div>
        </div>
        <div className="hotel-actions">
          <div className="placeholder-btn"></div>
          <div className="placeholder-text"></div>
        </div>
      </article>
    )}
  </div>;
}

function HotelCategories({hotelId, categories}) {
  return <ul className="categories">
    {
      categories.slice(0, 3).map(category => <li key={`${hotelId}-${category.category_id}`}>
        <div className="has-tooltip">
          <span className="category pill">{category.category_name}: {category.score}</span>
          { category.count > 0 && <div className="tooltip">
              Based on {category.count} {category.count === 1 ? "review" : "reviews"}
            </div>
          }
        </div>
      </li>)
    }
  </ul>;
}

function HotelBadges({hotelId, badges}) {
  // Take 1st badge is not trust_score_sentence, if there is no item, take 1st
  var badge = badges.find(b => b.badge_type !== 'trust_score_sentence' && b.badge_type !== 'good_to_know'
      && b.badge_type !== 'ranking')
  if (badge === undefined && badges.length > 0) {
    badge = badges[0];
  }

  return <>
    { badge && <>
      <ul className="badges">
        <li
          key={`${hotelId}-${badge.badge_type}-${badge.badge_data.category_name}-${badge.subtext}`}
          className="has-tooltip"
        >
          <div className="tooltip">
            { !badge.subtext && <span dangerouslySetInnerHTML={{ __html: badge.text }}></span>}
            {badge.subtext}
          </div>
          <div className="badge">
              <div className="icon-wrapper"><i className={`ty-icon ty-icon-${badge.icon || "trophy"}`}></i></div>
              <div className="ribbon-tail"></div>
          </div>
        </li>
      </ul>
      <div className="rank-value">
        <span dangerouslySetInnerHTML={{ __html: badge.text }}></span>
      </div>
    </>
    }
  </>;
}

class Hotel extends React.Component {
  render() {
    const { hotel, randomIndex, isPersonalizedSearch } = this.props
    if (!hotel.image) {
      hotel.image = `img/hotels/h${randomIndex}.jpg`
    }
    const hotelImageStyle = { backgroundImage: `url(${hotel.image})`, };

    const isPersonalizedMatch = hotel.match.personalized_match;
    const allCategories = {...hotel.match.categories, ...hotel.match.hotel_types}
    const matchCategories = Object.values(allCategories).sort((a, b) => b.score - a.score )
    const matchesTripType = hotel.match.trip_type !== "all";
    const categories = isPersonalizedMatch ? matchCategories: hotel.categories;

    return <article className="hotel" id={hotel.ty_id} onClick={() => this.props.onHotelClicked(hotel)}>
      <div className="hotel-image has-tooltip" style={hotelImageStyle}>
        <div className="tooltip"> ⚠️ This picture doesn't belong to the hotel </div>
      </div>
      <div className="hotel-details">
        <div className="hotel-name">{hotel.name}</div>
        { hotel.distance_from_center && <div className="hotel-location">
          <i className="ty-icon ty-icon-map-marker"></i> {hotel.distance_from_center}
        </div>
        }
        { isPersonalizedSearch && <span className="hotel-match-score has-tooltip">
            <div className="tooltip"> Matches {hotel.match.match_score}% to your personalization </div>
              {hotel.match.match_score}% match for you
          </span>
        }
        { matchesTripType &&
          <div>
            Guest feedback from similar trips:
          </div>
        }
        <HotelCategories hotelId={hotel.ty_id} categories={categories} />
        <RelevantNow relevantNow={hotel.relevant_now} />
      </div>
      <div className="hotel-actions">
        <div className="trustscore">
          <div className="score">{hotel.score}</div>
          <div className="details">
            <div className="label">{hotel.score_description}</div>
            <div className="caption">{hotel.reviews_count ? hotel.reviews_count.toLocaleString(undefined): 0} reviews</div>
          </div>
        </div>
        <HotelBadges hotelId={hotel.ty_id} badges={hotel.badges} />
        <a className="action-primary btn btn-primary" href={`details.html?ty_id=${hotel.ty_id}`}>Book Now</a>
        <a className="action-secondary btn btn-text" href={`details.html?ty_id=${hotel.ty_id}`}>More details</a>
      </div>
    </article>
  }
}

class SearchResults extends React.Component {
  render() {
    if (this.props.hotels.length == 0) {
      return <NoResult />
    }

    return <div id="hotel-list">
      {this.props.hotels.map(
        hotel => <Hotel
          key={hotel.ty_id}
          onHotelClicked={this.props.onHotelClicked}
          hotel={hotel}
          isPersonalizedSearch={this.props.isPersonalizedSearch}
          randomIndex={getRandomImageIndex()}
        />)
      }
      {this.props.appendLoading && <Loader itemCount={2} />}
    </div>
  }
}

class SearchPage extends React.Component {
  state = {
    isLoadingHotel: true,
    isLoadingMore: false,
    isLoadingCategories: true,
    hotels: [],
    totalCount: null,
    mrCategories: [],
    error: null,
    filterCity: "",
    filterCountry: "",

    filterLat: null,
    filterLon: null,

    filterCategories: [],
    filterTrips: [],
    filterOccasions: [],
    isPersonalizedSearch: false,
    isOpenSearch: false,

    prevY: 0,
    pageSize: 10,
    currentPage: 0,
    hasNextPage: true,

    isMapFloating: false,
    newHotels: null,

    // Selected hotel, center in map
    selectedHotelId: null,
    centerLat: null,
    centerLon: null,
  }

  fetchSearchParamsInUrl = () => {
    const newState = {};
    var isPersonalizedSearch = false;

    const country = getLocationSearchInUrl("country");
    if (country) {
      newState["filterCountry"] = country;
    }
    const city = getLocationSearchInUrl("city");
    if (city) {
      newState["filterCity"] = city;
    }

    const pageSize = getLocationSearchInUrl("page_size");
    if (pageSize && !isNaN(parseInt(pageSize))) {
      newState["pageSize"] = parseInt(pageSize);
    }

    const filterTrips = getParamsInUrl("trip_type");
    if (filterTrips && filterTrips.length > 0) {
      isPersonalizedSearch = true;
      newState["filterTrips"] = filterTrips.map(id => {
        return ALL_TRIPS_INDEX[id];
      });
    }

    const filterOccasions = getParamsInUrl("occasions");
    if (filterOccasions && filterOccasions.length > 0) {
      isPersonalizedSearch = true;
      newState["filterOccasions"] = filterOccasions.map(id => {
        return ALL_OCCASIONS_INDEX[id];
      });
    }

    const filterCategories = getParamsInUrl("categories");
    if (filterCategories && filterCategories.length > 0) {
      isPersonalizedSearch = true;
      newState["filterCategories"] = filterCategories;
    }

    newState["isPersonalizedSearch"] = isPersonalizedSearch;

    return newState;
  }

  componentDidMount() {
    const selectedLocation = getLocationSearchInUrl("location");
    const locationFilter = parseCityCountry(selectedLocation);
    var newState = {
      isLoadingHotel: true,
      isLoadingCategories: true,
    }

    if (locationFilter) {
      // TODO Support lat,lon query
      if (this.state.filterCity != locationFilter[0] || this.state.filterCountry != locationFilter[1]) {
        newState["filterCity"] = locationFilter[0]
        newState["filterCountry"] = locationFilter[1]
      }
      newState = Object.assign({}, this.fetchSearchParamsInUrl(), newState);
      this.setState(newState, () => this.fetchHotels());
      this.fetchCategories();
    } else {
      window.location.href = "index.html"
    }

    var observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    };

    this.observer = new IntersectionObserver(
      this.handleObserver.bind(this),
      observerOptions
    );
    this.observer.observe(this.loadingRef);

    // float Map
    this.observerFloatMap = new IntersectionObserver(
      this.handleObserverFloatMap.bind(this),
      observerOptions
    );
    this.observerFloatMap.observe(this.floatMapRef);
  }

  handleObserverFloatMap(entities, observer) {
    /**
     * if The indicator is not in the viewport set map floating
     */
    const el = entities[0];
    var rect = el.boundingClientRect;

    var isMapFloating = false;

    if (rect.bottom < 0 || rect.top < 0) {
      isMapFloating = true;
    }

    this.setState({
      isMapFloating,
    });
  }

  handleObserver(entities, observer) {
    const y = entities[0].boundingClientRect.y;

    if (!this.state.isLoadingHotel && this.state.prevY > y && this.state.hasNextPage) {
      this.setState(
        { currentPage: this.state.currentPage +1, isLoadingMore: true },
        () => this.fetchHotels()
      );
    }
    this.setState({ prevY: y });
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

  addMarkers = (hotels) => {
    this.setState({ newHotels: hotels})
  }

  buildAndStoreSearchUrl = () => {
    const { filterCountry, filterCity, filterCategories, filterOccasions } = this.state;
    var url = `country=${filterCountry}&city=${filterCity}`;
    var browserUrl = url;

    filterCategories.forEach(function(category) {
      url = `${url}&categories=${JSON.parse(category).category_id}`;
      browserUrl = `${browserUrl}&categories=${category}`;
    });

    this.state.filterTrips.forEach(function(trip) {
      url = `${url}&trip_type=${trip.id}`;
      browserUrl = `${browserUrl}&trip_type=${trip.id}`;
    });

    filterOccasions.forEach(function(occasion) {
      occasion.categories.forEach(cat => {
        url = `${url}&hotel_types=${cat}`;
      });
      browserUrl = `${browserUrl}&occasions=${occasion.id}`;
    });

    url = `${url}&page_size=${this.state.pageSize}&page=${this.state.currentPage}`;
    browserUrl = `${browserUrl}&page_size=${this.state.pageSize}`;

    const urlFull = `results.html?location=${filterCity}--${filterCountry}&${browserUrl}`;

    // Replace url to keep track search params
    if (`results.html${window.location.search}`.toUpperCase() !== encodeURI(urlFull).toUpperCase()) {
      window.history.replaceState(null, null, urlFull);
    }

    return url;
  }

  fetchHotels() {
    this.setState({
      isLoadingHotel: true,
    })

    const baseUrl = `${OTA_DEMO_API_URL}/api/v1/search/?`
    var url = this.buildAndStoreSearchUrl();

    this.fetchLocationCoordinates()
      .then(coordinates => {
        // Update mapbox
        if (coordinates) {
          this.setState({
            filterLat: coordinates.lat,
            filterLon: coordinates.lon
          })
        }

        axios({
          method: 'get',
          url: `${baseUrl}${url}`
        })
        .then(response => response.data)
        .then(data => {
          this.addMarkers(data.hotels);
          const hasNextPage = data.hotels.length == this.state.pageSize ? true : false;
          const hotels = this.state.currentPage == 0 ? data.hotels : this.state.hotels.concat(data.hotels);
          const totalCount = data.total_count;

          this.setState({
            hasNextPage,
            error: null,
            hotels,
            totalCount,
            isLoadingHotel: false,
            isLoadingMore: false,
            isOpenSearch: false,
          });
        })
        // Catch any errors we hit and update the app
        .catch(error => this.setState({ error, isLoadingHotel: false }));
      })
  }

  fetchLocationCoordinates() {
    /**
     * Get the coordinates of the city.
     *
     */
    const { filterCountry, filterCity, isLoadingMore } = this.state

    if (isLoadingMore) {
      // Loading more means location is not changed, ignore the fetch
      return Promise.resolve(null);
    }
    const coordinateUrl = `https://nominatim.openstreetmap.org/search?q=${filterCity},${filterCountry}&format=json&polygon=1&addressdetails=1`;

    return axios({
      method: 'get',
      url: coordinateUrl
    })
      .then(response => {
        if (response.data.length > 0) {
          return response.data[0];
        }
        return null;
      })
      .catch(() => null);
  }

  fetchCategories() {
    axios({
      method: 'get',
      url: `${OTA_DEMO_API_URL}/hotels/categories`
    })
        .then(response => {
          return response
        })
        .then(response => response.data.response.cluster_category_list)
        .then(categories =>
            this.setState({
              error: null,
              mrCategories: categories,
              isLoadingCategories: false,
            })
        )
        .catch(error => this.setState({ error, isLoadingCategories: false }));
  }

  onApplyLocationChange = (newLocation) => {
    /**
     * Change location will trigger new search
     * Reset to first page
     */
    const locationFilter = parseCityCountry(newLocation);
    if (locationFilter[0] !== this.state.filterCity || locationFilter[1] !== this.state.filterCountry) {
      this.setState({
        currentPage: 0,
        isLoadingMore: false,
        filterCity: locationFilter[0],
        filterCountry: locationFilter[1],
        totalCount: null,
      }, () => {
        this.fetchHotels();
      });
    }
  }

  onApplyChangesFilter = (data) => {
    /**
     * Apply new search, reset to the first page
     */
    var newState = {
      filterCategories: data.categories,
      filterTrips: data.tripTypes,
      filterOccasions: data.occasions,
      isPersonalizedSearch: !!(data.categories.length || data.tripTypes.length || data.occasions.length),
      currentPage: 0,
      isLoadingMore: false,
    }

    const locationFilter = parseCityCountry(data.location);
    if (locationFilter) {
      newState["filterCity"] = locationFilter[0]
      newState["filterCountry"] = locationFilter[1]
    }

    this.setState(newState, () => {
      this.fetchHotels();
    });
  }

  toggleSearch = () => {
    this.setState({
      isOpenSearch: !this.state.isOpenSearch,
    })
  }

  handleHotelClicked = (hotel) => {
    if (
      hotel.coordinates
      && this.state.centerLat !== hotel.coordinates[0]
      && this.state.centerLon !== hotel.coordinates[1]
    ) {
      this.setState({
        centerLat: hotel.coordinates[0],
        centerLon: hotel.coordinates[1],
        selectedHotelId: hotel.ty_id,
      })
    }
  }

  render() {
    return <>
      <SearchHeader
        toggleSearch={this.toggleSearch}
        isOpen={this.state.isOpenSearch}
        isSearching={this.state.isLoadingHotel}
        onApplyChanges={this.onApplyChangesFilter}
        onApplyLocationChange={this.onApplyLocationChange}
        mrCategories={this.state.mrCategories}
        categories={this.state.filterCategories}
        tripTypes={this.state.filterTrips}
        occasions={this.state.filterOccasions}
        totalCount={this.state.totalCount}
      />
      <span id="list-indicator" ref={floatMapRef => (this.floatMapRef = floatMapRef)}></span>

      <main>
        {(this.state.isLoadingMore || (!this.state.isLoadingHotel && !this.state.isLoadingCategories)) && !this.state.error &&
          <SearchResults
            hotels={this.state.hotels}
            isPersonalizedSearch={this.state.isPersonalizedSearch}
            onHotelClicked={this.handleHotelClicked}
            appendLoading={this.state.isLoadingMore}
          />
        }

        {!this.state.isLoadingHotel && !this.state.isLoadingCategories && this.state.error && <ErrorMessage/>}

        {this.state.isLoadingHotel && !this.state.isLoadingMore && <Loader itemCount={3} />}

        <MapContainer
          newHotels={this.state.newHotels}
          lat={this.state.filterLat}
          lon={this.state.filterLon}
          centerLat={this.state.centerLat}
          centerLon={this.state.centerLon}
          selectedHotelId={this.state.selectedHotelId}
          isMapFloating={this.state.isMapFloating}
        />
      </main>

      <div className="footer-loader" ref={loadingRef => (this.loadingRef = loadingRef)}></div>
    </>
  }
}

ReactDOM.render(<SearchPage />, document.getElementById('search-page'))
