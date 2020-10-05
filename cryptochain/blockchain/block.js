const hexToBin = require('hex-to-binary');
const {GENESIS_BLOCK_INFO,MINE_RATE} = require('../config');
const {cryptoHash} = require('../utils');
class Block{
    constructor({timestamp,data,hash,previousHash,difficulty,nonce}){
        this.timestamp=timestamp;
        this.data=data;
        this.hash=hash;
        this.difficulty=difficulty;
        this.nonce = nonce;
        this.previousHash=previousHash
    }
    static getGenesisBlock() {
        return new this(GENESIS_BLOCK_INFO);
    }
    static mineBlock({previousBlock,data}){
        let hash,timestamp;
        const previousHash = previousBlock.hash;
        let difficulty = previousBlock.difficulty;
        let nonce = 0;
        
        do{
            nonce++;
            timestamp= Date.now();
            difficulty  = Block.adjustDifficulty({originalBlock:previousBlock,timestamp});
            hash = cryptoHash(timestamp,data,previousHash,difficulty,nonce);
            

        }while(hexToBin(hash).substring(0,difficulty)!=='0'.repeat(difficulty));

        return new this({
            timestamp,
            previousHash,
            data,
            hash,
            difficulty,
            nonce}
            );
    }
    static adjustDifficulty({originalBlock,timestamp}){
        const {difficulty} = originalBlock;
        if(difficulty <=1)
            return 1;
        const difference = timestamp - originalBlock.timestamp;
        if( difference > MINE_RATE)
            return difficulty-1;
        return difficulty+1;
    }

}
module.exports = Block;