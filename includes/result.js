
function NoResult({}) {
  return <div class="placeholder-box">
    <div class="placeholder-box-icon">
      <i class="ty-icon ty-icon-database-search"></i>
    </div>
    <div class="placeholder-box-title">No hotels found</div>
    <div class="placeholder-box-subtitle">This might be due to the selected location or because of invalid search parameters.</div>
  </div>
}

function ErrorOccur({}) {
  return <div class="placeholder-box">
    <div class="placeholder-box-icon">
      <i class="ty-icon ty-icon-database-search"></i>
    </div>
    <div class="placeholder-box-title">There is an error occurred</div>
    <div class="placeholder-box-subtitle">Please try again.</div>
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
    isSearching: false,
    isOpen: false,
  }

  applyFilter = () => {
    if (!this.state.isSearching) {
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
    this.setState({
      location
    })
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
    const selectedLocation = getLocationSearchInUrl()
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
            <legend>You have 1,235 results for <em id="search-location-legend">{this.state.city} - {this.state.country}</em></legend>
            <div className="search-box">
              <SearchLocation value={this.state.location} handleChange={this.applyLocationChange} placeholder="Try another destination?"/>
              <i className="ty-icon ty-icon-search"></i>
            </div>
          </fieldset>
          <fieldset className="search-secondary">
            <div className={`search-preferences ${this.state.isOpen ? 'is-open' : ''}`} id="search-preferences">
              <CategoryFilter onChange={this.applyCategoryChange} selected={this.state.categories}/>
              <TripsFilter onChange={this.applyTripsChange} selected={this.state.tripTypes}/>
              <OccasionsFilter onChange={this.applyOccasionsChange} selected={this.state.occasions}/>
              <input className="form-submit btn btn-positive btn-lg" type="button" value={this.props.isSearching ? 'Searching...' : 'Apply changes'} onClick={this.applyFilter}/>}
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
    return [
      "couple",
      "business",
      "family",
      "solo",
    ]
  }
  handleClick = (e) => {
    const { name } = e.target
    var selectedItems = this.state.selected.map(a => a)

    const index = selectedItems.indexOf(name);

    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(name)
    }
    this.setState({
      selected: selectedItems,
    }, () => {
      this.props.onChange(selectedItems)
    })
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
    const { selected } = this.state;

    return <fieldset>
      <legend>What kind of trip did you have in mind?</legend>
      {
        this.allTrips().map(trip => <label key={trip} className={selected.includes(trip) ? "is-selected" : ""}>
          <input
            type="checkbox"
            defaultChecked={selected.includes(trip)}
            onClick={this.handleClick}
            name={trip}
            value={trip}
          />
            <i className="ty-icon ty-icon-heart"></i>
            {capitalize(trip)}
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
    return {
      "wedding": [
        "Wedding",
        "tuxedo"
      ],
      "bachelor-party": [
        "Bachelor party",
        "glass-martini"
      ],
      "wellness-relaxing": [
        "Wellness & relaxing",
        "lotus"
      ],
      "wintersports": [
        "Wintersports",
        "snowflake"
      ],
      "hiking-outdoors": [
        "Hiking & outdoors",
        "tree-pine"
      ],
      "luxury": [
        "Luxury",
        "crown"
      ]
    }
  }

  handleClick = (e) => {
    const { name } = e.target
    var selectedItems = this.state.selected.map(a => a)

    const index = selectedItems.indexOf(name);

    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(name)
    }

    this.setState({
      selected: selectedItems,
    }, () => {
      this.props.onChange(selectedItems)
    })
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
    const { selected } = this.state;

    return <fieldset>
      <legend>Any special occasion for this trip?</legend>
      {
        Object.entries(this.allOccasions()).map(
          ([occasionVal, [occasionName, icon]]) =>
          <label key={occasionVal} className={selected.includes(occasionVal) ? "is-selected" : ""}>
            <input
              type="checkbox"
              defaultChecked={selected.includes(occasionVal)}
              onClick={this.handleClick}
              name={occasionVal}
              value={occasionVal}
            />
              <i className={`ty-icon ty-icon-${icon}`}></i>
              {occasionName}
          </label>
        )
      }
    </fieldset>
  }
}

