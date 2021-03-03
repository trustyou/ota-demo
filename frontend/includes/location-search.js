const { Select } = antd;

let timeout;
let currentValue;

function fetchCities(value, callback) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  function fake() {
    axios({
        method: 'get',
        url: `https://ota-demo.integration.nbg1-c01-stag.hcloud.trustyou.net/api/v1/city_search/?q=${value}`
      })
      .then(response => response.data.cities)
      .then(result => {
        if (currentValue === value) {
          callback(result);
        }
      });
  }

  timeout = setTimeout(fake, 800);
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
    const dataParts = value.split('--')
    const initData = {
      city: capitalize(dataParts[0]),
      country: capitalize(dataParts[1])
    }

    this.setState({
      value: `${initData.city} - ${initData.country}`,
      data: [
        initData
      ],
    })
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
