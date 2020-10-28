const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
//const path = require('path');
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");
const TransactionMiner = require("./app/transaction-miner");

const DEFAULT_PORT = 3000;
let PEER_PORT;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubSub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubSub,
});
const syncWithRootState = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("replace chain on a sync with", rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);
        console.log(
          "replace transaction-pool map on a sync with",
          rootTransactionPoolMap
        );
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

app.use(bodyParser.json());
app.use(express.static(__dirname + "/client/dist/"));

app.get("/api/blocks", (req, res) => {
  return res.json(blockchain.chain);
});

app.get("/api/transaction-pool-map", (req, res) => {
  return res.json(transactionPool.transactionMap);
});
app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubSub.broadcastChain();
  res.redirect("/api/blocks");
});
app.get("/api/mine-transactions", (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect("/api/blocks");
});
app.get("/api/wallet-info", (req, res) => {
  const address = wallet.publicKey;
  console.log(`Requesting wallet-info for address:${address}`);
  return res.json({
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address }),
  });
});
app.post("/api/transact", (req, res) => {
  const { recipient, amount } = req.body;
  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });
  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain,
      });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }
  transactionPool.setTransaction(transaction);
  pubSub.broadcastTransaction(transaction);
  // console.log(`transaction #${transaction.id} added to transactionPool`);
  res.json({ type: "success", transaction });
});

app.get("*", (req, res) => {
  res.sendFile("/client/dist/index.html", { root: "." });
});

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, function () {
  console.log(`Server Started. Listening at http://localhost:${PORT}.`);

  if (PORT !== DEFAULT_PORT) {
    console.log(`Chain sync initiated on a peer node.`);
    syncWithRootState();
  }
});
