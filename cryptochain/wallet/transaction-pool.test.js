const Transaction = require("./transaction");
const TransactionPool = require("./transaction-pool");
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
});
