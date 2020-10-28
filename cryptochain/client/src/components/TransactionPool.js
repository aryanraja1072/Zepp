import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Transaction from "./Transaction";
import history from "../history";
const POLL_INERVAL_MS = 10000;
class TransactionPool extends Component {
  state = { transactionPoolMap: {} };

  fetchTransactionPoolMap = () => {
    fetch(`${document.location.origin}/api/transaction-pool-map`)
      .then((response) => response.json())
      .then((json) => {
        this.setState({ transactionPoolMap: json });
      });
  };

  fetchMineTransactions = () => {
    fetch(`${document.location.origin}/api/mine-transactions`).then(
      (response) => {
        if (response.status === 200) {
          alert("Success");
          history.push("/blocks");
        } else {
          alert("ERROR:Couldn't mine the transactions");
        }
      }
    );
  };
  componentDidMount() {
    this.fetchTransactionPoolMap();

    this.fetchPoolMapInterval = setInterval(
      () => this.fetchTransactionPoolMap(),
      POLL_INERVAL_MS
    );
  }
  componentWillUnmount() {
    clearInterval(this.fetchPoolMapInterval);
  }
  render() {
    return (
      <div className="TransactionPool">
        <div>
          <Link to="/">Home</Link>
        </div>
        <h2>Transaction Pool</h2>
        {Object.values(this.state.transactionPoolMap).map((transaction) => {
          return (
            <div key={transaction.id}>
              <hr />
              <Transaction transaction={transaction} />
              <hr />
            </div>
          );
        })}
        <div>
          <Button onClick={this.fetchMineTransactions}>
            Mine Transactions
          </Button>
        </div>
      </div>
    );
  }
}

export default TransactionPool;
