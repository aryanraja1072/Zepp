const Block = require("./block");
const { cryptoHash } = require("../utils");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");
class Blockchain {
  constructor() {
    this.chain = [Block.getGenesisBlock()];
  }
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      previousBlock: this.chain[this.chain.length - 1],
      data,
    });
    this.chain.push(newBlock);
  }
  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.getGenesisBlock()))
      return false;
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, data, previousHash, hash, difficulty, nonce } = chain[
        i
      ];
      const orgPreviousHash = chain[i - 1].hash;
      const previousDifficulty = chain[i - 1].difficulty;
      if (Math.abs(difficulty - previousDifficulty) > 1) return false;
      if (previousHash !== orgPreviousHash) return false;
      const recalculatedHash = cryptoHash(
        timestamp,
        data,
        previousHash,
        difficulty,
        nonce
      );
      if (recalculatedHash !== hash) return false;
    }
    return true;
  }
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }
  replaceChain(chain, validateTransactions, onSuccess) {
    if (this.chain.length >= chain.length) {
      console.error("Incoming chain must be longer");
      return;
    }
    if (Blockchain.isValidChain(chain) === false) {
      console.error("Incoming chain must be valid");
      return;
    }
    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error("Incoming chain has invalid transaction data");
      return;
    }
    if (onSuccess) {
      onSuccess();
    }
    console.log("Current chain is replaced by a new chain");
    this.chain = chain;
  }
  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      let rewardTransactionCount = 0;
      let transactionSet = new Set();
      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;
          if (rewardTransactionCount > 1) {
            console.error("Miner reward exceeds limit");
            return false;
          }
          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("Miner reward amount is invalid");
            return false;
          }
        } else {
          if (!Transaction.isValidTransaction(transaction)) {
            return false;
          }
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          });
          if (transaction.input.amount !== trueBalance) {
            console.error("Invalid input amount");
            return false;
          }
          if (transactionSet.has(transaction)) {
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }
    return true;
  }
}
module.exports = Blockchain;
