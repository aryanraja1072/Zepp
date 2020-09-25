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
            const {timestamp,data,previousHash,hash} = chain[i];
            const orgPreviousHash = chain[i-1].hash;
            if(previousHash !== orgPreviousHash)
                return false;
            const recalculatedHash = cryptoHash(timestamp,data,previousHash);
            if(recalculatedHash !== hash)
                return false;
            
        }
        return true;
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
        console.log('Current chain is replaced by the newChain');
        this.chain = chain;
    } 

}
module.exports = Blockchain;