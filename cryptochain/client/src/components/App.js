import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/zepp_logo_max.png";
class App extends Component {
  state = { walletInfo: {} };
  componentDidMount() {
    fetch(`${document.location.origin}/api/wallet-info`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        this.setState({ walletInfo: json });
      });
  }
  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className="App">
        <div>
          <img className="logo" src={logo}></img>
        </div>
        <br />
        <div className="WalletInfo">
          <div>
            <h4>Address:</h4>
            {address}
          </div>
          <div>
            <h4>Balance:</h4>
            {balance}
          </div>
        </div>
        <br />

        <Link to="/blocks">Blocks</Link>

        <Link to="/conduct-transaction">Conduct Transaction</Link>
        <Link to="/transaction-pool">Transaction Pool</Link>
      </div>
    );
  }
}
export default App;
