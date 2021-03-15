
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
  var items = [];
  var relevantNowText = '';

  if (relevantNow.overall_satisfaction && relevantNow.overall_satisfaction.score) {
    var recentRating = relevantNow.overall_satisfaction.score;
    items.push(`<span>Recent feedback: Score <span class="pill">${recentRating}</span>`);
  }

  if (relevantNow.relevant_topics) {
    for (var key in relevantNow.relevant_topics) {
      const val = relevantNow.relevant_topics[key];
      items.push(`${val.name} <span class="pill">${val.score}</span>`)
    }
  }
  relevantNowText = items.join(', ');

  return <div>
    {relevantNowText && <span dangerouslySetInnerHTML={{ __html: relevantNowText }}></span>}
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
              <CategoryFilter onChange={this.applyCategoryChange} selected={this.state.categories}/>
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
              <span>{!this.state.isOpen ? 'Customize your search' : 'Hide preferences' }</span>
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
        name: "Couple"
      },
      {
        id: "business",
        name: "Business"
      },
      {
        id: "family",
        name: "Family"
      },
      {
        id: "solo",
        name: "Solo"
      },
    ]
  }

  handleClick = (e) => {
    const { value } = e.target
    var selectedItems = this.state.selected.map(a => a)

    const index = selectedItems.indexOf(value);

    if (index > -1) {
      // Remove item if exists
      selectedItems.splice(index, 1);
    } else {
      // Add item
      selectedItems.push(value)
    }
    this.setState({
      selected: selectedItems,
    }, () => {
      this.props.onChange(this.allTrips().filter(t => selectedItems.includes(t.id)))
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.setState({
        selected: this.props.selected.map(a => a.id),
      })
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
        this.allTrips().map(({id, name}) => <label key={id} className={selected.includes(id) ? "is-selected" : ""}>
          <input
            type="checkbox"
            defaultChecked={selected.includes(id)}
            onClick={this.handleClick}
            name={name}
            value={id}
          />
            <i className="ty-icon ty-icon-heart"></i>
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
        id:  "wedding",
        name: "Wedding",
        icon: "tuxedo",
      },
      {
        id:  "bachelor-party",
        name: "Bachelor party",
        icon: "glass-martini",
      },
      {
        id:  "wellness-relaxing",
        name: "Wellness & relaxing",
        icon: "lotus",
      },
      {
        id:  "wintersports",
        name: "Wintersports",
        icon: "snowflake",
      },
      {
        id:  "hiking-outdoors",
        name: "Hiking & outdoors",
        icon: "tree-pine",
      },
      {
        id:  "luxury",
        name: "Luxury",
        icon: "crown",
      },
    ]
  }

  handleClick = (e) => {
    const { value } = e.target
    var selectedItems = this.state.selected.map(a => a)

    const index = selectedItems.indexOf(value);

    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(value)
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
    error: null,
    categories: [],
    isLoading: false,
    selected: null,
  }

  updateValue = (selected) => {
    this.setState({ selected });
    this.props.onChange(selected)
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
          categories: categories,
          isLoading: false,
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
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
      isLoading: true,
    })
    this.fetchCategories();
  }

  render() {
    const options = this.state.categories.map(
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

function Loader({}) {
  return <div id="spinner">
    <article className="hotel">
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
      <article className="hotel">
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
      <article className="hotel">
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
  </div>;
}

function HotelCategories({hotelId, categories}) {
  return <ul className="categories">
    {
      categories.slice(0, 3).map(category => <li key={`${hotelId}-${category.category_id}`}>
        <span className="pill">{category.score}</span> {category.category_name}
      </li>)
    }
  </ul>;
}

function HotelBadges({hotelId, badges}) {
  // Take 1st badge is not trust_score_sentence, if there is no item, take 1st
  var badge = badges.find(b => b.badge_type !== 'trust_score_sentence')
  if (badge === undefined && badges.length > 0) {
    badge = badges[0];
  }

  return <>
    { badge && <ul className="badges">
      <li
        key={`${hotelId}-${badge.badge_type}-${badge.badge_data.category_name}-${badge.subtext}`}
        className="has-tooltip"
      >
        <div className="tooltip"> {badge.subtext} {badge.badge_data.category_name}</div>
        <div className="badge">
            <div className="icon-wrapper"><i className={`ty-icon ty-icon-${badge.icon || "trophy"}`}></i></div>
            <div className="ribbon-tail"></div>
        </div>
      </li>
    </ul>
    }
  </>;
}

class Hotel extends React.Component {
    render() {
      const { hotel, randomIndex } = this.props
      const hotelImage = { backgroundImage: `url(img/hotels/h${randomIndex}.jpg)`, };

      return <article className="hotel">
        <div className="hotel-image" style={hotelImage}></div>
        <div className="hotel-details">
          <div className="hotel-name">{hotel.name}</div>
          { hotel.distance_from_center && <div className="hotel-location">
            <i className="ty-icon ty-icon-map-marker"></i> {hotel.distance_from_center}
          </div>
          }
          85% match for you:
          <HotelCategories hotelId={hotel.ty_id} categories={hotel.categories} />
          <RelevantNow relevantNow={hotel.relevant_now} />
        </div>
        <div className="hotel-actions">
          <div className="trustscore">
            <div className="score">{hotel.score}</div>
            <div className="details">
              <div className="label">Excellent</div>
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
    </div>
  }
}

class SearchPage extends React.Component {
  state = {
    isLoadingHotel: true,
    hotels: [],
    error: null,
    filterCity: "",
    filterCountry: "",
    filterCategories: [],
    filterTrips: [],
    filterOccasions: [],
    isOpenSearch: false
  }

  componentDidMount() {
    const selectedLocation = getLocationSearchInUrl("location");
    const locationFilter = parseCityCountry(selectedLocation);
    const newState = {
      isLoadingHotel: true
    }

    if (locationFilter) {
      if (this.state.filterCity != locationFilter[0] || this.state.filterCountry != locationFilter[1]) {
        newState["filterCity"] = locationFilter[0]
        newState["filterCountry"] = locationFilter[1]
      }
      this.setState(newState, () => this.fetchHotels());
    } else {
      window.location.href = "index.html"
    }
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
      url = `${url}&occasion=${occasion.id}`
    });

    url = `${url}&page_size=10&page=0`

    axios({
        method: 'get',
        url: url
      })
      .then(response => response.data)
      .then(data =>
        this.setState({
          error: null,
          hotels: data.hotels,
          isLoadingHotel: false,
          isOpenSearch: false,
        })
      )
      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoadingHotel: false }));
  }

  onApplyLocationChange = (newLocation) => {
    const locationFilter = parseCityCountry(newLocation);
    if (locationFilter[0] !== this.state.filterCity || locationFilter[1] !== this.state.filterCountry) {
      this.setState({
        filterCity: locationFilter[0],
        filterCountry: locationFilter[1]
      }, () => {
        this.fetchHotels();
      });
    }
  }

  onApplyChangesFilter = (data) => {
    var newState = {
      filterCategories: data.categories,
      filterTrips: data.tripTypes,
      filterOccasions: data.occasions,
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
    return <>
      <SearchHeader
        toggleSearch={this.toggleSearch}
        isOpen={this.state.isOpenSearch}
        isSearching={this.state.isLoadingHotel}
        onApplyChanges={this.onApplyChangesFilter}
        onApplyLocationChange={this.onApplyLocationChange}
      />
      <main>
        {!this.state.isLoadingHotel && !this.state.error && <SearchResults hotels={this.state.hotels}/>}
        {!this.state.isLoadingHotel && this.state.error && <ErrorMessage/>}
        {this.state.isLoadingHotel && <Loader />}
        <section className="search-map"></section>
      </main>
    </>
  }
}

ReactDOM.render(<SearchPage />, document.getElementById('search-page'))
