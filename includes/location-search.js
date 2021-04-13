const { Select } = antd;

let timeout;
let currentValue;

function fetchCities(value, callback) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  function citySearch() {
    axios({
        method: 'get',
        url: `${OTA_DEMO_API_URL}/api/v1/city_search/?q=${value}`
      })
      .then(response => response.data.cities)
      .then(result => {
        if (currentValue === value) {
          callback(result);
        }
      });
  }

  timeout = setTimeout(citySearch, 200);
}

class SearchLocation extends React.Component {
  state = {
    data: [],
    value: undefined,
  };

  handleSearch = value => {
    if (value) {
      fetchCities(value, data => this.setState({ data }));
    } else {
      this.setState({ data: [] });
    }
  };

  handleChange = value => {
    this.setState({ value });
    this.props.handleChange(value)
  };

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setDefault(this.props.value);
    }
  }

  componentDidMount() {
    if (this.props.value) {
      this.setDefault(this.props.value);
    }
  }

  setDefault = (value) => {
    const locationData =parseCityCountry(value)
    if (locationData) {
      const initData = {
        city: toTitleCase(locationData[0]),
        country: toTitleCase(locationData[1])
      }

      this.setState({
        value: `${initData.city} - ${initData.country}`,
        data: [
          initData
        ],
      })
    }
  }

  render() {
    const options = this.state.data.map(d => <Option key={`${d.city}--${d.country}`}>{d.city} - {d.country}</Option>);

    return (
      <Select
        showSearch
        value={this.state.value}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        notFoundContent={null}
      >
        {options}
      </Select>
    );
  }
}
