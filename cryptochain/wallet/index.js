const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../utils");
const Transaction = require("./transaction");

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }
  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }
    if (amount > this.balance) {
      throw new Error("Amount Exceeds Balance");
    }
    return new Transaction({ senderWallet: this, recipient, amount });
  }
  static calculateBalance({ chain, address }) {
    let outputsTotal = 0; //What happens if we have multiple transactions for the current address and a recent transaction in between them in a single block?
    let hasConductedTransaction = false;
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }
        const output = transaction.outputMap[address];
        if (output) {
          outputsTotal += output;
        }
      }
      if (hasConductedTransaction) break;
    }
    return hasConductedTransaction
      ? outputsTotal
      : STARTING_BALANCE + outputsTotal;
  }
}
module.exports = Wallet;
