const MINE_RATE = 1000; //in milliseconds
const STARTING_BALANCE = 1000;
const INITIAL_DIFFICULTY = 3;
const GENESIS_BLOCK_INFO = {
  timestamp: 1,
  data: [],
  hash: "0x000000",
  previousHash: "0xffffff",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
};
const REWARD_INPUT = { address: "AUTHORIZED-REWARD" };
const MINING_REWARD = 50;
module.exports = {
  GENESIS_BLOCK_INFO,
  MINE_RATE,
  STARTING_BALANCE,
  REWARD_INPUT,
  MINING_REWARD,
};
