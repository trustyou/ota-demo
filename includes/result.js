// Inline Reactjs render
function Loader({}) {
  return <div id="spinner">
    <img src="img/ajax-loader.gif" className="center-block"/>
  </div>;
}

function HotelCategories({categories}) {
  return <ul className="categories">
    {
      categories.slice(0, 3).map(category => <li key={category.category_id}>
        <span className="pill">{category.score}</span> {category.category_name}
      </li>)
    }
  </ul>;
}

function HotelBadges({badges}) {
  return <ul className="badges">
    {
      badges.slice(0, 3).map(badge => <li key={badge.badge_type}>
        <span className="pill">{badge.subtext}</span> {badge.badge_data.category_name}
      </li>)
    }
  </ul>;
}

function Hotel({ hotel }) {
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
      <h3>{hotel.name}</h3>
      <h4>2km from center</h4>
      <ul className="overall">
        <li>Match: <span className="pill">85%</span></li>
        <li>Reviews: {hotel.reviews_count.toLocaleString(undefined)}</li>
        <li>Score: {hotel.rating}</li>
      </ul>
      <HotelCategories categories={hotel.categories} />
      <HotelBadges badges={hotel.badges} />
    </div>
    <div className="hotel-actions">
      <a className="action-primary btn btn-primary" href="details.html">Book Now</a>
      <a className="action-secondary btn btn-text" href="details.html">More details</a>
    </div>
  </article>
}

class SearchResults extends React.Component {
  state = {
    isLoading: true,
    hotels: [],
    error: null
  }

  fetchHotels() {
    axios({
        method: 'get',
        url: 'https://ota-demo.integration.nbg1-c01-stag.hcloud.trustyou.net/api/v1/search/?city=test&country=us&scale=5'
      })
      .then(response => response.data)
      .then(data =>
        this.setState({
          error: null,
          hotels: data.hotels,
          isLoading: false,
        })
      )
      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoading: false }));
  }
  componentDidMount() {
    this.setState({
      isLoading: true,
    })
    this.fetchHotels();
  }

  render() {
    if (!this.state.isLoading && this.state.error) {
      return <div> Something wrong happened</div>
    }

    return this.state.isLoading ?
      <Loader /> :
      <div>
        {this.state.hotels.map(hotel => <Hotel key={hotel.ty_id} hotel={hotel} />)}
      </div>
  }
}

ReactDOM.render(<SearchResults />, document.getElementById('search-results'))
