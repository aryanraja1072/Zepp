const MINE_RATE = 1000; //in milliseconds
const INITIAL_DIFFICULTY = 3;
const GENESIS_BLOCK_INFO = {
    timestamp : 1,
    data:[],
    hash:'0x000000',
    previousHash:'0xffffff',
    difficulty:INITIAL_DIFFICULTY,
    nonce:0
};
module.exports = {GENESIS_BLOCK_INFO,MINE_RATE};