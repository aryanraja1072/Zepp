const PubNub = require("pubnub");

const credentials = {
  publishKey: "pub-c-dbc628b4-0fda-47ef-9c8c-3534b473279a",
  subscribeKey: "sub-c-8d3e6404-00ac-11eb-81c8-6616e216ad91",
  secretKey: "sec-c-MmZlZTE1OTgtZTE1NS00ODg5LThiMDQtNTJiNWQ1ZjVjMTUz",
};

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};
class PubSub {
  constructor({ blockchain, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubNub = new PubNub(credentials);
    this.pubNub.subscribe({ channels: Object.values(CHANNELS) });
    this.pubNub.addListener(this.listener());
  }
  listener() {
    return {
      message: (messageBody) => {
        const { channel, message } = messageBody;
        console.log(
          `Message Recieved on channel:${channel}, Message:${message}`
        );
        const parsedMsg = JSON.parse(message);
        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMsg, true, () => {
              this.transactionPool.clearBlockchainTransactions({
                chain: parsedMsg,
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (parsedMsg.input.address !== this.wallet.publicKey) {
              this.transactionPool.setTransaction(parsedMsg);
            }
            break;
          default:
            return;
        }
      },
    };
  }
  publish({ channel, message }) {
    this.pubNub.publish({ channel, message });
  }
  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;
