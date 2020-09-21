const {GENESIS_BLOCK_INFO} = require('./config');
const cryptoHash = require('./crypto-hash');
class Block{
    constructor({timestamp,data,hash,previousHash}){
        this.timestamp=timestamp;
        this.data=data;
        this.hash=hash;
        this.previousHash=previousHash
    }
    static getGenesisBlock() {
        return new this(GENESIS_BLOCK_INFO);
    }
    static mineBlock({previousBlock,data}){
        const timestamp = Date.now();
        const previousHash = previousBlock.hash;
        const hash = cryptoHash(timestamp,previousHash,data);
        return new this({
            timestamp,
            previousHash,
            data,
            hash}
            );
    }

}
module.exports = Block;