class CategoryFilter extends React.Component {
  // We will use API data once we fixed CORS issue
  state = {
    error: null,
    categories: [
      {
        category_id:	"11",
        name:	"Room"
      },
      {
        category_id:	"11a",
        name:	"Bathroom"
      },
    ],
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
        url: 'http://api.trustyou.com/hotels/categories'
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
    const options = this.state.categories.map(d => <antd.Select.Option key={d.category_id}>{d.name}</antd.Select.Option>);
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
  return <ul className="badges">
    {
      badges.slice(0, 3).map(badge => <li key={`${hotelId}-${badge.badge_type}-${badge.subtext}`} class="has-tooltip">
        <div class="tooltip"> {badge.subtext} {badge.badge_data.category_name}</div>
        <div class="badge">
            <div class="icon-wrapper"><i class="ty-icon ty-icon-trophy"></i></div>
            <div class="ribbon-tail"></div>
        </div>
      </li>)
    }
  </ul>;
}

class Hotel extends React.Component {

    render() {
      const { hotel } = this.props
      const imgs = [
        'img/hotels/h1.jpg',
        'img/hotels/h2.jpg',
        'img/hotels/h3.jpg',
        'img/hotels/h4.jpg',
        'img/hotels/h5.jpg',
        'img/hotels/h6.jpg',
        'img/hotels/h7.jpg',
        'img/hotels/h8.jpg',
        'img/hotels/h9.jpg',
      ]
      const imgUrl = imgs[Math.floor(Math.random() * imgs.length)];
      const hotelImage = { backgroundImage: 'url(' + imgUrl + ')', };

      return <article className="hotel">
        <div className="hotel-image" style={hotelImage}></div>
        <div className="hotel-details">
          <div class="hotel-name">{hotel.name}</div>
          <div class="hotel-location"><i class="ty-icon ty-icon-map-marker"></i> 2km from center</div>
          85% match for you:
          <HotelCategories hotelId={hotel.ty_id} categories={hotel.categories} />
        </div>
        <div className="hotel-actions">
          <div class="trustscore">
            <div class="score">{hotel.rating}</div>
            <div class="details">
              <div class="label">Excellent</div>
              <div class="caption">{hotel.reviews_count ? hotel.reviews_count.toLocaleString(undefined): 0} reviews</div>
            </div>
          </div>
          <HotelBadges hotelId={hotel.ty_id} badges={hotel.badges} />
          <a className="action-primary btn btn-primary" href="details.html">Book Now</a>
          <a className="action-secondary btn btn-text" href="details.html">More details</a>
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
      {this.props.hotels.map(hotel => <Hotel key={hotel.ty_id} hotel={hotel} />)}
    </div>
  }
}

class SearchPage extends React.Component {
  state = {
    isLoadingHotel: true,
    hotels: [],
    error: null,
    filterCity: "stockholm",
    filterCountry: "sweden",
    filterCategories: [],
    filterTrips: [],
    filterOccasions: [],
    isOpenSearch: false
  }

  componentWillMount() {
    const selectedLocation = getLocationSearchInUrl();
    const locationFilter = parseCityCountry(selectedLocation);
    const newState = {}

    if (locationFilter) {
      newState["filterCity"] = locationFilter[0]
      newState["filterCountry"] = locationFilter[1]
    } else {
      window.location.href = "index.html"
      return false
    }

    this.setState(newState);
  }

  componentDidMount() {
    this.setState({
      isLoadingHotel: true,
    }, () => this.fetchHotels());
  }

  fetchHotels() {
    this.setState({
      isLoadingHotel: true,
    })

    const { filterCountry, filterCity, filterCategories } = this.state

    const base_url = 'https://ota-demo.integration.nbg1-c01-stag.hcloud.trustyou.net/api/v1/search/?'
    var url = `${base_url}country=${filterCountry}&city=${filterCity}`

    filterCategories.forEach(function(category) {
      url = `${url}&categories=${category}`
    });

    this.state.filterTrips.forEach(function(trip) {
      url = `${url}&trip_type=${trip}`
    });

    this.state.filterOccasions.forEach(function(occasion) {
      url = `${url}&occasion=${occasion}`
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
      .catch(error => this.setState({ error, isLoadingHotel: false, isOpenSearch: false }));
  }

  onApplyChangesFilter = (data) => {
    // TODO Filter after change location
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
      <SearchHeader toggleSearch={this.toggleSearch} isOpen={this.state.isOpenSearch} isSearching={this.state.isLoadingHotel} onApplyChanges={this.onApplyChangesFilter}/>
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
