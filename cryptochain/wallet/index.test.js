const Wallet = require(".");
const Blockchain = require("../blockchain");
const { verifySignature } = require("../utils");
const Transaction = require("./transaction");
const { STARTING_BALANCE } = require("../config");
describe("Wallet", () => {
  let wallet;
  beforeEach(() => {
    wallet = new Wallet();
  });
  it("has a `balance`", () => {
    expect(wallet).toHaveProperty("balance");
  });
  it("has a `publicKey`", () => {
    expect(wallet).toHaveProperty("publicKey");
  });
  describe("signing data", () => {
    const data = "foo-bar";
    it("verifies a signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data),
        })
      ).toBe(true);
    });
    it("does not verify an invalid signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data),
        })
      ).toBe(false);
    });
  });

  describe("createTransaction()", () => {
    describe("and the amount exceeds the balance", () => {
      it("throws an error", () => {
        expect(() =>
          wallet.createTransaction({
            amount: 121212,
            recipient: "recipient-address",
          })
        ).toThrow("Amount Exceeds Balance");
      });
    });
    describe("and the amount is valid", () => {
      let transaction, recipient, amount;
      beforeEach(() => {
        amount = 50;
        recipient = "Albus-Dumbledore";
        transaction = wallet.createTransaction({ amount, recipient });
      });
      it("creates  an instance of `Transaction`", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });
      it("matches the transaction input with the wallet", () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });
      it("outputs the amount to the recipient", () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });

    describe("and a chain is passed", () => {
      it("calls `Wallet.calculateBalance`", () => {
        const calculateBalanceMock = jest.fn();

        const originalCalculateBalance = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          recipient: "Zeus",
          amount: 10,
          chain: new Blockchain().chain,
        });

        expect(calculateBalanceMock).toHaveBeenCalled();

        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe("calculateBalanace()", () => {
    let blockchain;
    beforeEach(() => {
      blockchain = new Blockchain();
    });
    describe("and there are no outputs for the wallet", () => {
      it("returns the `STARTING_BALANCE`", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(STARTING_BALANCE);
      });
    });
    describe("and there are outputs for the wallet", () => {
      let transactionOne, transactionTwo;
      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 40,
        });
        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 60,
        });
        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      it("adds sum of all outputs to the wallet balance", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(
          STARTING_BALANCE +
            transactionTwo.outputMap[wallet.publicKey] +
            transactionOne.outputMap[wallet.publicKey]
        );
      });
    });

    describe("and the wallet has made a transaction", () => {
      let recentTransaction;
      beforeEach(() => {
        recentTransaction = wallet.createTransaction({
          recipient: "E.T.",
          amount: 40,
        });
        blockchain.addBlock({ data: [recentTransaction] });
      });

      it("returns output amount of the recent transaction", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
      });

      describe("and there are outputs after recent transaction", () => {
        let sameBlockTransaction, nextBlockTransaction;
        beforeEach(() => {
          recentTransaction = wallet.createTransaction({
            recipient: "E.T.",
            amount: 40,
          });
          sameBlockTransaction = Transaction.rewardTransaction({
            minerWallet: wallet,
          });
          blockchain.addBlock({
            data: [recentTransaction, sameBlockTransaction],
          });

          nextBlockTransaction = new Wallet().createTransaction({
            recipient: wallet.publicKey,
            amount: 60,
          });
          blockchain.addBlock({ data: [nextBlockTransaction] });

          it("returns correct balance including outputs after recent transaction", () => {
            expect(
              Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey,
              })
            ).toEqual(
              recentTransaction.outputMap[wallet.publicKey] +
                sameBlockTransaction.outputMap[wallet.publicKey] +
                nextBlockTransaction.outputMap[wallet.publicKey]
            );
          });
        });
      });
    });
  });
});
