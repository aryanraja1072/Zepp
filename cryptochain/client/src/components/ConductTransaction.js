import React, { Component } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import history from "../history";
class ConductTransaction extends Component {
  state = { recipient: "", amount: 0 }; // recipient address and amount to be sent to the recipient

  updateRecipient = (event) => {
    this.setState({ recipient: event.target.value });
  };
  updateAmount = (event) => {
    this.setState({ amount: Number(event.target.value) });
  };
  conductTransaction = () => {
    const { recipient, amount } = this.state;
    fetch(`${document.location.origin}/api/transact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, amount }),
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        alert(json.message || json.type);
        history.push("/transaction-pool");
      });
  };
  render() {
    return (
      <div className="ConductTransaction">
        <div>
          <h2>Conduct Transaction</h2>
        </div>
        <br />
        <FormGroup>
          <FormControl
            type="text"
            placeholder="Recipient Address"
            onChange={this.updateRecipient}
            value={this.state.recipient}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="number"
            placehoder="Amount"
            onChange={this.updateAmount}
            value={this.state.amount}
          />
        </FormGroup>
        <div>
          <Button onClick={this.conductTransaction}>Transact</Button>
        </div>
        <br />
        <div>
          <Link to="/">Home</Link>
        </div>
      </div>
    );
  }
}
export default ConductTransaction;
