class HomePage extends React.Component {
  state = {
    city: ''
  }

  handleChange = (city) => {
    this.setState({
      city
    })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    window.location.href = `results.html?location=${this.state.city.toLowerCase()}`
  }

  render() {
    return (<form className="search-form" id="search-form" onSubmit={this.handleSubmit}>
        <div className="search-container">
          <fieldset className="search-primary" id="search-primary">
            <legend>Where are you traveling to?</legend>
            <div className="search-box">
              <SearchLocation handleChange={this.handleChange} placeholder="Enter your destination..." style={{width: 300}}/>
              <i className="ty-icon ty-icon-search"></i>
            </div>
          </fieldset>
        </div>
      </form>
    )
  }
}

ReactDOM.render(<HomePage />, document.getElementById('index-page'))