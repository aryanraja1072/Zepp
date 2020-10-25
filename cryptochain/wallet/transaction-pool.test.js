const Transaction = require("./transaction");
const TransactionPool = require("./transaction-pool");
const Blockchain = require("../blockchain");
const Wallet = require("./");

describe("TransactionPool", () => {
  let transactionPool, transaction, senderWallet;
  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      recipient: "fake-recipient",
      amount: 50,
    });
  });
  describe("setTransaction()", () => {
    it("adds a transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction); // returns true if the transaction instance is same as the instance added
    });
  });
  describe("existingTransaction()", () => {
    it("returns an existing transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey,
        })
      ).toBe(transaction);
    });
  });

  describe("validTransactions()", () => {
    let validTransactions;
    beforeEach(() => {
      validTransactions = [];
      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: "dummy-recipient",
          amount: 30,
        });
        if (i % 3 === 0) {
          transaction.input.amount = 999999;
        } else if (i % 3 === 1) {
          transaction.input.signature = new Wallet().sign("fake-data");
        } else {
          validTransactions.push(transaction);
        }
        transactionPool.setTransaction(transaction);
      }
    });

    it("returns valid transactions", () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });
  });

  describe("clear()", () => {
    it("clears the transactionPool's transactionMap", () => {
      transactionPool.clear();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  describe("clearBlockchainTransactions()", () => {
    it("clears transactions from pool that exists in the blockchain", () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};

      for (let i = 0; i < 6; i++) {
        const transaction = new Wallet().createTransaction({
          recipient: "SkyWalker",
          amount: 30,
        });
        transactionPool.setTransaction(transaction);
        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
      }
      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
