import ReactDOM from "react-dom";
import React, { Component } from "react";
import "./styles.css";
import axios from "axios";
import CurrencyInput from "react-currency-masked-input";

//Currency Converter

//Create a currency converter that converts a user’s selected base currency and outputs the equivalent money value of the exchange currency using the current day’s rate.

//Include two select inputs, one for base currency and second for equivalent currency, which make use of the json found at:
//https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/27beff3509eff0d2690e593336179d4ccda530c2/Common-Currency.json

//For the base currency, create a masked currency input that:

// Shows the symbol of the selected base currency
// Is formatted to two decimal places
// On focus sets the cursor to the rightmost decimal position
// Only allows numbers
// Each new number is added to the right most position
// When a new number is inserted shifts the decimal right one place
// When deleted shifts the decimal left one place

// Currency rates are available from https://api.exchangeratesapi.io/latest?base=USD

// Use the money.js library (see this codesandbox's package.json) to convert the selected base currency to its chosen equivalent money value. For more details: http://openexchangerates.github.io/money.js/

// Best practice would be to inform the user if their selected currency is not available from fixer.io using inline validation. In order to more easily test error handling, allow the user to select a currency not available from fixer.io and present the error returned.

// Show the equivalent money value's currency symbol which is included in the above Common-Currency.json endpoint.

// Use React but do not include jQuery in your project.

class CurrencyConverter extends Component {
  state = {
    result: null,
    fromCurrency: "USD",
    toCurrency: "INR",
    amount: "1.00",
    currencies: [],
    value: ""
  };

  componentDidMount() {
    axios
      .get(
        "https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/27beff3509eff0d2690e593336179d4ccda530c2/Common-Currency.json"
      )
      .then(response => {
        const currencyAr = [];
        for (const key in response.data) {
          currencyAr.push(key);
        }
        this.setState({ currencies: currencyAr.sort() });
        this.setState({ allCurrencies: response.data });
        this.setState({ baseCurrency: "USD" });
        this.setState({ toCurrency: "INR" });
        this.setState({
          baseCurrencySymbol: this.state.allCurrencies[this.state.baseCurrency]
            .symbol
        });
        this.setState({
          toCurrencySymbol: this.state.allCurrencies[this.state.toCurrency]
            .symbol
        });
      })
      .catch(err => {
        console.log(
          "Oops, something broke with GET in componentDidMount() - we've got a: ",
          err.message
        );
      });
  }

  convertHandler = () => {
    this.setState({ amount: document.getElementById("currency").value });
    if (this.state.fromCurrency !== this.state.toCurrency) {
      axios
        .get(
          `https://api.exchangeratesapi.io/latest?base=${
            this.state.fromCurrency
          }`
        )
        .then(response => {
          console.log(response.data);
          if (response.data.rates[this.state.toCurrency]) {
            const result =
              this.state.amount * response.data.rates[this.state.toCurrency];
            this.setState({
              result: this.state.toCurrencySymbol + " " + result.toFixed(2)
            });
          } else {
            this.setState({
              result:
                "The selected " +
                this.state.toCurrencySymbol +
                " Currency is not available to convert!"
            });
          }
        })
        .catch(err => {
          this.setState({
            result:
              "The selected Base " +
              this.state.baseCurrencySymbol +
              " Currency is not supported!"
          });

          console.log(
            "Request GET broken here in convertHandler() - we've got a: ",
            err.message
          );
        });
    } else {
      this.setState({ result: "Can't convert the same currency!" });
    }
  };

  selectHandler = event => {
    this.setState({ result: null });
    if (event.target.name === "from") {
      this.setState({ fromCurrency: event.target.value });
      this.setState({ baseCurrency: event.target.value });
      this.setState({
        baseCurrencySymbol: this.state.allCurrencies[event.target.value].symbol
      });
    }
    if (event.target.name === "to") {
      this.setState({ toCurrency: event.target.value });
      this.setState({
        toCurrencySymbol: this.state.allCurrencies[event.target.value].symbol
      });
    }
  };

  setEnteredValue(event) {
    this.setState({ amount: event.target.value });
    console.log(this.state.value);
  }
  render() {
    return (
      <div className="container">
        <div className="text-center">
          <h3>
            <strong>Currency Converter</strong>
          </h3>
        </div>
        <div className="form-group">
          <label for="currency">Currency Amount</label>
          <CurrencyInput
            id="currency"
            className="form-control"
            name="amount"
            placeholder="0.00"
            required
          />
        </div>
        <div className="form-group">
          <label for="currency">From</label> &nbsp;
          <span style={{ color: "blue" }}>
            ({this.state.baseCurrencySymbol})
          </span>
          &nbsp;
          <select
            id="from"
            name="from"
            className="form-control"
            onChange={event => this.selectHandler(event)}
            value={this.state.baseCurrency}
          >
            {this.state.currencies.map(cur => (
              <option key={cur}>{cur}</option>
            ))}
          </select>
        </div>
        <label for="to">To</label> &nbsp;
        <span style={{ color: "red" }}>({this.state.toCurrencySymbol})</span>
        &nbsp;
        <select
          name="to"
          className="form-control"
          onChange={event => this.selectHandler(event)}
          value={this.state.toCurrency}
        >
          {this.state.currencies.map(cur => (
            <option key={cur}>{cur}</option>
          ))}
        </select>
        &nbsp; &nbsp;
        <div className="text-right">
          <button className="btn btn-primary" onClick={this.convertHandler}>
            Convert
          </button>
        </div>
        <div className="container text-center bg-success">
          {this.state.result && this.state.result !== 0 && (
            <h3>{this.state.result}</h3>
          )}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<CurrencyConverter />, document.getElementById("root"));
