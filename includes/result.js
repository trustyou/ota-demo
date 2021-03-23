
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
    scoreTrendItems.push(`<span>Recent Rating: Score <span class="pill">${recentRating}</span>`);
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
      this.setState({
        location
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
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({
        isOpen: this.props.isOpen,
      })
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
            <legend>You have 1,235 results for <em id="search-location-legend">{capitalize(this.state.city)} - {capitalize(this.state.country)}</em></legend>
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
    return [
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
    ]
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
    return [
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
    ]
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
          { category.count && <div className="tooltip">
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
  var badge = badges.find(b => b.badge_type !== 'trust_score_sentence' && b.badge_type !== 'good_to_know')
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
      <div class="rank-value">
        <span dangerouslySetInnerHTML={{ __html: badge.text }}></span>
      </div>
    </>
    }
  </>;
}

class Hotel extends React.Component {
  render() {
    const { hotel, randomIndex } = this.props
    const hotelImage = { backgroundImage: `url(img/hotels/h${randomIndex}.jpg)`, };
    const hasOnlyGenericMatchCategories = !!hotel.match.overall_score;
    const allCategories = {...hotel.match.categories, ...hotel.match.hotel_types}
    const matchCategories = Object.values(allCategories).sort((a, b) => b.score - a.score )
    const matchesTripType = hotel.match.trip_type !== "all";
    const categories = hasOnlyGenericMatchCategories ? hotel.categories : matchCategories;
    const personalizedSearch = !(hasOnlyGenericMatchCategories && hotel.match.trip_type === "all")

    return <article className="hotel">
      <div className="hotel-image" style={hotelImage}></div>
      <div className="hotel-details">
        <div className="hotel-name">{hotel.name}</div>
        { hotel.distance_from_center && <div className="hotel-location">
          <i className="ty-icon ty-icon-map-marker"></i> {hotel.distance_from_center}
        </div>
        }
        { personalizedSearch && <span className="hotel-match-score has-tooltip">
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

    return <div>
      {this.props.hotels.map(
        hotel => <Hotel
          key={hotel.ty_id}
          hotel={hotel}
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
    mrCategories: [],
    error: null,
    filterCity: "",
    filterCountry: "",
    filterCategories: [],
    filterTrips: [],
    filterOccasions: [],
    isOpenSearch: false,

    prevY: 0,
    pageSize: 10,
    currentPage: 0,
    hasNextPage: true,
  }

  componentDidMount() {
    const selectedLocation = getLocationSearchInUrl("location");
    const locationFilter = parseCityCountry(selectedLocation);
    const newState = {
      isLoadingHotel: true,
      isLoadingCategories: true,
    }

    if (locationFilter) {
      if (this.state.filterCity != locationFilter[0] || this.state.filterCountry != locationFilter[1]) {
        newState["filterCity"] = locationFilter[0]
        newState["filterCountry"] = locationFilter[1]
      }
      this.setState(newState, () => this.fetchHotels());
      this.fetchCategories();
    } else {
      window.location.href = "index.html"
    }

    var options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    };

    this.observer = new IntersectionObserver(
      this.handleObserver.bind(this),
      options
    );
    this.observer.observe(this.loadingRef);
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
    hotels.forEach(h => {
      const { ty_id, score_description, coordinates } = h;
      if (coordinates) {
        addMarker(ty_id, score_description, coordinates[0], coordinates[1], this.getMarkerPopup(h));
      }
    });
  }

  fetchHotels() {
    this.setState({
      isLoadingHotel: true,
    })

    const { filterCountry, filterCity, filterCategories } = this.state

    const base_url = `${OTA_DEMO_API_URL}/api/v1/search/?`
    var url = `${base_url}country=${filterCountry}&city=${filterCity}`

    filterCategories.forEach(function(category) {
      url = `${url}&categories=${JSON.parse(category).category_id}`
    });

    this.state.filterTrips.forEach(function(trip) {
      url = `${url}&trip_type=${trip.id}`
    });

    this.state.filterOccasions.forEach(function(occasion) {
      occasion.categories.forEach(cat => url = `${url}&hotel_types=${cat}`)
    });

    url = `${url}&page_size=${this.state.pageSize}&page=${this.state.currentPage}`

    this.fetchLocationCoordinates()
      .then(coordinates => {
        // Update mapbox
        if (coordinates) {
          buildMap(coordinates.lat, coordinates.lon);
        }

        axios({
          method: 'get',
          url: url
        })
        .then(response => response.data)
        .then(data => {
          this.addMarkers(data.hotels);
          const hasNextPage = data.hotels.length == this.state.pageSize ? true : false;
          const hotels = this.state.currentPage == 0 ? data.hotels : this.state.hotels.concat(data.hotels);

          this.setState({
            hasNextPage,
            error: null,
            hotels,
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
        filterCountry: locationFilter[1]
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

  render() {
    const footerLoadingCSS = {
      height: "60px",
    };

    return <>
      <SearchHeader
        toggleSearch={this.toggleSearch}
        isOpen={this.state.isOpenSearch}
        isSearching={this.state.isLoadingHotel}
        onApplyChanges={this.onApplyChangesFilter}
        onApplyLocationChange={this.onApplyLocationChange}
        mrCategories={this.state.mrCategories}
      />
      <main>
        {(this.state.isLoadingMore || (!this.state.isLoadingHotel && !this.state.isLoadingCategories)) && !this.state.error &&
          <SearchResults hotels={this.state.hotels} appendLoading={this.state.isLoadingMore} />
        }

        {!this.state.isLoadingHotel && !this.state.isLoadingCategories && this.state.error && <ErrorMessage/>}

        {this.state.isLoadingHotel && !this.state.isLoadingMore && <Loader itemCount={3} />}
        <div>
          <section className="search-map" id="search-map"></section>
          <div className="score-gradient">
            Preference match: <img src="/img/score-gradient.png" />
          </div>
        </div>
      </main>
      <div ref={loadingRef => (this.loadingRef = loadingRef)} style={footerLoadingCSS}></div>
    </>
  }
}

ReactDOM.render(<SearchPage />, document.getElementById('search-page'))
