const Transaction = require("../wallet/transaction");
class TransactionMiner {
  constructor({ wallet, blockchain, transactionPool, pubSub }) {
    this.wallet = wallet;
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.pubSub = pubSub;
  }
  mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );
    this.blockchain.addBlock({ data: validTransactions });
    this.pubSub.broadcastChain();
    this.transactionPool.clear();
  }
}

module.exports = TransactionMiner;
