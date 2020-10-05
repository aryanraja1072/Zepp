const Blockchain = require('.');
const Block = require('./block');
const { cryptoHash }= require('../utils');
describe('Blockchain',()=>{
    let blockchain,newBlockchain,orgChain;
    beforeEach(() => {
        blockchain = new Blockchain();
        newBlockchain = new Blockchain();
        orgChain = blockchain.chain;
    });
    it('has a `chain` of type Array',() =>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });
    it('starts with the genesis block',() =>{
        expect(blockchain.chain[0]).toEqual(Block.getGenesisBlock());
    });
    it('adds a new block to the chain',() =>{
        const newData='lorem ipsum';
        blockchain.addBlock({data:newData});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });
    describe('getLastBlock()',() => {
        it('returns the last block of the chain',() =>{
            blockchain.addBlock({data:'Temp-Transaction'});
            expect(blockchain.getLastBlock()).toEqual(blockchain.chain[blockchain.chain.length-1]);
        });
    });
    describe('isValidChain()',() =>{
        describe('when chain doesn\'t start with the genesis block',() =>{
            it('returns false',() => {
                blockchain.chain[0]= {data:'fake-genesis-block'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });

            
        });
        describe('when the chain starts with the genesis block and has multiple blocks',() =>{
            beforeEach(() => {
                blockchain.addBlock({data:'The'});
                blockchain.addBlock({data:'best'});
                blockchain.addBlock({data:'is'});
                blockchain.addBlock({data:'Chocolate Cake'});
            });
            describe('and a previousHash has changed',() =>{
                it('returns false',() => {
                     blockchain.chain[2].previousHash = 'broken-hash';
                     expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and there is a jump in difficulty',() =>{
                it('returns false',() =>{
                    const lastBlock = blockchain.getLastBlock();
                    const timestamp = Date.now();
                    const data = 'Temp-transaction';
                    const difficulty = lastBlock.difficulty-3;
                    const previousHash = lastBlock.hash;
                    const nonce = 1;
                    const hash = cryptoHash(timestamp,data,difficulty,previousHash,nonce);
                    const badBlock = new Block({timestamp,data,difficulty,previousHash,nonce,hash});
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and chain contains a block with an invalid field',() =>{
                it('returns false',() => {               
                    blockchain.chain[2].data = 'corrupted-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);});

            });
            describe('and chain does not contain an invalid block',() => {
                it('returns true',() => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });
    describe('replaceChain()', () =>{
        describe('newChain is not longer', () =>{
            it('does not replaces the chain',() => {
                newBlockchain.chain[0].hash = 'corrupted-hash';
                blockchain.replaceChain(newBlockchain.chain);
                expect(blockchain.chain).toEqual(orgChain);
            });
        });
        describe('when newChain is longer',() =>{
            beforeEach(() =>{
                newBlockchain.addBlock({data:'The'});
                newBlockchain.addBlock({data:'best'});
                newBlockchain.addBlock({data:'is'});
                newBlockchain.addBlock({data:'Chocolate Cake'});
            });
            describe('newChain is invalid',() =>{
                
                it('does not replaces the chain',() => {
                    newBlockchain.chain[2].hash='corrupted-hash';
                    blockchain.replaceChain(newBlockchain.chain);
                    expect(blockchain.chain).toEqual(orgChain);
                });
            });
            describe('newChain is valid',() =>{
                
                it('does replaces the chain',() => {
                    blockchain.replaceChain(newBlockchain.chain);
                    expect(blockchain.chain).toEqual(newBlockchain.chain);
                });
            });
        });
    });
});