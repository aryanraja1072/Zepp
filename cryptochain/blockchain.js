const Block = require('./block');
const cryptoHash = require('./crypto-hash');
class Blockchain{
    constructor(){
        this.chain = [Block.getGenesisBlock()];
    }
    addBlock({data}){
        const newBlock = Block.mineBlock({
            previousBlock: this.chain[this.chain.length-1],
            data
        });
        this.chain.push(newBlock);
    }
    static isValidChain(chain) {
        if(JSON.stringify(chain[0])!==JSON.stringify(Block.getGenesisBlock()))
            return false;
        for(let i=1;i<chain.length;i++){
            const {timestamp,data,previousHash,hash,difficulty,nonce} = chain[i];
            const orgPreviousHash = chain[i-1].hash;
            const previousDifficulty = chain[i-1].difficulty;
            if(Math.abs(difficulty-previousDifficulty)>1)
                return false;
            if(previousHash !== orgPreviousHash)
                return false;
            const recalculatedHash = cryptoHash(timestamp,data,previousHash,difficulty,nonce);
            if(recalculatedHash !== hash)
                return false;
            
        }
        return true;
    }
    getLastBlock() {
        return this.chain[this.chain.length-1];
    }
    replaceChain(chain){
        if(this.chain.length >= chain.length){
            console.error('Incoming chain must be longer');
            return ;
        }
        if(Blockchain.isValidChain(chain) === false){
            console.error('Incoming chain must be valid');
            return ;
        }
        console.log('Current chain is replaced by a new chain');
        this.chain = chain;
    } 

}
module.exports = Blockchain;