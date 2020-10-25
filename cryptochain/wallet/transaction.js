const { v1: uuid } = require("uuid");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const { verifySignature } = require("../utils");
class Transaction {
  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    this.id = uuid();
    this.outputMap =
      outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }
  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }
  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }
  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey])
      throw new Error("Amount Exceeds Balance");
    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] += amount;
    }
    this.outputMap[senderWallet.publicKey] -= amount;
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }
  static isValidTransaction(transaction) {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;
    const outputTotal = Object.values(outputMap).reduce(
      (total, amt) => total + amt
    );
    if (outputTotal !== amount) {
      console.error(`Invalid transaction at ${address}.
                Cause:Invald outputMap values`);
      return false;
    }
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid transaction at ${address}.
            Cause:Invald Signature`);
      return false;
    }
    return true;
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }
}

module.exports = Transaction;
