
function WidgetIframe({url}) {
  return <iframe
    src={url}
    allowtransparency="true"
    frameBorder="0" width="100%"
  >
  </iframe>
}

function RelevantNowWidget({tyId, apiKey}) {
  return <div className="container">
    <section className="hotel-relevant-now">
      <WidgetIframe
        url={`https://api.trustyou.com/hotels/${tyId}/relevant_now.html?key=${apiKey}&amp;iframe_resizer=true`}
      />
    </section>
  </div>
}

function MetaReviewWidget({tyId, apiKey}) {
  return <section className="hotel-meta-review">
    <WidgetIframe
      url={`https://api.trustyou.com/hotels/${tyId}/tops_flops.html?key=${apiKey}&amp;iframe_resizer=true`}
    />
  </section>
}

class HotelNameLocation extends React.Component{
  state = {
    address: null,
    coordinates: null,
    name: null,
    image: `img/hotels/h${getRandomImageIndex()}.jpg`,
  }

  buildFullAddress = (addresses) => {
    return `${addresses.street},${addresses.postal_code ? ` ${addresses.postal_code},` : ""} ${addresses.city}, ${addresses.country}`;
  }

  componentDidMount() {
    axios({
        method: 'get',
        url: `https://api.trustyou.com/hotels/${this.props.tyId}/location.json`
      })
      .then(response => response.data.response)
      .then(({ address, coordinates, name }) => {
        this.setState({
          addresses: address,
          coordinates: coordinates ? coordinates.coordinates : null,
          name,
        });
      });
  }

  render() {
    const { image, addresses, coordinates, name} = this.state;

    const hotelImage = { backgroundImage: `url(${image})`, };
    const mapLink = coordinates ? `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}` : "javascript:void(0)";

    return <header style={hotelImage}>
      <div className="container">
        { name && <section className="hotel-details">
          <h1 className="hotel-name">{name}</h1>
          <a className="hotel-address" href={mapLink} target="_blank">
            <i className="ty-icon ty-icon-map-marker"></i>{this.buildFullAddress(addresses)}
          </a>
        </section>
        }
      </div>
    </header>
  }
}

class DetailPage extends React.Component {
  componentDidMount() {
    iFrameResize({});
  }

  render() {
    const { tyId, apiKey } = this.props;

    return (
      <>
        <HotelNameLocation tyId={tyId}/>
        <main>
          <RelevantNowWidget
            tyId={tyId}
            apiKey={apiKey}
          />
          <MetaReviewWidget
            tyId={tyId}
            apiKey={apiKey}
          />
        </main>
      </>
    );
  }
}

const selectedTyId = getLocationSearchInUrl("ty_id");

ReactDOM.render(<DetailPage tyId={selectedTyId} apiKey={TRUSTYOU_HOTEL_API_KEY} />, document.getElementById('detail-page'))
