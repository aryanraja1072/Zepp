import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";

class Block extends Component {
  state = { displayTransaction: false };

  toggleDisplayTransaction = () => {
    this.setState({ displayTransaction: !this.state.displayTransaction });
  };
  get displayTransaction() {
    const { data } = this.props.block;
    const stringifiedData = JSON.stringify(data);
    const displayData =
      stringifiedData.length > 35
        ? `${stringifiedData.substring(0, 35)}...`
        : stringifiedData;
    if (this.state.displayTransaction)
      return (
        <div>
          <div>
            {data.map((transaction) => {
              return (
                <div key={transaction.id}>
                  <hr />
                  <Transaction transaction={transaction} />
                </div>
              );
            })}
          </div>
          <Button onClick={this.toggleDisplayTransaction}>Show Less</Button>
        </div>
      );

    return (
      <div>
        <div>Data:{displayData}</div>
        <Button onClick={this.toggleDisplayTransaction}>Show Details</Button>
      </div>
    );
  }
  render() {
    const { timestamp, hash } = this.props.block;
    const displayHash = `${hash.substring(0, 15)}...`;

    const displayDate = new Date(timestamp).toLocaleString();
    return (
      <div className="Block">
        <div>Hash:{displayHash}</div>
        <div>TimeStamp:{displayDate}</div>
        {this.displayTransaction}
      </div>
    );
  }
}
export default Block;
